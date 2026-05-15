const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error?.message || 'API Error')
  }
  return json.data
}

// ─── Analytics ────────────────────────────────────────────────────

export function fetchSummary(period = '30d') {
  return request(`/analytics/summary?period=${period}`)
}

export function fetchCampaigns(period = '30d') {
  return request(`/analytics/campaigns?period=${period}`)
}

export function fetchFunnel(period = '30d') {
  return request(`/analytics/funnel?period=${period}`)
}

export function fetchChartData(granularity = 'daily', period = '30d') {
  return request(`/analytics/chart?granularity=${granularity}&period=${period}`)
}

export function fetchLeads(filters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page)
  if (filters.limit) params.append('limit', filters.limit)
  if (filters.utm_source) params.append('utm_source', filters.utm_source)
  if (filters.utm_campaign) params.append('utm_campaign', filters.utm_campaign)
  if (filters.device_type) params.append('device_type', filters.device_type)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  return request(`/analytics/leads?${params}`)
}

export function fetchLeadDetail(sessionId) {
  return request(`/analytics/leads/${sessionId}`)
}

// ─── Bookings ─────────────────────────────────────────────────────

export function fetchBookings(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.date) params.append('date', filters.date)
  if (filters.service) params.append('service', filters.service)
  return request(`/bookings?${params}`)
}

export function fetchBookingById(id) {
  return request(`/bookings/${id}`)
}

export function updateBookingStatus(id, status) {
  return request(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function deleteBooking(id) {
  return request(`/bookings/${id}`, { method: 'DELETE' })
}

