<template>
  <div class="py-12 px-6 text-center">
    <div
      class="w-11 h-11 rounded-lg bg-panel-3 border border-line flex items-center justify-center mx-auto mb-3"
      aria-hidden="true"
    >
      <span class="material-symbols-outlined text-xl text-ink-3">{{ icon }}</span>
    </div>
    <p class="text-sm font-bold text-ink">{{ title }}</p>
    <p v-if="hint" class="mt-1 text-xs text-ink-3 max-w-sm mx-auto">{{ hint }}</p>
    <div v-if="$slots.default" class="mt-4 flex items-center justify-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: 'Chưa có dữ liệu' },
  hint: { type: String, default: '' },
})
</script>
