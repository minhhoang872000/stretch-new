import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchLeads, fetchLeadDetail } from '@/services/api.js'

export const useLeadsStore = defineStore('leads', () => {
  const leads = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const filters = ref({})
  const leadDetail = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadLeads(_filters = {}) {
    loading.value = true
    error.value = null
    filters.value = { ...filters.value, ..._filters }
    try {
      const data = await fetchLeads({ page: page.value, limit: limit.value, ...filters.value })
      leads.value = data.rows
      total.value = data.total
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadLeadDetail(sessionId) {
    loading.value = true
    error.value = null
    try {
      leadDetail.value = await fetchLeadDetail(sessionId)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function setPage(p) {
    page.value = p
    loadLeads()
  }

  function setFilters(f) {
    filters.value = f
    page.value = 1
    loadLeads()
  }

  return { leads, total, page, limit, filters, leadDetail, loading, error, loadLeads, loadLeadDetail, setPage, setFilters }
})
