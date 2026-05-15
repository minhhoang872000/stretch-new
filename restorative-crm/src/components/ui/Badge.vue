<template>
  <span
    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
    :class="statusClasses"
  >
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const statusClasses = computed(() => {
  return props.status === 'Completed'
    ? 'bg-primary-container/20 text-primary'
    : 'bg-tertiary-container/20 text-tertiary'
})
</script>
