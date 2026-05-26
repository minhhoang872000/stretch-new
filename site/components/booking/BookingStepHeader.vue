<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentStep: number
  totalSteps?: number
  stepLabels?: string[]
}>(), {
  totalSteps: 3,
  stepLabels: () => []
})

const { t } = useI18n()
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 mb-16 select-none">
    <!-- Progress Stepper Container -->
    <div class="relative flex items-center justify-between">
      
      <!-- Continuous Background Line (Starts and ends at circle centers) -->
      <div class="absolute left-5 right-5 top-5 h-1 bg-[#E2E8F0] rounded-full z-0"></div>
      
      <!-- Active Progress Bar Line (Tuned perfectly with flex steps) -->
      <div 
        class="absolute left-5 top-5 h-1 bg-accent rounded-full z-0 transition-all duration-500 ease-in-out"
        :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
      ></div>

      <!-- Steps Dots -->
      <div 
        v-for="i in totalSteps" 
        :key="i"
        class="relative z-10 flex flex-col items-center"
      >
        <!-- Circle indicator -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ease-in-out border-2 shadow-sm"
          :class="[
            i < currentStep 
              ? 'bg-accent border-accent text-white scale-95' 
              : i === currentStep 
                ? 'bg-navy border-navy text-white ring-4 ring-navy/10 scale-105 shadow-md shadow-navy/10' 
                : 'bg-white border-[#CBD5E1] text-[#94A3B8]'
          ]"
        >
          <!-- Tick Icon for completed steps, or number for current/upcoming steps -->
          <svg v-if="i < currentStep" class="w-4 h-4 stroke-[3] animate-fade-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span v-else>{{ i }}</span>
        </div>

        <!-- Step Label -->
        <span 
          v-if="stepLabels && stepLabels[i - 1]"
          class="absolute top-12 whitespace-nowrap text-[10px] sm:text-xs tracking-wide transition-all duration-300 text-center uppercase"
          :class="[
            i <= currentStep 
              ? 'text-navy font-bold scale-100' 
              : 'text-[#94A3B8] font-medium'
          ]"
        >
          {{ stepLabels[i - 1] }}
        </span>
      </div>
    </div>
    <!-- Spacing at the bottom so the absolute label doesn't overlap container below -->
    <div class="h-6"></div>
  </div>
</template>

