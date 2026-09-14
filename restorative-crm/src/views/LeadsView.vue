<template>
  <main class="page">
    <PageHeader
      eyebrow="Khách hàng"
      title="Khách tiềm năng"
      subtitle="Lead thu được từ site kèm nguồn UTM và lịch sử phiên truy cập."
    >
      <template #actions>
        <RouterLink to="/funnel" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">filter_alt</span>
          Xem phễu
        </RouterLink>
        <button type="button" class="btn-outline btn-sm" @click="exportCSV">
          <span class="material-symbols-outlined text-lg">download</span>
          Xuất CSV
        </button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="panel px-3 py-2.5 mb-3 flex flex-wrap gap-2 items-center">
      <InputText v-model="filterUtmSource" @keyup.enter="applyFilters" placeholder="UTM Source" class="p-inputtext-sm text-sm w-36 bg-surface border-outline-variant/20 rounded-lg" />
      <InputText v-model="filterUtmCampaign" @keyup.enter="applyFilters" placeholder="UTM Campaign" class="p-inputtext-sm text-sm w-36 bg-surface border-outline-variant/20 rounded-lg" />
      
      <Dropdown
        v-model="filterDevice"
        :options="deviceOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Mọi thiết bị"
        class="p-dropdown-sm text-sm w-40 bg-surface border-outline-variant/20 rounded-lg"
        @change="applyFilters"
      />

      <Calendar
        v-model="filterDateFrom"
        dateFormat="yy-mm-dd"
        dataType="string"
        showIcon
        placeholder="Từ ngày"
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
        placeholder="Đến ngày"
        class="p-calendar-sm text-sm w-44 bg-surface border-outline-variant/20 rounded-lg"
        @date-select="applyFilters"
        @clear-click="applyFilters"
        showButtonBar
      />

      <button @click="resetFilters" class="text-xs text-on-surface-variant hover:text-primary font-semibold ml-auto">Xoá lọc</button>
    </div>

    <!-- Table -->
    <div class="panel overflow-hidden">
      <div v-if="store.loading" class="p-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <p class="mt-3 text-sm">Đang tải danh sách lead…</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-outline-variant/20 text-left">
            <th>Phiên</th>
            <th>Trang</th>
            <th>Nguồn UTM</th>
            <th>Chiến dịch</th>
            <th>CTA</th>
            <th>Thiết bị</th>
            <th>Thời điểm</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in store.leads" :key="lead.id" class="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors">
            <td class="font-mono text-xs text-on-surface-variant truncate max-w-[120px]" :title="lead.session_id">
              {{ lead.session_id?.slice(0, 8) }}...
            </td>
            <td class="truncate max-w-[140px]" :title="lead.page_source">{{ lead.page_source || '—' }}</td>
            <td>
              <span v-if="lead.utm_source" class="badge-primary text-xs">{{ lead.utm_source }}</span>
              <span v-else class="text-on-surface-variant/40">—</span>
            </td>
            <td>
              <span v-if="lead.utm_campaign" class="badge-secondary text-xs">{{ lead.utm_campaign }}</span>
              <span v-else class="text-on-surface-variant/40">—</span>
            </td>
            <td>{{ lead.cta_clicked || '—' }}</td>
            <td>
              <span class="material-symbols-outlined text-on-surface-variant text-lg" :title="lead.device_type">
                {{ lead.device_type === 'mobile' ? 'smartphone' : lead.device_type === 'tablet' ? 'tablet' : 'desktop_windows' }}
              </span>
            </td>
            <td class="text-xs text-on-surface-variant">{{ formatTime(lead.created_at) }}</td>
            <td>
              <router-link :to="`/leads/${lead.session_id}`" class="text-primary font-semibold text-xs hover:underline">Chi tiết →</router-link>
            </td>
          </tr>
          <tr v-if="store.leads.length === 0">
            <td colspan="8" class="p-12 text-center text-on-surface-variant">Chưa có lead nào khớp bộ lọc.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.total > store.limit" class="flex items-center justify-between p-4 border-t border-outline-variant/10">
        <span class="text-xs text-on-surface-variant">{{ store.total }} lead</span>
        <div class="flex gap-2">
          <button :disabled="store.page <= 1" @click="store.setPage(store.page - 1)" class="btn-outline text-xs px-3 py-1.5">Trước</button>
          <span class="px-3 py-1.5 text-xs font-semibold text-on-surface">{{ store.page }} / {{ Math.ceil(store.total / store.limit) }}</span>
          <button :disabled="store.page >= Math.ceil(store.total / store.limit)" @click="store.setPage(store.page + 1)" class="btn-outline text-xs px-3 py-1.5">Sau</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import PageHeader from '@/components/ui/PageHeader.vue'
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
  { label: 'Mọi thiết bị', value: '' },
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
