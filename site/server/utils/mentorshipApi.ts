import type { H3Event } from 'h3'

/**
 * Talking to lead-tracker-api about 1-to-1 sessions.
 *
 * The learner's browser never reaches that API directly. It asks this server,
 * this server checks the Google session, and only then forwards with the shared
 * service token — the same arrangement `server/api/lessons/video.get.ts` uses
 * for signed video URLs, and the reason the token must stay server-side.
 */

export interface MentorshipLearner {
  name: string
  email: string
  avatar: string | null
}

/** `https://…/api/v1`, from the lesson API base or the public tracking host. */
export function apiBase(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const direct = String(config.lessonApiBase || '').replace(/\/$/, '')
  if (direct) return direct

  const host = String(config.public?.trackingApiUrl || '').replace(/\/$/, '')
  return host ? `${host}/api/v1` : ''
}

export function serviceToken(event: H3Event): string {
  return String(useRuntimeConfig(event).siteServiceToken || '')
}

/**
 * The signed-in learner, or a 401.
 *
 * A real Google session is required rather than the hub's demo cookie: an
 * accepted session becomes a calendar invitation, and that needs an email
 * address the demo login simply does not have.
 */
export async function requireLearner(event: H3Event): Promise<MentorshipLearner> {
  const session = await getUserSession(event)
  const user = session?.user as { name?: string; email?: string; avatar?: string } | undefined

  if (!user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in required',
      message: 'Anh/chị vui lòng đăng nhập bằng Google để đặt buổi học 1-1.',
    })
  }

  return {
    name: user.name || user.email.split('@')[0]!,
    email: user.email,
    avatar: user.avatar || null,
  }
}

/** Pulls the human-readable message out of an API error, whatever shape it took. */
export function upstreamMessage(err: any, fallback: string): string {
  return (
    err?.data?.error?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  )
}
