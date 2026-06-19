<template>
  <main class="p-6 lg:p-8 bg-surface min-h-screen">
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-[#4285F4]/10 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[#4285F4]">travel_explore</span>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface">Google Search Console</h1>
          <p class="text-sm text-on-surface-variant mt-0.5">
            Organic search · {{ store.overview?.startDate || '—' }} → {{ store.overview?.endDate || '—' }}
          </p>
        </div>
      </div>

      <!-- Period + Refresh -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-1 bg-surface-container rounded-full p-1">
          <button v-for="p in periods" :key="p.value" @click="store.changePeriod(p.value)"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            :class="store.period === p.value ? 'bg-[#4285F4] text-white shadow' : 'text-on-surface-variant hover:text-on-surface'">
            {{ p.label }}
          </button>
        </div>
        <button @click="store.loadAll()"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors">
          <span class="material-symbols-outlined text-base">refresh</span>Refresh
        </button>
      </div>
    </div>

    <!-- Not configured -->
    <div v-if="store.notConfigured" class="py-20 text-center">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant">key_off</span>
      <p class="font-semibold text-on-surface mt-4">Search Console not configured</p>
      <p class="text-sm text-on-surface-variant mt-1">
        Set GSC_SITE_URL (and reuse the GA service account) in the backend .env, then add that
        service-account email as a user on the GSC property.
      </p>
    </div>

    <template v-else>
      <!-- Overview KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="kpi in overviewKPIs" :key="kpi.label" :title="kpi.tip"
          class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 hover:shadow-md transition-shadow cursor-help">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-base" :style="{ color: kpi.color }">{{ kpi.icon }}</span>
            <p class="text-xs text-on-surface-variant font-medium truncate">{{ kpi.label }}</p>
            <span class="material-symbols-outlined text-sm text-on-surface-variant/40 ml-auto">info</span>
          </div>
          <p class="text-2xl font-extrabold text-on-surface">{{ kpi.value }}</p>
          <p v-if="kpi.sub" class="text-[11px] text-on-surface-variant mt-0.5">{{ kpi.sub }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-container rounded-xl p-1 mb-6 overflow-x-auto no-scrollbar">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :title="tab.tip"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
          :class="activeTab === tab.key ? 'bg-white shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'">
          <span class="material-symbols-outlined text-base">{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </div>

      <!-- ─── TAB: Trend ──────────────────────────────────────────────── -->
      <div v-if="activeTab === 'trend'" class="bg-surface-container-lowest rounded-xl p-6">
        <h3 class="font-bold text-on-surface mb-6">Clicks & Impressions Trend</h3>
        <div v-if="store.loading.trend" class="h-32 flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
        </div>
        <p v-else-if="!store.trend.length" class="text-sm text-on-surface-variant py-10 text-center">No data for this period yet.</p>
        <template v-else>
          <div class="flex items-end gap-0.5 h-40 mb-2">
            <div v-for="(d, i) in trendBars" :key="i"
              class="flex-1 flex flex-col justify-end gap-0.5 cursor-pointer group"
              :title="`${d.date}\nClicks: ${d.clicks}\nImpressions: ${d.impressions}`">
              <div class="rounded-t transition-all" :style="{ height: d.imprH + '%', background: '#4285F4', opacity: 0.5 }"></div>
              <div class="rounded-t transition-all" :style="{ height: d.clickH + '%', background: '#34A853', opacity: 0.9 }"></div>
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-on-surface-variant mb-4">
            <span>{{ store.trend[0]?.date }}</span>
            <span>{{ store.trend[store.trend.length - 1]?.date }}</span>
          </div>
          <div class="flex gap-4 text-xs mb-6">
            <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#34A853"></span>Clicks</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block opacity-50" style="background:#4285F4"></span>Impressions</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-2 text-on-surface-variant font-semibold">Date</th>
                <th class="text-right py-2 text-on-surface-variant font-semibold">Clicks</th>
                <th class="text-right py-2 text-on-surface-variant font-semibold">Impressions</th>
                <th class="text-right py-2 text-on-surface-variant font-semibold">CTR</th>
                <th class="text-right py-2 text-on-surface-variant font-semibold">Position</th>
              </tr></thead>
              <tbody>
                <tr v-for="d in store.trend" :key="d.date" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                  <td class="py-2 font-medium">{{ d.date }}</td>
                  <td class="py-2 text-right">{{ fmt(d.clicks) }}</td>
                  <td class="py-2 text-right">{{ fmt(d.impressions) }}</td>
                  <td class="py-2 text-right">{{ d.ctr }}%</td>
                  <td class="py-2 text-right">{{ d.position }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- ─── TAB: Queries / Pages (shared table) ─────────────────────── -->
      <div v-else-if="activeTab === 'queries' || activeTab === 'pages'" class="bg-surface-container-lowest rounded-xl p-6">
        <h3 class="font-bold text-on-surface mb-6">{{ activeTab === 'queries' ? 'Top Search Queries' : 'Top Pages' }}</h3>
        <div v-if="store.loading[activeTab]" class="h-32 flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
        </div>
        <p v-else-if="!currentRows.length" class="text-sm text-on-surface-variant py-10 text-center">No data for this period yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="border-b border-outline-variant/30">
              <th class="text-left py-2 text-on-surface-variant font-semibold">{{ activeTab === 'queries' ? 'Query' : 'Page' }}</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Clicks</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Impressions</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">CTR</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Position</th>
            </tr></thead>
            <tbody>
              <tr v-for="(r, i) in currentRows" :key="i" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                <td class="py-2 font-medium max-w-[420px] truncate" :title="r.query || r.page">{{ r.query || r.page }}</td>
                <td class="py-2 text-right">{{ fmt(r.clicks) }}</td>
                <td class="py-2 text-right">{{ fmt(r.impressions) }}</td>
                <td class="py-2 text-right">{{ r.ctr }}%</td>
                <td class="py-2 text-right">{{ r.position }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TAB: Countries ──────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'countries'" class="bg-surface-container-lowest rounded-xl p-6">
        <h3 class="font-bold text-on-surface mb-6">Countries</h3>
        <div v-if="store.loading.countries" class="h-32 flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
        </div>
        <p v-else-if="!store.countries.length" class="text-sm text-on-surface-variant py-10 text-center">No data for this period yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="border-b border-outline-variant/30">
              <th class="text-left py-2 text-on-surface-variant font-semibold">Country</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Clicks</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Impressions</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">CTR</th>
              <th class="text-right py-2 text-on-surface-variant font-semibold">Position</th>
            </tr></thead>
            <tbody>
              <tr v-for="(r, i) in store.countries" :key="i" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                <td class="py-2 font-medium uppercase">{{ r.country }}</td>
                <td class="py-2 text-right">{{ fmt(r.clicks) }}</td>
                <td class="py-2 text-right">{{ fmt(r.impressions) }}</td>
                <td class="py-2 text-right">{{ r.ctr }}%</td>
                <td class="py-2 text-right">{{ r.position }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TAB: Devices ────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'devices'" class="bg-surface-container-lowest rounded-xl p-6">
        <h3 class="font-bold text-on-surface mb-6">Devices</h3>
        <div v-if="store.loading.devices" class="h-32 flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
        </div>
        <p v-else-if="!store.devices.length" class="text-sm text-on-surface-variant py-10 text-center">No data for this period yet.</p>
        <div v-else class="space-y-4">
          <div v-for="(r, i) in store.devices" :key="i">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold text-on-surface capitalize">{{ r.device }}</span>
              <span class="text-on-surface-variant">{{ fmt(r.clicks) }} clicks · {{ fmt(r.impressions) }} impr · {{ r.ctr }}% CTR</span>
            </div>
            <div class="h-2 rounded-full bg-surface-container overflow-hidden">
              <div class="h-full rounded-full bg-[#4285F4]" :style="{ width: deviceClickPct(r) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSearchConsoleStore } from '@/stores/searchConsole.js'

const store = useSearchConsoleStore()

const periods = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
]

const tabs = [
  { key: 'trend', label: 'Trend', icon: 'show_chart', tip: 'Biến động clicks & impressions theo từng ngày.' },
  { key: 'queries', label: 'Queries', icon: 'search', tip: 'Từ khoá người dùng gõ trên Google để tìm thấy bạn.' },
  { key: 'pages', label: 'Pages', icon: 'description', tip: 'Các trang của bạn nhận traffic từ tìm kiếm Google.' },
  { key: 'countries', label: 'Countries', icon: 'public', tip: 'Lượng tìm kiếm chia theo quốc gia.' },
  { key: 'devices', label: 'Devices', icon: 'devices', tip: 'Thiết bị người dùng dùng để tìm: máy tính / điện thoại / máy tính bảng.' },
]
const activeTab = ref('trend')

function fmt(n) {
  return (n ?? 0).toLocaleString('en-US')
}

const overviewKPIs = computed(() => {
  const o = store.overview || {}
  return [
    { label: 'Total Clicks', value: fmt(o.clicks), icon: 'ads_click', color: '#34A853',
      tip: 'Số lần người dùng bấm vào kết quả của bạn trên Google Search để vào website.' },
    { label: 'Total Impressions', value: fmt(o.impressions), icon: 'visibility', color: '#4285F4',
      tip: 'Số lần website xuất hiện trong kết quả tìm kiếm — dù người dùng có bấm hay không.' },
    { label: 'Avg CTR', value: `${o.ctr ?? 0}%`, icon: 'percent', color: '#F37C20',
      tip: 'Click-Through Rate = Clicks ÷ Impressions. Tỷ lệ % người thấy rồi bấm vào. Càng cao càng tốt.' },
    { label: 'Avg Position', value: o.position ?? 0, icon: 'leaderboard', color: '#A142F4',
      tip: 'Thứ hạng trung bình của website trên trang kết quả tìm kiếm (1 = cao nhất / tốt nhất).' },
  ]
})

const currentRows = computed(() => (activeTab.value === 'queries' ? store.queries : store.pages))

const trendBars = computed(() => {
  const maxClicks = Math.max(1, ...store.trend.map((d) => d.clicks))
  const maxImpr = Math.max(1, ...store.trend.map((d) => d.impressions))
  return store.trend.map((d) => ({
    date: d.date,
    clicks: d.clicks,
    impressions: d.impressions,
    clickH: Math.round((d.clicks / maxClicks) * 100),
    imprH: Math.round((d.impressions / maxImpr) * 100),
  }))
})

function deviceClickPct(r) {
  const max = Math.max(1, ...store.devices.map((d) => d.clicks))
  return Math.round((r.clicks / max) * 100)
}

onMounted(() => store.loadAll())
</script>
