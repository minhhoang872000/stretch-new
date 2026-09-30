import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * PUT /api/me/progress/:slug — a batch of lesson writes from the player
 * (ticks, playheads, notes). The API refuses a course the learner does not
 * hold; a free course enrols them on the first write.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  const body = await readBody<{ lessons?: unknown[] }>(event)
  const lessons = (Array.isArray(body?.lessons) ? body.lessons : []).slice(0, 300).map((raw: any) => ({
    moduleIndex: Number(raw?.moduleIndex) || 0,
    itemIndex: Number(raw?.itemIndex) || 0,
    lessonTitle: raw?.lessonTitle ? String(raw.lessonTitle).slice(0, 300) : undefined,
    positionSeconds: raw?.positionSeconds === undefined ? undefined : Number(raw.positionSeconds) || 0,
    watchedSeconds: raw?.watchedSeconds === undefined ? undefined : Number(raw.watchedSeconds) || 0,
    durationSeconds: raw?.durationSeconds === undefined ? undefined : Number(raw.durationSeconds) || 0,
    done: typeof raw?.done === 'boolean' ? raw.done : undefined,
    note: raw?.note === undefined ? undefined : String(raw.note).slice(0, 20000),
  }))
  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/progress/${encodeURIComponent(slug)}`,
    { method: 'PUT', body: { lessons } },
  )
})
