<template>
  <div class="w-full">
    <div v-if="label || showValue" class="flex items-center justify-between gap-2 mb-1">
      <span v-if="label" class="text-xs text-ink-2 truncate">{{ label }}</span>
      <span v-if="showValue" class="num text-xs font-bold text-ink shrink-0">{{ display }}</span>
    </div>
    <div
      class="h-1.5 rounded-full bg-panel-3 overflow-hidden"
      role="progressbar"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label || 'Tiến độ'"
    >
      <div
        class="h-full rounded-full transition-[width] duration-300 ease-out"
        :class="barClass"
        :style="{ width: `${clamped}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  label: { type: String, default: '' },
  showValue: { type: Boolean, default: true },
  /** `auto` colours by how far along it is; otherwise force a tone. */
  tone: { type: String, default: 'auto' },
  suffix: { type: String, default: '%' },
})

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value || 0))))
const display = computed(() => `${clamped.value}${props.suffix}`)

const barClass = computed(() => {
  if (props.tone !== 'auto') {
    return { accent: 'bg-accent', ok: 'bg-ok', warn: 'bg-warn', danger: 'bg-danger', info: 'bg-info' }[props.tone] || 'bg-accent'
  }
  if (clamped.value >= 100) return 'bg-ok'
  if (clamped.value >= 40) return 'bg-accent'
  return 'bg-warn'
})
</script>
