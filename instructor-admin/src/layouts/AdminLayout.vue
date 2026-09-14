<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '~/components/ui/AppIcon.vue'
import { session } from '~/services/session'
import { useToast } from '~/composables/useToast'
import type { IconName } from '~/components/ui/icons'

/**
 * The console shell: a fixed rail on desktop, a slide-over on mobile.
 *
 * Nine destinations is past the "≤5 items" bottom-nav ceiling, which is exactly
 * why this is a side rail with headings rather than a tab bar — the grouping is
 * what keeps it navigable.
 */
const route = useRoute()
const router = useRouter()

const navOpen = ref(false)

interface NavItem {
  to: string
  label: string
  icon: IconName
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Giảng dạy',
    items: [
      { to: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
      { to: '/courses', label: 'Chương trình', icon: 'book' },
      { to: '/media', label: 'Video', icon: 'video' },
      { to: '/sessions', label: 'Lịch đào tạo', icon: 'calendar' },
    ],
  },
  {
    title: 'Học viên',
    items: [
      { to: '/learners', label: 'Danh sách học viên', icon: 'users' },
      { to: '/certificates', label: 'Chứng nhận', icon: 'award' },
      { to: '/reviews', label: 'Đánh giá', icon: 'star' },
    ],
  },
  {
    title: 'Báo cáo',
    items: [{ to: '/analytics', label: 'Phân tích học tập', icon: 'chart' }],
  },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

// Navigating on a phone must close the drawer, or the next screen opens behind it.
watch(() => route.fullPath, () => (navOpen.value = false))

const toast = useToast()

function signOut() {
  session.signOut()
  toast.push('Đã đăng xuất.', 'info')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-shell">
    <!-- ══ Mobile bar ══ -->
    <header class="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5 lg:hidden">
      <button
        type="button"
        class="t-fast grid size-10 place-items-center rounded-lg text-navy hover:bg-track"
        @click="navOpen = true"
      >
        <AppIcon name="menu" :size="18" label="Mở menu" />
      </button>
      <p class="min-w-0 flex-1 truncate text-[13px] font-bold text-navy">
        {{ route.meta.title ?? 'Stretch Academy' }}
      </p>
      <span class="grid size-8 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
        {{ session.user.value?.initials }}
      </span>
    </header>

    <div class="lg:flex">
      <!-- ══ Rail ══ -->
      <div
        class="fixed inset-y-0 left-0 z-50 flex w-[264px] max-w-[86vw] flex-col border-r border-line bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
        :class="navOpen ? 'translate-x-0' : '-translate-x-[105%]'"
      >
        <div class="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
          <div class="min-w-0">
            <p class="text-[13.5px] font-bold tracking-tight text-navy">Stretch Academy</p>
            <p class="text-[11px] text-ink-muted">Bảng quản lý giảng dạy</p>
          </div>
          <button
            type="button"
            class="t-fast grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-track lg:hidden"
            @click="navOpen = false"
          >
            <AppIcon name="x" :size="16" label="Đóng menu" />
          </button>
        </div>

        <nav class="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
          <div v-for="group in GROUPS" :key="group.title" class="mb-4 last:mb-0">
            <p class="px-2.5 pb-1.5 text-[10px] font-bold tracking-[0.1em] text-ink-muted uppercase">
              {{ group.title }}
            </p>
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="t-fast mb-0.5 flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium lg:min-h-10"
              :class="
                isActive(item.to)
                  ? 'bg-navy text-white'
                  : 'text-ink-soft hover:bg-track hover:text-navy'
              "
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              <AppIcon :name="item.icon" :size="16" />
              {{ item.label }}
            </RouterLink>
          </div>
        </nav>

        <div class="border-t border-line px-2.5 py-3">
          <div class="mb-2 flex items-center gap-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-bold text-white">
              {{ session.user.value?.initials }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-[12.5px] font-semibold text-navy">{{ session.user.value?.name }}</p>
              <p class="truncate text-[11px] text-ink-muted">{{ session.user.value?.role === 'admin' ? 'Quản trị' : 'Giảng viên' }}</p>
            </div>
          </div>
          <button
            type="button"
            class="t-fast flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-[12.5px] font-semibold text-ink-soft hover:bg-track hover:text-bad"
            @click="signOut"
          >
            <AppIcon name="logout" :size="15" />
            Đăng xuất
          </button>
        </div>
      </div>

      <div v-if="navOpen" class="fixed inset-0 z-40 bg-navy/40 lg:hidden" @click="navOpen = false" />

      <!-- ══ Page ══ -->
      <main class="min-w-0 flex-1">
        <div class="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 sm:py-7">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
