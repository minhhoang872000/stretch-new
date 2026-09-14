import { readFileSync } from 'node:fs'
import { toCourse, toProgramBody, toSession, toSessionBody, toEnrolment, splitTime } from '../src/services/adapters'

/**
 * Contract test for the instructor console against a running API.
 *
 * The syllabus round trip is the one that matters: a programme is read, turned
 * into a Course, turned back, saved, and read again. If the adapter loses a
 * lesson, a quiz or a module summary, this is where it shows up — not three
 * weeks later when someone notices a course is shorter than it was.
 */
const BASE = process.env.API_BASE ?? 'http://localhost:3001/api/v1'
const env = Object.fromEntries(
  readFileSync(new URL('../../lead-tracker-api/.env', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

let token = ''
let pass = 0
let fail = 0
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function call(method: string, path: string, body?: unknown, retried = false): Promise<any> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 429 && !retried) {
    console.log('  … rate limited, waiting 61s')
    await sleep(61_000)
    return call(method, path, body, true)
  }
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json?.data, error: json?.error }
}

async function check(label: string, fn: () => Promise<string | void>) {
  try {
    const detail = await fn()
    pass += 1
    console.log(`  ok   ${label}${detail ? '  — ' + detail : ''}`)
  } catch (err: any) {
    fail += 1
    console.log(`  FAIL ${label}  — ${err.message}`)
  }
}

const must = (cond: unknown, msg: string) => { if (!cond) throw new Error(msg) }

const login = await call('POST', '/auth/login', {
  email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD,
})
token = login.data?.token
console.log(token ? '\nsigned in\n' : '\nLOGIN FAILED\n')

console.log('── syllabus round trip ──')
await check('programme → Course → programme keeps every lesson', async () => {
  const list = await call('GET', '/programs?limit=1&sort=-updatedAt')
  const before = await call('GET', `/programs/${list.data.programs[0].id}`)
  const course = toCourse(before.data)

  const lessonsBefore = course.modules.reduce((n, m) => n + m.lessons.length, 0)
  must(course.modules.length > 0, 'no modules read')
  must(lessonsBefore > 0, 'no lessons read')

  const saved = await call('PATCH', `/programs/${course.id}`, toProgramBody(course))
  must(saved.status === 200, `save failed: ${saved.status} ${saved.error?.message || ''}`)

  const after = toCourse((await call('GET', `/programs/${course.id}`)).data)
  const lessonsAfter = after.modules.reduce((n, m) => n + m.lessons.length, 0)

  must(after.modules.length === course.modules.length, `modules ${course.modules.length} → ${after.modules.length}`)
  must(lessonsAfter === lessonsBefore, `lessons ${lessonsBefore} → ${lessonsAfter}`)

  for (const [mi, module] of course.modules.entries()) {
    must(after.modules[mi]!.title === module.title, `module ${mi} title changed`)
    must(after.modules[mi]!.summary === module.summary, `module ${mi} summary lost`)
    for (const [li, lesson] of module.lessons.entries()) {
      const round = after.modules[mi]!.lessons[li]!
      must(round.title === lesson.title, `lesson ${mi}.${li} title changed`)
      must(round.type === lesson.type, `lesson ${mi}.${li} type changed`)
      must(round.minutes === lesson.minutes, `lesson ${mi}.${li} minutes changed`)
      must(round.free === lesson.free, `lesson ${mi}.${li} free flag changed`)
    }
  }
  return `${course.modules.length} modules / ${lessonsBefore} lessons intact`
})

await check('quiz questions survive the round trip', async () => {
  const list = await call('GET', '/programs?limit=500')
  let found: any = null
  for (const row of list.data.programs) {
    const course = toCourse((await call('GET', `/programs/${row.id}`)).data)
    const quizLesson = course.modules.flatMap((m) => m.lessons).find((l) => l.quiz?.length)
    if (quizLesson) { found = { course, quizLesson }; break }
  }
  must(found, 'no programme has a quiz to test')
  const { course, quizLesson } = found
  const before = quizLesson.quiz!.map((q: any) => q.question)

  await call('PATCH', `/programs/${course.id}`, toProgramBody(course))
  const after = toCourse((await call('GET', `/programs/${course.id}`)).data)
  const roundTripped = after.modules.flatMap((m) => m.lessons).find((l) => l.quiz?.length)
  must(roundTripped, 'quiz disappeared on save')
  const now = roundTripped!.quiz!.map((q) => q.question)
  must(JSON.stringify(now) === JSON.stringify(before), `questions changed:\n  ${before}\n  ${now}`)
  return `${before.length} questions kept`
})

await check('derived counts are recomputed server-side', async () => {
  const list = await call('GET', '/programs?limit=1')
  const course = toCourse((await call('GET', `/programs/${list.data.programs[0].id}`)).data)
  const expected = course.modules.reduce((n, m) => n + m.lessons.length, 0)
  // Send a deliberately wrong count; the API must ignore it and recount.
  const body = { ...toProgramBody(course), lessons: 9999, minutes: 9999 }
  const saved = await call('PATCH', `/programs/${course.id}`, body)
  must(saved.data.lessons === expected, `lessons ${saved.data.lessons}, expected ${expected}`)
  return `client said 9999, server said ${saved.data.lessons}`
})

console.log('\n── attendance ──')
await check('toggle attendance updates the register and the seat count', async () => {
  const sessions = await call('GET', '/program-sessions?limit=1')
  const session = sessions.data.sessions[0]
  const learners = await call('GET', '/learners?limit=1')
  const learnerId = learners.data.learners[0].id

  const before = await call('GET', `/program-sessions/${session.id}/attendees`)
  const wasPresent = before.data.attendeeIds.includes(learnerId)

  const on = await call('POST', `/program-sessions/${session.id}/attendance`, { learnerId })
  must(on.status === 200, `status ${on.status} ${on.error?.message || ''}`)
  must(on.data.present === !wasPresent, 'toggle did not flip')

  const mid = await call('GET', `/program-sessions/${session.id}/attendees`)
  must(mid.data.attendeeIds.includes(learnerId) === !wasPresent, 'register disagrees with the toggle')
  must(mid.data.attendeeIds.length === on.data.booked, `booked ${on.data.booked} vs register ${mid.data.attendeeIds.length}`)

  // Put it back the way it was.
  await call('POST', `/program-sessions/${session.id}/attendance`, { learnerId })
  const after = await call('GET', `/program-sessions/${session.id}/attendees`)
  must(after.data.attendeeIds.includes(learnerId) === wasPresent, 'restore failed')
  return `booked tracked the register (${on.data.booked})`
})

console.log('\n── session shape ──')
await check('session time splits and rejoins', async () => {
  const r = await call('GET', '/program-sessions?limit=1')
  const row = r.data.sessions[0]
  const session = toSession(row, [])
  must(session.courseId === row.programId, 'courseId not mapped')
  const body = toSessionBody(session)
  must(body.time === row.time, `time "${row.time}" → "${body.time}"`)
  return `"${row.time}" → ${session.startTime} / ${session.endTime}`
})
await check('splitTime handles a missing end time', async () => {
  const { startTime, endTime } = splitTime('09:00')
  must(startTime === '09:00' && endTime === '', `got "${startTime}" / "${endTime}"`)
  return 'no crash on a one-sided time'
})

console.log('\n── enrolment mapping ──')
await check('source "order" becomes "checkout"', async () => {
  const r = await call('GET', '/enrolments?limit=500')
  const fromOrder = r.data.enrolments.find((e: any) => e.source === 'order')
  must(fromOrder, 'no order-sourced enrolment in the seed')
  const mapped = toEnrolment(fromOrder)
  must(mapped.source === 'checkout', `got ${mapped.source}`)
  must(mapped.courseId === fromOrder.programId, 'courseId not mapped')
  return `${fromOrder.source} → ${mapped.source}`
})

console.log('\n── reports the console renders ──')
await check('drop-off carries moduleTitle and lessonTitle', async () => {
  const r = await call('GET', '/academy-insights/drop-off')
  const row = r.data.dropOff[0]
  must(row, 'no drop-off rows')
  must(row.moduleTitle, 'moduleTitle empty')
  must(row.lessonTitle, 'lessonTitle empty')
  return `${row.moduleTitle} → ${row.lessonTitle}`
})
await check('quiz-misses carries questionId and lessonTitle', async () => {
  const r = await call('GET', '/academy-insights/quiz-misses')
  const row = r.data.quizMisses[0]
  must(row?.questionId, 'no questionId')
  must(row.lessonTitle, 'lessonTitle empty')
  return `${row.questionId} — ${row.lessonTitle}`
})
await check('dashboard maps to avgProgressByCourse', async () => {
  const r = await call('GET', '/academy-insights/dashboard')
  must(Array.isArray(r.data.avgProgressByProgram), 'no avgProgressByProgram')
  must(Array.isArray(r.data.upcomingSessions), 'no upcomingSessions')
  return `${r.data.activeLearners} active, ${r.data.avgProgressByProgram.length} courses`
})

console.log(`\n${'─'.repeat(56)}\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
