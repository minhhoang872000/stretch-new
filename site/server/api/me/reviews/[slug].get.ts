import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** GET /api/me/reviews/:slug — may this learner review the course, and their review if written. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/reviews/${encodeURIComponent(slug)}`,
  )
})
