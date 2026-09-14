import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * POST /api/checkout/orders — create (or resume) a bank-transfer order for the
 * signed-in learner.
 *
 * The learner id comes from the session, the price from the programme row on
 * the API side — the browser only names the course and, optionally, a coupon.
 * The API is idempotent about it: an existing pending order for the same
 * course comes back instead of a duplicate.
 */
export interface CheckoutOrder {
  id: string
  code: string
  programId: string
  programTitle: string
  subtotal: number
  couponCode: string
  discount: number
  total: number
  method: string
  status: string
  enrolled: boolean
  createdAt: string
}

export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const body = await readBody<{ slug?: string; couponCode?: string }>(event)
  const slug = String(body?.slug || '').trim()
  if (!slug) throw createError({ statusCode: 400, message: 'Thiếu slug chương trình' })

  const data = await learnerFetch<{ order: CheckoutOrder; created: boolean }>(
    event,
    `/learner/${encodeURIComponent(learner.id)}/orders`,
    {
      method: 'POST',
      body: { programSlug: slug, couponCode: String(body?.couponCode || '') },
    },
  )

  setHeader(event, 'cache-control', 'no-store')
  return data
})
