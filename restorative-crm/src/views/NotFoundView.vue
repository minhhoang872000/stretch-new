<template>
  <main class="page-narrow">
    <div class="panel px-6 py-12 text-center">
      <p class="label-xs">Lỗi 404</p>
      <h1 class="h-page mt-2">Không có trang nào ở địa chỉ này</h1>
      <p class="mt-2 text-[0.8125rem] text-ink-2 max-w-md mx-auto">
        Đường dẫn <code class="font-mono text-xs bg-panel-3 px-1.5 py-0.5 rounded">{{ path }}</code>
        không thuộc bảng điều khiển. Có thể module đã được đổi tên khi gom lại theo nhóm.
      </p>
      <div class="mt-5 flex items-center justify-center gap-2">
        <RouterLink to="/dashboard" class="btn-primary">Về tổng quan</RouterLink>
        <button type="button" class="btn-outline" @click="layout.openPalette()">
          <span class="material-symbols-outlined text-lg">search</span>
          Tìm module
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout.js'

const route = useRoute()
const layout = useLayoutStore()
const path = computed(() => route.fullPath)
</script>
