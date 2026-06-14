<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
      <div>
        <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Lead Intelligence</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Lead Tracking</h1>
        <p class="text-on-surface-variant mt-1.5 text-sm">All captured leads with UTM attribution and session history.</p>
      </div>
      <button @click="exportCSV" class="btn-outline flex items-center gap-2 text-sm">
        <span class="material-symbols-outlined text-lg">download</span>
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-surface-container-low rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
      <InputText v-model="filterUtmSource" @keyup.enter="applyFilters" placeholder="UTM Source" class="p-inputtext-sm text-sm w-36 bg-surface border-outline-variant/20 rounded-lg" />
      <InputText v-model="filterUtmCampaign" @keyup.enter="applyFilters" placeholder="UTM Campaign" class="p-inputtext-sm text-sm w-36 bg-surface border-outline-variant/20 rounded-lg" />
      
      <Dropdown
        v-model="filterDevice"
        :options="deviceOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="All Devices"
        class="p-dropdown-sm text-sm w-40 bg-surface border-outline-variant/20 rounded-lg"
        @change="applyFilters"
      />

      <Calendar
        v-model="filterDateFrom"
        dateFormat="yy-mm-dd"
        dataType="string"
        showIcon
        placeholder="Date From"
        class="p-calendar-sm text-sm w-44 bg-surface border-outline-variant/20 rounded-lg"
        @date-select="applyFilters"
        @clear-click="applyFilters"
        showButtonBar
      />

      <Calendar
        v-model="filterDateTo"
        dateFormat="yy-mm-dd"
        dataType="string"
        showIcon
        placeholder="Date To"
        class="p-calendar-sm text-sm w-44 bg-surface border-outline-variant/20 rounded-lg"
        @date-select="applyFilters"
        @clear-click="applyFilters"
        showButtonBar
      />

      <button @click="resetFilters" class="text-xs text-on-surface-variant hover:text-primary font-semibold ml-auto">Clear Filters</button>
    </div>

    <!-- Table -->
    <div class="bg-surface-container-low rounded-2xl overflow-hidden">
      <div v-if="store.loading" class="p-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <p class="mt-3 text-sm">Loading leads...</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-outline-variant/20 text-left">
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Session</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Page</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">UTM Source</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Campaign</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">CTA</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Device</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Time</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in store.leads" :key="lead.id" class="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors">
            <td class="p-4 font-mono text-xs text-on-surface-variant truncate max-w-[120px]" :title="lead.session_id">
              {{ lead.session_id?.slice(0, 8) }}...
            </td>
            <td class="p-4 truncate max-w-[140px]" :title="lead.page_source">{{ lead.page_source || '—' }}</td>
            <td class="p-4">
              <span v-if="lead.utm_source" class="badge-primary text-xs">{{ lead.utm_source }}</span>
              <span v-else class="text-on-surface-variant/40">—</span>
            </td>
            <td class="p-4">
              <span v-if="lead.utm_campaign" class="badge-secondary text-xs">{{ lead.utm_campaign }}</span>
              <span v-else class="text-on-surface-variant/40">—</span>
            </td>
            <td class="p-4">{{ lead.cta_clicked || '—' }}</td>
            <td class="p-4">
              <span class="material-symbols-outlined text-on-surface-variant text-lg" :title="lead.device_type">
                {{ lead.device_type === 'mobile' ? 'smartphone' : lead.device_type === 'tablet' ? 'tablet' : 'desktop_windows' }}
              </span>
            </td>
            <td class="p-4 text-xs text-on-surface-variant">{{ formatTime(lead.created_at) }}</td>
            <td class="p-4">
              <router-link :to="`/leads/${lead.session_id}`" class="text-primary font-semibold text-xs hover:underline">Detail →</router-link>
            </td>
          </tr>
          <tr v-if="store.leads.length === 0">
            <td colspan="8" class="p-12 text-center text-on-surface-variant">No leads found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.total > store.limit" class="flex items-center justify-between p-4 border-t border-outline-variant/10">
        <span class="text-xs text-on-surface-variant">{{ store.total }} total leads</span>
        <div class="flex gap-2">
          <button :disabled="store.page <= 1" @click="store.setPage(store.page - 1)" class="btn-outline text-xs px-3 py-1.5">Prev</button>
          <span class="px-3 py-1.5 text-xs font-semibold text-on-surface">{{ store.page }} / {{ Math.ceil(store.total / store.limit) }}</span>
          <button :disabled="store.page >= Math.ceil(store.total / store.limit)" @click="store.setPage(store.page + 1)" class="btn-outline text-xs px-3 py-1.5">Next</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeadsStore } from '@/stores/leads.js'
import { formatDateTime } from '@/utils/date.js'

const store = useLeadsStore()

const filterUtmSource = ref('')
const filterUtmCampaign = ref('')
const filterDevice = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const deviceOptions = [
  { label: 'All Devices', value: '' },
  { label: 'Desktop', value: 'desktop' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Tablet', value: 'tablet' }
]

function applyFilters() {
  store.setFilters({
    utm_source: filterUtmSource.value,
    utm_campaign: filterUtmCampaign.value,
    device_type: filterDevice.value,
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  })
}

function resetFilters() {
  filterUtmSource.value = ''
  filterUtmCampaign.value = ''
  filterDevice.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  store.setFilters({})
}

function formatTime(d) {
  if (!d) return '—'
  return formatDateTime(d)
}

function exportCSV() {
  const headers = ['Session ID', 'Page Source', 'Form Source', 'CTA Clicked', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Device', 'Referrer', 'Timestamp']
  const rows = store.leads.map(l => [
    l.session_id, l.page_source, l.form_source, l.cta_clicked,
    l.utm_source, l.utm_medium, l.utm_campaign, l.device_type, l.referrer, l.created_at
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v ?? ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => store.loadLeads())
</script>
