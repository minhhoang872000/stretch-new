/**
 * Learning Hub session — a thin, typed view over the Google OAuth session that
 * nuxt-auth-utils keeps in its sealed cookie.
 *
 * Everything the header, account menu and learner pages need comes from here,
 * so no component reads `useUserSession()` directly and the shape of the
 * session object stays a detail of `server/api/auth/google.get.ts`.
 */

export interface HubUser {
  name: string
  avatar: string | null
  initials: string
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const letters = parts.length === 1
    ? parts[0].slice(0, 1)
    : parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
  return letters.toUpperCase()
}

export function useHubSession() {
  const { loggedIn, user: sessionUser, clear } = useUserSession()

  /**
   * The learner row behind the session, or null.
   *
   * Null also covers the edge case where Google sign-in succeeded but the
   * learner API was unreachable at that moment: the person is signed in and can
   * browse, and the pages that need an enrolment check this rather than
   * `loggedIn`. The next sign-in retries.
   */
  const learner = computed<{ id: string; name: string; email: string } | null>(() => {
    if (!loggedIn.value) return null
    return ((sessionUser.value as any)?.learner as any) ?? null
  })

  const user = computed<HubUser | null>(() => {
    if (!loggedIn.value || !sessionUser.value) return null
    const name = (sessionUser.value as any).name ?? ''
    return {
      name,
      avatar: (sessionUser.value as any).avatar ?? null,
      initials: toInitials(name),
    }
  })

  async function logout() {
    await clear()
  }

  return { loggedIn, user, learner, logout }
}
