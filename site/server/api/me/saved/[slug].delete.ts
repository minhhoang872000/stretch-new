import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** DELETE /api/me/saved/:slug — un-bookmark on the account. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/saved/${encodeURIComponent(slug)}`,
    { method: 'DELETE' },
  )
})
