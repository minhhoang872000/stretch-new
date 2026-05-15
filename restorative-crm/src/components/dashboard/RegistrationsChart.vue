<template>
  <div class="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h4 class="text-xl font-bold text-on-surface">Registrations Over Time</h4>
        <p class="text-sm text-on-surface-variant">Daily clinical intake volume</p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="period in ['Week', 'Month']"
          :key="period"
          class="p-1 px-3 rounded-full text-xs font-bold transition-colors"
          :class="
            activePeriod === period
              ? 'bg-primary text-white'
              : 'text-outline hover:bg-surface-container-high'
          "
          @click="activePeriod = period"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <!-- Chart bars -->
    <div class="h-64 w-full flex items-end gap-2 relative">
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
        <div class="border-b border-outline"></div>
        <div class="border-b border-outline"></div>
        <div class="border-b border-outline"></div>
        <div class="border-b border-outline"></div>
      </div>
      <div
        v-for="(val, i) in chart.values"
        :key="i"
        class="flex-1 bg-gradient-to-t from-primary/5 to-primary/20 rounded-t-lg relative group transition-all duration-300 hover:from-primary/20 hover:to-primary/40"
        :style="{ height: maxValue ? (val / maxValue * 100) + '%' : '0%' }"
      >
        <div
          class="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {{ val }}
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-4 text-[10px] font-bold text-outline uppercase tracking-wider">
      <span v-for="label in chart.labels" :key="label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard.js'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { chart } = storeToRefs(store)

const activePeriod = ref('Week')
const maxValue = computed(() => Math.max(...(chart.value.values || [0]), 1))
</script>
