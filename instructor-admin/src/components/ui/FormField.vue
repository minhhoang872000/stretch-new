<script setup lang="ts">
/**
 * A labelled field.
 *
 * The label is always visible (a placeholder is not a label — it disappears the
 * moment someone types), helper text sits under the control, and the error
 * replaces the helper text right next to the field rather than in a summary at
 * the top of the form.
 */
const props = defineProps<{
  label: string
  hint?: string
  error?: string
  required?: boolean
  for?: string
}>()
</script>

<template>
  <div class="min-w-0">
    <label :for="props.for" class="mb-1 block text-[12px] font-semibold text-ink-soft">
      {{ props.label }}
      <span v-if="props.required" class="text-bad" aria-hidden="true">*</span>
    </label>

    <slot />

    <p v-if="props.error" class="mt-1 text-[11.5px] font-medium text-bad">{{ props.error }}</p>
    <p v-else-if="props.hint" class="mt-1 text-[11.5px] text-ink-muted">{{ props.hint }}</p>
  </div>
</template>
