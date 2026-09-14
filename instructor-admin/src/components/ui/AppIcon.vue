<script setup lang="ts">
import { ICON_PATHS, type IconName } from './icons'

/**
 * Decorative icons are `aria-hidden`; an icon that carries meaning on its own
 * gets a `label`, which becomes its accessible name.
 */
const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    label?: string
    strokeWidth?: number
  }>(),
  { size: 18, strokeWidth: 1.8 },
)
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="props.label ? undefined : true"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    class="shrink-0"
    v-html="ICON_PATHS[props.name]"
  />
</template>
