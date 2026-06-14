<template>
  <div class="bg-surface-container-lowest rounded-xl p-8 mb-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#F37C20]/10 flex items-center justify-center">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#F37C20" opacity=".2"/>
            <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586V7z" fill="#F37C20"/>
          </svg>
        </div>
        <div>
          <h4 class="text-lg font-bold text-on-surface">Google Analytics</h4>
          <p class="text-xs text-on-surface-variant">Website traffic overview</p>
        </div>
      </div>
      <!-- Period selector -->
      <div class="flex gap-2">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="changePeriod(p.value)"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="activePeriod === p.value
            ? 'bg-[#F37C20] text-white'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Not configured -->
    <div v-if="store.notConfigured" class="py-10 text-center">
      <div class="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-outlined text-2xl text-on-surface-variant">key_off</span>
      </div>
      <p class="font-semibold text-on-surface">Google Analytics not configured</p>
      <p class="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
        Set <code class="bg-surface-container px-1 py-0.5 rounded text-xs">GA_PROPERTY_ID</code>,
        <code class="bg-surface-container px-1 py-0.5 rounded text-xs">GA_CLIENT_EMAIL</code>, and
        <code class="bg-surface-container px-1 py-0.5 rounded text-xs">GA_PRIVATE_KEY</code>
        in your backend <code class="bg-surface-container px-1 py-0.5 rounded text-xs">.env</code> file.
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="store.loading" class="py-10 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      <p class="mt-2 text-sm">Loading Google Analytics…</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="py-10 text-center">
      <span class="material-symbols-outlined text-3xl text-error">error</span>
      <p class="text-error font-semibold mt-2">{{ store.error }}</p>
      <button @click="store.loadAll(activePeriod)" class="mt-3 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold">Retry</button>
    </div>

    <template v-else-if="store.overview">
      <!-- KPI row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div v-for="kpi in kpis" :key="kpi.label" class="bg-surface-container rounded-xl p-4 text-center">
          <p class="text-xs text-on-surface-variant font-medium mb-1">{{ kpi.label }}</p>
          <p class="text-xl font-extrabold text-on-surface">{{ kpi.value }}</p>
          <p v-if="kpi.sub" class="text-[10px] text-on-surface-variant mt-0.5">{{ kpi.sub }}</p>
        </div>
      </div>

      <!-- Channels + Top Pages -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Channel breakdown -->
        <div>
          <h5 class="text-sm font-bold text-on-surface mb-4">Traffic by Channel</h5>
          <div class="space-y-3">
            <div v-for="ch in store.channels" :key="ch.channel" class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: channelColor(ch.channel) }"></div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-on-surface truncate">{{ ch.channel || 'Direct' }}</span>
                  <span class="text-xs font-bold text-on-surface ml-2">{{ ch.percent }}%</span>
                </div>
                <div class="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{ width: ch.percent + '%', background: channelColor(ch.channel) }"
                  ></div>
                </div>
                <p class="text-[11px] text-on-surface-variant mt-0.5">{{ formatNum(ch.sessions) }} sessions</p>
              </div>
            </div>
            <p v-if="!store.channels.length" class="text-sm text-on-surface-variant">No channel data</p>
          </div>
        </div>

        <!-- Top Pages -->
        <div>
          <h5 class="text-sm font-bold text-on-surface mb-4">Top Pages</h5>
          <div class="space-y-2">
            <div
              v-for="(page, i) in store.pages.slice(0, 7)"
              :key="page.path"
              class="flex items-center gap-3 py-2 border-b border-surface-container-high last:border-0"
            >
              <span class="text-xs font-bold text-on-surface-variant w-4 text-right flex-shrink-0">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-on-surface truncate">{{ page.path }}</p>
                <p class="text-[11px] text-on-surface-variant truncate">{{ page.title }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-sm font-bold text-on-surface">{{ formatNum(page.pageViews) }}</p>
                <p class="text-[11px] text-on-surface-variant">views</p>
              </div>
            </div>
            <p v-if="!store.pages.length" class="text-sm text-on-surface-variant">No page data</p>
          </div>
        </div>
      </div>

      <!-- Daily trend sparkline -->
      <div v-if="store.trend.length" class="mt-8">
        <h5 class="text-sm font-bold text-on-surface mb-4">Sessions Trend</h5>
        <div class="flex items-end gap-1 h-16">
          <div
            v-for="(day, i) in trendBars"
            :key="i"
            class="flex-1 rounded-t transition-all duration-300 cursor-default"
            :style="{ height: day.height + '%', background: '#F37C20', opacity: day.height < 20 ? 0.3 : 0.7 + (day.height / 100) * 0.3 }"
            :title="`${day.date}: ${formatNum(day.sessions)} sessions`"
          ></div>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-[10px] text-on-surface-variant">{{ store.trend[0]?.date }}</span>
          <span class="text-[10px] text-on-surface-variant">{{ store.trend[store.trend.length - 1]?.date }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoogleAnalyticsStore } from '@/stores/googleAnalytics.js'

const store = useGoogleAnalyticsStore()
const activePeriod = ref('30d')
const periods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
]

function changePeriod(p) {
  activePeriod.value = p
  store.loadAll(p)
}

onMounted(() => store.loadAll(activePeriod.value))

function formatNum(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(Math.round(n))
}

function formatDuration(secs) {
  if (!secs) return '0s'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return m ? `${m}m ${s}s` : `${s}s`
}

const kpis = computed(() => {
  const ov = store.overview
  if (!ov) return []
  return [
    { label: 'Sessions', value: formatNum(ov.sessions) },
    { label: 'Users', value: formatNum(ov.activeUsers) },
    { label: 'New Users', value: formatNum(ov.newUsers) },
    { label: 'Page Views', value: formatNum(ov.pageViews) },
    { label: 'Bounce Rate', value: ov.bounceRate + '%' },
    { label: 'Avg Duration', value: formatDuration(ov.avgSessionDuration) },
  ]
})

const CHANNEL_COLORS = {
  'Organic Search': '#34A853',
  'Direct': '#4285F4',
  'Organic Social': '#EA4335',
  'Paid Search': '#FBBC04',
  'Email': '#9C27B0',
  'Referral': '#00BCD4',
  'Affiliates': '#FF5722',
}
function channelColor(name) {
  return CHANNEL_COLORS[name] || '#9E9E9E'
}

const trendBars = computed(() => {
  if (!store.trend.length) return []
  const max = Math.max(...store.trend.map(d => d.sessions), 1)
  return store.trend.map(d => ({
    date: d.date,
    sessions: d.sessions,
    height: Math.max(4, Math.round((d.sessions / max) * 100)),
  }))
})
</script>
