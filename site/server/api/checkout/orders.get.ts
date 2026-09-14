import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'
import type { CheckoutOrder } from '~~/server/api/checkout/orders.post'

/**
 * GET /api/checkout/orders?slug= — the signed-in learner's orders for one
 * course, newest first. The checkout page reads it to resume a pending
 * transfer instead of minting a fresh order on every visit.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getQuery(event).slug || '').trim()
  if (!slug) throw createError({ statusCode: 400, message: 'Thiếu slug chương trình' })

  const data = await learnerFetch<{ orders: CheckoutOrder[] }>(
    event,
    `/learner/${encodeURIComponent(learner.id)}/orders?programSlug=${encodeURIComponent(slug)}`,
  )

  setHeader(event, 'cache-control', 'no-store')
  return { orders: data.orders || [] }
})
