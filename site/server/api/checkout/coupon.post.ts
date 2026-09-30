import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * POST /api/checkout/coupon — price a coupon against a subtotal, without
 * spending it. Proxies the API's side-effect-free learner coupon check (which also knows
 * your own referral code from a friend's) so the
 * browser keeps talking to one origin. The discount shown here is advisory;
 * the API re-prices the code at the moment the order is written.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const body = await readBody<{ code?: string; subtotal?: number }>(event)
  const code = String(body?.code || '').trim()
  if (!code) throw createError({ statusCode: 400, message: 'Thiếu mã giảm giá' })

  type Priced = { valid: boolean; reason: string; discount: number; total?: number }
  const payload = { code, subtotal: Math.max(0, Math.round(Number(body?.subtotal) || 0)) }
  const data = await learnerFetch<Priced>(
    event,
    `/learner/${encodeURIComponent(learner.id)}/coupons/validate`,
    { method: 'POST', body: payload },
  ).catch((err: any) => {
    // An API build older than the learner route: the generic check still prices it.
    if (err?.statusCode === 404 || err?.response?.status === 404) {
      return learnerFetch<Priced>(event, '/coupons/validate', { method: 'POST', body: payload })
    }
    throw err
  })

  setHeader(event, 'cache-control', 'no-store')
  return data
})
