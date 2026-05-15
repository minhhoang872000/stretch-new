<template>
  <div
    class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
    :class="[bgClass, textClass]"
  >
    {{ initials }}
  </div>
</template>

<script setup>
defineProps({
  initials: { type: String, required: true },
  bgClass: { type: String, default: 'bg-primary-fixed' },
  textClass: { type: String, default: 'text-primary' }
})
</script>
