<script setup lang="ts">
/** The shared text/number/date control, so focus and error styling stay one rule. */
const props = withDefaults(
  defineProps<{
    modelValue: string | number
    type?: string
    placeholder?: string
    invalid?: boolean
    disabled?: boolean
    id?: string
    mono?: boolean
  }>(),
  { type: 'text' },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <input
    :id="props.id"
    :type="props.type"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :aria-invalid="props.invalid || undefined"
    class="t-fast min-h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-[13.5px] text-ink placeholder:text-ink-muted/70 focus:outline-none sm:min-h-10"
    :class="[
      props.invalid ? 'border-bad' : 'border-line hover:border-line-strong focus:border-accent-dark',
      props.mono ? 'figure' : '',
      props.disabled ? 'opacity-60' : '',
    ]"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
