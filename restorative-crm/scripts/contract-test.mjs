/**
 * Verifies every collection the CRM store maps actually answers, with the key
 * the store reads and rows shaped the way the views expect.
 *
 * This is the contract between `services/console.js` and the API: if a key or a
 * field name here is wrong, the console renders an empty table and says nothing.
 */
import { readFileSync } from 'node:fs'

const BASE = process.env.API_BASE || 'http://localhost:3001/api/v1'
const env = Object.fromEntries(
  readFileSync(new URL('../../lead-tracker-api/.env', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

// Mirrors COLLECTIONS in restorative-crm/src/services/console.js, plus the
// fields the views actually read off each row.
const COLLECTIONS = {
  programs:      { path: '/programs',           key: 'programs',      needs: ['title', 'status', 'enrolled', 'revenue', 'slug', 'modules'] },
  instructors:   { path: '/instructors',        key: 'instructors',   needs: ['name', 'role', 'status', 'rating'] },
  sessions:      { path: '/program-sessions',   key: 'sessions',      needs: ['programId', 'date', 'seatsLeft', 'seatStatus', 'status'] },
  learners:      { path: '/learners',           key: 'learners',      needs: ['name', 'email', 'status', 'joinedAt'] },
  enrolments:    { path: '/enrolments',         key: 'enrolments',    needs: ['learnerName', 'programTitle', 'percent', 'status'] },
  certificates:  { path: '/certificates',       key: 'certificates',  needs: ['code', 'learnerName', 'programTitle', 'issuedAt', 'status'] },
  reviews:       { path: '/reviews',            key: 'reviews',       needs: ['programTitle', 'learnerName', 'rating', 'status'] },
  videos:        { path: '/lesson-video-index', key: 'videoIndex',    needs: ['programTitle', 'lessonTitle', 'provider', 'status', 'ordinal'] },
  progress:      { path: '/lesson-progress',    key: 'progress',      needs: ['learnerId', 'programId', 'watchedSeconds'] },
  orders:        { path: '/orders',             key: 'orders',        needs: ['code', 'customer', 'total', 'status', 'enrolled'] },
  payments:      { path: '/payments',           key: 'payments',      needs: ['orderCode', 'amount', 'status', 'reconciled'] },
  coupons:       { path: '/coupons',            key: 'coupons',       needs: ['code', 'type', 'value', 'status'] },
  services:      { path: '/services',           key: 'services',      needs: ['nameVi', 'price', 'status', 'durationMinutes'] },
  practitioners: { path: '/practitioners',      key: 'practitioners', needs: ['name', 'studio', 'status', 'services'] },
  availability:  { path: '/availability',       key: 'availability',  needs: ['practitionerId', 'weekday', 'from', 'to', 'open'] },
  timeOff:       { path: '/time-off',           key: 'timeOff',       needs: ['practitionerId', 'from', 'to', 'status'] },
  bookings:      { path: '/bookings',           key: 'bookings',      needs: ['name', 'date', 'time', 'status'] },
  pages:         { path: '/pages',              key: 'pages',         needs: ['path', 'titleVi', 'status'] },
  faqs:          { path: '/faqs',               key: 'faqs',          needs: ['group', 'questionVi', 'status', 'order'] },
  translations:  { path: '/translations',       key: 'translations',  needs: ['key', 'vi', 'en', 'namespace', 'status'] },
  media:         { path: '/media-assets',       key: 'media',         needs: ['name', 'url', 'kind'] },
  enquiries:     { path: '/enquiries',          key: 'enquiries',     needs: ['company', 'contact', 'status', 'owner'] },
  users:         { path: '/users',              key: 'users',         needs: ['name', 'email', 'role', 'status'] },
  auditLog:      { path: '/audit-log',          key: 'auditLog',      needs: ['user', 'action', 'area', 'at'] },
}

let token = ''
let pass = 0
let fail = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function call(path, retried = false) {
  const res = await fetch(BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.status === 429 && !retried) {
    console.log('  … rate limited, waiting 61s')
    await sleep(61_000)
    return call(path, true)
  }
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json?.data, error: json?.error }
}

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
}).then((r) => r.json())
token = login?.data?.token
console.log(token ? 'signed in\n' : 'LOGIN FAILED\n')

for (const [name, { path, key, needs }] of Object.entries(COLLECTIONS)) {
  const r = await call(`${path}?limit=500`)
  const rows = r.data?.[key]
  if (!Array.isArray(rows)) {
    console.log(`  FAIL ${name.padEnd(14)} ${path} → data.${key} is ${typeof rows} (status ${r.status}) ${r.error?.message || ''}`)
    fail += 1
    continue
  }
  const missing = rows.length ? needs.filter((f) => !(f in rows[0])) : []
  if (missing.length) {
    console.log(`  FAIL ${name.padEnd(14)} rows missing fields: ${missing.join(', ')}`)
    fail += 1
    continue
  }
  console.log(`  ok   ${name.padEnd(14)} ${String(rows.length).padStart(3)} rows`)
  pass += 1
}

console.log('\n── things that are not collections ──')
for (const [label, path, check] of [
  ['settings', '/settings', (d) => d?.settings?.general && d.settings.booking?.notifyEmails],
  ['counts', '/console-counts', (d) => typeof d?.bookingsPending === 'number'],
  ['drop-off', '/academy-insights/drop-off', (d) => Array.isArray(d?.dropOff)],
  ['quiz-misses', '/academy-insights/quiz-misses', (d) => Array.isArray(d?.quizMisses)],
  ['revenue', '/sales-insights/revenue?days=30', (d) => Array.isArray(d?.revenueTrend)],
  ['funnel', '/funnel?days=30', (d) => Array.isArray(d?.funnel)],
  ['cta', '/funnel/cta?days=30', (d) => Array.isArray(d?.ctaBreakdown)],
]) {
  const r = await call(path)
  if (check(r.data)) { console.log(`  ok   ${label}`); pass += 1 }
  else { console.log(`  FAIL ${label} — status ${r.status} ${r.error?.message || JSON.stringify(r.data).slice(0, 90)}`); fail += 1 }
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
