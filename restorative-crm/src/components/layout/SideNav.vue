<template>
  <!-- Mobile backdrop -->
  <div
    v-if="layout.isSidebarOpen"
    class="fixed inset-0 bg-ink/25 z-rail lg:hidden"
    @click="layout.closeSidebar"
  />

  <aside
    class="fixed left-0 top-0 h-screen z-rail bg-panel border-r border-line flex flex-col
           transition-[width,transform] duration-200 ease-out"
    :class="[
      layout.isRail ? 'w-[4.25rem]' : 'w-64',
      layout.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    aria-label="Điều hướng chính"
  >
    <!-- Brand ---------------------------------------------------------- -->
    <div class="h-14 shrink-0 px-3 flex items-center gap-2.5 border-b border-line">
      <RouterLink
        to="/dashboard"
        class="w-9 h-9 rounded-md bg-accent text-white flex items-center justify-center shrink-0"
        aria-label="Về trang tổng quan"
      >
        <span class="material-symbols-outlined ms-fill text-xl">accessibility_new</span>
      </RouterLink>
      <div v-if="!layout.isRail" class="min-w-0 flex-1">
        <p class="font-headline font-extrabold text-[0.9375rem] text-ink leading-tight truncate">
          Stretch.vn
        </p>
        <p class="text-2xs text-ink-3 font-semibold">Bảng điều khiển</p>
      </div>
      <button
        type="button"
        class="btn-ghost btn-sm btn-icon hidden lg:inline-flex"
        :aria-label="layout.isRail ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'"
        :title="layout.isRail ? 'Mở rộng' : 'Thu gọn'"
        @click="layout.toggleRail"
      >
        <span class="material-symbols-outlined text-lg">
          {{ layout.isRail ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
      <button
        type="button"
        class="btn-ghost btn-sm btn-icon lg:hidden"
        aria-label="Đóng điều hướng"
        @click="layout.closeSidebar"
      >
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Search trigger ------------------------------------------------- -->
    <div class="px-2.5 py-2.5 border-b border-line">
      <button
        type="button"
        class="w-full h-9 rounded-md border border-line-strong bg-panel-2 flex items-center gap-2
               px-2.5 text-ink-3 hover:border-accent hover:text-accent transition-colors"
        :aria-label="'Tìm nhanh (' + shortcutLabel + ')'"
        :title="'Tìm nhanh (' + shortcutLabel + ')'"
        @click="layout.openPalette"
      >
        <span class="material-symbols-outlined text-lg shrink-0">search</span>
        <template v-if="!layout.isRail">
          <span class="text-xs font-semibold">Tìm nhanh</span>
          <span class="kbd ml-auto">{{ shortcutLabel }}</span>
        </template>
      </button>
    </div>

    <!-- Groups --------------------------------------------------------- -->
    <nav class="flex-1 overflow-y-auto px-2 py-2.5 space-y-0.5">
      <div v-for="group in navGroups" :key="group.id" class="pb-1">
        <button
          v-if="group.label && !layout.isRail"
          type="button"
          class="w-full flex items-center gap-1 px-2 pt-2.5 pb-1 label-xs hover:text-ink-2 transition-colors"
          :aria-expanded="!layout.isGroupCollapsed(group.id)"
          @click="layout.toggleGroup(group.id)"
        >
          {{ group.label }}
          <span
            v-if="groupBadge(group)"
            class="w-1.5 h-1.5 rounded-full bg-warn shrink-0"
            :title="`${groupBadge(group)} việc cần xử lý`"
          />
          <span
            class="material-symbols-outlined text-base ml-auto transition-transform duration-150"
            :class="layout.isGroupCollapsed(group.id) ? '-rotate-90' : ''"
            aria-hidden="true"
          >expand_more</span>
        </button>

        <!-- Rail mode keeps a hairline between groups instead of a label -->
        <div v-else-if="group.label && layout.isRail" class="my-1.5 mx-2 divider" />

        <ul v-show="layout.isRail || !layout.isGroupCollapsed(group.id)" class="space-y-0.5">
          <li v-for="item in group.items" :key="item.path">
            <RouterLink
              :to="item.path"
              :title="layout.isRail ? item.label : null"
              class="relative flex items-center gap-2.5 h-9 rounded-md text-[0.8125rem] font-semibold
                     transition-colors duration-150 group"
              :class="[
                layout.isRail ? 'justify-center px-0' : 'px-2.5',
                isActive(item.path)
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-2 hover:bg-panel-3 hover:text-ink',
              ]"
              @click="layout.closeSidebar"
            >
              <!-- Active marker: a bar, not just a colour change -->
              <span
                v-if="isActive(item.path)"
                class="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-accent"
                aria-hidden="true"
              />
              <span
                class="material-symbols-outlined text-xl shrink-0"
                :class="isActive(item.path) ? 'ms-fill' : ''"
                aria-hidden="true"
              >{{ item.icon }}</span>
              <span v-if="!layout.isRail" class="truncate">{{ item.label }}</span>
              <span
                v-if="count(item.badge) && !layout.isRail"
                class="num ml-auto shrink-0 h-5 min-w-[1.25rem] px-1 rounded bg-warn-soft text-warn
                       text-2xs font-bold flex items-center justify-center"
              >{{ count(item.badge) }}</span>
              <span
                v-else-if="count(item.badge)"
                class="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-warn"
                :aria-label="`${count(item.badge)} việc cần xử lý`"
              />
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer: who is signed in + the mock-data reminder --------------- -->
    <div class="shrink-0 border-t border-line p-2.5">
      <div v-if="!layout.isRail" class="panel-quiet px-2.5 py-2 mb-2">
        <p class="text-2xs font-bold text-warn flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">science</span>
          Dữ liệu mẫu
        </p>
        <p class="text-2xs text-ink-3 mt-0.5 leading-snug">
          Các module mới đang chạy trên mock, chưa nối API.
        </p>
      </div>
      <RouterLink
        to="/users"
        class="flex items-center gap-2.5 h-9 rounded-md px-1.5 hover:bg-panel-3 transition-colors"
        :class="layout.isRail ? 'justify-center' : ''"
        :title="auth.user?.name || 'Tài khoản'"
      >
        <span
          class="w-7 h-7 rounded-full bg-accent-soft text-accent-ink text-2xs font-bold
                 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >{{ initials(auth.user?.name || 'Admin') }}</span>
        <span v-if="!layout.isRail" class="min-w-0 flex-1">
          <span class="block text-xs font-bold text-ink truncate">{{ auth.user?.name || 'Quản trị viên' }}</span>
          <span class="block text-2xs text-ink-3 truncate">{{ auth.user?.email || 'admin@stretch.vn' }}</span>
        </span>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navGroups } from '@/data/navigation.js'
import { useLayoutStore } from '@/stores/layout.js'
import { useAuthStore } from '@/stores/auth.js'
import { useMockDb } from '@/stores/db.js'
import { useMentorshipStore } from '@/stores/mentorship.js'
import { initials } from '@/utils/format.js'

const route = useRoute()
const layout = useLayoutStore()
const auth = useAuthStore()
const db = useMockDb()
const mentorship = useMentorshipStore()

/** A section stays highlighted while you are on one of its detail screens. */
const isActive = (path) => route.path === path || route.path.startsWith(`${path}/`)

/**
 * Badge counts come from the mock DB, except mentorship — those requests are
 * real, so that one number is read from the API instead.
 */
const count = (key) => {
  if (!key) return 0
  if (key === 'mentorshipPending') return mentorship.pendingCount
  return db.counts[key] || 0
}

// One call on load; the mentorship screen keeps it current after that.
onMounted(() => {
  if (auth.isAuthenticated) mentorship.refreshBadge()
})

const groupBadge = (group) =>
  group.items.reduce((sum, item) => sum + count(item.badge), 0)

const shortcutLabel = computed(() =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Ctrl K',
)
</script>
