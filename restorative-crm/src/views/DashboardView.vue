<template>
  <main class="p-8 bg-surface min-h-screen">
    <!-- Header -->
    <div class="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">
          Lead Tracking System
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          Analytics Dashboard
        </h2>
      </div>
      <div class="flex flex-wrap gap-3">
        <button @click="store.loadAll()" class="px-6 py-2.5 rounded-full bg-surface-container-highest text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors">
          <span class="material-symbols-outlined text-lg align-middle mr-1">refresh</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-20 text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p class="mt-4">Loading analytics...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="text-center py-20">
      <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-outlined text-3xl text-error">error</span>
      </div>
      <p class="text-error font-semibold">Failed to load analytics</p>
      <p class="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">{{ store.error }}</p>
      <button @click="store.loadAll()" class="mt-4 px-6 py-2 rounded-full bg-primary text-white text-sm font-semibold">Retry</button>
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <KpiGrid />

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <RegistrationsChart />
        <TrafficSources />
      </div>

      <!-- Recent Leads -->
      <RecentRegistrations />
    </template>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import KpiGrid from '@/components/dashboard/KpiGrid.vue'
import RegistrationsChart from '@/components/dashboard/RegistrationsChart.vue'
import TrafficSources from '@/components/dashboard/TrafficSources.vue'
import RecentRegistrations from '@/components/dashboard/RecentRegistrations.vue'
import { useDashboardStore } from '@/stores/dashboard.js'

const store = useDashboardStore()
onMounted(() => store.loadAll())
</script>
