import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/** PUT /api/me/saved — add slugs to the account's list (a merge, never a replace). */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const body = await readBody<{ slugs?: unknown[] }>(event)
  const slugs = (Array.isArray(body?.slugs) ? body.slugs : []).map((s) => String(s || '')).filter(Boolean).slice(0, 200)
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch<{ slugs: string[] }>(event, `/learner/${encodeURIComponent(learner.id)}/saved`, {
    method: 'PUT',
    body: { slugs },
  })
})
