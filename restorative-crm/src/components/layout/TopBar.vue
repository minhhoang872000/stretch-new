<template>
  <header
    class="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 h-16 lg:h-20 border-b border-outline-variant/10 transition-all duration-300"
  >
    <!-- Hamburger & Search -->
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <button
        @click="layoutStore.toggleSidebar"
        class="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
      >
        <span class="material-symbols-outlined text-xl">menu</span>
      </button>
      <div class="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-full max-w-sm gap-2">
        <span class="material-symbols-outlined text-outline text-lg">search</span>
        <InputText
          v-model="searchQuery"
          class="bg-transparent border-none shadow-none focus:ring-0 text-sm w-full p-0"
          placeholder="Tìm kiếm..."
        />
      </div>
    </div>

    <!-- Actions + Profile -->
    <div class="flex items-center gap-2 lg:gap-3 shrink-0">
      <button class="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-xl">notifications</span>
      </button>
      <button class="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-xl">settings</span>
      </button>
      <div class="hidden sm:block h-6 w-[1px] bg-outline-variant/20 mx-1"></div>

      <!-- Profile -->
      <div class="flex items-center gap-2.5 pl-1 shrink-0">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-bold text-on-surface leading-tight">{{ authStore.user?.name || 'Admin' }}</p>
          <p class="text-[10px] text-outline uppercase tracking-wider">Quản trị viên</p>
        </div>
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm border-2 border-primary-fixed shrink-0">
          {{ (authStore.user?.name || 'A').charAt(0).toUpperCase() }}
        </div>
      </div>

      <div class="h-6 w-[1px] bg-outline-variant/20 mx-1"></div>

      <button
        @click="handleLogout"
        class="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shrink-0"
        title="Đăng xuất"
      >
        <span class="material-symbols-outlined text-xl">logout</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout.js'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const searchQuery = ref('')

const handleLogout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    authStore.logout()
    router.push({ name: 'Login' })
  }
}
</script>
