<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

/**
 * Status pills. Every tone ships with a WORD, and the state tones also ship with
 * an icon — status must never rest on colour alone (the status hues are reserved
 * for state and are never reused as a chart series).
 */
const props = withDefaults(
  defineProps<{ tone?: 'good' | 'warn' | 'bad' | 'info' | 'neutral'; icon?: IconName }>(),
  { tone: 'neutral' },
)

const TONES: Record<string, string> = {
  good: 'bg-good-bg text-good',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
  info: 'bg-info-bg text-navy-light',
  neutral: 'bg-track text-ink-soft',
}

const DEFAULT_ICON: Record<string, IconName | undefined> = {
  good: 'check',
  warn: 'warning',
  bad: 'x',
  info: 'info',
  neutral: undefined,
}
</script>

<template>
  <span
    class="font-heading inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tracking-wide whitespace-nowrap"
    :class="TONES[props.tone]"
  >
    <AppIcon
      v-if="props.icon ?? DEFAULT_ICON[props.tone]"
      :name="(props.icon ?? DEFAULT_ICON[props.tone])!"
      :size="11"
      :stroke-width="2.4"
    />
    <slot />
  </span>
</template>
