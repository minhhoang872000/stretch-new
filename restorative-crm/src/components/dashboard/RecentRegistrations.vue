<template>
  <div class="bg-surface-container-lowest rounded-xl overflow-hidden">
    <div class="p-5 lg:p-8 flex justify-between items-center gap-3 border-b border-outline-variant/10">
      <div>
        <h4 class="text-xl font-bold text-on-surface">Top Pages</h4>
        <p class="text-sm text-on-surface-variant mt-0.5">Most visited pages from Google Analytics</p>
      </div>
      <router-link to="/google-analytics" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
        <span class="material-symbols-outlined text-base">open_in_new</span>Full Report
      </router-link>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low text-[10px] font-bold text-outline uppercase tracking-widest">
            <th class="px-5 lg:px-8 py-4">#</th>
            <th class="px-5 lg:px-8 py-4">Page</th>
            <th class="px-5 lg:px-8 py-4">Title</th>
            <th class="px-5 lg:px-8 py-4">Views</th>
            <th class="px-5 lg:px-8 py-4">Users</th>
            <th class="px-5 lg:px-8 py-4">Bounce</th>
            <th class="px-5 lg:px-8 py-4">Engagement</th>
            <th class="px-5 lg:px-8 py-4">Conv.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/10">
          <tr
            v-for="(pg, i) in topPages" :key="pg.path"
            class="hover:bg-surface-container-low transition-colors"
          >
            <td class="px-5 lg:px-8 py-4 text-sm font-bold text-on-surface-variant">{{ i + 1 }}</td>
            <td class="px-5 lg:px-8 py-4 max-w-[160px]">
              <p class="text-sm font-mono text-primary truncate" :title="pg.path">{{ pg.path }}</p>
            </td>
            <td class="px-5 lg:px-8 py-4 max-w-[200px]">
              <p class="text-sm text-on-surface truncate" :title="pg.title">{{ pg.title || '—' }}</p>
            </td>
            <td class="px-5 lg:px-8 py-4 text-sm font-semibold text-on-surface">{{ fmt(pg.pageViews) }}</td>
            <td class="px-5 lg:px-8 py-4 text-sm text-on-surface-variant">{{ fmt(pg.users) }}</td>
            <td class="px-5 lg:px-8 py-4 text-sm" :class="pg.bounceRate > 70 ? 'text-error font-semibold' : 'text-on-surface-variant'">
              {{ pg.bounceRate }}%
            </td>
            <td class="px-5 lg:px-8 py-4 text-sm text-green-600 font-medium">{{ pg.engagementRate }}%</td>
            <td class="px-5 lg:px-8 py-4 text-sm font-semibold text-on-surface">{{ fmt(pg.conversions) }}</td>
          </tr>
          <tr v-if="!topPages.length">
            <td colspan="8" class="px-5 lg:px-8 py-12 text-center text-on-surface-variant text-sm">
              No page data yet — make sure Google Analytics is configured.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard.js'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { topPages } = storeToRefs(store)

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}
</script>
