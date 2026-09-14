<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

/**
 * A single headline figure.
 *
 * When one number IS the answer, a chart is the wrong form — a big figure with a
 * label reads faster than any plot of it. The figure wears the mono/tabular face
 * so a row of tiles lines up, and its delta carries a word, not just a colour.
 */
const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  icon?: IconName
  delta?: { text: string; tone: 'good' | 'bad' | 'flat' }
  hint?: string
}>()

const DELTA_TONE: Record<string, string> = {
  good: 'text-good',
  bad: 'text-bad',
  flat: 'text-ink-muted',
}
</script>

<template>
  <div class="flex h-full flex-col rounded-xl border border-line bg-surface p-3.5 shadow-card">
    <div class="flex items-center justify-between gap-2">
      <p class="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">{{ props.label }}</p>
      <AppIcon v-if="props.icon" :name="props.icon" :size="15" class="text-ink-muted" />
    </div>

    <p class="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span class="figure font-heading text-2xl leading-none font-extrabold text-navy">{{ props.value }}</span>
      <span v-if="props.unit" class="text-xs text-ink-muted">{{ props.unit }}</span>
    </p>

    <!-- Two lines max: a hint that runs longer than that belongs in the panel
         below, not in a tile. -->
    <p v-if="props.delta" class="mt-1.5 line-clamp-2 text-[11.5px] leading-snug font-medium" :class="DELTA_TONE[props.delta.tone]">
      {{ props.delta.text }}
    </p>
    <p v-else-if="props.hint" class="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-ink-muted">
      {{ props.hint }}
    </p>
  </div>
</template>
