import { request } from '@/services/api.js'

/**
 * The console's collections, mapped to the API.
 *
 * One table per row: the name the views already use, the path it lives at, and
 * the key the API wraps its list in. Keeping the console's names (`sessions`,
 * `videos`, `media`) rather than renaming 32 view files means the API's paths
 * can be whatever reads best over HTTP — `/program-sessions` is unambiguous in
 * a log in a way `/sessions` is not.
 */
export const COLLECTIONS = {
  // Academy
  programs:      { path: '/programs',            key: 'programs' },
  instructors:   { path: '/instructors',         key: 'instructors' },
  sessions:      { path: '/program-sessions',    key: 'sessions' },
  learners:      { path: '/learners',            key: 'learners' },
  enrolments:    { path: '/enrolments',          key: 'enrolments' },
  certificates:  { path: '/certificates',        key: 'certificates' },
  reviews:       { path: '/reviews',             key: 'reviews' },
  videos:        { path: '/lesson-video-index',  key: 'videoIndex' },
  progress:      { path: '/lesson-progress',     key: 'progress' },

  // Sales
  orders:        { path: '/orders',              key: 'orders' },
  payments:      { path: '/payments',            key: 'payments' },
  coupons:       { path: '/coupons',             key: 'coupons' },

  // Therapy
  practitioners: { path: '/practitioners',       key: 'practitioners' },
  availability:  { path: '/availability',        key: 'availability' },
  timeOff:       { path: '/time-off',            key: 'timeOff' },
  // The bookings module predates the CRUD engine and answers `{ bookings, total }`
  // without paging — same envelope, so it needs no special case here.
  bookings:      { path: '/bookings',            key: 'bookings' },

  // Content
  pages:         { path: '/pages',               key: 'pages' },
  faqs:          { path: '/faqs',                key: 'faqs' },
  media:         { path: '/media-assets',        key: 'media' },

  // CRM & system
  enquiries:     { path: '/enquiries',           key: 'enquiries' },
  users:         { path: '/users',               key: 'users' },
  auditLog:      { path: '/audit-log',           key: 'auditLog' },
}

/**
 * The console filters, sorts and pages in the browser (see `useResource`), so a
 * collection is fetched whole. That is the right trade at this size — the
 * biggest table is a few hundred rows — and it is what keeps the existing views
 * working untouched. The cap is the API's own maximum; if a collection ever
 * approaches it, that is the signal to move filtering server-side rather than
 * to raise the number.
 */
const FETCH_LIMIT = 500

function endpoint(name) {
  const entry = COLLECTIONS[name]
  if (!entry) throw new Error(`Không có bộ dữ liệu "${name}"`)
  return entry
}

export async function fetchCollection(name) {
  const { path, key } = endpoint(name)
  const data = await request(`${path}?limit=${FETCH_LIMIT}`)
  return Array.isArray(data?.[key]) ? data[key] : []
}

export function createRow(name, row) {
  const { path } = endpoint(name)
  return request(path, { method: 'POST', body: JSON.stringify(row) })
}

export function updateRow(name, id, changes) {
  const { path } = endpoint(name)
  return request(`${path}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function deleteRow(name, id) {
  const { path } = endpoint(name)
  return request(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** One request for a whole selection, rather than one per row. */
export function bulkUpdate(name, ids, patch) {
  const { path } = endpoint(name)
  return request(path, { method: 'PATCH', body: JSON.stringify({ ids, patch }) })
}

// ─── Things that are not collections ─────────────────────────────────

export function fetchSettings() {
  return request('/settings').then((d) => d?.settings || {})
}

export function saveSettingsSection(section, changes) {
  return request(`/settings/${encodeURIComponent(section)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  }).then((d) => d?.value || {})
}

/** Sidebar badges — eight counts in one query, not eight collections. */
export function fetchCounts() {
  return request('/console-counts')
}

/**
 * The read-only rollups. Each is computed server-side from raw rows, so these
 * are reports rather than stored numbers and are re-fetched, never cached.
 */
export const reports = {
  dropOff: () => request('/academy-insights/drop-off').then((d) => d?.dropOff || []),
  // A different question from drop-off: how much of the cohort is still there
  // by lesson N, rather than which single lesson loses people.
  retention: () => request('/academy-insights/retention').then((d) => d?.retention || []),
  quizMisses: () => request('/academy-insights/quiz-misses').then((d) => d?.quizMisses || []),
  dashboard: () => request('/academy-insights/dashboard'),
  revenueTrend: (days = 30) =>
    request(`/sales-insights/revenue?days=${days}`).then((d) => d?.revenueTrend || []),
  salesSummary: () => request('/sales-insights/summary'),
  funnel: (days = 30) => request(`/funnel?days=${days}`).then((d) => d?.funnel || []),
  ctaBreakdown: (days = 30) =>
    request(`/funnel/cta?days=${days}`).then((d) => d?.ctaBreakdown || []),
}
