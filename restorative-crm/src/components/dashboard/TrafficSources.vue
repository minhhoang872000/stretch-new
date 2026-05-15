<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl">
    <h4 class="text-xl font-bold text-on-surface mb-2">Traffic Sources</h4>
    <p class="text-sm text-on-surface-variant mb-8">Acquisition by channel</p>

    <!-- Donut SVG -->
    <div class="relative w-48 h-48 mx-auto mb-8">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
        <circle
          class="text-surface-container-high"
          cx="96" cy="96" r="80"
          fill="transparent" stroke="currentColor" stroke-width="24"
        />
        <circle
          class="text-primary"
          cx="96" cy="96" r="80"
          fill="transparent" stroke="currentColor"
          stroke-width="24"
          stroke-dasharray="502"
          stroke-dashoffset="125"
        />
        <circle
          class="text-tertiary"
          cx="96" cy="96" r="80"
          fill="transparent" stroke="currentColor"
          stroke-width="24"
          stroke-dasharray="502"
          stroke-dashoffset="400"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-on-surface">75%</span>
        <span class="text-[10px] text-outline font-bold uppercase">Direct</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="space-y-4">
      <div
        v-for="source in traffic"
        :key="source.label"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :class="source.color"></div>
          <span class="text-sm font-medium text-on-surface">{{ source.label }}</span>
        </div>
        <span class="text-sm font-bold">{{ source.percent }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard.js'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { traffic } = storeToRefs(store)
</script>
