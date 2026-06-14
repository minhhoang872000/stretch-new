import { formatDate } from '@/utils/date.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://stretch-new.onrender.com/api/v1'

async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options
  const token = localStorage.getItem('auth_token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...optHeaders },
    ...rest,
  })
  const json = await res.json()
  if (!json.success) {
    if (res.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
      return
    }
    throw new Error(json.error?.message || 'API Error')
  }
  return json.data
}

// ─── Image Upload (Cloudflare Images via lead-tracker-api) ────────

/**
 * Upload an image file to Cloudflare Images through the backend proxy.
 * @param {File|Blob} file
 * @returns {Promise<{ id: string, url: string, variants: string[], filename: string }>}
 */
export async function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  const token = localStorage.getItem('auth_token')
  // NOTE: do NOT set Content-Type — the browser adds the multipart boundary.
  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `Upload failed (HTTP ${res.status})`)
  }
  return json.data
}

// ─── Leads (internal tracking) ────────────────────────────────────

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

// ─── Google Analytics ─────────────────────────────────────────────

export function fetchGaOverview(period = '30d') {
  return request(`/google-analytics/overview?period=${period}`)
}

export function fetchGaChannels(period = '30d') {
  return request(`/google-analytics/channels?period=${period}`)
}

export function fetchGaTrend(period = '30d') {
  return request(`/google-analytics/trend?period=${period}`)
}

export function fetchGaPages(period = '30d') {
  return request(`/google-analytics/pages?period=${period}`)
}

export function fetchGaUTM(period = '30d', filters = {}) {
  const p = new URLSearchParams({ period })
  if (filters.source) p.append('source', filters.source)
  if (filters.medium) p.append('medium', filters.medium)
  if (filters.campaign) p.append('campaign', filters.campaign)
  if (filters.content) p.append('content', filters.content)
  if (filters.term) p.append('term', filters.term)
  return request(`/google-analytics/utm?${p}`)
}

export function fetchGaUTMSources(period = '30d') {
  return request(`/google-analytics/utm/sources?period=${period}`)
}

export function fetchGaDevices(period = '30d') {
  return request(`/google-analytics/devices?period=${period}`)
}

export function fetchGaGeo(period = '30d') {
  return request(`/google-analytics/geo?period=${period}`)
}

export function fetchGaEvents(period = '30d', event = '') {
  const p = new URLSearchParams({ period })
  if (event) p.append('event', event)
  return request(`/google-analytics/events?${p}`)
}

export function fetchGaRealtime() {
  return request('/google-analytics/realtime')
}

export function fetchGaSocial(period = '30d') {
  return request(`/google-analytics/social?period=${period}`)
}

// ─── Bookings (lead-tracker-api — source of truth) ────────────────

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

// ─── Categories (lead-tracker-api · Postgres) ─────────────────────

export async function fetchCategories() {
  const data = await request('/categories')
  return data.categories
}

export async function createCategory(payload) {
  const data = await request('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.category
}

export async function updateCategory(id, payload) {
  const data = await request(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data.category
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' })
}

// ─── Blog Posts (lead-tracker-api · Postgres) ─────────────────────
//
// The CRM editor uses a single-language flat shape; the API stores a
// bilingual (En/Vi) shape. These mappers translate between the two.
// (The CRM is single-field, so the same value is written to both languages.)

/** Join CKEditor section(s) → a single HTML string. */
function htmlFromSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((s) => s.text || '').filter(Boolean).join('\n')
}

/** Map an API blog post → the flat shape the CRM views/store expect. */
function toCrmPost(p) {
  const contentEn = htmlFromSections(p.contentEn)
  const contentVi = htmlFromSections(p.contentVi)
  return {
    id: p.id,
    slug: p.slug,
    // Per-language fields (used by the editor's EN/VI toggle)
    titleEn: p.titleEn || '',
    titleVi: p.titleVi || '',
    excerptEn: p.excerptEn || '',
    excerptVi: p.excerptVi || '',
    contentEn,
    contentVi,
    // Primary display values (prefer VI, fall back to EN)
    title: p.titleVi || p.titleEn || '',
    excerpt: p.excerptVi || p.excerptEn || '',
    content: contentVi || contentEn,
    sections: (p.contentVi?.length ? p.contentVi : p.contentEn) || [],
    categoryKey: p.category,
    category: p.category,
    status: p.published ? 'published' : 'draft',
    author: p.author || 'Stretch Team',
    readTime: p.readTime || '',
    date: formatDate(p.publishedAt || p.createdAt || ''),
    image: p.coverImage || '',
    tags: p.tags || [],
    featured: !!p.featured,
    views: 0,
  }
}

/** Map the CRM flat shape → an API payload. Only includes keys present in `d` (supports partial PATCH). */
function toApiPayload(d) {
  const p = {}
  const wrapHtml = (html) => (html ? [{ id: 'content', title: '', type: 'text', text: html }] : [])
  if (d.slug !== undefined) p.slug = d.slug
  // Titles (per-language; fall back to the single `title` for back-compat)
  if (d.titleEn !== undefined) p.titleEn = d.titleEn
  if (d.titleVi !== undefined) p.titleVi = d.titleVi
  if (d.title !== undefined) { if (p.titleEn === undefined) p.titleEn = d.title; if (p.titleVi === undefined) p.titleVi = d.title }
  // Excerpts
  if (d.excerptEn !== undefined) p.excerptEn = d.excerptEn || null
  if (d.excerptVi !== undefined) p.excerptVi = d.excerptVi || null
  if (d.excerpt !== undefined) { if (p.excerptEn === undefined) p.excerptEn = d.excerpt || null; if (p.excerptVi === undefined) p.excerptVi = d.excerpt || null }
  // Content — CKEditor HTML per language → one section each
  if (d.contentEn !== undefined) p.contentEn = wrapHtml(d.contentEn)
  if (d.contentVi !== undefined) p.contentVi = wrapHtml(d.contentVi)
  if (d.sections !== undefined) { if (p.contentEn === undefined) p.contentEn = d.sections; if (p.contentVi === undefined) p.contentVi = d.sections }
  if (d.categoryKey !== undefined) p.category = d.categoryKey
  if (d.tags !== undefined) p.tags = d.tags
  if (d.image !== undefined) p.coverImage = d.image || null
  if (d.author !== undefined) p.author = d.author
  if (d.readTime !== undefined) p.readTime = d.readTime || null
  if (d.status !== undefined) p.published = d.status === 'published'
  if (d.featured !== undefined) p.featured = !!d.featured
  if (d.date !== undefined) {
    const parsed = d.date ? new Date(d.date) : null
    p.publishedAt = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : null
  }
  return p
}

export async function fetchPosts(filters = {}) {
  const params = new URLSearchParams({ includeUnpublished: 'true' })
  if (filters.search) params.append('search', filters.search)
  if (filters.categoryKey) params.append('category', filters.categoryKey)
  if (filters.status === 'published') params.set('published', 'true')
  if (filters.status === 'draft') params.set('published', 'false')
  if (filters.page) params.set('page', filters.page)
  if (filters.limit) params.set('limit', filters.limit)
  const data = await request(`/blog?${params}`)
  return {
    posts: (data.posts || []).map(toCrmPost),
    total: data.total ?? (data.posts?.length || 0),
  }
}

export function fetchBlogStats() {
  return request('/blog/stats')
}

export async function fetchPostBySlug(slug) {
  const data = await request(`/blog/${slug}`)
  return toCrmPost(data.post)
}

export async function createPost(data) {
  const res = await request('/blog', { method: 'POST', body: JSON.stringify(toApiPayload(data)) })
  // create / update / getBySlug all return { post: <full post> } → one shared format.
  return toCrmPost(res.post)
}

export async function updatePost(idOrSlug, data) {
  const res = await request(`/blog/${idOrSlug}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiPayload(data)),
  })
  return toCrmPost(res.post)
}

export function deletePost(idOrSlug) {
  return request(`/blog/${idOrSlug}`, { method: 'DELETE' })
}

