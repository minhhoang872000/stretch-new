<template>
  <div class="flex min-h-screen bg-surface text-on-surface antialiased">
    <PageProgress />
    <Toast position="top-right" />
    <SideNav v-if="showLayout" />
    <div
      class="flex-1 min-w-0 transition-all duration-300 flex flex-col"
      :class="showLayout ? 'ml-0 lg:ml-64' : 'ml-0'"
    >
      <TopBar v-if="showLayout" />
      <div class="flex-1 overflow-x-hidden">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <component
              :is="Component"
              :key="route.path"
              :class="showLayout ? 'pt-16 lg:pt-20' : ''"
            />
          </Transition>
        </RouterView>
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
import PageProgress from '@/components/ui/PageProgress.vue'

const route = useRoute()
const authStore = useAuthStore()

const showLayout = computed(() => route.path !== '/login' && authStore.isAuthenticated)
</script>

<style>
.page-enter-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
