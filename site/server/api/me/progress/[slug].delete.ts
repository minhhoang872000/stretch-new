import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** DELETE /api/me/progress/:slug — "học lại từ đầu" on the account. */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/progress/${encodeURIComponent(slug)}`,
    { method: 'DELETE' },
  )
})
