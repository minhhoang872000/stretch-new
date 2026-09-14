import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * POST /api/me/progress — the player reporting how far a lesson got.
 *
 * The browser sends the lesson and how much of it played; the learner comes
 * from the session on this server. Someone editing the request body can lie
 * about which lesson they watched — they cannot lie about who they are, and the
 * API refuses the write outright unless that learner holds the course.
 */
export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const body = await readBody(event)

  const programId = String(body?.programId || '')
  if (!programId) throw createError({ statusCode: 400, message: 'programId là bắt buộc' })

  setHeader(event, 'cache-control', 'no-store')

  return learnerFetch(event, `/learner/${encodeURIComponent(learner.id)}/progress`, {
    method: 'POST',
    body: {
      programId,
      moduleIndex: Number(body?.moduleIndex) || 0,
      itemIndex: Number(body?.itemIndex) || 0,
      ordinal: body?.ordinal ?? null,
      lessonTitle: String(body?.lessonTitle || ''),
      watchedSeconds: Number(body?.watchedSeconds) || 0,
      durationSeconds: Number(body?.durationSeconds) || 0,
    },
  })
})
