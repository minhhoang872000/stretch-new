import { apiBase, requireLearner, serviceToken, upstreamMessage } from '~~/server/utils/mentorshipApi'

/**
 * GET /api/mentorship/mine
 *
 * The signed-in learner's own 1-to-1 requests — what the lesson page shows once
 * something has been asked for ("waiting for confirmation", or the Meet link).
 *
 * The email is taken from the session, never from a query parameter, so this
 * cannot be turned into a way to read somebody else's bookings.
 */

export interface LearnerSession {
  id: string
  programSlug: string | null
  lessonKey: string | null
  lessonTitle: string | null
  topic: string | null
  date: string
  time: string
  durationMinutes: number
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
  meetUrl: string | null
  googleHtmlLink: string | null
  declineReason: string | null
  createdAt: string
}

export default defineEventHandler(async (event): Promise<{ sessions: LearnerSession[] }> => {
  const learner = await requireLearner(event)

  const base = apiBase(event)
  const token = serviceToken(event)
  if (!base || !token) return { sessions: [] }

  setHeader(event, 'cache-control', 'no-store')

  try {
    const res = await $fetch<{ data?: { sessions?: LearnerSession[] } }>(`${base}/mentorship/mine`, {
      query: { email: learner.email },
      headers: { 'x-service-token': token },
      timeout: 8000,
    })
    return { sessions: res?.data?.sessions ?? [] }
  } catch (err: any) {
    console.error('[mentorship/mine]', upstreamMessage(err, 'lookup failed'))
    return { sessions: [] }
  }
})
