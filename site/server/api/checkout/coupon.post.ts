import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * POST /api/checkout/coupon — price a coupon against a subtotal, without
 * spending it. Proxies the API's side-effect-free `/coupons/validate` so the
 * browser keeps talking to one origin. The discount shown here is advisory;
 * the API re-prices the code at the moment the order is written.
 */
export default defineEventHandler(async (event) => {
  await requireLearner(event)
  const body = await readBody<{ code?: string; subtotal?: number }>(event)
  const code = String(body?.code || '').trim()
  if (!code) throw createError({ statusCode: 400, message: 'Thiếu mã giảm giá' })

  const data = await learnerFetch<{
    valid: boolean
    reason: string
    discount: number
    total?: number
  }>(event, '/coupons/validate', {
    method: 'POST',
    body: { code, subtotal: Math.max(0, Math.round(Number(body?.subtotal) || 0)) },
  })

  setHeader(event, 'cache-control', 'no-store')
  return data
})
