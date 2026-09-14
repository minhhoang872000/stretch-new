/**
 * Server-side reader for the learner API.
 *
 * The rule this file exists to enforce: **the learner id comes from the session
 * on this server, never from the request.** A route that took `?learnerId=`
 * from the browser would hand anyone else's course history to whoever asked.
 *
 * The service token stays here too. It is not a learner credential — it says
 * "a server you trust has already checked who this is" — so it must never
 * reach the browser, which is why none of this lives in a composable.
 */

export interface SessionLearner {
  id: string
  name: string
  email: string
  avatar: string
  initials: string
}

function config(event: any) {
  const runtime = useRuntimeConfig(event)
  return {
    base: String(runtime.lessonApiBase || '').replace(/\/$/, ''),
    token: String(runtime.siteServiceToken || ''),
  }
}

/** One call to the learner API, already carrying the service token. */
export async function learnerFetch<T>(
  event: any,
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { base, token } = config(event)
  if (!base || !token) {
    throw createError({
      statusCode: 503,
      message: 'Learner API chưa được cấu hình (NUXT_LESSON_API_BASE / NUXT_SITE_SERVICE_TOKEN)',
    })
  }

  const res = await $fetch<{ success: boolean; data?: T; error?: { message: string } }>(
    `${base}${path}`,
    {
      method: (options.method as any) || 'GET',
      headers: { 'x-service-token': token },
      body: options.body,
      timeout: 8000,
    },
  )
  return res?.data as T
}

/**
 * Who is signed in, as a learner row.
 *
 * `nuxt-auth-utils` holds the Google profile; the learner id is put into that
 * session at sign-in (see `api/auth/google.get.ts`). Reading it back here means
 * every learner route agrees on one source of truth.
 */
export async function requireLearner(event: any): Promise<SessionLearner> {
  const session = await getUserSession(event)
  const user = session?.user as
    | { name?: string; email?: string; avatar?: string; learner?: SessionLearner | null }
    | undefined
  if (user?.learner?.id) return user.learner

  // A session without a learner is a Google sign-in that happened while the
  // learner API was unreachable (sign-in deliberately succeeds anyway). Retry
  // the identify here so the person is not stuck 401ing until they sign out —
  // the session predates this outage-shaped hole, so heal it in place.
  if (user?.email) {
    try {
      const result = await identifyLearner(event, {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      })
      const learner = result?.learner
      if (learner?.id) {
        await setUserSession(event, { user: { ...user, learner } })
        return learner
      }
    } catch {
      // API still unreachable — same 401 as before, and the next call retries.
    }
  }

  throw createError({ statusCode: 401, message: 'Bạn cần đăng nhập' })
}

/**
 * Create or update the learner behind a Google profile.
 *
 * Called once, at sign-in. Everything after that addresses the learner by the
 * id this returns.
 */
export function identifyLearner(
  event: any,
  profile: { email: string; name?: string; avatar?: string; googleSub?: string },
) {
  return learnerFetch<{ learner: SessionLearner & { status: string }; created: boolean }>(
    event,
    '/learner/identify',
    { method: 'POST', body: profile },
  )
}
