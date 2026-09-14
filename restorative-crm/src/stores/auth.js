import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

/**
 * Who is signed in. One door: `POST /auth/login` on the API, which returns a
 * 7-day JWT that every request from this console carries.
 *
 * There used to be a mock fallback here (a shared demo password that let
 * anyone in when the API was unreachable, onto browser-held sample data). It
 * is gone: with the API deployed, a fallback that signs someone in and then
 * fails on every request reads as a broken console, not as a failed login.
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Kept for callers that still ask (e.g. the mentorship store's offline
   * switch): there is no demo session any more, so this is always false.
   */
  const isDemo = computed(() => false)

  function persist(nextToken, nextUser) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem('auth_token', nextToken)
    localStorage.setItem('auth_user', JSON.stringify(nextUser))
    localStorage.removeItem('auth_demo')
  }

  async function login(email, password) {
    let res
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch {
      // Network failure or CORS rejection — indistinguishable from here.
      return { success: false, message: 'Không kết nối được máy chủ. Vui lòng thử lại sau.' }
    }

    let json = null
    try {
      json = await res.json()
    } catch {
      return { success: false, message: 'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.' }
    }

    if (!json?.success) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng' }
    }
    persist(json.data.token, json.data.admin)
    return { success: true }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_demo')
  }

  return { token, user, isDemo, isAuthenticated, login, logout }
})
