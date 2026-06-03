import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem('auth_authenticated') === 'true')
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

  function login(username, password) {
    // Demo credentials check
    if (username.trim() === 'admin' && password === 'password123') {
      isAuthenticated.value = true
      user.value = {
        username: username.trim(),
        name: 'Dr. Sarah Chen',
        role: 'Lead Practitioner'
      }
      localStorage.setItem('auth_authenticated', 'true')
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      return { success: true }
    } else {
      return { 
        success: false, 
        message: {
          en: 'Invalid username or password.',
          vi: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        }
      }
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('auth_authenticated')
    localStorage.removeItem('auth_user')
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
})
