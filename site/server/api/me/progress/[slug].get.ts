import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * GET /api/me/progress/:slug — the signed-in learner's ticks, resume points
 * and notes for one course, so the player picks up where another device left.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/progress/${encodeURIComponent(slug)}`,
  )
})
