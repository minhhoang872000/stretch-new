import { randomBytes } from 'node:crypto'
import { pool } from '../../config/db'
import { env } from '../../config/env'
import { generateId } from '../../core/crud'
import { sendOnceInBackground } from '../email/mailer'
import { certificateEmail } from '../email/templates'

/**
 * The learning rules shared by the learner routes, the console and the jobs:
 * rolling lesson progress up into an enrolment, issuing the certificate when a
 * course is finished, and minting the codes both of those hand out.
 */

// No 0/O, 1/I/L — these codes are read off paper and typed into a phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function randomCode(length: number): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length]
  return out
}

/** `STR-2026-7KQ2MX` — unique, checked against the table before it is used. */
export async function newCertificateCode(prefix = 'STR'): Promise<string> {
  const year = new Date().getFullYear()
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `${prefix}-${year}-${randomCode(6)}`
    const taken = await pool.query('SELECT 1 FROM certificates WHERE code = $1', [code])
    if (!taken.rows.length) return code
  }
  throw new Error('Could not mint a unique certificate code')
}

export const verifyUrlFor = (code: string) => `${env.siteBaseUrl}/verify/${encodeURIComponent(code)}`

/**
 * Recount an enrolment from its lesson rows. A course finishes itself — waiting
 * for someone to notice and tick a box is how a learner sits at 100% with no
 * certificate — and finishing issues the certificate in the same breath.
 */
export async function rollUpEnrolment(learnerId: string, programId: string) {
  const rolled = await pool.query(
    `UPDATE enrolments e SET
       lessons_done = sub.done,
       percent = CASE WHEN e.lessons > 0
                      THEN LEAST(100, ROUND(100.0 * sub.done / e.lessons))
                      ELSE 0 END,
       status = CASE WHEN e.lessons > 0 AND sub.done >= e.lessons THEN 'completed' ELSE e.status END,
       completed_at = CASE WHEN e.lessons > 0 AND sub.done >= e.lessons
                           THEN COALESCE(e.completed_at, CURRENT_DATE) ELSE e.completed_at END,
       last_lesson_at = NOW(),
       updated_at = NOW()
     FROM (SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS done
             FROM lesson_progress
            WHERE learner_id = $1 AND program_id = $2) sub
     WHERE e.learner_id = $1 AND e.program_id = $2
     RETURNING e.id, e.percent, e.lessons_done, e.lessons, e.status`,
    [learnerId, programId],
  )
  const row = rolled.rows[0]
  if (!row) return null

  let certificate: string | null = null
  if (row.status === 'completed') certificate = await issueCertificate(row.id)

  return {
    percent: Number(row.percent),
    lessonsDone: Number(row.lessons_done),
    lessons: Number(row.lessons),
    status: row.status as string,
    certificate,
  }
}

/**
 * Issue the certificate for a completed enrolment, once. Returns its code, or
 * null when the programme does not award one (`programs.certificate`).
 *
 * Idempotent: an enrolment that already holds a certificate — valid or revoked
 * — gets that one back. A revoked certificate stays revoked; re-issuing is a
 * decision for a person in the console, not for a progress ping.
 */
export async function issueCertificate(enrolmentId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT e.id, e.learner_id, e.program_id, e.status, e.quiz_avg,
            l.name AS learner_name, l.email,
            p.title AS program_title, p.certificate
       FROM enrolments e
       JOIN learners l ON l.id = e.learner_id
       JOIN programs p ON p.id = e.program_id
      WHERE e.id = $1`,
    [enrolmentId],
  )
  const e = rows[0]
  if (!e || e.status !== 'completed' || !e.certificate) return null

  const existing = await pool.query(
    `SELECT code FROM certificates WHERE enrolment_id = $1 ORDER BY created_at LIMIT 1`,
    [enrolmentId],
  )
  if (existing.rows.length) return existing.rows[0].code

  const code = await newCertificateCode()
  await pool.query(
    `INSERT INTO certificates
       (id, code, enrolment_id, learner_id, learner_name, program_id, program_title,
        issued_at, score, status, signed_by, verify_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7, CURRENT_DATE, $8, 'valid', 'Stretch Academy', $9)`,
    [
      generateId('crt'),
      code,
      e.id,
      e.learner_id,
      e.learner_name,
      e.program_id,
      e.program_title,
      e.quiz_avg ?? null,
      verifyUrlFor(code),
    ],
  )
  sendOnceInBackground(
    'certificate',
    code,
    certificateEmail({ email: e.email, name: e.learner_name, programTitle: e.program_title, code }),
  )
  return code
}

/**
 * A free course needs no purchase, but progress, completion and the
 * certificate all hang off an enrolment — so the first lesson a learner opens
 * in a free course enrols them. Paid courses are never enrolled here.
 */
export async function ensureEnrolment(learnerId: string, programId: string): Promise<boolean> {
  const held = await pool.query(
    `SELECT status FROM enrolments WHERE learner_id = $1 AND program_id = $2`,
    [learnerId, programId],
  )
  const status = held.rows[0]?.status
  if (status === 'active' || status === 'completed') return true
  if (status) return false // revoked: a person decided, the player does not undo it

  const program = await pool.query(
    `SELECT title, mode, lessons, price, status FROM programs WHERE id = $1`,
    [programId],
  )
  const p = program.rows[0]
  if (!p || Number(p.price) > 0 || p.status !== 'published') return false

  const learner = await pool.query('SELECT name FROM learners WHERE id = $1', [learnerId])
  if (!learner.rows.length) return false

  await pool.query(
    `INSERT INTO enrolments
       (id, learner_id, learner_name, program_id, program_title, mode, status,
        source, lessons, started_at)
     VALUES ($1,$2,$3,$4,$5,$6,'active','free',$7, CURRENT_DATE)
     ON CONFLICT (learner_id, program_id) DO NOTHING`,
    [generateId('enr'), learnerId, learner.rows[0].name, programId, p.title, p.mode, p.lessons],
  )
  return true
}

/**
 * The learner's personal referral code — created on first ask. It is a coupon
 * row (`kind = 'referral'`) so checkout prices it with the rules it already
 * has; no quota, since one person can refer many.
 */
export async function referralCodeFor(learnerId: string): Promise<string | null> {
  const found = await pool.query('SELECT name, referral_code FROM learners WHERE id = $1', [learnerId])
  const learner = found.rows[0]
  if (!learner) return null
  if (learner.referral_code) return learner.referral_code

  // "Nguyễn Hải Đăng" → "DANG" + 4 random: readable, and hard to guess.
  const stem = String(learner.name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .split(/\s+/)
    .pop()
    ?.replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 6) || 'STRETCH'

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `${stem}${randomCode(4)}`
    const taken = await pool.query('SELECT 1 FROM coupons WHERE code = $1', [code])
    if (taken.rows.length) continue
    await pool.query(
      `INSERT INTO coupons (id, code, type, value, scope, quota, status, note, owner_learner_id, kind)
       VALUES ($1,$2,'percent',$3,'all',0,'active',$4,$5,'referral')`,
      [
        generateId('cpn'),
        code,
        env.referral.refereePercent,
        `Mã giới thiệu của ${learner.name}`,
        learnerId,
      ],
    )
    const updated = await pool.query(
      `UPDATE learners SET referral_code = $2, updated_at = NOW()
        WHERE id = $1 AND referral_code IS NULL RETURNING referral_code`,
      [learnerId, code],
    )
    if (updated.rows.length) return code
    // Lost a race with a parallel request — theirs won; drop ours.
    await pool.query('DELETE FROM coupons WHERE code = $1', [code])
    const again = await pool.query('SELECT referral_code FROM learners WHERE id = $1', [learnerId])
    return again.rows[0]?.referral_code ?? null
  }
  return null
}
