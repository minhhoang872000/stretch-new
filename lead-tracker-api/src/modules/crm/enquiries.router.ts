import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { type Resource } from '../../core/crud'
import { requireAuth } from '../../middleware/requireAuth'
import { success } from '../../utils/response'

/**
 * CRM — corporate enquiries, and the conversion funnel.
 *
 * An enquiry is a company asking about training for a team: a named contact
 * with a budget and an owner. That is a different object from `lead_events`,
 * which is anonymous page-level tracking, and the two are deliberately not
 * merged — one is a person you call back, the other is a count.
 *
 * The funnel below is measured from `lead_events`, `bookings` and `orders`
 * rather than stored. A funnel is a ratio between things that already exist;
 * storing it would only create a second version that can be wrong.
 */

const enquiriesResource: Resource = {
  name: 'enquiries',
  table: 'enquiries',
  idPrefix: 'enq',
  defaultOrder: 'created_at DESC',
  search: ['company', 'contact', 'email', 'phone', 'need'],
  filters: ['status', 'owner', 'industry', 'source'],
  sortable: ['createdAt', 'budget', 'headcount', 'status', 'nextFollowUp'],
  fields: {
    id: { readOnly: true },
    company: { required: true },
    companySize: { fallback: '' },
    industry: { fallback: '' },
    contact: { fallback: '' },
    email: { fallback: '' },
    phone: { fallback: '' },
    interest: { fallback: '' },
    need: { fallback: '' },
    headcount: { type: 'int', fallback: 0 },
    budget: { type: 'int', fallback: 0 },
    source: { fallback: '' },
    status: { fallback: 'new' },
    owner: { fallback: '' },
    nextFollowUp: { type: 'date' },
    lastNote: { fallback: '' },
    createdAt: { type: 'timestamp', readOnly: true },
    updatedAt: { type: 'timestamp', readOnly: true },
  },
}

const enquiries = createCrudRouter(enquiriesResource, {
  extend(sub, repo) {
    /**
     * Public: the "train my team" form on the site. The only unauthenticated
     * write in this module, and it can only ever create a `new` enquiry — the
     * owner, the status and the follow-up date are the sales team's to set.
     */
    sub.post('/public', async (req, res, next) => {
      try {
        const b = req.body || {}
        const row = await repo.create({
          company: String(b.company || '').trim() || 'Chưa rõ',
          contact: String(b.contact || b.name || ''),
          email: String(b.email || ''),
          phone: String(b.phone || ''),
          companySize: String(b.companySize || ''),
          industry: String(b.industry || ''),
          interest: String(b.interest || ''),
          need: String(b.need || b.message || ''),
          headcount: Number(b.headcount) || 0,
          source: String(b.source || 'website'),
          status: 'new',
        })
        success(res, { id: (row as any).id, received: true }, 201)
      } catch (err) {
        next(err)
      }
    })

    /** Log a call without touching the rest of the row. */
    sub.post('/:id/note', requireAuth, async (req, res, next) => {
      try {
        success(
          res,
          await repo.update(String(req.params.id), {
            lastNote: String(req.body?.note || ''),
            nextFollowUp: req.body?.nextFollowUp ?? undefined,
          }),
        )
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Funnel ──────────────────────────────────────────────────────────

const funnel = Router()

/**
 * Visitors → CTA click → booking → confirmed → paid order, over a window.
 *
 * Each step counts distinct sessions where it can, because a person who clicks
 * three CTAs is one person, and a funnel that counts them three times reports a
 * conversion rate above what actually happened.
 */
funnel.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.min(Math.max(1, Number(req.query.days) || 30), 365)

    const [events, bookings, orders] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT session_id)::int AS visitors,
                COUNT(DISTINCT session_id) FILTER (WHERE cta_clicked IS NOT NULL)::int AS cta,
                COUNT(DISTINCT session_id) FILTER (WHERE form_source IS NOT NULL)::int AS forms
           FROM lead_events
          WHERE created_at > NOW() - ($1::int * INTERVAL '1 day')`,
        [days],
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status IN ('confirmed','completed'))::int AS confirmed
           FROM bookings
          WHERE created_at > NOW() - ($1::int * INTERVAL '1 day')`,
        [days],
      ),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'paid')::int AS paid
           FROM orders
          WHERE created_at > NOW() - ($1::int * INTERVAL '1 day')`,
        [days],
      ),
    ])

    const e = events.rows[0]
    const b = bookings.rows[0]
    const steps = [
      { step: 'Phiên truy cập', count: e.visitors, note: 'Session có sự kiện tracking' },
      { step: 'Bấm CTA', count: e.cta, note: 'Session bấm ít nhất một nút' },
      { step: 'Mở form', count: e.forms, note: 'Session chạm vào form đặt lịch' },
      { step: 'Đặt lịch', count: b.total, note: 'Booking được tạo' },
      { step: 'Xác nhận', count: b.confirmed, note: 'Booking đã xác nhận hoặc hoàn tất' },
      { step: 'Đơn đã thanh toán', count: orders.rows[0].paid, note: 'Đơn khoá học đã trả tiền' },
    ]

    success(res, {
      days,
      funnel: steps.map((row, index) => ({
        ...row,
        // Conversion against the previous step, which is the number that tells
        // you where people leave. Against the top it only ever says "few".
        rateFromPrevious:
          index === 0 || !steps[index - 1]!.count
            ? 100
            : Math.round((row.count / steps[index - 1]!.count) * 100),
      })),
    })
  } catch (err) {
    next(err)
  }
})

/** Which CTAs actually earn their place on the page. */
funnel.get('/cta', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.min(Math.max(1, Number(req.query.days) || 30), 365)
    const result = await pool.query(
      `SELECT cta_clicked AS name,
              COUNT(*)::int AS clicks,
              COUNT(DISTINCT session_id)::int AS sessions,
              COUNT(*) FILTER (WHERE form_source IS NOT NULL)::int AS submits,
              COALESCE(MAX(page_source), '') AS source
         FROM lead_events
        WHERE cta_clicked IS NOT NULL
          AND created_at > NOW() - ($1::int * INTERVAL '1 day')
        GROUP BY cta_clicked
        ORDER BY clicks DESC
        LIMIT 25`,
      [days],
    )
    success(res, { ctaBreakdown: result.rows })
  } catch (err) {
    next(err)
  }
})

const router = Router()
router.use('/enquiries', enquiries.router)
router.use('/funnel', funnel)

export default router
