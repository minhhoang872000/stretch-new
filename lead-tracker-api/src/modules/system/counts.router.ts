import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { requireAuth } from '../../middleware/requireAuth'
import { success } from '../../utils/response'

/**
 * The console's sidebar badges, in one query.
 *
 * Every one of these is "how many rows need someone to look at them", and the
 * sidebar wants the number, not the rows. Fetching eight collections in full to
 * count them client-side is what the console did while it ran on a mock store;
 * against a real API that would be eight requests and a few hundred kilobytes
 * on every page load, to render eight integers.
 */
const router = Router()

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM bookings           WHERE status = 'pending')::int   AS bookings_pending,
        (SELECT COUNT(*) FROM orders             WHERE status = 'pending')::int   AS orders_pending,
        (SELECT COUNT(*) FROM program_reviews    WHERE status = 'pending')::int   AS reviews_pending,
        (SELECT COUNT(*) FROM enquiries          WHERE status = 'new')::int       AS enquiries_new,
        (SELECT COUNT(*) FROM lesson_video_index WHERE status = 'missing')::int   AS videos_missing,
        (SELECT COUNT(*) FROM translations       WHERE status <> 'ok')::int       AS translations_missing,
        (SELECT COUNT(*) FROM program_sessions   WHERE date = CURRENT_DATE)::int  AS sessions_today,
        (SELECT COUNT(*) FROM programs           WHERE status = 'draft')::int     AS programs_draft
    `)

    const r = result.rows[0]
    success(res, {
      bookingsPending: r.bookings_pending,
      ordersPending: r.orders_pending,
      reviewsPending: r.reviews_pending,
      enquiriesNew: r.enquiries_new,
      videosMissing: r.videos_missing,
      translationsMissing: r.translations_missing,
      sessionsToday: r.sessions_today,
      programsDraft: r.programs_draft,
    })
  } catch (err) {
    next(err)
  }
})

export default router
