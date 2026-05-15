<script setup lang="ts">
const props = defineProps<{
  currentStep: number
  totalSteps: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="max-w-xl mx-auto px-6 mb-12">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs font-bold text-navy uppercase tracking-widest">
        {{ t('booking_v2.common.step') }} {{ currentStep }}/{{ totalSteps }}
      </span>
      <div class="flex gap-1">
        <div 
          v-for="i in totalSteps" 
          :key="i"
          class="h-1.5 rounded-full transition-all duration-500"
          :class="i <= currentStep ? 'w-8 bg-accent' : 'w-4 bg-border'"
        />
      </div>
    </div>
  </div>
</template>
