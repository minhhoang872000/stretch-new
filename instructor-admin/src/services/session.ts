import { computed, ref } from 'vue'
import { apiFetch, ApiError, hasApi, setApiToken } from '~/services/http'

/**
 * Who is signed in.
 *
 * One door: `POST /auth/login` on `lead-tracker-api`, which returns a 7-day
 * JWT. Every screen in this console now reads and writes that API, so a session
 * without a token is a console where nothing works.
 *
 * There used to be a demo fallback here for when most screens ran on a mock
 * store. Keeping it would now be worse than not having it: it let someone in
 * and then failed on every request, which reads as a broken app rather than as
 * a failed login. If the API is down, the login screen says so.
 */
const KEY = 'stretch-instructor-session'

interface SessionUser {
  name: string
  email: string
  role: 'instructor' | 'admin'
  initials: string
}

const user = ref<SessionUser | null>(read())

function read(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

function write(next: SessionUser | null) {
  user.value = next
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next))
    else localStorage.removeItem(KEY)
  } catch {
    // Blocked storage — the session still holds for this tab.
  }
}

/** "Nguyễn Hải Đăng" → "NĐ"; a single-word name keeps one letter. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0]![0]!
  const last = words.length > 1 ? words[words.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}

export const session = {
  user: computed(() => user.value),
  isSignedIn: computed(() => user.value !== null),
  /** True when this session holds an API token — i.e. the video screens work. */
  hasApi,

  /** Returns an error message, or null on success. */
  async signIn(email: string, password: string): Promise<string | null> {
    const trimmed = email.trim().toLowerCase()

    try {
      const result = await apiFetch<{
        token: string
        admin: { id: string; email: string; name: string; role: string }
      }>('/auth/login', { method: 'POST', auth: false, body: { email: trimmed, password } })

      setApiToken(result.token)
      write({
        name: result.admin.name || 'Quản trị',
        email: result.admin.email,
        role: 'admin',
        initials: initialsOf(result.admin.name || result.admin.email),
      })
      return null
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return 'Email hoặc mật khẩu không đúng.'
      // A dead API and a CORS rejection look the same from here, and both mean
      // the same thing to the person at the keyboard: the backend is not there.
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') return err.message
      return err instanceof Error ? err.message : 'Đăng nhập thất bại.'
    }
  },

  signOut() {
    setApiToken(null)
    write(null)
  },
}

