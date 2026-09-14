import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * GET /api/me/access/:slug — may I watch this course?
 *
 * The question the lesson player asks before it plays anything, and the one the
 * course page asks to decide between "Vào học" and "Đăng ký".
 *
 * A signed-out visitor gets a plain answer rather than a 401: the course page
 * is public and needs to render for them too, it just shows the sign-in button.
 */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) throw createError({ statusCode: 400, message: 'slug là bắt buộc' })

  setHeader(event, 'cache-control', 'no-store')

  const session = await getUserSession(event)
  if (!(session?.user as any)?.learner?.id) {
    return { allowed: false, reason: 'signed-out', percent: 0, enrolmentId: null }
  }

  const learner = await requireLearner(event)
  return learnerFetch(
    event,
    `/learner/${encodeURIComponent(learner.id)}/access/${encodeURIComponent(slug)}`,
  )
})
