<script setup lang="ts">
import AppIcon from './AppIcon.vue'

/**
 * `min-w-0` on both the wrapper and the control is load-bearing: a native select
 * takes its intrinsic width from its LONGEST OPTION, so one long option name is
 * enough to widen its grid track and push the card around it out of shape.
 */
const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  id?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="relative min-w-0">
    <select
      :id="props.id"
      :value="props.modelValue"
      :disabled="props.disabled"
      class="t-fast min-h-11 w-full min-w-0 appearance-none rounded-lg border border-line bg-surface pr-8 pl-3 text-[13.5px] text-ink hover:border-line-strong focus:border-accent-dark focus:outline-none disabled:opacity-60 sm:min-h-10"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <AppIcon
      name="chevronDown"
      :size="14"
      class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted"
    />
  </div>
</template>
