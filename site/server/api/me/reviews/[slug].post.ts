import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * POST /api/me/reviews/:slug — a star rating and text for a finished course.
 * Lands as `pending`; the console approves it before the course page shows it.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  const body = await readBody<{ rating?: number; text?: string }>(event)
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/reviews/${encodeURIComponent(slug)}`,
    {
      method: 'POST',
      body: { rating: Number(body?.rating) || 0, text: String(body?.text || '').slice(0, 3000) },
    },
  )
})
