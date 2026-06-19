import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
  fetchScOverview, fetchScTrend, fetchScQueries,
  fetchScPages, fetchScCountries, fetchScDevices,
} from '@/services/api.js'

export const useSearchConsoleStore = defineStore('searchConsole', () => {
  // ─── State ────────────────────────────────────────────────────────
  const overview = ref(null)
  const trend = ref([])
  const queries = ref([])
  const pages = ref([])
  const countries = ref([])
  const devices = ref([])

  // ─── Filters ──────────────────────────────────────────────────────
  const period = ref('30d')

  // ─── Loading / error ──────────────────────────────────────────────
  const loading = reactive({
    overview: false, trend: false, queries: false,
    pages: false, countries: false, devices: false,
  })
  const error = ref(null)
  const notConfigured = ref(false)

  function onError(e) {
    if (e.message?.includes('SC_NOT_CONFIGURED') || e.message?.includes('credentials not configured')) {
      notConfigured.value = true
    } else {
      error.value = e.message
    }
  }

  // ─── Loaders ──────────────────────────────────────────────────────
  async function loadOverview() {
    loading.overview = true
    try { overview.value = await fetchScOverview(period.value) }
    catch (e) { onError(e) } finally { loading.overview = false }
  }

  async function loadTrend() {
    loading.trend = true
    try { trend.value = await fetchScTrend(period.value) }
    catch (e) { onError(e) } finally { loading.trend = false }
  }

  async function loadQueries() {
    loading.queries = true
    try { queries.value = await fetchScQueries(period.value) }
    catch (e) { onError(e) } finally { loading.queries = false }
  }

  async function loadPages() {
    loading.pages = true
    try { pages.value = await fetchScPages(period.value) }
    catch (e) { onError(e) } finally { loading.pages = false }
  }

  async function loadCountries() {
    loading.countries = true
    try { countries.value = await fetchScCountries(period.value) }
    catch (e) { onError(e) } finally { loading.countries = false }
  }

  async function loadDevices() {
    loading.devices = true
    try { devices.value = await fetchScDevices(period.value) }
    catch (e) { onError(e) } finally { loading.devices = false }
  }

  async function loadAll() {
    error.value = null
    notConfigured.value = false
    await Promise.all([
      loadOverview(), loadTrend(), loadQueries(),
      loadPages(), loadCountries(), loadDevices(),
    ])
  }

  async function changePeriod(p) {
    period.value = p
    await loadAll()
  }

  return {
    overview, trend, queries, pages, countries, devices,
    period, loading, error, notConfigured,
    loadAll, loadOverview, loadTrend, loadQueries, loadPages, loadCountries, loadDevices,
    changePeriod,
  }
})
