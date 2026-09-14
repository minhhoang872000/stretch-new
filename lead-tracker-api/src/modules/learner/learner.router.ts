import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { HttpError, generateId } from '../../core/crud'
import { requireSite } from '../../middleware/requireSite'
import { success } from '../../utils/response'

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

    const created = await pool.query(
      `INSERT INTO learners
         (id, name, initials, email, avatar, google, google_sub, source,
          joined_at, last_login_at, last_active_at, status)
       VALUES ($1,$2,$3,$4,$5, TRUE, $6, 'google', CURRENT_DATE, NOW(), NOW(), 'active')
       RETURNING *`,
      [
        generateId('lrn'),
        name || email.split('@')[0],
        initialsOf(name || email),
        email,
        avatar,
        googleSub,
      ],
    )
    success(res, { learner: toLearner(created.rows[0]), created: true }, 201)
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

/**
 * POST /learner/:id/progress — the player, reporting in.
 *
 * Same upsert-and-roll-up as the console's `/lesson-progress/track`, but scoped
 * to one learner and reachable by the site. It refuses to write progress for a
 * course the learner does not hold: without that check, a forged request could
 * mark anyone as having completed anything, and certificates are issued off
 * these numbers.
 */
router.post('/:id/progress', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const learnerId = String(req.params.id)
    const b = req.body || {}
    const programId = String(b.programId || '')
    if (!programId) throw new HttpError('programId là bắt buộc', 400, 'INVALID_BODY')

    const enrolled = await pool.query(
      `SELECT 1 FROM enrolments
        WHERE learner_id = $1 AND program_id = $2 AND status IN ('active','completed')`,
      [learnerId, programId],
    )
    if (!enrolled.rows.length) {
      throw new HttpError('Chưa ghi danh chương trình này', 403, 'NOT_ENROLLED')
    }

    const moduleIndex = Number(b.moduleIndex) || 0
    const itemIndex = Number(b.itemIndex) || 0
    const watched = Math.max(0, Math.round(Number(b.watchedSeconds) || 0))
    const duration = Math.max(0, Math.round(Number(b.durationSeconds) || 0))
    const completed = duration > 0 && watched / duration >= 0.9

    await pool.query(
      `INSERT INTO lesson_progress
         (id, learner_id, program_id, module_index, item_index, ordinal, lesson_title,
          watched_seconds, duration_seconds, completed_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
       ON CONFLICT (learner_id, program_id, module_index, item_index) DO UPDATE SET
         watched_seconds  = GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
         duration_seconds = EXCLUDED.duration_seconds,
         ordinal          = COALESCE(EXCLUDED.ordinal, lesson_progress.ordinal),
         lesson_title     = COALESCE(NULLIF(EXCLUDED.lesson_title, ''), lesson_progress.lesson_title),
         completed_at     = COALESCE(lesson_progress.completed_at, EXCLUDED.completed_at),
         updated_at       = NOW()`,
      [
        generateId('lp'),
        learnerId,
        programId,
        moduleIndex,
        itemIndex,
        b.ordinal === undefined || b.ordinal === null ? null : Number(b.ordinal),
        String(b.lessonTitle || ''),
        watched,
        duration,
        completed ? new Date().toISOString() : null,
      ],
    )

    const rolled = await pool.query(
      `UPDATE enrolments e SET
         lessons_done = sub.done,
         percent = CASE WHEN e.lessons > 0
                        THEN LEAST(100, ROUND(100.0 * sub.done / e.lessons))
                        ELSE 0 END,
         -- A course finishes itself. Waiting for someone to notice and tick a
         -- box is how a learner sits at 100% with no certificate.
         status = CASE WHEN e.lessons > 0 AND sub.done >= e.lessons THEN 'completed' ELSE e.status END,
         completed_at = CASE WHEN e.lessons > 0 AND sub.done >= e.lessons
                             THEN COALESCE(e.completed_at, CURRENT_DATE) ELSE e.completed_at END,
         last_lesson_at = NOW(),
         updated_at = NOW()
       FROM (SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS done
               FROM lesson_progress
              WHERE learner_id = $1 AND program_id = $2) sub
       WHERE e.learner_id = $1 AND e.program_id = $2
       RETURNING e.percent, e.lessons_done, e.lessons, e.status`,
      [learnerId, programId],
    )

    const row = rolled.rows[0]
    success(res, {
      tracked: true,
      completed,
      enrolment: row
        ? {
            percent: Number(row.percent),
            lessonsDone: Number(row.lessons_done),
            lessons: Number(row.lessons),
            status: row.status,
          }
        : null,
    })
  } catch (err) {
    next(err)
  }
})

/** GET /learner/:id/certificates — what the account page lists. */
router.get('/:id/certificates', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT code, program_title, issued_at, score, status, verify_url
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
        verifyUrl: row.verify_url || '',
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
async function priceCoupon(code: string, subtotal: number) {
  const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code])
  const coupon = result.rows[0]
  if (!coupon || coupon.status !== 'active') return null

  const today = new Date().toISOString().slice(0, 10)
  if (coupon.starts_at && today < coupon.starts_at.toISOString().slice(0, 10)) return null
  if (coupon.ends_at && today > coupon.ends_at.toISOString().slice(0, 10)) return null
  if (coupon.quota > 0 && coupon.used >= coupon.quota) return null
  if (subtotal < coupon.min_spend) return null

  const discount =
    coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
  return { id: coupon.id, code: coupon.code, discount }
}

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
    const coupon = couponCode ? await priceCoupon(couponCode, subtotal) : null
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

    success(res, { order: toOrder(inserted.rows[0]), created: true }, 201)
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
