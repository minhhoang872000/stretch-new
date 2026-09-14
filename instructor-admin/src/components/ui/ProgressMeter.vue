<script setup lang="ts">
/**
 * A progress meter — one value against a whole.
 *
 * Design decisions worth keeping:
 * - the fill is the single data hue (teal), never a status colour: 40% progress
 *   is not an error, so it must not be painted red
 * - the number is always printed beside the bar, so the meter never asks anyone
 *   to estimate a length or to read a colour
 * - the track is a surface tone, not a lighter tint of the fill, which keeps the
 *   filled portion unambiguous for a colour-blind reader
 * - `role="progressbar"` + aria values make the same figure available to a
 *   screen reader
 */
const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    label?: string
    /** Draw a threshold tick, e.g. the 90% "counts as watched" line. */
    mark?: number
    size?: 'sm' | 'md'
    showValue?: boolean
  }>(),
  { max: 100, size: 'md', showValue: true },
)

const percent = () => Math.max(0, Math.min(100, (props.value / props.max) * 100))
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="relative min-w-0 flex-1 overflow-hidden rounded-full bg-track"
      :class="props.size === 'sm' ? 'h-1.5' : 'h-2'"
      role="progressbar"
      :aria-valuenow="Math.round(percent())"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="props.label"
    >
      <span class="block h-full rounded-full bg-data" :style="{ width: `${percent()}%` }" />
      <span
        v-if="props.mark !== undefined"
        class="absolute inset-y-0 w-px bg-navy/35"
        :style="{ left: `${props.mark}%` }"
        aria-hidden="true"
      />
    </span>

    <span v-if="props.showValue" class="figure w-9 text-right text-[11.5px] text-ink-soft">
      {{ Math.round(percent()) }}%
    </span>
  </div>
</template>
