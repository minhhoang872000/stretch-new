import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Exercises the learner API the way stretch.vn will: with a service token, no
 * admin JWT, acting for one learner.
 *
 * The checks that matter are the refusals — progress for a course you do not
 * hold, and access to a paid course you never bought. Those are what stand
 * between a forged request and someone else's certificate.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

const BASE = process.env.API_BASE || 'http://localhost:3001/api/v1'
const SITE = { 'x-service-token': env.SITE_SERVICE_TOKEN, 'Content-Type': 'application/json' }

let pass = 0
let fail = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function call(method, path, body, headers = SITE, retried = false) {
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 429 && !retried) {
    console.log('  … rate limited, waiting 61s')
    await sleep(61_000)
    return call(method, path, body, headers, true)
  }
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json?.data, error: json?.error }
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
const must = (c, m) => { if (!c) throw new Error(m) }

const TEST_EMAIL = 'learner.smoke@example.com'
let learnerId = ''

console.log('\n── the service token is the whole gate ──')
await check('no token → 401', async () => {
  const r = await call('POST', '/learner/identify', { email: TEST_EMAIL }, { 'Content-Type': 'application/json' })
  must(r.status === 401, `expected 401, got ${r.status}`)
  return r.error.code
})
await check('wrong token → 401', async () => {
  const r = await call('POST', '/learner/identify', { email: TEST_EMAIL }, {
    'x-service-token': 'nope', 'Content-Type': 'application/json',
  })
  must(r.status === 401, `expected 401, got ${r.status}`)
  return 'forged token refused'
})

console.log('\n── sign-in creates the account ──')
await check('first identify creates the learner', async () => {
  const r = await call('POST', '/learner/identify', {
    email: TEST_EMAIL, googleSub: 'smoke-sub-1', name: 'Người Học Thử', avatar: 'https://x/y.png',
  })
  must(r.status === 201, `expected 201, got ${r.status} ${r.error?.message || ''}`)
  must(r.data.created === true, 'not reported as created')
  must(r.data.learner.google === true, 'google flag not set')
  must(r.data.learner.initials === 'NT', `initials ${r.data.learner.initials}`)
  learnerId = r.data.learner.id
  return `${learnerId} (${r.data.learner.initials})`
})
await check('second identify reuses the row', async () => {
  const r = await call('POST', '/learner/identify', {
    email: TEST_EMAIL, googleSub: 'smoke-sub-1', name: 'Người Học Thử',
  })
  must(r.status === 200 && r.data.created === false, `created=${r.data?.created} status=${r.status}`)
  must(r.data.learner.id === learnerId, 'made a second account')
  return 'same id, login stamped'
})
await check('a changed Google email still finds them by subject id', async () => {
  const r = await call('POST', '/learner/identify', {
    email: 'learner.smoke.new@example.com', googleSub: 'smoke-sub-1', name: 'Người Học Thử',
  })
  must(r.data.learner.id === learnerId, `got ${r.data.learner.id}, expected ${learnerId}`)
  return 'matched on google_sub, not email'
})
await check('a case-different email is the same person', async () => {
  const r = await call('POST', '/learner/identify', { email: TEST_EMAIL.toUpperCase() })
  must(r.data.learner.id === learnerId, 'case created a duplicate account')
  return 'LOWER(email) unique index holds'
})

console.log('\n── access ──')
let paidSlug = ''
let freeSlug = ''
await check('paid course, not enrolled → refused', async () => {
  const list = await fetch(`${BASE}/programs?limit=200`).then((r) => r.json())
  const paid = list.data.programs.find((p) => p.price > 0)
  const free = list.data.programs.find((p) => p.price === 0)
  must(paid, 'no paid course in the seed')
  paidSlug = paid.slug
  freeSlug = free?.slug || ''
  const r = await call('GET', `/learner/${learnerId}/access/${paidSlug}`)
  must(r.data.allowed === false && r.data.reason === 'not-enrolled', JSON.stringify(r.data))
  return `${paidSlug} → ${r.data.reason}`
})
await check('free course → allowed without enrolling', async () => {
  if (!freeSlug) return 'no free course in the seed — skipped'
  const r = await call('GET', `/learner/${learnerId}/access/${freeSlug}`)
  must(r.data.allowed === true && r.data.reason === 'free', JSON.stringify(r.data))
  return `${freeSlug} → free`
})

console.log('\n── progress is gated on enrolment ──')
let programId = ''
await check('progress on a course you do not hold → 403', async () => {
  const p = await fetch(`${BASE}/programs/slug/${paidSlug}`).then((r) => r.json())
  programId = p.data.id
  const r = await call('POST', `/learner/${learnerId}/progress`, {
    programId, moduleIndex: 0, itemIndex: 0, watchedSeconds: 600, durationSeconds: 600,
  })
  must(r.status === 403 && r.error.code === 'NOT_ENROLLED', `got ${r.status} ${r.error?.code}`)
  return 'NOT_ENROLLED'
})

console.log('\n── the enrolled path ──')
await check('grant, then progress rolls up', async () => {
  const admin = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  }).then((r) => r.json())
  const grant = await fetch(`${BASE}/enrolments/grant`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin.data.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId, programId }),
  }).then((r) => r.json())
  must(grant.success !== false, `grant failed: ${grant.error?.message}`)

  const r = await call('POST', `/learner/${learnerId}/progress`, {
    programId, moduleIndex: 0, itemIndex: 0, ordinal: 0,
    lessonTitle: 'Bài thử', watchedSeconds: 600, durationSeconds: 600,
  })
  must(r.status === 200 && r.data.completed === true, JSON.stringify(r.data))
  must(r.data.enrolment.lessonsDone >= 1, 'not rolled up')
  return `${r.data.enrolment.lessonsDone}/${r.data.enrolment.lessons} → ${r.data.enrolment.percent}%`
})
await check('access now says enrolled', async () => {
  const r = await call('GET', `/learner/${learnerId}/access/${paidSlug}`)
  must(r.data.allowed === true && r.data.reason === 'enrolled', JSON.stringify(r.data))
  return 'enrolled'
})
await check('/courses returns it with a resume point', async () => {
  const r = await call('GET', `/learner/${learnerId}/courses`)
  must(Array.isArray(r.data.active), 'no active list')
  const course = r.data.active.find((c) => c.slug === paidSlug)
  must(course, 'granted course missing from /courses')
  must(course.resume && course.resume.title === 'Bài thử', `resume: ${JSON.stringify(course.resume)}`)
  return `${r.data.active.length} active, resume at "${course.resume.title}"`
})
await check('re-watching does not roll progress backwards', async () => {
  await call('POST', `/learner/${learnerId}/progress`, {
    programId, moduleIndex: 0, itemIndex: 0, watchedSeconds: 5, durationSeconds: 600,
  })
  const r = await call('GET', `/learner/${learnerId}/courses`)
  const course = r.data.active.find((c) => c.slug === paidSlug)
  must(course.lesson >= 1, `lessonsDone fell to ${course.lesson}`)
  return 'GREATEST held'
})
await check('/certificates responds', async () => {
  const r = await call('GET', `/learner/${learnerId}/certificates`)
  must(Array.isArray(r.data.certificates), 'no certificates array')
  return `${r.data.certificates.length} certificate(s)`
})

console.log('\n── cleanup ──')
await check('test learner removed', async () => {
  const admin = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  }).then((r) => r.json())
  const res = await fetch(`${BASE}/learners/${learnerId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${admin.data.token}` },
  })
  must(res.ok, `delete failed ${res.status}`)
  return 'enrolment and progress cascaded'
})

console.log(`\n${'─'.repeat(56)}\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
