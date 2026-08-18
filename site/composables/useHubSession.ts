/**
 * Learning Hub session — the real Google OAuth session plus a DEMO login.
 *
 * ⚠️ DEMO LOGIN — REMOVE BEFORE PRODUCTION
 * `admin` / `123456` is checked in the browser and only sets a cookie holding a
 * display name. It grants nothing: there is no protected learner API behind it,
 * and the cookie is trivially forged. It exists so the logged-in header, avatar
 * and account states can be reviewed before the real auth backend lands.
 * Deleting `DEMO_USERNAME`/`DEMO_PASSWORD` and `signInDemo()` removes it
 * entirely — everything else here works off the real session.
 */

const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = '123456'
const DEMO_COOKIE = 'stretch-demo-user'

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
  const { loggedIn: realLoggedIn, user: realUser, clear } = useUserSession()

  // The cookie is read on the server too, so the header renders signed-in on
  // first paint instead of flashing the logged-out buttons. It is mirrored into
  // `useState` because every `useCookie()` call returns its OWN ref — without
  // the shared state, signing in from the modal would not update the header.
  const cookie = useCookie<string | null>(DEMO_COOKIE, {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  const demoName = useState<string | null>('hub-demo-user', () => cookie.value)

  function setDemoName(value: string | null) {
    demoName.value = value
    cookie.value = value
  }

  const loggedIn = computed(() => realLoggedIn.value || Boolean(demoName.value))

  const user = computed<HubUser | null>(() => {
    if (realLoggedIn.value && realUser.value) {
      const name = (realUser.value as any).name ?? ''
      return {
        name,
        avatar: (realUser.value as any).avatar ?? null,
        initials: toInitials(name),
      }
    }
    if (demoName.value) {
      return { name: demoName.value, avatar: null, initials: toInitials(demoName.value) }
    }
    return null
  })

  /** Returns false on a wrong username/password so the form can show an error. */
  function signInDemo(username: string, password: string): boolean {
    if (username.trim().toLowerCase() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return false
    }
    setDemoName(DEMO_USERNAME.charAt(0).toUpperCase() + DEMO_USERNAME.slice(1))
    return true
  }

  const isDemoCandidate = (value: string) => value.trim().toLowerCase() === DEMO_USERNAME

  async function logout() {
    setDemoName(null)
    if (realLoggedIn.value) await clear()
  }

  return { loggedIn, user, signInDemo, isDemoCandidate, logout }
}
