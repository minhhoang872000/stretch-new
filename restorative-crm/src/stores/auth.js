import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()

      if (!json.success) {
        return {
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
        }
      }

      token.value = json.data.token
      user.value = json.data.admin
      localStorage.setItem('auth_token', json.data.token)
      localStorage.setItem('auth_user', JSON.stringify(json.data.admin))

      return { success: true }
    } catch {
      return {
        success: false,
        message: 'Lỗi kết nối. Vui lòng kiểm tra server API.',
      }
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return { token, user, isAuthenticated, login, logout }
})
