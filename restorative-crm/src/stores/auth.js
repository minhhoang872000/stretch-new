import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users as mockUsers } from '@/data/mock/system.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

/**
 * Demo sign-in.
 *
 * The console's new modules run entirely on mock data, so it has to be usable
 * with no backend running. The real API is still tried first — if it answers,
 * that session wins. Only when the request cannot be reached at all do we fall
 * back to the seeded staff accounts with this shared password.
 */
const DEMO_PASSWORD = 'Admin@stretch1'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  /** True when the session came from the mock fallback rather than the API. */
  const isDemo = ref(localStorage.getItem('auth_demo') === '1')

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function persist(nextToken, nextUser, demo) {
    token.value = nextToken
    user.value = nextUser
    isDemo.value = demo
    localStorage.setItem('auth_token', nextToken)
    localStorage.setItem('auth_user', JSON.stringify(nextUser))
    localStorage.setItem('auth_demo', demo ? '1' : '0')
  }

  /** Canonical demo address, mapped to whoever owns the workspace. */
  const DEMO_EMAIL = 'admin@stretch.vn'

  function signInWithMock(email, password) {
    const wanted = email.trim().toLowerCase()
    const match = wanted === DEMO_EMAIL
      ? mockUsers.find((u) => u.role === 'owner')
      : mockUsers.find((u) => u.email.toLowerCase() === wanted && u.status !== 'suspended')
    if (!match || password !== DEMO_PASSWORD) {
      return {
        success: false,
        message: `Không có API nào đang chạy. Dùng tài khoản mẫu: admin@stretch.vn / ${DEMO_PASSWORD}`,
      }
    }
    persist(`demo.${match.id}`, { name: match.name, email: match.email, role: match.role }, true)
    return { success: true, demo: true }
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) return { success: false, message: 'Email hoặc mật khẩu không đúng' }
      persist(json.data.token, json.data.admin, false)
      return { success: true }
    } catch {
      // Unreachable API — this is the expected path while the console runs on
      // mock data, so it falls through to the demo accounts instead of failing.
      return signInWithMock(email, password)
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    isDemo.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_demo')
  }

  return { token, user, isDemo, isAuthenticated, login, logout, DEMO_PASSWORD }
})
