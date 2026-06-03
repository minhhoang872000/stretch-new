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
          :placeholder="$t('common.search')"
        />
      </div>
    </div>

    <!-- Actions + Profile -->
    <div class="flex items-center gap-2 lg:gap-3 shrink-0">
      <!-- Language Switcher -->
      <button
        @click="toggleLanguage"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-outline-variant/30 hover:bg-surface-container"
      >
        <span class="material-symbols-outlined text-lg">language</span>
        <span class="uppercase">{{ locale }}</span>
      </button>

      <button
        class="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <span class="material-symbols-outlined text-xl">notifications</span>
      </button>
      <button
        class="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <span class="material-symbols-outlined text-xl">settings</span>
      </button>
      <div class="hidden sm:block h-6 w-[1px] bg-outline-variant/20 mx-1"></div>
      
      <!-- Profile Details -->
      <div class="flex items-center gap-2.5 pl-1 shrink-0">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-bold text-on-surface leading-tight">
            {{ authStore.user?.name || 'Dr. Sarah Chen' }}
          </p>
          <p class="text-[10px] text-outline uppercase tracking-wider">
            {{ authStore.user?.role === 'Lead Practitioner' ? ($t('common.support') === 'Support' ? 'Lead Practitioner' : 'Hành nghề chính') : authStore.user?.role }}
          </p>
        </div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqEoiRTIASa0EdeCeL0Cczh7UVF7C3T2VPzBBRMZUy-Qiy-EoS-LcB4dYRAjySe5EwzQP8QyAszNiak62KR_Y4QIY4bMln4LtvhddUV-0t5XRGD2BRrjqm-6YAJ_4x7FZcrxcjDQbLMp_VAk4Vnw7xBYX3q4Pc3qVFUHdjchZ_ntjEQwf6bdSQlbkjS4JqlunaV30GxXnNjdOyqiUHdSKw6I92q3cFfrjYknqNOuvg2aD2Zl-wucu2SVu4bZMtwDpq-TrsBILB6zk"
          alt="Dr. Sarah Chen"
          class="w-9 h-9 rounded-full object-cover border-2 border-primary-fixed"
        />
      </div>

      <div class="h-6 w-[1px] bg-outline-variant/20 mx-1"></div>

      <!-- Logout Button -->
      <button
        @click="handleLogout"
        class="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shrink-0"
        :title="$t('login.signOut')"
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const searchQuery = ref('')

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'vi' : 'en'
}

const handleLogout = () => {
  if (confirm(t('login.signOutConfirm'))) {
    authStore.logout()
    router.push({ name: 'Login' })
  }
}
</script>
