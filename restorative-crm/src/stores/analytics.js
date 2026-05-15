import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSummary, fetchCampaigns, fetchFunnel, fetchChartData } from '@/services/api.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  const summary = ref({ total_leads: 0, total_bookings: 0, conversion_rate: 0, period: '30d' })
  const campaigns = ref([])
  const funnel = ref([])
  const chartData = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadSummary(period = '30d') {
    try {
      summary.value = await fetchSummary(period)
    } catch (e) { error.value = e.message }
  }

  async function loadCampaigns(period = '30d') {
    try {
      campaigns.value = await fetchCampaigns(period)
    } catch (e) { error.value = e.message }
  }

  async function loadFunnel(period = '30d') {
    try {
      funnel.value = await fetchFunnel(period)
    } catch (e) { error.value = e.message }
  }

  async function loadChart(granularity = 'daily', period = '30d') {
    try {
      chartData.value = await fetchChartData(granularity, period)
    } catch (e) { error.value = e.message }
  }

  async function loadAll(period = '30d') {
    loading.value = true
    error.value = null
    await Promise.all([
      loadSummary(period),
      loadCampaigns(period),
      loadFunnel(period),
      loadChart('daily', period),
    ])
    loading.value = false
  }

  return { summary, campaigns, funnel, chartData, loading, error, loadAll, loadSummary, loadCampaigns, loadFunnel, loadChart }
})
