import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { HttpError, type Resource } from '../../core/crud'
import { requireAuth } from '../../middleware/requireAuth'
import { success } from '../../utils/response'

/**
 * Sales — orders, the payments that settle them, and coupons.
 *
 * The one rule worth stating: an order being paid and a learner having access
 * are two different facts, and this API keeps them that way. `orders.enrolled`
 * is false until someone (or `POST /orders/:id/enrol`) actually grants the
 * course. A paid order with no enrolment is exactly what the Orders screen is
 * for finding, so collapsing the two would delete the screen's purpose.
 */

const timestamps = {
  createdAt: { type: 'timestamp', readOnly: true },
  updatedAt: { type: 'timestamp', readOnly: true },
} as const

const couponsResource: Resource = {
  name: 'coupons',
  table: 'coupons',
  idPrefix: 'cpn',
  defaultOrder: 'created_at DESC',
  search: ['code', 'note'],
  filters: ['status', 'type', 'scope'],
  sortable: ['code', 'value', 'used', 'endsAt', 'status'],
  fields: {
    id: { readOnly: true },
    code: { required: true },
    type: { fallback: 'percent' },
    value: { type: 'int', fallback: 0 },
    scope: { fallback: 'all' },
    minSpend: { type: 'int', fallback: 0 },
    quota: { type: 'int', fallback: 0 },
    used: { type: 'int', fallback: 0 },
    startsAt: { type: 'date' },
    endsAt: { type: 'date' },
    status: { fallback: 'active' },
    note: { fallback: '' },
    ...timestamps,
  },
}

const ordersResource: Resource = {
  name: 'orders',
  table: 'orders',
  idPrefix: 'ord',
  defaultOrder: 'created_at DESC',
  search: ['code', 'customer', 'email', 'phone', 'program_title'],
  filters: ['status', 'method', 'programId', 'learnerId', 'enrolled'],
  sortable: ['createdAt', 'total', 'status', 'paidAt'],
  fields: {
    id: { readOnly: true },
    code: {},
    learnerId: {},
    customer: { fallback: '' },
    email: { fallback: '' },
    phone: { fallback: '' },
    programId: {},
    programTitle: { fallback: '' },
    quantity: { type: 'int', fallback: 1 },
    subtotal: { type: 'int', fallback: 0 },
    couponCode: {},
    discount: { type: 'int', fallback: 0 },
    total: { type: 'int', fallback: 0 },
    method: {},
    status: { fallback: 'pending' },
    enrolled: { type: 'bool', fallback: false },
    paidAt: { type: 'timestamp' },
    note: { fallback: '' },
    ...timestamps,
  },
}

const paymentsResource: Resource = {
  name: 'payments',
  table: 'payments',
  idPrefix: 'pay',
  defaultOrder: 'received_at DESC NULLS LAST',
  search: ['order_code', 'customer', 'reference'],
  filters: ['status', 'method', 'orderId', 'reconciled'],
  sortable: ['receivedAt', 'amount', 'status'],
  fields: {
    id: { readOnly: true },
    orderId: {},
    orderCode: { fallback: '' },
    customer: { fallback: '' },
    amount: { type: 'int', fallback: 0 },
    method: {},
    reference: { fallback: '' },
    status: { fallback: 'pending' },
    reconciled: { type: 'bool', fallback: false },
    receivedAt: { type: 'timestamp' },
    note: { fallback: '' },
    ...timestamps,
  },
}

// ─── Coupons ─────────────────────────────────────────────────────────

const coupons = createCrudRouter(couponsResource, {
  beforeWrite(body) {
    // Codes are typed by customers, compared by machines. Normalise on write so
    // the comparison never has to care.
    if (body.code) body.code = String(body.code).trim().toUpperCase()
    return body
  },
  extend(sub) {
    /**
     * Check a code and price it, without spending it. The site's checkout calls
     * this while the customer is still typing, so it must not have side effects.
     */
    sub.post('/validate', async (req, res, next) => {
      try {
        const code = String(req.body?.code || '').trim().toUpperCase()
        const subtotal = Math.max(0, Math.round(Number(req.body?.subtotal) || 0))
        if (!code) throw new HttpError('Thiếu mã giảm giá', 400, 'INVALID_BODY')

        const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code])
        const coupon = result.rows[0]

        const reject = (reason: string) => success(res, { valid: false, reason, discount: 0 })
        if (!coupon) return reject('Mã không tồn tại')
        if (coupon.status !== 'active') return reject('Mã đã ngừng áp dụng')

        const today = new Date().toISOString().slice(0, 10)
        if (coupon.starts_at && today < coupon.starts_at.toISOString().slice(0, 10)) {
          return reject('Mã chưa tới ngày áp dụng')
        }
        if (coupon.ends_at && today > coupon.ends_at.toISOString().slice(0, 10)) {
          return reject('Mã đã hết hạn')
        }
        if (coupon.quota > 0 && coupon.used >= coupon.quota) return reject('Mã đã hết lượt')
        if (subtotal < coupon.min_spend) {
          return reject(`Đơn tối thiểu ${coupon.min_spend.toLocaleString('vi-VN')}đ`)
        }

        // A percentage discount can never exceed the order it discounts.
        const discount =
          coupon.type === 'percent'
            ? Math.round((subtotal * coupon.value) / 100)
            : Math.min(coupon.value, subtotal)

        success(res, {
          valid: true,
          reason: '',
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount,
          total: Math.max(0, subtotal - discount),
        })
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Orders ──────────────────────────────────────────────────────────

const orders = createCrudRouter(ordersResource, {
  async beforeWrite(body) {
    if (!body.code) body.code = `SA${Date.now().toString(36).toUpperCase()}`
    if (body.programId) {
      const program = await pool.query('SELECT title, price FROM programs WHERE id = $1', [
        String(body.programId),
      ])
      if (program.rows.length) {
        body.programTitle = program.rows[0].title
        if (body.subtotal === undefined) {
          body.subtotal = program.rows[0].price * (Number(body.quantity) || 1)
        }
      }
    }
    // The total is arithmetic, not an opinion — recompute rather than trust it.
    if (body.subtotal !== undefined || body.discount !== undefined) {
      const subtotal = Number(body.subtotal) || 0
      const discount = Number(body.discount) || 0
      body.total = Math.max(0, subtotal - discount)
    }
    if (body.status === 'paid' && body.paidAt === undefined) body.paidAt = new Date().toISOString()
    return body
  },
  extend(sub, repo) {
    /**
     * Turn a paid order into access. Idempotent on the enrolment side — the
     * unique (learner, programme) key means clicking twice grants once — and it
     * refuses to run on an unpaid order, which is the whole point of the check.
     */
    sub.post('/:id/enrol', requireAuth, async (req, res, next) => {
      try {
        const order = (await repo.get(String(req.params.id))) as any
        if (order.status !== 'paid') {
          throw new HttpError('Đơn chưa thanh toán', 409, 'ORDER_NOT_PAID')
        }
        if (!order.learnerId || !order.programId) {
          throw new HttpError('Đơn thiếu học viên hoặc chương trình', 409, 'ORDER_INCOMPLETE')
        }

        const program = await pool.query('SELECT title, mode, lessons FROM programs WHERE id = $1', [
          order.programId,
        ])
        const learner = await pool.query('SELECT name FROM learners WHERE id = $1', [order.learnerId])
        if (!program.rows.length || !learner.rows.length) {
          throw new HttpError('Học viên hoặc chương trình không tồn tại', 404, 'NOT_FOUND')
        }

        await pool.query(
          `INSERT INTO enrolments
             (id, learner_id, learner_name, program_id, program_title, mode, status,
              source, lessons, started_at)
           VALUES ($1,$2,$3,$4,$5,$6,'active','order',$7, CURRENT_DATE)
           ON CONFLICT (learner_id, program_id)
           DO UPDATE SET status = 'active', updated_at = NOW()`,
          [
            `enr-${Date.now().toString(36)}`,
            order.learnerId,
            learner.rows[0].name,
            order.programId,
            program.rows[0].title,
            program.rows[0].mode,
            program.rows[0].lessons,
          ],
        )

        success(res, await repo.update(order.id, { enrolled: true }))
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Payments ────────────────────────────────────────────────────────

const payments = createCrudRouter(paymentsResource, {
  async beforeWrite(body) {
    if (body.orderId) {
      const order = await pool.query('SELECT code, customer FROM orders WHERE id = $1', [
        String(body.orderId),
      ])
      if (order.rows.length) {
        body.orderCode = order.rows[0].code
        body.customer ??= order.rows[0].customer
      }
    }
    return body
  },
  extend(sub, repo) {
    /**
     * Confirming a received payment also marks its order paid. Two writes, one
     * intent: a console where those can be done separately is a console where
     * they end up disagreeing.
     */
    sub.post('/:id/confirm', requireAuth, async (req, res, next) => {
      try {
        const payment = (await repo.update(String(req.params.id), {
          status: 'succeeded',
          reconciled: true,
          receivedAt: new Date().toISOString(),
        })) as any

        if (payment.orderId) {
          await pool.query(
            `UPDATE orders SET status = 'paid', paid_at = COALESCE(paid_at, NOW()), updated_at = NOW()
              WHERE id = $1`,
            [payment.orderId],
          )
        }
        success(res, payment)
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Reports ─────────────────────────────────────────────────────────

const insights = Router()

/** Revenue by day, from paid orders only — an unpaid order is not revenue. */
insights.get('/revenue', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.min(Math.max(1, Number(req.query.days) || 30), 365)
    const result = await pool.query(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
              COALESCE(SUM(o.total), 0)::int AS revenue,
              COUNT(o.id)::int AS orders
         FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, '1 day') AS d(day)
         LEFT JOIN orders o
                ON o.status = 'paid'
               -- generate_series over dates yields timestamptz, and Postgres has
               -- no timestamptz + integer operator: the step must be an interval.
               AND o.paid_at >= d.day
               AND o.paid_at < d.day + INTERVAL '1 day'
        GROUP BY d.day
        ORDER BY d.day`,
      [days],
    )
    success(res, { revenueTrend: result.rows })
  } catch (err) {
    next(err)
  }
})

/** The tiles above the Orders and Payments tables. */
insights.get('/summary', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int                       AS pending_orders,
         COUNT(*) FILTER (WHERE status = 'paid')::int                          AS paid_orders,
         COUNT(*) FILTER (WHERE status = 'paid' AND NOT enrolled)::int         AS paid_not_enrolled,
         COALESCE(SUM(total) FILTER (WHERE status = 'paid'), 0)::bigint        AS revenue_total,
         COALESCE(SUM(total) FILTER (
           WHERE status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE)
         ), 0)::bigint                                                          AS revenue_this_month
       FROM orders`,
    )
    const unreconciled = await pool.query(
      `SELECT COUNT(*)::int AS n FROM payments WHERE status = 'succeeded' AND NOT reconciled`,
    )
    const row = result.rows[0]
    success(res, {
      pendingOrders: row.pending_orders,
      paidOrders: row.paid_orders,
      paidNotEnrolled: row.paid_not_enrolled,
      revenueTotal: Number(row.revenue_total),
      revenueThisMonth: Number(row.revenue_this_month),
      unreconciledPayments: unreconciled.rows[0].n,
    })
  } catch (err) {
    next(err)
  }
})

const router = Router()
router.use('/orders', orders.router)
router.use('/payments', payments.router)
router.use('/coupons', coupons.router)
router.use('/sales-insights', insights)

export default router
