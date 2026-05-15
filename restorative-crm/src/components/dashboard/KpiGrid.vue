<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <KpiCard v-for="kpi in kpis" :key="kpi.id" :kpi="kpi" />
  </div>
</template>

<script setup>
import KpiCard from './KpiCard.vue'
import { useDashboardStore } from '@/stores/dashboard.js'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { kpis } = storeToRefs(store)
</script>
