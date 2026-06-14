import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
  fetchGaOverview, fetchGaChannels, fetchGaTrend, fetchGaPages,
  fetchGaUTM, fetchGaUTMSources, fetchGaDevices, fetchGaGeo,
  fetchGaEvents, fetchGaRealtime, fetchGaSocial,
} from '@/services/api.js'

export const useGoogleAnalyticsStore = defineStore('googleAnalytics', () => {
  // ─── State ────────────────────────────────────────────────────────
  const overview = ref(null)
  const channels = ref([])
  const trend = ref([])
  const pages = ref([])
  const utm = ref([])
  const utmSources = ref({ sources: [], mediums: [], campaigns: [] })
  const devices = ref(null)
  const geo = ref(null)
  const events = ref([])
  const realtime = ref({ totalActive: 0, byPage: [] })
  const social = ref({ platforms: [], campaigns: [], total: 0 })

  // ─── Filters ──────────────────────────────────────────────────────
  const period = ref('30d')
  const utmFilters = reactive({ source: '', medium: '', campaign: '', content: '', term: '' })
  const eventFilter = ref('')

  // ─── Loading / error per section ──────────────────────────────────
  const loading = reactive({
    overview: false, channels: false, trend: false, pages: false,
    utm: false, devices: false, geo: false, events: false, realtime: false, social: false,
  })
  const error = ref(null)
  const notConfigured = ref(false)

  function onError(e) {
    if (e.message?.includes('GA_NOT_CONFIGURED') || e.message?.includes('credentials not configured')) {
      notConfigured.value = true
    } else {
      error.value = e.message
    }
  }

  // ─── Loaders ──────────────────────────────────────────────────────
  async function loadOverview() {
    loading.overview = true
    try { overview.value = await fetchGaOverview(period.value) }
    catch (e) { onError(e) } finally { loading.overview = false }
  }

  async function loadChannels() {
    loading.channels = true
    try { channels.value = await fetchGaChannels(period.value) }
    catch (e) { onError(e) } finally { loading.channels = false }
  }

  async function loadTrend() {
    loading.trend = true
    try { trend.value = await fetchGaTrend(period.value) }
    catch (e) { onError(e) } finally { loading.trend = false }
  }

  async function loadPages() {
    loading.pages = true
    try { pages.value = await fetchGaPages(period.value) }
    catch (e) { onError(e) } finally { loading.pages = false }
  }

  async function loadUTM() {
    loading.utm = true
    try { utm.value = await fetchGaUTM(period.value, { ...utmFilters }) }
    catch (e) { onError(e) } finally { loading.utm = false }
  }

  async function loadUTMSources() {
    try { utmSources.value = await fetchGaUTMSources(period.value) }
    catch (e) { onError(e) }
  }

  async function loadDevices() {
    loading.devices = true
    try { devices.value = await fetchGaDevices(period.value) }
    catch (e) { onError(e) } finally { loading.devices = false }
  }

  async function loadGeo() {
    loading.geo = true
    try { geo.value = await fetchGaGeo(period.value) }
    catch (e) { onError(e) } finally { loading.geo = false }
  }

  async function loadEvents() {
    loading.events = true
    try { events.value = await fetchGaEvents(period.value, eventFilter.value) }
    catch (e) { onError(e) } finally { loading.events = false }
  }

  async function loadRealtime() {
    loading.realtime = true
    try { realtime.value = await fetchGaRealtime() }
    catch (e) { onError(e) } finally { loading.realtime = false }
  }

  async function loadSocial() {
    loading.social = true
    try { social.value = await fetchGaSocial(period.value) }
    catch (e) { onError(e) } finally { loading.social = false }
  }

  async function loadAll() {
    error.value = null
    notConfigured.value = false
    await Promise.all([
      loadOverview(), loadChannels(), loadTrend(), loadPages(),
      loadUTM(), loadUTMSources(), loadDevices(), loadGeo(), loadEvents(), loadRealtime(), loadSocial(),
    ])
  }

  async function changePeriod(p) {
    period.value = p
    await loadAll()
  }

  async function applyUTMFilters() {
    await loadUTM()
  }

  function resetUTMFilters() {
    utmFilters.source = ''
    utmFilters.medium = ''
    utmFilters.campaign = ''
    utmFilters.content = ''
    utmFilters.term = ''
    loadUTM()
  }

  return {
    overview, channels, trend, pages, utm, utmSources,
    devices, geo, events, realtime, social,
    period, utmFilters, eventFilter,
    loading, error, notConfigured,
    loadAll, loadOverview, loadChannels, loadTrend, loadPages,
    loadUTM, loadDevices, loadGeo, loadEvents, loadRealtime, loadSocial,
    changePeriod, applyUTMFilters, resetUTMFilters,
  }
})
