<template>
  <div class="bg-surface-container-lowest p-5 lg:p-8 rounded-xl">
    <h4 class="text-xl font-bold text-on-surface mb-2">Traffic Sources</h4>
    <p class="text-sm text-on-surface-variant mb-6">Acquisition by channel</p>

    <!-- Donut SVG -->
    <div class="relative w-44 h-44 mx-auto mb-6">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="64" fill="transparent" stroke="#e5e7eb" stroke-width="20"/>
        <circle
          v-for="seg in donutSegments" :key="seg.channel"
          cx="80" cy="80" r="64"
          fill="transparent"
          :stroke="seg.color"
          stroke-width="20"
          :stroke-dasharray="`${seg.dash} ${seg.gap}`"
          :stroke-dashoffset="seg.offset"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-extrabold text-on-surface">{{ topChannel.percent }}</span>
        <span class="text-[10px] text-outline font-bold uppercase truncate max-w-[72px] text-center">{{ topChannel.label }}</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="space-y-3">
      <div v-for="source in traffic" :key="source.label" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :class="source.color"></div>
          <span class="text-sm font-medium text-on-surface truncate max-w-[120px]">{{ source.label }}</span>
        </div>
        <span class="text-sm font-bold text-on-surface ml-2">{{ source.percent }}</span>
      </div>
      <p v-if="!traffic.length" class="text-sm text-on-surface-variant text-center py-2">No data yet</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard.js'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { traffic } = storeToRefs(store)

const COLORS_HEX = ['#6750A4', '#6EC1B2', '#7965AF', '#B3261E', '#9747FF', '#78909C']

const topChannel = computed(() => traffic.value[0] ?? { label: 'Direct', percent: '0%' })

const donutSegments = computed(() => {
  const circ = 2 * Math.PI * 64
  let offset = 0
  return traffic.value.map((src, i) => {
    const pct = parseFloat(src.percent) / 100
    const dash = circ * pct
    const gap = circ - dash
    const seg = { channel: src.label, color: COLORS_HEX[i % COLORS_HEX.length], dash, gap, offset: -offset }
    offset += dash
    return seg
  })
})
</script>
