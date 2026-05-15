<template>
  <div class="bg-surface-container-lowest rounded-xl overflow-hidden">
    <div class="p-8 flex justify-between items-center border-b border-outline-variant/10">
      <h4 class="text-xl font-bold text-on-surface">Recent Leads</h4>
      <router-link to="/leads" class="text-primary font-bold text-sm hover:underline">View All Leads</router-link>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low text-[10px] font-bold text-outline uppercase tracking-widest">
            <th class="px-8 py-4">Session</th>
            <th class="px-8 py-4">Page</th>
            <th class="px-8 py-4">UTM Source</th>
            <th class="px-8 py-4">Campaign</th>
            <th class="px-8 py-4">CTA</th>
            <th class="px-8 py-4">Device</th>
            <th class="px-8 py-4">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/10">
          <tr
            v-for="lead in recentLeads"
            :key="lead.session_id"
            class="hover:bg-surface-container-low transition-colors group"
          >
            <td class="px-8 py-5">
              <p class="text-xs font-mono text-on-surface-variant truncate max-w-[100px]" :title="lead.session_id">
                {{ lead.session_id?.slice(0, 8) }}...
              </p>
            </td>
            <td class="px-8 py-5 text-sm text-on-surface truncate max-w-[140px]" :title="lead.page_source">
              {{ lead.page_source || '—' }}
            </td>
            <td class="px-8 py-5">
              <span v-if="lead.utm_source" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{{ lead.utm_source }}</span>
              <span v-else class="text-xs text-on-surface-variant/40">—</span>
            </td>
            <td class="px-8 py-5">
              <span v-if="lead.utm_campaign" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary">{{ lead.utm_campaign }}</span>
              <span v-else class="text-xs text-on-surface-variant/40">—</span>
            </td>
            <td class="px-8 py-5 text-sm text-on-surface-variant">{{ lead.cta_clicked || '—' }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant capitalize">{{ lead.device_type || '—' }}</td>
            <td class="px-8 py-5 text-xs text-on-surface-variant">{{ formatTime(lead.created_at) }}</td>
          </tr>
          <tr v-if="!recentLeads.length">
            <td colspan="7" class="px-8 py-12 text-center text-on-surface-variant">No leads yet. Start tracking from your frontend.</td>
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
const { recentLeads } = storeToRefs(store)

function formatTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
