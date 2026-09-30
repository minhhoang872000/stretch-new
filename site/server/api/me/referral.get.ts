import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** GET /api/me/referral — the learner's personal referral code and what it earned. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(event, `/learner/${encodeURIComponent(learner.id)}/referral`)
})
