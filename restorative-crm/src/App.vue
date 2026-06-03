<template>
  <div class="flex min-h-screen bg-surface text-on-surface antialiased">
    <SideNav v-if="showLayout" />
    <div 
      class="flex-1 min-w-0 transition-all duration-300 flex flex-col"
      :class="showLayout ? 'ml-0 lg:ml-64' : 'ml-0'"
    >
      <TopBar v-if="showLayout" />
      <div class="flex-1 overflow-x-hidden">
        <RouterView :class="showLayout ? 'pt-16 lg:pt-20' : ''" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import SideNav from '@/components/layout/SideNav.vue'
import TopBar from '@/components/layout/TopBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const showLayout = computed(() => {
  return route.path !== '/login' && authStore.isAuthenticated
})
</script>

