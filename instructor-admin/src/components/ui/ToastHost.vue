<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useToast } from '~/composables/useToast'
import type { IconName } from './icons'

const { toasts, dismiss } = useToast()

const TONES: Record<string, string> = {
  good: 'border-good/40 bg-good-bg text-good',
  bad: 'border-bad/40 bg-bad-bg text-bad',
  info: 'border-line bg-surface text-navy',
}

const ICONS: Record<string, IconName> = { good: 'check', bad: 'warning', info: 'info' }
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-4 sm:items-end">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="status"
      aria-live="polite"
      class="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium"
      :class="TONES[toast.tone]"
    >
      <AppIcon :name="ICONS[toast.tone]" :size="15" :stroke-width="2.2" class="mt-px" />
      <span class="min-w-0 flex-1">{{ toast.message }}</span>
      <button type="button" class="t-fast opacity-60 hover:opacity-100" @click="dismiss(toast.id)">
        <AppIcon name="x" :size="13" label="Đóng thông báo" />
      </button>
    </div>
  </div>
</template>
