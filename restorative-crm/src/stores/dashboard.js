import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useGoogleAnalyticsStore } from './googleAnalytics.js'

function fmt(n) {
  if (n == null) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}

const CHANNEL_COLORS = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-error', 'bg-primary/60']

export const useDashboardStore = defineStore('dashboard', () => {
  const ga = useGoogleAnalyticsStore()

  const kpis = computed(() => {
    const ov = ga.overview
    return [
      {
        id: 'sessions', icon: 'show_chart', label: 'Sessions',
        value: fmt(ov?.sessions),
        badge: null, iconBg: 'bg-primary/10', iconColor: 'text-primary',
        iconHoverBg: 'group-hover:bg-primary', iconHoverText: 'group-hover:text-white',
        pulse: false, badgeColor: 'primary',
      },
      {
        id: 'users', icon: 'group', label: 'Total Users',
        value: fmt(ov?.totalUsers),
        badge: null, iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary',
        iconHoverBg: 'group-hover:bg-tertiary', iconHoverText: 'group-hover:text-white',
        pulse: false, badgeColor: 'tertiary',
      },
      {
        id: 'engagement', icon: 'thumb_up', label: 'Engagement Rate',
        value: (ov?.engagementRate ?? 0) + '%',
        badge: null, iconBg: 'bg-secondary/10', iconColor: 'text-secondary',
        iconHoverBg: 'group-hover:bg-secondary', iconHoverText: 'group-hover:text-white',
        pulse: false, badgeColor: 'secondary',
      },
      {
        id: 'conversions', icon: 'flag', label: 'Conversions',
        value: fmt(ov?.conversions),
        badge: null, iconBg: 'bg-error/10', iconColor: 'text-error',
        iconHoverBg: 'group-hover:bg-error', iconHoverText: 'group-hover:text-white',
        pulse: false, badgeColor: 'error',
      },
    ]
  })

  const traffic = computed(() => {
    if (!ga.channels.length) return [{ label: 'No data yet', percent: '100%', color: 'bg-surface-container-high' }]
    return ga.channels.slice(0, 5).map((c, i) => ({
      label: c.channel,
      percent: c.percent + '%',
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    }))
  })

  const chart = computed(() => {
    if (!ga.trend.length) return { labels: [], values: [] }
    return {
      labels: ga.trend.map(d => d.date.slice(5)),
      values: ga.trend.map(d => d.sessions),
    }
  })

  const topPages = computed(() => ga.pages.slice(0, 8))

  const loading = computed(() => ga.loading.overview || ga.loading.channels || ga.loading.trend || ga.loading.pages)
  const error = computed(() => ga.error)

  async function loadAll() {
    await ga.loadAll()
  }

  return { kpis, traffic, chart, topPages, loading, error, loadAll }
})
