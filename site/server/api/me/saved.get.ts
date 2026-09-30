import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** GET /api/me/saved — the signed-in learner's bookmarked programme slugs. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch<{ slugs: string[] }>(event, `/learner/${encodeURIComponent(learner.id)}/saved`)
})
