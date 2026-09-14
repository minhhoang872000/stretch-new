<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import AppIcon from './AppIcon.vue'

/** Escape closes, the backdrop closes, and body scroll is locked while open. */
const props = defineProps<{ open: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="props.open" class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
    <div class="absolute inset-0 bg-navy/45" @click="emit('close')" />

    <div
      role="dialog"
      aria-modal="true"
      :aria-label="props.title"
      class="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface sm:rounded-2xl"
      :class="props.wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'"
    >
      <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 class="text-[15px] font-bold text-navy">{{ props.title }}</h2>
        <button
          type="button"
          class="t-fast grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-track hover:text-navy"
          @click="emit('close')"
        >
          <AppIcon name="x" :size="16" label="Đóng" />
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
