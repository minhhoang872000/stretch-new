import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchSummary, fetchCampaigns, fetchChartData, fetchLeads } from '@/services/api.js'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref({ total_leads: 0, total_bookings: 0, conversion_rate: 0 })
  const campaigns = ref([])
  const chart = ref({ labels: [], values: [] })
  const recentLeads = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed KPI cards
  const kpis = computed(() => [
    { id: 'leads', icon: 'person_search', label: 'Total Leads', value: String(summary.value.total_leads), badge: null, iconBg: 'bg-primary/10', iconColor: 'text-primary', iconHoverBg: 'group-hover:bg-primary', iconHoverText: 'group-hover:text-white', pulse: false, badgeColor: 'primary' },
    { id: 'bookings', icon: 'event_available', label: 'Total Bookings', value: String(summary.value.total_bookings), badge: null, iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary', iconHoverBg: 'group-hover:bg-tertiary', iconHoverText: 'group-hover:text-white', pulse: false, badgeColor: 'tertiary' },
    { id: 'conversion', icon: 'trending_up', label: 'Conversion Rate', value: summary.value.conversion_rate + '%', badge: null, iconBg: 'bg-secondary/10', iconColor: 'text-secondary', iconHoverBg: 'group-hover:bg-secondary', iconHoverText: 'group-hover:text-white', pulse: false, badgeColor: 'secondary' },
    { id: 'campaigns', icon: 'campaign', label: 'Active Campaigns', value: String(campaigns.value.length), badge: null, iconBg: 'bg-error/10', iconColor: 'text-error', iconHoverBg: 'group-hover:bg-error', iconHoverText: 'group-hover:text-white', pulse: false, badgeColor: 'error' },
  ])

  // Computed traffic sources from campaign data
  const traffic = computed(() => {
    if (!campaigns.value.length) return [{ label: 'No data yet', percent: '100%', color: 'bg-surface-container-high' }]
    const total = campaigns.value.reduce((s, c) => s + c.leads, 0) || 1
    const colors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-error', 'bg-primary/60']
    return campaigns.value.slice(0, 5).map((c, i) => ({
      label: c.utm_campaign || '(direct)',
      percent: Math.round(c.leads / total * 100) + '%',
      color: colors[i % colors.length],
    }))
  })

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      console.log('[Dashboard] Fetching analytics from:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')
      const [s, camp, ch, leadsData] = await Promise.all([
        fetchSummary('30d'),
        fetchCampaigns('30d'),
        fetchChartData('daily', '7d'),
        fetchLeads({ page: 1, limit: 5 }),
      ])
      console.log('[Dashboard] Summary:', s)
      console.log('[Dashboard] Campaigns:', camp)
      console.log('[Dashboard] Chart:', ch)
      console.log('[Dashboard] Leads:', leadsData)
      summary.value = s
      campaigns.value = camp
      chart.value = {
        labels: ch.map(d => d.date.slice(-5)),
        values: ch.map(d => d.leads),
      }
      recentLeads.value = (leadsData.rows || []).map(l => ({
        session_id: l.session_id,
        page_source: l.page_source,
        utm_source: l.utm_source,
        utm_campaign: l.utm_campaign,
        cta_clicked: l.cta_clicked,
        device_type: l.device_type,
        created_at: l.created_at,
      }))
    } catch (e) {
      console.error('[Dashboard] Load failed:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { summary, campaigns, chart, recentLeads, kpis, traffic, loading, error, loadAll }
})
