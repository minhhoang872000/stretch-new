<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="inline-flex items-center gap-2 group"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="w-9 h-5 rounded-full border transition-colors duration-150 relative shrink-0"
      :class="modelValue ? 'bg-accent border-accent' : 'bg-panel-3 border-line-strong'"
    >
      <span
        class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-150"
        :class="modelValue ? 'translate-x-4' : ''"
      />
    </span>
    <span v-if="label" class="text-[0.8125rem] font-semibold text-ink-2 group-hover:text-ink">
      {{ label }}
    </span>
    <!-- State is spelled out, not left to the knob position alone. -->
    <span v-if="stateText" class="text-2xs font-bold" :class="modelValue ? 'text-ok' : 'text-ink-3'">
      {{ modelValue ? onText : offText }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  stateText: { type: Boolean, default: false },
  onText: { type: String, default: 'Bật' },
  offText: { type: String, default: 'Tắt' },
})
defineEmits(['update:modelValue'])
</script>
