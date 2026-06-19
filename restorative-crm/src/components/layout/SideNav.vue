<template>
  <!-- Backdrop -->
  <div
    v-if="layoutStore.isSidebarOpen"
    @click="layoutStore.closeSidebar"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
  ></div>

  <aside
    class="h-screen w-64 fixed left-0 top-0 bg-emerald-50/50 backdrop-blur-xl flex flex-col py-5 px-3 z-50 transition-transform duration-300"
    :class="layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="mb-8 px-3 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg shrink-0">
        <span class="material-symbols-outlined text-xl">clinical_notes</span>
      </div>
      <div class="min-w-0">
        <h1 class="text-base font-bold text-teal-900 font-headline tracking-tight leading-tight truncate">Stretch.vn</h1>
        <p class="text-[9px] uppercase tracking-widest text-secondary font-bold opacity-70">Admin</p>
      </div>
    </div>

    <!-- Nav Links -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="layoutStore.closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200"
        :class="
          isActive(item.path)
            ? 'text-primary bg-primary/8 border-r-[3px] border-primary'
            : 'text-slate-500 hover:text-teal-700 hover:bg-white/50'
        "
      >
        <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
        <span class="font-headline tracking-tight">{{ NAV_LABELS[item.label] || item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { navItems } from '@/data/mockData.js'
import { useLayoutStore } from '@/stores/layout.js'

const route = useRoute()
const layoutStore = useLayoutStore()
const isActive = (path) => route.path === path

const NAV_LABELS = {
  'Dashboard': 'Bảng điều khiển',
  'Bookings': 'Lịch đặt',
  'Categories': 'Danh mục',
  'Calendar': 'Lịch hẹn',
  'Blog': 'Bài viết',
  'Media': 'Thư viện ảnh',
  'Services': 'Dịch vụ',
  'Google Analytics': 'Google Analytics',
  'Search Console': 'Search Console',
  'Leads': 'Khách tiềm năng',
}
</script>
