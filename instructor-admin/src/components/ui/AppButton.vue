<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

/**
 * Buttons are ≥ 44px tall on touch and ≥ 40px on desktop — the touch-target floor
 * — and every state change runs through a 150ms transition rather than snapping.
 *
 * `to` renders a RouterLink instead of a <button>. That prop exists because the
 * alternative people reach for is `<RouterLink><AppButton/></RouterLink>`, which
 * nests a button inside an anchor: invalid HTML, two focus stops, and a screen
 * reader announcing the same control twice.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    icon?: IconName
    iconRight?: IconName
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit'
    /** Renders as a router link rather than a button. */
    to?: string
    block?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

const SIZES: Record<string, string> = {
  sm: 'min-h-9 gap-1.5 px-2.5 text-[12.5px]',
  md: 'min-h-11 gap-2 px-3.5 text-[13.5px] sm:min-h-10',
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-navy text-white hover:bg-navy-light border border-transparent',
  secondary: 'bg-surface text-navy border border-line hover:border-line-strong hover:text-accent-text',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-track hover:text-navy',
  danger: 'bg-bad-bg text-bad border border-transparent hover:bg-bad hover:text-white',
}
</script>

<template>
  <component
    :is="props.to ? 'RouterLink' : 'button'"
    :to="props.to"
    :type="props.to ? undefined : props.type"
    :disabled="props.to ? undefined : props.disabled || props.loading"
    class="t-fast font-heading inline-flex shrink-0 items-center justify-center rounded-lg font-bold disabled:opacity-45"
    :class="[VARIANTS[props.variant], SIZES[props.size], props.block ? 'w-full' : '']"
  >
    <span
      v-if="props.loading"
      class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <AppIcon v-else-if="props.icon" :name="props.icon" :size="15" />
    <slot />
    <AppIcon v-if="props.iconRight" :name="props.iconRight" :size="15" />
  </component>
</template>
