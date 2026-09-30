import { pool } from '../../config/db'
import { env } from '../../config/env'
import { generateId } from '../../core/crud'
import { issueCertificate, randomCode } from '../learner/learning'
import { sendOnce } from './mailer'
import { nudgeEmail, paidEmail, reminderEmail, rewardEmail } from './templates'

/**
 * The scheduled half of the automated emails, run hourly by the `stretch-cron`
 * Worker (POST /api/v1/jobs/run). Each job is a sweep — "who should have heard
 * from us by now and has not" — rather than a timer set when something
 * happened, so a missed run (Render asleep, a deploy) is caught by the next one,
 * and `email_log`'s unique key makes re-running any of them harmless.
 */

type Tally = Record<string, number>
const bump = (tally: Tally, key: string) => (tally[key] = (tally[key] || 0) + 1)

/** Vietnam has no DST, so +07:00 is always right. */
const VN_OFFSET_MS = 7 * 3600 * 1000

/** "08:30 – 16:30" or "8h30" → minutes after midnight; unknown → 08:00. */
function startMinutes(time: string): number {
  const m = String(time || '').match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/)
  if (!m) return 8 * 60
  return Math.min(23, Number(m[1])) * 60 + Math.min(59, Number(m[2] || 0))
}

function startsAt(date: string | Date, time: string): Date {
  const day = typeof date === 'string' ? date.slice(0, 10) : new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
  const [y, mo, d] = day.split('-').map(Number)
  const utc = Date.UTC(y!, mo! - 1, d!, 0, 0) + startMinutes(time) * 60000 - VN_OFFSET_MS
  return new Date(utc)
}

const dayString = (date: string | Date) =>
  typeof date === 'string' ? date.slice(0, 10) : new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)

/** Anything starting in the next 24 hours gets its reminder — with an hourly
    run, that lands 23–24 hours ahead, or at once for a session booked late. */
async function sessionReminders(tally: Tally) {
  const now = Date.now()
  const sessions = await pool.query(
    `SELECT s.id, s.program_id, s.program_title, s.date::text AS date, s.time, s.location, p.slug
       FROM program_sessions s JOIN programs p ON p.id = s.program_id
      WHERE s.date BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 2`,
  )
  for (const s of sessions.rows) {
    const at = startsAt(s.date, s.time).getTime()
    if (at <= now || at - now > 24 * 3600 * 1000) continue
    const learners = await pool.query(
      `SELECT l.id, l.name, l.email FROM enrolments e JOIN learners l ON l.id = e.learner_id
        WHERE e.program_id = $1 AND e.status IN ('active','completed') AND l.status <> 'blocked'`,
      [s.program_id],
    )
    for (const l of learners.rows) {
      const result = await sendOnce(
        'reminder',
        `session:${s.id}:${l.id}`,
        reminderEmail({
          kind: 'session',
          email: l.email,
          name: l.name,
          title: s.program_title,
          date: dayString(s.date),
          time: s.time,
          location: s.location,
          url: `${env.siteBaseUrl}/vi/learning-hub/programs/${s.slug}`,
        }),
      )
      bump(tally, `reminder:${result}`)
    }
  }

  const mentor = await pool.query(
    `SELECT id, learner_name, learner_email, date, time, topic, meet_url, google_html_link
       FROM mentorship_sessions
      WHERE status = 'accepted'
        AND date BETWEEN to_char(CURRENT_DATE - 1, 'YYYY-MM-DD') AND to_char(CURRENT_DATE + 2, 'YYYY-MM-DD')`,
  )
  for (const m of mentor.rows) {
    const at = startsAt(m.date, m.time).getTime()
    if (at <= now || at - now > 24 * 3600 * 1000) continue
    const result = await sendOnce(
      'reminder',
      `mentorship:${m.id}`,
      reminderEmail({
        kind: 'mentorship',
        email: m.learner_email,
        name: m.learner_name,
        title: m.topic ? `Mentor 1-1: ${m.topic}` : 'Buổi mentor 1-1',
        date: dayString(m.date),
        time: m.time,
        url: m.meet_url || m.google_html_link || undefined,
      }),
    )
    bump(tally, `reminder:${result}`)
  }
}

/**
 * "Học tiếp" — an active course untouched for 3+ days. One email per pause:
 * the ref carries the day they stopped, so coming back and stopping again
 * earns a new nudge, but ignoring one never earns a second. Pauses older than
 * 30 days are left alone; that learner has moved on, and a nudge reads as spam.
 */
async function inactivityNudges(tally: Tally) {
  const { rows } = await pool.query(
    `SELECT e.id, e.percent, e.last_lesson_at, e.program_id, l.id AS learner_id, l.name, l.email,
            p.title, p.slug
       FROM enrolments e
       JOIN learners l ON l.id = e.learner_id
       JOIN programs p ON p.id = e.program_id
      WHERE e.status = 'active'
        AND e.percent < 100
        AND e.lessons > 0
        AND l.status <> 'blocked'
        AND e.last_lesson_at < NOW() - INTERVAL '3 days'
        AND e.last_lesson_at > NOW() - INTERVAL '30 days'
      ORDER BY e.last_lesson_at
      LIMIT 200`,
  )
  for (const e of rows) {
    // The first lesson not yet finished, in syllabus order — "bài tiếp theo".
    const nextLesson = await pool.query(
      `SELECT lesson_title FROM lesson_progress
        WHERE learner_id = $1 AND program_id = $2 AND completed_at IS NULL AND lesson_title <> ''
        ORDER BY updated_at DESC LIMIT 1`,
      [e.learner_id, e.program_id],
    )
    const result = await sendOnce(
      'nudge',
      `${e.id}:${dayString(e.last_lesson_at)}`,
      nudgeEmail({
        email: e.email,
        name: e.name,
        title: e.title,
        slug: e.slug,
        percent: Number(e.percent) || 0,
        lessonTitle: nextLesson.rows[0]?.lesson_title,
      }),
    )
    bump(tally, `nudge:${result}`)
  }
}

/** Orders a person marked paid in the console: tell the buyer, and pay out the
    referral if one brought them here. */
async function paidOrders(tally: Tally) {
  const { rows } = await pool.query(
    `SELECT o.id, o.code, o.customer, o.email, o.program_title, o.learner_id, o.coupon_code,
            p.slug, l.referred_by, l.name AS learner_name
       FROM orders o
       LEFT JOIN programs p ON p.id = o.program_id
       LEFT JOIN learners l ON l.id = o.learner_id
      WHERE o.status = 'paid' AND o.paid_at > NOW() - INTERVAL '14 days'
      ORDER BY o.paid_at`,
  )
  for (const o of rows) {
    const result = await sendOnce(
      'paid',
      o.id,
      paidEmail({ email: o.email, customer: o.customer, code: o.code, programTitle: o.program_title, programSlug: o.slug }),
    )
    bump(tally, `paid:${result}`)
    await rewardReferral(o, tally)
  }
}

/**
 * The referrer is the owner of the referral code on the order, or failing
 * that the person whose link the buyer signed up through. Rewarded once per
 * referred learner — their first paid order — never for referring yourself.
 */
async function rewardReferral(o: any, tally: Tally) {
  if (!o.learner_id) return
  let referrer: string | null = null
  if (o.coupon_code) {
    const c = await pool.query(`SELECT owner_learner_id FROM coupons WHERE code = $1 AND kind = 'referral'`, [o.coupon_code])
    referrer = c.rows[0]?.owner_learner_id ?? null
  }
  referrer ||= o.referred_by || null
  if (!referrer || referrer === o.learner_id) return

  const already = await pool.query(
    `SELECT 1 FROM referral_rewards WHERE order_id = $1 OR referee_id = $2`,
    [o.id, o.learner_id],
  )
  if (already.rows.length) return

  const owner = await pool.query(`SELECT id, name, email, status FROM learners WHERE id = $1`, [referrer])
  const r = owner.rows[0]
  if (!r || r.status === 'blocked') return

  const code = `QUA${randomCode(6)}`
  const endsAt = new Date(Date.now() + env.referral.rewardValidDays * 86400000).toISOString().slice(0, 10)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const claimed = await client.query(
      `INSERT INTO referral_rewards (order_id, referrer_id, referee_id, coupon_code)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING order_id`,
      [o.id, referrer, o.learner_id, code],
    )
    if (!claimed.rows.length) {
      await client.query('ROLLBACK')
      return
    }
    await client.query(
      `INSERT INTO coupons (id, code, type, value, scope, quota, ends_at, status, note, owner_learner_id, kind)
       VALUES ($1,$2,'percent',$3,'all',1,$4,'active',$5,$6,'reward')`,
      [generateId('cpn'), code, env.referral.rewardPercent, endsAt, `Thưởng giới thiệu ${o.learner_name || ''} (đơn ${o.code})`, referrer],
    )
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    client.release()
  }
  bump(tally, 'reward:issued')
  const result = await sendOnce(
    'reward',
    o.id,
    rewardEmail({ email: r.email, name: r.name, refereeName: o.learner_name || o.customer, code, percent: env.referral.rewardPercent, endsAt }),
  )
  bump(tally, `reward-email:${result}`)
}

/**
 * Completed enrolments with no certificate yet — finished through the console
 * (status set by hand) or before auto-issue existed. The player's own
 * completion issues at once; this catches every other road to 'completed'.
 */
async function missingCertificates(tally: Tally) {
  const { rows } = await pool.query(
    `SELECT e.id FROM enrolments e JOIN programs p ON p.id = e.program_id
      WHERE e.status = 'completed' AND p.certificate = TRUE
        AND NOT EXISTS (SELECT 1 FROM certificates c WHERE c.enrolment_id = e.id)
      LIMIT 200`,
  )
  for (const r of rows) {
    if (await issueCertificate(r.id)) bump(tally, 'certificate:issued')
  }
}

/** Run every job; one failing does not stop the others. */
export async function runJobs(): Promise<{ tally: Tally; errors: string[] }> {
  const tally: Tally = {}
  const errors: string[] = []
  for (const [name, job] of [
    ['certificates', missingCertificates],
    ['paid', paidOrders],
    ['reminders', sessionReminders],
    ['nudges', inactivityNudges],
  ] as const) {
    try {
      await job(tally)
    } catch (err: any) {
      console.error(`[Jobs] ${name} failed:`, err?.message || err)
      errors.push(`${name}: ${err?.message || err}`)
    }
  }
  return { tally, errors }
}
