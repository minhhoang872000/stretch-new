import { identifyLearner } from '~~/server/utils/learnerApi'

/**
 * Google sign-in — and sign-up, because they are the same event.
 *
 * There is no separate registration form. Google has already established who
 * this person is; asking them to fill in a name and email afterwards only loses
 * people between two screens. The first successful sign-in creates the learner
 * row, every later one updates it.
 *
 * The learner id is written into the session here and read back by every
 * learner route. That is the only place it is decided — nothing downstream
 * takes a learner id from a request.
 *
 * If the API is unreachable the person still gets a session, with no learner
 * attached: they can browse, and the pages that need an enrolment say so. A
 * failed sign-in would be the worse outcome, and the next sign-in retries.
 */
export default defineOAuthGoogleEventHandler({
  async onSuccess(event: any, { user }: { user: Record<string, unknown> }) {
    const profile = {
      email: String(user.email || ''),
      name: String(user.name || ''),
      avatar: String(user.picture || ''),
      // Google's stable subject id, so a later email change does not orphan
      // everything this learner has paid for.
      googleSub: user.sub ? String(user.sub) : undefined,
    }

    let learner = null
    try {
      const result = await identifyLearner(event, profile)
      learner = result.learner
    } catch (err: any) {
      console.error('[auth/google] identify failed:', err?.data?.statusMessage || err?.message || err)
    }

    await setUserSession(event, {
      user: {
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        learner,
      },
    })

    // Back where they started, not the home page: signing in from a course page
    // and landing on the front page means finding that course again by hand.
    // `auth=ok` is the success flag app.vue turns into a toast — a full-page
    // OAuth redirect has no other channel back to the UI.
    const next = getCookie(event, 'stretch-auth-next')
    if (next) deleteCookie(event, 'stretch-auth-next')
    const target = next && next.startsWith('/') ? next : '/'
    return sendRedirect(event, `${target}${target.includes('?') ? '&' : '?'}auth=ok`)
  },

  onError(event: any, error: unknown) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/?auth=failed')
  },
})
