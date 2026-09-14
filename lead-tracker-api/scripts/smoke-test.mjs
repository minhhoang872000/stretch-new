/**
 * End-to-end smoke test against the running API.
 *
 * Exercises every new router: a public read, an admin read, a full
 * create → update → delete round trip, and each of the business-logic routes
 * that are not plain CRUD.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.API_BASE || 'http://localhost:3001/api/v1'
const env = Object.fromEntries(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

let pass = 0
let fail = 0
let token = ''

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * The API rate-limits to 120 requests a minute and this suite makes more than
 * that. Waiting out the window is the honest response — turning the limiter off
 * would be testing a configuration nobody runs.
 */
async function call(method, path, { body, auth = true, retried = false } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 429 && !retried) {
    process.stdout.write('  … rate limited, waiting 61s for the window to reset\n')
    await sleep(61_000)
    return call(method, path, { body, auth, retried: true })
  }
  let json = null
  try { json = await res.json() } catch { /* non-JSON */ }
  return { status: res.status, ok: res.ok, data: json?.data, error: json?.error }
}

async function check(label, fn) {
  try {
    const detail = await fn()
    pass += 1
    console.log(`  ok   ${label}${detail ? '  — ' + detail : ''}`)
  } catch (err) {
    fail += 1
    console.log(`  FAIL ${label}  — ${err.message}`)
  }
}

const must = (cond, msg) => { if (!cond) throw new Error(msg) }

console.log('\n── auth ──')
await check('POST /auth/login', async () => {
  const r = await call('POST', '/auth/login', {
    auth: false,
    body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
  })
  must(r.ok && r.data?.token, `status ${r.status} ${r.error?.message || ''}`)
  token = r.data.token
  return `token ${token.slice(0, 12)}…`
})

console.log('\n── academy: reads ──')
for (const [path, key] of [
  ['/programs', 'programs'],
  ['/instructors', 'instructors'],
  ['/learners', 'learners'],
  ['/enrolments', 'enrolments'],
  ['/program-sessions', 'sessions'],
  ['/certificates', 'certificates'],
  ['/reviews', 'reviews'],
  ['/lesson-progress', 'progress'],
  ['/lesson-video-index', 'videoIndex'],
]) {
  await check(`GET ${path}`, async () => {
    const r = await call('GET', path)
    must(r.ok, `status ${r.status} ${r.error?.message || ''}`)
    must(Array.isArray(r.data?.[key]), `missing data.${key}`)
    return `${r.data.total} rows`
  })
}

console.log('\n── academy: filters, sort, search, paging ──')
await check('GET /programs?status=published&sort=-price&limit=3', async () => {
  const r = await call('GET', '/programs?status=published&sort=-price&limit=3')
  must(r.ok, `status ${r.status}`)
  must(r.data.programs.length <= 3, 'limit ignored')
  const prices = r.data.programs.map((p) => p.price)
  must(prices.every((v, i) => i === 0 || prices[i - 1] >= v), `not sorted desc: ${prices}`)
  return `prices ${prices.join(',')}`
})
await check('GET /learners?q=<search>', async () => {
  const all = await call('GET', '/learners?limit=1')
  const name = all.data.learners[0].name.split(' ').pop()
  const r = await call('GET', `/learners?q=${encodeURIComponent(name)}`)
  must(r.ok && r.data.total >= 1, `no match for "${name}"`)
  return `"${name}" → ${r.data.total}`
})
await check('GET /enrolments?status=active,completed (multi-value)', async () => {
  const r = await call('GET', '/enrolments?status=active,completed')
  must(r.ok, `status ${r.status}`)
  must(r.data.enrolments.every((e) => e.status === 'active' || e.status === 'completed'), 'leaked other statuses')
  return `${r.data.total} rows`
})
await check('GET /programs?page=2&limit=4 (paging)', async () => {
  const p1 = await call('GET', '/programs?page=1&limit=4')
  const p2 = await call('GET', '/programs?page=2&limit=4')
  must(p1.ok && p2.ok, 'request failed')
  must(p1.data.programs[0].id !== p2.data.programs[0].id, 'page 2 same as page 1')
  return `p1=${p1.data.programs.length} p2=${p2.data.programs.length}`
})

console.log('\n── public access & the draft rule ──')
await check('GET /programs anonymous → published only', async () => {
  const r = await call('GET', '/programs?limit=500', { auth: false })
  must(r.ok, `status ${r.status}`)
  must(r.data.programs.every((p) => p.status === 'published'), 'a draft leaked')
  return `${r.data.total} public vs admin total`
})
await check('anonymous cannot widen with ?status=draft', async () => {
  const r = await call('GET', '/programs?status=draft', { auth: false })
  must(r.ok, `status ${r.status}`)
  must(r.data.programs.every((p) => p.status === 'published'), 'filter was overridable')
  return `${r.data.total} rows`
})
await check('GET /learners anonymous → 401', async () => {
  const r = await call('GET', '/learners', { auth: false })
  must(r.status === 401, `expected 401, got ${r.status}`)
  return 'personal data protected'
})
await check('GET /programs/slug/:slug anonymous', async () => {
  const list = await call('GET', '/programs?status=published&limit=1')
  const slug = list.data.programs[0].slug
  const r = await call('GET', `/programs/slug/${slug}`, { auth: false })
  must(r.ok && r.data.slug === slug, `status ${r.status}`)
  return slug
})

console.log('\n── academy: computed columns ──')
await check('GET /program-sessions has seatsLeft/seatStatus/status', async () => {
  const r = await call('GET', '/program-sessions?limit=200')
  const row = r.data.sessions[0]
  must(typeof row.seatsLeft === 'number', 'seatsLeft missing')
  must(['full', 'few', 'open'].includes(row.seatStatus), `bad seatStatus ${row.seatStatus}`)
  must(['done', 'today', 'upcoming'].includes(row.status), `bad status ${row.status}`)
  const bad = r.data.sessions.find((s) => s.seatsLeft !== Math.max(0, s.capacity - s.booked))
  must(!bad, `seatsLeft wrong on ${bad?.id}`)
  return `${row.seatsLeft} left, ${row.seatStatus}, ${row.status}`
})

console.log('\n── academy: reports (computed from raw rows) ──')
await check('GET /academy-insights/drop-off', async () => {
  const r = await call('GET', '/academy-insights/drop-off')
  must(r.ok, `status ${r.status} ${r.error?.message || ''}`)
  must(Array.isArray(r.data.dropOff) && r.data.dropOff.length, 'empty')
  const top = r.data.dropOff[0]
  must(typeof top.medianStopSecond === 'number', 'no median')
  return `${r.data.dropOff.length} lessons, worst ${top.dropRate}% @ ${top.medianStopSecond}s`
})
await check('GET /academy-insights/quiz-misses', async () => {
  const r = await call('GET', '/academy-insights/quiz-misses')
  must(r.ok && r.data.quizMisses.length, `status ${r.status} ${r.error?.message || ''}`)
  return `${r.data.quizMisses.length} questions, worst ${r.data.quizMisses[0].missRate}%`
})
await check('GET /academy-insights/dashboard', async () => {
  const r = await call('GET', '/academy-insights/dashboard')
  must(r.ok, `status ${r.status} ${r.error?.message || ''}`)
  must(typeof r.data.activeLearners === 'number', 'no activeLearners')
  return `${r.data.activeLearners} active, ${r.data.avgProgressByProgram.length} programmes, ${r.data.pendingReviews} reviews pending`
})
await check('GET /lesson-video-index/missing', async () => {
  const r = await call('GET', '/lesson-video-index/missing')
  must(r.ok, `status ${r.status} ${r.error?.message || ''}`)
  return `${r.data.total} lessons without a source`
})

console.log('\n── CRUD round trip (coupons) ──')
let couponId = ''
await check('POST /coupons', async () => {
  const r = await call('POST', '/coupons', {
    body: { code: 'smoke-test-01', type: 'percent', value: 15, minSpend: 500000, quota: 5, status: 'active' },
  })
  must(r.status === 201 && r.data?.id, `status ${r.status} ${r.error?.message || ''}`)
  must(r.data.code === 'SMOKE-TEST-01', `code not normalised: ${r.data.code}`)
  couponId = r.data.id
  return `${r.data.id} code=${r.data.code}`
})
await check('PATCH /coupons/:id', async () => {
  const r = await call('PATCH', `/coupons/${couponId}`, { body: { value: 25 } })
  must(r.ok && r.data.value === 25, `status ${r.status}`)
  must(r.data.quota === 5, 'PATCH clobbered an untouched field')
  return 'partial update kept other fields'
})
await check('POST /coupons/validate (public, no side effect)', async () => {
  const r = await call('POST', '/coupons/validate', { auth: false, body: { code: 'SMOKE-TEST-01', subtotal: 1000000 } })
  must(r.ok && r.data.valid === true, `${r.data?.reason || r.error?.message}`)
  must(r.data.discount === 250000, `discount ${r.data.discount}, expected 250000`)
  const after = await call('GET', `/coupons/${couponId}`)
  must(after.data.used === 0, 'validate spent a use')
  return `discount ${r.data.discount}, total ${r.data.total}`
})
await check('POST /coupons/validate below minSpend → rejected', async () => {
  const r = await call('POST', '/coupons/validate', { auth: false, body: { code: 'SMOKE-TEST-01', subtotal: 100000 } })
  must(r.ok && r.data.valid === false, 'should be invalid')
  return r.data.reason
})
await check('PATCH /coupons (bulk)', async () => {
  const r = await call('PATCH', '/coupons', { body: { ids: [couponId], patch: { status: 'paused' } } })
  must(r.ok && r.data.changed === 1, `changed ${r.data?.changed}`)
  return '1 changed'
})
await check('DELETE /coupons/:id', async () => {
  const r = await call('DELETE', `/coupons/${couponId}`)
  must(r.ok, `status ${r.status}`)
  const gone = await call('GET', `/coupons/${couponId}`)
  must(gone.status === 404, `expected 404 after delete, got ${gone.status}`)
  return 'deleted, then 404'
})

console.log('\n── academy: business logic ──')
let grantedId = ''
await check('POST /enrolments/grant', async () => {
  const learners = await call('GET', '/learners?limit=100')
  const programs = await call('GET', '/programs?limit=100')
  const existing = await call('GET', '/enrolments?limit=500')
  const taken = new Set(existing.data.enrolments.map((e) => `${e.learnerId}|${e.programId}`))
  let learnerId, programId
  for (const l of learners.data.learners) {
    for (const p of programs.data.programs) {
      if (!taken.has(`${l.id}|${p.id}`)) { learnerId = l.id; programId = p.id; break }
    }
    if (learnerId) break
  }
  must(learnerId, 'no free learner/programme pair')
  const r = await call('POST', '/enrolments/grant', { body: { learnerId, programId } })
  must(r.status === 201, `status ${r.status} ${r.error?.message || ''}`)
  must(r.data.learnerName && r.data.programTitle, 'denormalised names not filled')
  must(r.data.lessons > 0, 'lesson count not copied from programme')
  grantedId = r.data.id
  return `${r.data.learnerName} → ${r.data.programTitle} (${r.data.lessons} lessons)`
})
await check('POST /enrolments/grant twice → revives, no duplicate', async () => {
  const before = await call('GET', `/enrolments/${grantedId}`)
  await call('POST', `/enrolments/${grantedId}/revoke`, { body: { reason: 'smoke' } })
  const revoked = await call('GET', `/enrolments/${grantedId}`)
  must(revoked.data.status === 'revoked', 'revoke did not take')
  const again = await call('POST', '/enrolments/grant', {
    body: { learnerId: before.data.learnerId, programId: before.data.programId },
  })
  must(again.ok, `status ${again.status} ${again.error?.message || ''}`)
  must(again.data.id === grantedId, `made a new row ${again.data.id} instead of reviving ${grantedId}`)
  must(again.data.status === 'active', 'not reactivated')
  return 'same row revived'
})
await check('POST /lesson-progress/track → recomputes enrolment percent', async () => {
  const e = await call('GET', `/enrolments/${grantedId}`)
  const r = await call('POST', '/lesson-progress/track', {
    body: {
      learnerId: e.data.learnerId, programId: e.data.programId,
      moduleIndex: 0, itemIndex: 0, ordinal: 0,
      lessonTitle: 'Smoke test lesson', watchedSeconds: 600, durationSeconds: 600,
    },
  })
  must(r.ok && r.data.completed === true, `completed=${r.data?.completed}`)
  must(r.data.enrolment && r.data.enrolment.lessonsDone >= 1, 'enrolment not rolled up')
  return `lessonsDone=${r.data.enrolment.lessonsDone}/${r.data.enrolment.lessons} → ${r.data.enrolment.percent}%`
})
await check('track again with a lower watched time → keeps the furthest point', async () => {
  const e = await call('GET', `/enrolments/${grantedId}`)
  await call('POST', '/lesson-progress/track', {
    body: {
      learnerId: e.data.learnerId, programId: e.data.programId,
      moduleIndex: 0, itemIndex: 0, watchedSeconds: 5, durationSeconds: 600,
    },
  })
  const rows = await call('GET', `/lesson-progress?learnerId=${e.data.learnerId}&programId=${e.data.programId}`)
  const row = rows.data.progress.find((p) => p.moduleIndex === 0 && p.itemIndex === 0)
  must(row.watchedSeconds === 600, `watched rolled back to ${row.watchedSeconds}`)
  return 'GREATEST held at 600s'
})
await check('POST /programs/:id/duplicate drops earned figures', async () => {
  const list = await call('GET', '/programs?limit=1&sort=-enrolled')
  const source = list.data.programs[0]
  const r = await call('POST', `/programs/${source.id}/duplicate`)
  must(r.status === 201, `status ${r.status} ${r.error?.message || ''}`)
  must(r.data.status === 'draft', `status ${r.data.status}`)
  must(r.data.enrolled === 0 && r.data.revenue === 0 && r.data.reviewCount === 0, 'inherited earned figures')
  must(r.data.lessons === source.lessons, 'syllabus not copied')
  await call('DELETE', `/programs/${r.data.id}`)
  return `copy had ${r.data.lessons} lessons, 0 enrolled`
})
await check('GET /certificates/verify/:code (public)', async () => {
  const list = await call('GET', '/certificates?limit=1')
  const code = list.data.certificates[0].code
  const r = await call('GET', `/certificates/verify/${code}`, { auth: false })
  must(r.ok && r.data.certificate?.code === code, `status ${r.status}`)
  return `${code} valid=${r.data.valid}`
})

console.log('\n── sales ──')
for (const [path, key] of [['/orders', 'orders'], ['/payments', 'payments'], ['/coupons', 'coupons']]) {
  await check(`GET ${path}`, async () => {
    const r = await call('GET', path)
    must(r.ok && Array.isArray(r.data[key]), `status ${r.status}`)
    return `${r.data.total} rows`
  })
}
await check('GET /sales-insights/revenue?days=30', async () => {
  const r = await call('GET', '/sales-insights/revenue?days=30')
  must(r.ok && r.data.revenueTrend.length === 30, `got ${r.data?.revenueTrend?.length} days`)
  const total = r.data.revenueTrend.reduce((s, d) => s + d.revenue, 0)
  return `30 days, ${total.toLocaleString('vi-VN')}đ`
})
await check('GET /sales-insights/summary', async () => {
  const r = await call('GET', '/sales-insights/summary')
  must(r.ok && typeof r.data.paidNotEnrolled === 'number', `status ${r.status} ${r.error?.message || ''}`)
  return `paid=${r.data.paidOrders} pending=${r.data.pendingOrders} paidNotEnrolled=${r.data.paidNotEnrolled}`
})
await check('POST /orders/:id/enrol refuses an unpaid order', async () => {
  const r0 = await call('GET', '/orders?status=pending&limit=1')
  const order = r0.data.orders[0]
  if (!order) return 'no pending order to test'
  const r = await call('POST', `/orders/${order.id}/enrol`)
  must(r.status === 409, `expected 409, got ${r.status}`)
  return r.error.code
})

console.log('\n── therapy ──')
for (const [path, key] of [
  ['/practitioners', 'practitioners'],
  ['/availability', 'availability'],
  ['/time-off', 'timeOff'],
]) {
  await check(`GET ${path}`, async () => {
    const r = await call('GET', path)
    must(r.ok && Array.isArray(r.data[key]), `status ${r.status} ${r.error?.message || ''}`)
    return `${r.data.total} rows`
  })
}
await check('GET /slots?practitionerId=&date=', async () => {
  const av = await call('GET', '/availability?limit=100')
  const open = av.data.availability.find((a) => a.open)
  must(open, 'no open availability row')
  // Find the next date matching that weekday.
  const d = new Date()
  while (d.getDay() !== open.weekday) d.setDate(d.getDate() + 1)
  const date = d.toISOString().slice(0, 10)
  const r = await call('GET', `/slots?practitionerId=${open.practitionerId}&date=${date}`, { auth: false })
  must(r.ok, `status ${r.status} ${r.error?.message || ''}`)
  must(Array.isArray(r.data.slots), 'no slots array')
  return `${date} (weekday ${open.weekday}) → ${r.data.slots.length} slots, ${r.data.slots.filter((s) => s.free).length} free`
})
await check('GET /slots with a bad date → 400', async () => {
  const r = await call('GET', '/slots?practitionerId=x&date=nope', { auth: false })
  must(r.status === 400, `expected 400, got ${r.status}`)
  return r.error.code
})

console.log('\n── content ──')
for (const [path, key] of [
  ['/pages', 'pages'],
  ['/faqs', 'faqs'],
  ['/translations', 'translations'],
  ['/media-assets', 'media'],
]) {
  await check(`GET ${path}`, async () => {
    const r = await call('GET', path)
    must(r.ok && Array.isArray(r.data[key]), `status ${r.status} ${r.error?.message || ''}`)
    return `${r.data.total} rows`
  })
}
await check('GET /faqs/public (grouped)', async () => {
  const r = await call('GET', '/faqs/public', { auth: false })
  must(r.ok && r.data.groups && Object.keys(r.data.groups).length, `status ${r.status}`)
  return `${Object.keys(r.data.groups).length} groups`
})
await check('GET /translations/bundle/vi', async () => {
  const r = await call('GET', '/translations/bundle/vi', { auth: false })
  must(r.ok && r.data.count > 0, `status ${r.status}`)
  return `${r.data.count} keys, locale=${r.data.locale}`
})
await check('translations status recomputed on write', async () => {
  const r = await call('POST', '/translations', { body: { key: 'smoke.test', namespace: 'smoke', vi: 'có', en: '' } })
  must(r.status === 201, `status ${r.status} ${r.error?.message || ''}`)
  must(r.data.status === 'partial', `status ${r.data.status}, expected partial`)
  const done = await call('PATCH', `/translations/${r.data.id}`, { body: { en: 'yes' } })
  must(done.data.status === 'ok', `status ${done.data.status}, expected ok`)
  await call('DELETE', `/translations/${r.data.id}`)
  return 'partial → ok'
})

console.log('\n── crm ──')
await check('GET /enquiries', async () => {
  const r = await call('GET', '/enquiries')
  must(r.ok && Array.isArray(r.data.enquiries), `status ${r.status}`)
  return `${r.data.total} rows`
})
await check('POST /enquiries/public (anonymous)', async () => {
  const r = await call('POST', '/enquiries/public', {
    auth: false,
    body: { company: 'Smoke Co', contact: 'Test', email: 't@example.com', headcount: 12, status: 'won' },
  })
  must(r.status === 201 && r.data?.id, `status ${r.status} ${r.error?.message || ''}`)
  const row = await call('GET', `/enquiries/${r.data.id}`)
  must(row.data.status === 'new', `status forced to new failed: ${row.data.status}`)
  await call('DELETE', `/enquiries/${r.data.id}`)
  return 'created as new, status not client-controlled'
})
await check('GET /funnel?days=30', async () => {
  const r = await call('GET', '/funnel?days=30')
  must(r.ok && r.data.funnel.length === 6, `got ${r.data?.funnel?.length} steps`)
  return r.data.funnel.map((s) => s.count).join(' → ')
})
await check('GET /funnel/cta', async () => {
  const r = await call('GET', '/funnel/cta?days=30')
  must(r.ok && Array.isArray(r.data.ctaBreakdown), `status ${r.status} ${r.error?.message || ''}`)
  return `${r.data.ctaBreakdown.length} CTAs (lead_events is empty on a fresh DB)`
})

console.log('\n── system ──')
await check('GET /users', async () => {
  const r = await call('GET', '/users')
  must(r.ok && r.data.users.length, `status ${r.status}`)
  return `${r.data.total} rows`
})
await check('GET /audit-log', async () => {
  const r = await call('GET', '/audit-log')
  must(r.ok && r.data.auditLog.length, `status ${r.status} ${r.error?.message || ''}`)
  return `${r.data.total} entries`
})
await check('POST /audit-log (append only)', async () => {
  const r = await call('POST', '/audit-log', { body: { action: 'smoke', area: 'test', detail: 'from smoke test' } })
  must(r.status === 201, `status ${r.status} ${r.error?.message || ''}`)
  const del = await call('DELETE', `/audit-log/${r.data.id}`)
  must(del.status === 404, `DELETE should not exist, got ${del.status}`)
  return 'appended; no delete route'
})
await check('GET /settings', async () => {
  const r = await call('GET', '/settings')
  must(r.ok && r.data.settings.general, `status ${r.status} ${r.error?.message || ''}`)
  return Object.keys(r.data.settings).join(', ')
})
await check('PATCH /settings/:section merges', async () => {
  const before = await call('GET', '/settings/booking')
  const keys = Object.keys(before.data.value)
  const r = await call('PATCH', '/settings/booking', { body: { leadTimeHours: 9 } })
  must(r.ok && r.data.value.leadTimeHours === 9, `status ${r.status}`)
  must(Object.keys(r.data.value).length === keys.length, 'merge dropped fields')
  await call('PATCH', '/settings/booking', { body: { leadTimeHours: before.data.value.leadTimeHours } })
  return `${keys.length} fields preserved`
})

console.log('\n── error handling ──')
await check('GET /programs/does-not-exist → 404', async () => {
  const r = await call('GET', '/programs/does-not-exist')
  must(r.status === 404 && r.error?.code === 'NOT_FOUND', `got ${r.status} ${r.error?.code}`)
  return r.error.code
})
await check('POST /learners without required field → 422', async () => {
  const r = await call('POST', '/learners', { body: { name: 'No Email' } })
  must(r.status === 422, `expected 422, got ${r.status} ${r.error?.message || ''}`)
  return r.error.message
})
await check('PATCH bulk without ids → 400', async () => {
  const r = await call('PATCH', '/coupons', { body: { patch: { status: 'x' } } })
  must(r.status === 400, `expected 400, got ${r.status}`)
  return r.error.code
})

console.log(`\n${'─'.repeat(60)}`)
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
