<template>
  <div :class="inline ? 'flex items-center gap-3' : ''">
    <label :for="id" class="field-label" :class="inline ? 'mb-0 shrink-0 w-36' : ''">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(bắt buộc)</span>
    </label>

    <div class="flex-1 min-w-0">
      <slot :id="id" />
      <!-- Hint sits under the field it explains, never in a tooltip. -->
      <p v-if="hint && !error" class="field-hint">{{ hint }}</p>
      <p v-if="error" class="field-error">
        <span class="material-symbols-outlined text-sm">error</span>{{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  fieldId: { type: String, default: '' },
})

// useId is available from Vue 3.5; fall back to a stable derived string.
const generated = typeof useId === 'function' ? useId() : null
const id = computed(() => props.fieldId || generated || `f-${props.label.length}`)
</script>
