import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** GET /api/me/certificates — what the account page lists. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(event, `/learner/${encodeURIComponent(learner.id)}/certificates`)
})
