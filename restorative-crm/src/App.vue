<template>
  <div class="min-h-screen bg-canvas text-ink antialiased">
    <!-- Keyboard users get past the 30-item sidebar in one tab. -->
    <a href="#content" class="skip-link">Bỏ qua điều hướng</a>

    <PageProgress />
    <Toast position="top-right" />

    <template v-if="showLayout">
      <SideNav />
      <CommandPalette />
    </template>

    <div
      class="min-h-screen flex flex-col transition-[padding] duration-200 ease-out"
      :class="showLayout ? (layout.isRail ? 'lg:pl-[4.25rem]' : 'lg:pl-64') : ''"
    >
      <TopBar v-if="showLayout" />

      <div id="content" class="flex-1 min-w-0">
        <RouterView v-slot="{ Component, route: current }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="current.path" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useLayoutStore } from '@/stores/layout.js'
import { useDb } from '@/stores/db.js'
import { useNotify } from '@/composables/useNotify.js'
import SideNav from '@/components/layout/SideNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import CommandPalette from '@/components/layout/CommandPalette.vue'
import PageProgress from '@/components/ui/PageProgress.vue'

const route = useRoute()
const authStore = useAuthStore()
const layout = useLayoutStore()
const db = useDb()
const notify = useNotify()

const showLayout = computed(() => route.path !== '/login' && authStore.isAuthenticated)

/**
 * Settings and the sidebar badge counts are the two things the chrome needs
 * before any screen renders, and neither belongs to a particular screen. Loaded
 * on sign-in and re-loaded on a reload that lands already authenticated.
 */
watch(
  () => authStore.isAuthenticated,
  (signedIn) => { if (signedIn) db.bootstrap() },
  { immediate: true },
)

/**
 * One place to surface a failed write.
 *
 * The store reports failures on a ref instead of rejecting, because most write
 * call sites are click handlers that do not await — a rejected promise would
 * reach nobody. Watching it here means a failed save says so, wherever it came
 * from, without thirty views growing their own try/catch.
 */
watch(
  () => db.lastError,
  (err) => { if (err) notify.error(err.message) },
)

/** The success side of the same contract: every landed write gets a toast. */
watch(
  () => db.lastSuccess,
  (ok) => { if (ok) notify.success(ok.message) },
)
</script>

<style>
/* Page transition: short, transform-only, and skipped under reduced motion
   (see the global media query in assets/main.css). */
.page-enter-active {
  transition: opacity 160ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.page-leave-active {
  transition: opacity 110ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
}
</style>
