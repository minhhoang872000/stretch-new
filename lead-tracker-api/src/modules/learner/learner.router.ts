import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { env } from '../../config/env'
import { HttpError, generateId } from '../../core/crud'
import { requireSite } from '../../middleware/requireSite'
import { success } from '../../utils/response'
import { sendOnceInBackground } from '../email/mailer'
import { orderEmail, welcomeEmail } from '../email/templates'
import { ensureEnrolment, referralCodeFor, rollUpEnrolment, verifyUrlFor } from './learning'

/**
 * The learner-facing API.
 *
 * Every route here is called by stretch.vn's own server, never by a browser.
 * The site holds the Google session, works out who is signed in, and passes
 * that learner's id explicitly; `requireSite` only checks that the caller is
 * the site. Which means one rule matters more than any other here:
 *
 *   **the site must take the learner id from its session, never from the
 *   request it is serving.**
 *
 * Every route below still verifies the learner owns the row it touches, so a
 * mistake on that side is a 404 rather than someone else's course history.
 */

const router = Router()

/** "Nguyễn Hải Đăng" → "NĐ". */
function initialsOf(name: string): string {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0]![0]!
  const last = words.length > 1 ? words[words.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}

function toLearner(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || '',
    initials: row.initials || initialsOf(row.name),
    google: !!row.google,
    status: row.status,
    joinedAt: row.joined_at,
    lastLoginAt: row.last_login_at,
  }
}

/**
 * POST /learner/identify — sign-in, and sign-up, in one call.
 *
 * Called every time someone completes Google sign-in. First time it creates the
 * learner; after that it updates the profile and stamps the login. There is no
 * separate "register" step because there is nothing to register: Google has
 * already established who this is, and asking them to fill a form afterwards
 * only loses people between the two screens.
 *
 * Matching is by `google_sub` first and email second. The subject id is stable
 * across an email change; the email match is what adopts a learner who was
 * created by hand in the console before they ever signed in — which is exactly
 * how someone who paid by bank transfer gets their access.
 */
router.post('/identify', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const googleSub = req.body?.googleSub ? String(req.body.googleSub) : null
    const name = String(req.body?.name || '').trim()
    const avatar = String(req.body?.avatar || '')

    if (!email) throw new HttpError('email là bắt buộc', 400, 'INVALID_BODY')

    const found = await pool.query(
      `SELECT * FROM learners
        WHERE ($1::text IS NOT NULL AND google_sub = $1) OR LOWER(email) = $2
        ORDER BY (google_sub = $1) DESC NULLS LAST
        LIMIT 1`,
      [googleSub, email],
    )

    if (found.rows.length) {
      const existing = found.rows[0]
      if (existing.status === 'blocked') {
        throw new HttpError('Tài khoản đã bị khoá', 403, 'LEARNER_BLOCKED')
      }
      const updated = await pool.query(
        `UPDATE learners SET
           google        = TRUE,
           google_sub    = COALESCE($2, google_sub),
           -- Never overwrite a name an admin curated with a blank one.
           name          = COALESCE(NULLIF($3, ''), name),
           avatar        = COALESCE(NULLIF($4, ''), avatar),
           last_login_at = NOW(),
           last_active_at = NOW(),
           updated_at    = NOW()
         WHERE id = $1
         RETURNING *`,
        [existing.id, googleSub, name, avatar],
      )
      success(res, { learner: toLearner(updated.rows[0]), created: false })
      return
    }

    // Arrived through someone's referral link: remember who sent them, so the
    // referrer is rewarded when this learner's first order is paid.
    const referralCode = String(req.body?.referralCode || '').trim().toUpperCase()
    let referredBy: string | null = null
    if (referralCode) {
      const owner = await pool.query(
        `SELECT id FROM learners WHERE referral_code = $1 AND status <> 'blocked'`,
        [referralCode],
      )
      referredBy = owner.rows[0]?.id ?? null
    }

    const created = await pool.query(
      `INSERT INTO learners
         (id, name, initials, email, avatar, google, google_sub, source,
          joined_at, last_login_at, last_active_at, status, referred_by)
       VALUES ($1,$2,$3,$4,$5, TRUE, $6, $7, CURRENT_DATE, NOW(), NOW(), 'active', $8)
       RETURNING *`,
      [
        generateId('lrn'),
        name || email.split('@')[0],
        initialsOf(name || email),
        email,
        avatar,
        googleSub,
        referredBy ? 'referral' : 'google',
        referredBy,
      ],
    )
    const learner = created.rows[0]
    sendOnceInBackground('welcome', learner.id, welcomeEmail({ name: learner.name, email: learner.email }))
    success(res, { learner: toLearner(learner), created: true }, 201)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /learner/:id/courses — what "Khoá học của tôi" renders.
 *
 * Active and finished in one call, each already carrying the resume point, so
 * the page does not have to fetch a progress list per course and work it out.
 */
router.get('/:id/courses', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)

    const { rows } = await pool.query(
      `SELECT e.id, e.status, e.percent, e.lessons_done, e.lessons,
              e.started_at, e.completed_at, e.last_lesson_at,
              p.id AS program_id, p.slug, p.title, p.image, p.mode, p.kind,
              c.code AS certificate_code
         FROM enrolments e
         JOIN programs p ON p.id = e.program_id
         LEFT JOIN certificates c
                ON c.enrolment_id = e.id AND c.status = 'valid'
        WHERE e.learner_id = $1 AND e.status <> 'revoked'
        ORDER BY e.last_lesson_at DESC NULLS LAST, e.started_at DESC`,
      [learnerId],
    )

    // Where to drop the learner back in: the furthest lesson they have touched.
    const resume = await pool.query(
      `SELECT DISTINCT ON (program_id)
              program_id, module_index, item_index, ordinal, lesson_title
         FROM lesson_progress
        WHERE learner_id = $1
        ORDER BY program_id, updated_at DESC`,
      [learnerId],
    )
    const resumeBy = new Map(resume.rows.map((r) => [r.program_id, r]))

    const shape = (row: any) => {
      const at = resumeBy.get(row.program_id)
      return {
        enrolmentId: row.id,
        slug: row.slug,
        title: row.title,
        image: row.image,
        mode: row.mode,
        kind: row.kind,
        lesson: Number(row.lessons_done) || 0,
        lessons: Number(row.lessons) || 0,
        percent: Number(row.percent) || 0,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        certificate: row.certificate_code || null,
        resume: at
          ? {
              moduleIndex: at.module_index,
              itemIndex: at.item_index,
              ordinal: at.ordinal,
              title: at.lesson_title,
            }
          : null,
      }
    }

    success(res, {
      active: rows.filter((r) => r.status === 'active').map(shape),
      completed: rows.filter((r) => r.status === 'completed').map(shape),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /learner/:id/access/:slug — may this person watch this course?
 *
 * The one question the lesson player has to ask before it plays anything. A
 * free course is open to any signed-in learner; everything else needs an
 * active or completed enrolment.
 */
router.get('/:id/access/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.price, p.status,
              e.id AS enrolment_id, e.status AS enrolment_status, e.percent
         FROM programs p
         LEFT JOIN enrolments e ON e.program_id = p.id AND e.learner_id = $2
        WHERE p.slug = $1`,
      [String(req.params.slug), String(req.params.id)],
    )
    const row = rows[0]
    if (!row) throw new HttpError('Chương trình không tồn tại', 404, 'NOT_FOUND')

    const enrolled = row.enrolment_status === 'active' || row.enrolment_status === 'completed'
    const free = Number(row.price) === 0

    success(res, {
      programId: row.id,
      allowed: enrolled || free,
      // Told apart on purpose: "you already own this" and "this one is free"
      // lead to different buttons on the course page.
      reason: enrolled ? 'enrolled' : free ? 'free' : 'not-enrolled',
      enrolmentId: row.enrolment_id || null,
      percent: Number(row.percent) || 0,
    })
  } catch (err) {
    next(err)
  }
})

// ─── Progress ────────────────────────────────────────────────────────

/** The programme id behind a slug. */
async function programIdForSlug(slug: string): Promise<string> {
  const program = await pool.query(`SELECT id FROM programs WHERE slug = $1`, [slug])
  const programId = program.rows[0]?.id as string | undefined
  if (!programId) throw new HttpError('Chương trình không tồn tại', 404, 'NOT_FOUND')
  return programId
}

/** Refuses progress for a course the learner does not hold (a free one enrols here). */
async function assertCanTrack(learnerId: string, programId: string) {
  if (!(await ensureEnrolment(learnerId, programId))) {
    throw new HttpError('Chưa ghi danh chương trình này', 403, 'NOT_ENROLLED')
  }
}

interface LessonWrite {
  moduleIndex: number
  itemIndex: number
  ordinal?: number | null
  lessonTitle?: string
  /** Furthest point reached; only ever grows. */
  watchedSeconds?: number
  /** Where they last stopped. */
  positionSeconds?: number
  durationSeconds?: number
  /** Explicit tick (true) or un-tick (false); absent = decide from the video. */
  done?: boolean
  note?: string
}

/**
 * One lesson row, upserted. `done: false` is the one write that can take a
 * completion away — the learner un-ticking their own lesson. Everything else
 * only moves forward: a slower device reporting an older playhead must not
 * rewind a tick another device already earned.
 */
async function writeLesson(learnerId: string, programId: string, w: LessonWrite) {
  const watched = Math.max(0, Math.round(Number(w.watchedSeconds ?? w.positionSeconds) || 0))
  const position =
    w.positionSeconds === undefined || w.positionSeconds === null
      ? null
      : Math.max(0, Math.round(Number(w.positionSeconds) || 0))
  const duration = Math.max(0, Math.round(Number(w.durationSeconds) || 0))
  const byVideo = duration > 0 && watched / duration >= 0.9
  const completeNow = w.done === true || (w.done === undefined && byVideo)

  await pool.query(
    `INSERT INTO lesson_progress
       (id, learner_id, program_id, module_index, item_index, ordinal, lesson_title,
        watched_seconds, position_seconds, duration_seconds, note, completed_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9::int,0),$10,COALESCE($11::text,''),$12, NOW())
     ON CONFLICT (learner_id, program_id, module_index, item_index) DO UPDATE SET
       watched_seconds  = GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
       position_seconds = COALESCE($9::int, lesson_progress.position_seconds),
       duration_seconds = GREATEST(lesson_progress.duration_seconds, EXCLUDED.duration_seconds),
       ordinal          = COALESCE(EXCLUDED.ordinal, lesson_progress.ordinal),
       lesson_title     = COALESCE(NULLIF(EXCLUDED.lesson_title, ''), lesson_progress.lesson_title),
       note             = COALESCE($11::text, lesson_progress.note),
       completed_at     = CASE WHEN $13::boolean THEN NULL
                               ELSE COALESCE(lesson_progress.completed_at, EXCLUDED.completed_at) END,
       updated_at       = NOW()`,
    [
      generateId('lp'),
      learnerId,
      programId,
      Math.max(0, Number(w.moduleIndex) || 0),
      Math.max(0, Number(w.itemIndex) || 0),
      w.ordinal === undefined || w.ordinal === null ? null : Number(w.ordinal),
      String(w.lessonTitle || '').slice(0, 300),
      watched,
      position,
      duration,
      w.note === undefined || w.note === null ? null : String(w.note).slice(0, 20000),
      completeNow ? new Date().toISOString() : null,
      w.done === false,
    ],
  )
  return completeNow
}

/**
 * GET /learner/:id/progress/:slug — everything the player restores: ticks,
 * resume points and notes, keyed by the player's own "<module>-<item>".
 */
router.get('/:id/progress/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programId = await programIdForSlug(String(req.params.slug))
    const { rows } = await pool.query(
      `SELECT module_index, item_index, position_seconds, duration_seconds,
              note, completed_at, updated_at
         FROM lesson_progress
        WHERE learner_id = $1 AND program_id = $2`,
      [learnerId, programId],
    )
    const enrolment = await pool.query(
      `SELECT e.status, e.percent, c.code AS certificate
         FROM enrolments e
         LEFT JOIN certificates c ON c.enrolment_id = e.id AND c.status = 'valid'
        WHERE e.learner_id = $1 AND e.program_id = $2`,
      [learnerId, programId],
    )
    const e = enrolment.rows[0]
    success(res, {
      programId,
      lessons: rows.map((r) => ({
        key: `${r.module_index}-${r.item_index}`,
        done: !!r.completed_at,
        t: Number(r.position_seconds) || 0,
        d: Number(r.duration_seconds) || 0,
        note: r.note || '',
        updatedAt: r.updated_at,
      })),
      enrolment: e
        ? { status: e.status, percent: Number(e.percent) || 0, certificate: e.certificate || null }
        : null,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /learner/:id/progress/:slug — a batch of lesson writes.
 *
 * The player queues changes (ticks, playheads, notes) and sends them together
 * every few seconds; the first call after sign-in also carries whatever this
 * browser had stored locally, which is how progress made before the account
 * was wired up is not lost. Capped so one request cannot write a thousand rows.
 */
router.put('/:id/progress/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programId = await programIdForSlug(String(req.params.slug))
    await assertCanTrack(learnerId, programId)

    const writes: LessonWrite[] = Array.isArray(req.body?.lessons) ? req.body.lessons.slice(0, 300) : []
    for (const w of writes) await writeLesson(learnerId, programId, w)

    const enrolment = await rollUpEnrolment(learnerId, programId)
    success(res, { tracked: writes.length, enrolment })
  } catch (err) {
    next(err)
  }
})

/** DELETE /learner/:id/progress/:slug — "học lại từ đầu". Completion and any
    certificate already issued stay: they record something that happened. */
router.delete('/:id/progress/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programId = await programIdForSlug(String(req.params.slug))
    await pool.query(
      `UPDATE lesson_progress SET completed_at = NULL, position_seconds = 0, updated_at = NOW()
        WHERE learner_id = $1 AND program_id = $2`,
      [learnerId, programId],
    )
    const enrolment = await rollUpEnrolment(learnerId, programId)
    success(res, { reset: true, enrolment })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /learner/:id/progress — one lesson, addressed by programme id. Kept for
 * older clients; the batch route above is what the site's player uses.
 */
router.post('/:id/progress', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const b = req.body || {}
    const programId = String(b.programId || '')
    if (!programId) throw new HttpError('programId là bắt buộc', 400, 'INVALID_BODY')
    await assertCanTrack(learnerId, programId)

    const completed = await writeLesson(learnerId, programId, {
      moduleIndex: b.moduleIndex,
      itemIndex: b.itemIndex,
      ordinal: b.ordinal,
      lessonTitle: b.lessonTitle,
      watchedSeconds: b.watchedSeconds,
      positionSeconds: b.watchedSeconds,
      durationSeconds: b.durationSeconds,
    })
    const enrolment = await rollUpEnrolment(learnerId, programId)
    success(res, { tracked: true, completed, enrolment })
  } catch (err) {
    next(err)
  }
})

// ─── Saved programmes ────────────────────────────────────────────────

/** GET /learner/:id/saved — bookmarked slugs, oldest first (the site reverses). */
router.get('/:id/saved', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT program_slug FROM learner_saved_programs WHERE learner_id = $1 ORDER BY saved_at`,
      [String(req.params.id)],
    )
    success(res, { slugs: rows.map((r) => r.program_slug) })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /learner/:id/saved — add slugs (a merge, never a replace): the browser's
 * own list goes up on sign-in, and a bookmark made on another device must
 * survive that.
 */
router.put('/:id/saved', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const slugs: string[] = (Array.isArray(req.body?.slugs) ? req.body.slugs : [])
      .map((s: unknown) => String(s || '').trim())
      .filter((s: string) => s && s.length <= 200)
      .slice(0, 200)
    for (const slug of slugs) {
      await pool.query(
        `INSERT INTO learner_saved_programs (learner_id, program_slug) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [learnerId, slug],
      )
    }
    const { rows } = await pool.query(
      `SELECT program_slug FROM learner_saved_programs WHERE learner_id = $1 ORDER BY saved_at`,
      [learnerId],
    )
    success(res, { slugs: rows.map((r) => r.program_slug) })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/saved/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query(`DELETE FROM learner_saved_programs WHERE learner_id = $1 AND program_slug = $2`, [
      String(req.params.id),
      String(req.params.slug),
    ])
    success(res, { removed: true })
  } catch (err) {
    next(err)
  }
})

// ─── Reviews ─────────────────────────────────────────────────────────

/** GET /learner/:id/reviews/:slug — this learner's own review, if any, and
    whether they may write one (only after finishing the course). */
router.get('/:id/reviews/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programId = await programIdForSlug(String(req.params.slug))
    const enrolment = await pool.query(
      `SELECT status, percent FROM enrolments WHERE learner_id = $1 AND program_id = $2`,
      [learnerId, programId],
    )
    const review = await pool.query(
      `SELECT id, rating, text, status, reply, created_at FROM program_reviews
        WHERE learner_id = $1 AND program_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [learnerId, programId],
    )
    const e = enrolment.rows[0]
    const r = review.rows[0]
    success(res, {
      canReview: e?.status === 'completed',
      review: r
        ? { id: r.id, rating: r.rating, text: r.text, status: r.status, reply: r.reply, createdAt: r.created_at }
        : null,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /learner/:id/reviews/:slug — star rating + text, after completion only.
 *
 * One review per learner per programme: writing again edits it and sends it
 * back to `pending`, because an approved review whose text changed has not
 * been approved. The console's Reviews screen moderates; the course page only
 * ever shows `approved`.
 */
router.post('/:id/reviews/:slug', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programId = await programIdForSlug(String(req.params.slug))
    const rating = Math.round(Number(req.body?.rating) || 0)
    const text = String(req.body?.text || '').trim().slice(0, 3000)
    if (rating < 1 || rating > 5) throw new HttpError('Chọn từ 1 đến 5 sao', 400, 'INVALID_BODY')

    const enrolment = await pool.query(
      `SELECT e.status, e.learner_name, p.title
         FROM enrolments e JOIN programs p ON p.id = e.program_id
        WHERE e.learner_id = $1 AND e.program_id = $2`,
      [learnerId, programId],
    )
    const e = enrolment.rows[0]
    if (e?.status !== 'completed') {
      throw new HttpError('Hoàn thành khoá học để viết đánh giá', 403, 'NOT_COMPLETED')
    }
    const learner = await pool.query('SELECT name FROM learners WHERE id = $1', [learnerId])
    const name = learner.rows[0]?.name || e.learner_name || ''

    const existing = await pool.query(
      `SELECT id FROM program_reviews WHERE learner_id = $1 AND program_id = $2 ORDER BY created_at LIMIT 1`,
      [learnerId, programId],
    )
    let row
    if (existing.rows.length) {
      row = (
        await pool.query(
          `UPDATE program_reviews SET rating = $2, text = $3, status = 'pending',
                  learner_name = $4, updated_at = NOW()
            WHERE id = $1 RETURNING *`,
          [existing.rows[0].id, rating, text, name],
        )
      ).rows[0]
    } else {
      row = (
        await pool.query(
          `INSERT INTO program_reviews
             (id, program_id, program_title, learner_id, learner_name, rating, text, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
          [generateId('rev'), programId, e.title, learnerId, name, rating, text],
        )
      ).rows[0]
    }
    success(res, {
      review: { id: row.id, rating: row.rating, text: row.text, status: row.status, reply: row.reply, createdAt: row.created_at },
    })
  } catch (err) {
    next(err)
  }
})

// ─── Referrals ───────────────────────────────────────────────────────

/** GET /learner/:id/referral — the learner's personal code, created on first
    ask, with how many people it brought in and the rewards it earned. */
router.get('/:id/referral', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const code = await referralCodeFor(learnerId)
    if (!code) throw new HttpError('Học viên không tồn tại', 404, 'NOT_FOUND')

    const joined = await pool.query(`SELECT COUNT(*)::int AS n FROM learners WHERE referred_by = $1`, [learnerId])
    const rewards = await pool.query(
      `SELECT c.code, c.value, c.ends_at::text AS ends_at, c.used, c.quota, c.status
         FROM referral_rewards r JOIN coupons c ON c.code = r.coupon_code
        WHERE r.referrer_id = $1 ORDER BY r.created_at DESC`,
      [learnerId],
    )
    success(res, {
      code,
      refereePercent: env.referral.refereePercent,
      rewardPercent: env.referral.rewardPercent,
      joined: joined.rows[0]?.n ?? 0,
      rewards: rewards.rows.map((r) => ({
        code: r.code,
        percent: r.value,
        endsAt: r.ends_at,
        usable: r.status === 'active' && (r.quota === 0 || r.used < r.quota),
      })),
    })
  } catch (err) {
    next(err)
  }
})

/** GET /learner/:id/certificates — what the account page lists. */
router.get('/:id/certificates', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT code, program_title, issued_at::text AS issued_at, score, status, verify_url
         FROM certificates
        WHERE learner_id = $1 AND status = 'valid'
        ORDER BY issued_at DESC`,
      [String(req.params.id)],
    )
    success(res, {
      certificates: rows.map((row) => ({
        code: row.code,
        programTitle: row.program_title,
        issuedAt: row.issued_at,
        score: row.score,
        verifyUrl: row.verify_url || verifyUrlFor(row.code),
      })),
    })
  } catch (err) {
    next(err)
  }
})

// ─── Checkout ────────────────────────────────────────────────────────

function toOrder(row: any) {
  return {
    id: row.id,
    code: row.code,
    programId: row.program_id,
    programTitle: row.program_title,
    subtotal: row.subtotal,
    couponCode: row.coupon_code || '',
    discount: row.discount,
    total: row.total,
    method: row.method || 'transfer',
    status: row.status,
    enrolled: !!row.enrolled,
    createdAt: row.created_at,
  }
}

/**
 * The same pricing rules as `POST /coupons/validate`, applied at the moment the
 * order is written. Re-checked here rather than trusting a discount the browser
 * computed earlier: between typing the code and clicking "pay", the coupon may
 * have expired or run out of uses.
 */
async function checkCoupon(
  code: string,
  subtotal: number,
  learnerId: string,
): Promise<{ ok: true; id: string; code: string; discount: number } | { ok: false; reason: string }> {
  const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code])
  const coupon = result.rows[0]
  if (!coupon) return { ok: false, reason: 'Mã không tồn tại' }
  if (coupon.status !== 'active') return { ok: false, reason: 'Mã đã ngừng áp dụng' }

  const today = new Date().toISOString().slice(0, 10)
  if (coupon.starts_at && today < coupon.starts_at.toISOString().slice(0, 10)) {
    return { ok: false, reason: 'Mã chưa tới ngày áp dụng' }
  }
  if (coupon.ends_at && today > coupon.ends_at.toISOString().slice(0, 10)) {
    return { ok: false, reason: 'Mã đã hết hạn' }
  }
  if (coupon.quota > 0 && coupon.used >= coupon.quota) return { ok: false, reason: 'Mã đã hết lượt' }
  if (subtotal < coupon.min_spend) {
    return { ok: false, reason: `Đơn tối thiểu ${coupon.min_spend.toLocaleString('vi-VN')}đ` }
  }

  // A referral code is for the people you send it to; a reward is only yours.
  if (coupon.kind === 'referral' && coupon.owner_learner_id === learnerId) {
    return { ok: false, reason: 'Đây là mã giới thiệu của chính bạn — hãy gửi cho bạn bè nhé' }
  }
  if (coupon.kind === 'reward' && coupon.owner_learner_id && coupon.owner_learner_id !== learnerId) {
    return { ok: false, reason: 'Mã này thuộc tài khoản khác' }
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
  return { ok: true, id: coupon.id, code: coupon.code, discount }
}

async function priceCoupon(code: string, subtotal: number, learnerId: string) {
  const checked = await checkCoupon(code, subtotal, learnerId)
  return checked.ok ? checked : null
}

/**
 * POST /learner/:id/coupons/validate — the checkout's coupon field. Same as the
 * public `/coupons/validate`, plus the rules that need to know who is asking
 * (your own referral code, someone else's reward). No side effects.
 */
router.post('/:id/coupons/validate', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase()
    const subtotal = Math.max(0, Math.round(Number(req.body?.subtotal) || 0))
    if (!code) throw new HttpError('Thiếu mã giảm giá', 400, 'INVALID_BODY')
    const checked = await checkCoupon(code, subtotal, String(req.params.id))
    if (!checked.ok) {
      success(res, { valid: false, reason: checked.reason, discount: 0 })
      return
    }
    success(res, {
      valid: true,
      reason: '',
      code: checked.code,
      discount: checked.discount,
      total: Math.max(0, subtotal - checked.discount),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /learner/:id/orders — the site's checkout creating a bank-transfer order.
 *
 * Idempotent by design: a pending order for the same learner and programme is
 * returned as-is rather than duplicated, so reloading the checkout page (or
 * clicking twice) never produces two orders to reconcile. Someone who already
 * has access gets a 409 — there is nothing to sell them.
 *
 * The order is born `pending` with `method = 'transfer'`. Marking it paid and
 * granting access stay console actions (`/payments/:id/confirm`,
 * `/orders/:id/enrol`) — money is confirmed by a person, not by the browser
 * that claims to have sent it.
 */
router.post('/:id/orders', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const programSlug = String(req.body?.programSlug || '').trim()
    const couponCode = String(req.body?.couponCode || '').trim().toUpperCase()
    if (!programSlug) throw new HttpError('programSlug là bắt buộc', 400, 'INVALID_BODY')

    const learner = await pool.query('SELECT id, name, email, phone FROM learners WHERE id = $1', [
      learnerId,
    ])
    if (!learner.rows.length) throw new HttpError('Học viên không tồn tại', 404, 'NOT_FOUND')

    const program = await pool.query(
      `SELECT id, title, price FROM programs WHERE slug = $1 AND status = 'published'`,
      [programSlug],
    )
    if (!program.rows.length) throw new HttpError('Chương trình không tồn tại', 404, 'NOT_FOUND')
    if (program.rows[0].price <= 0) {
      throw new HttpError('Chương trình miễn phí, không cần thanh toán', 409, 'PROGRAM_FREE')
    }

    const enrolled = await pool.query(
      `SELECT 1 FROM enrolments WHERE learner_id = $1 AND program_id = $2 AND status = 'active'`,
      [learnerId, program.rows[0].id],
    )
    if (enrolled.rows.length) {
      throw new HttpError('Bạn đã có quyền truy cập chương trình này', 409, 'ALREADY_ENROLLED')
    }

    const existing = await pool.query(
      `SELECT * FROM orders
        WHERE learner_id = $1 AND program_id = $2 AND status = 'pending'
        ORDER BY created_at DESC LIMIT 1`,
      [learnerId, program.rows[0].id],
    )
    if (existing.rows.length) {
      success(res, { order: toOrder(existing.rows[0]), created: false })
      return
    }

    const subtotal = program.rows[0].price
    const coupon = couponCode ? await priceCoupon(couponCode, subtotal, learnerId) : null
    const discount = coupon?.discount ?? 0

    const inserted = await pool.query(
      `INSERT INTO orders
         (id, code, learner_id, customer, email, phone, program_id, program_title,
          quantity, subtotal, coupon_code, discount, total, method, status, enrolled)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, 1, $9,$10,$11,$12, 'transfer', 'pending', FALSE)
       RETURNING *`,
      [
        generateId('ord'),
        `SA${Date.now().toString(36).toUpperCase()}`,
        learnerId,
        learner.rows[0].name,
        learner.rows[0].email,
        learner.rows[0].phone || '',
        program.rows[0].id,
        program.rows[0].title,
        subtotal,
        coupon?.code ?? null,
        discount,
        Math.max(0, subtotal - discount),
      ],
    )
    // The code is spent when an order carries it — quota counts orders, not payments.
    if (coupon) {
      await pool.query('UPDATE coupons SET used = used + 1, updated_at = NOW() WHERE id = $1', [
        coupon.id,
      ])
    }

    const row = inserted.rows[0]
    sendOnceInBackground(
      'order',
      row.id,
      orderEmail({
        email: row.email,
        customer: row.customer,
        code: row.code,
        programTitle: row.program_title,
        subtotal: row.subtotal,
        discount: row.discount,
        total: row.total,
        couponCode: row.coupon_code,
        programSlug,
      }),
    )
    success(res, { order: toOrder(row), created: true }, 201)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /learner/:id/orders?programSlug= — this learner's orders, newest first.
 * The checkout page reads it to resume a pending transfer instead of minting a
 * fresh order on every visit. The site addresses programmes by slug, so the
 * filter takes the slug and resolves it here.
 */
router.get('/:id/orders', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params: unknown[] = [String(req.params.id)]
    let where = 'o.learner_id = $1'
    if (req.query.programSlug) {
      params.push(String(req.query.programSlug))
      where += ` AND o.program_id = (SELECT id FROM programs WHERE slug = $2)`
    }
    const { rows } = await pool.query(
      `SELECT o.* FROM orders o WHERE ${where} ORDER BY o.created_at DESC LIMIT 20`,
      params,
    )
    success(res, { orders: rows.map(toOrder) })
  } catch (err) {
    next(err)
  }
})

export default router
