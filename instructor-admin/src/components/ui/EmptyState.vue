<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

/**
 * Never a blank panel: an empty list says what is missing and offers the action
 * that fills it. This is the skill's "show helpful message and action" rule.
 */
const props = withDefaults(
  defineProps<{ icon?: IconName; title: string; hint?: string }>(),
  { icon: 'info' },
)
</script>

<template>
  <div class="flex flex-col items-center gap-2 px-6 py-10 text-center">
    <span class="grid size-10 place-items-center rounded-full bg-track text-ink-muted">
      <AppIcon :name="props.icon" :size="19" />
    </span>
    <p class="text-sm font-bold text-navy">{{ props.title }}</p>
    <p v-if="props.hint" class="max-w-md text-xs leading-relaxed text-ink-muted">{{ props.hint }}</p>
    <div v-if="$slots.action" class="mt-1.5">
      <slot name="action" />
    </div>
  </div>
</template>
