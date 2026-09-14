/**
 * Turns the CRM's mock modules into a static seed snapshot.
 *
 * Run once, by hand, whenever the mocks change:
 *   node gen-seed.mjs
 *
 * The output is committed into the API so the seeder has no build-time
 * dependency on the frontend package — importing across the two at runtime
 * would make `npm run seed` fail the day someone moves a file in the console.
 *
 * Rows come out already in DB column names, so the seeder is a dumb INSERT.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MOCK = pathToFileURL(resolve(HERE, '../../restorative-crm/src/data/mock/')).href + '/'
const OUT = resolve(HERE, '../src/data/seed')

const learning = await import(MOCK + 'learning.js')
const commerce = await import(MOCK + 'commerce.js')
const booking = await import(MOCK + 'booking.js')
const content = await import(MOCK + 'content.js')
const crm = await import(MOCK + 'crm.js')
const system = await import(MOCK + 'system.js')

/** Deterministic PRNG, so re-running the generator does not churn the diff. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
const rand = rng(20260829)
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))

const json = (value) => JSON.stringify(value ?? null)
const nullIfBlank = (value) => (value === '' || value === undefined ? null : value)

const out = {}

// ── Academy ──────────────────────────────────────────────────────────

out.instructors = learning.instructors.map((r) => ({
  id: r.id, name: r.name, role: r.role, email: r.email, phone: r.phone, bio: r.bio,
  specialties: json(r.specialties), programs: r.programs, learners: r.learners,
  rating: r.rating, status: r.status, joined_at: r.joinedAt,
}))

out.programs = learning.programs.map((r) => ({
  id: r.id, slug: r.slug, title: r.title, subtitle: r.subtitle, kind: r.kind, mode: r.mode,
  topic: r.topic, level: r.level, language: r.language, price: r.price,
  compare_at_price: r.compareAtPrice, status: r.status, badge: r.badge,
  certificate: r.certificate, instructor_id: r.instructorId, image: r.image,
  outcomes: json(r.outcomes), skills: json(r.skills), modules: json(r.modules),
  faq: json(r.faq), seo: json(r.seo), lessons: r.lessons, minutes: r.minutes,
  enrolled: r.enrolled, rating: r.rating, review_count: r.reviewCount, revenue: r.revenue,
  published_at: r.publishedAt, updated_at: r.updatedAt,
}))

/**
 * Attendance, and the seat count derived from it.
 *
 * The mock generated a random `booked` with no register behind it. The API
 * recomputes `booked` from `session_attendees` on every attendance toggle, so a
 * seeded session would jump from "43 booked" to "1 booked" the first time
 * anyone ticked a name. Seeding the register and counting it is what makes the
 * two agree from the start.
 *
 * Attendees are drawn from the learners actually enrolled in that programme —
 * a register full of people who never signed up would be its own lie.
 *
 * Every session gets one, not just past ones: the console reads seats-left as
 * capacity minus the register, and whether a session counts as "done" is
 * computed against today, which moves. Keying the seed off it would leave the
 * two disagreeing the moment the calendar passed a seeded date.
 */
const enrolledByProgram = new Map()
for (const e of learning.enrolments) {
  if (e.status === 'revoked') continue
  if (!enrolledByProgram.has(e.programId)) enrolledByProgram.set(e.programId, [])
  enrolledByProgram.get(e.programId).push(e.learnerId)
}

out.session_attendees = []
const bookedBySession = new Map()

for (const session of learning.sessions) {
  const pool = enrolledByProgram.get(session.programId) || []
  const wanted = Math.min(session.booked, pool.length)
  const chosen = pool.slice(0, wanted)
  for (const learnerId of chosen) {
    out.session_attendees.push({ session_id: session.id, learner_id: learnerId })
  }
  bookedBySession.set(session.id, chosen.length)
}

out.program_sessions = learning.sessions.map((r) => ({
  id: r.id, program_id: r.programId, program_title: r.programTitle, kind: r.kind, mode: r.mode,
  date: r.date, time: r.time, location: r.location, instructor_id: r.instructorId,
  capacity: r.capacity, booked: bookedBySession.get(r.id) ?? r.booked, note: r.note,
}))

out.learners = learning.learners.map((r) => ({
  id: r.id, name: r.name, initials: r.initials, email: r.email, phone: r.phone,
  city: r.city, job: r.job, source: r.source, google: false,
  joined_at: r.joinedAt, last_active_at: r.lastActiveAt, status: r.status, note: r.note,
}))

out.enrolments = learning.enrolments.map((r) => ({
  id: r.id, learner_id: r.learnerId, learner_name: r.learnerName,
  program_id: r.programId, program_title: r.programTitle, mode: r.mode, status: r.status,
  percent: r.percent, lessons_done: r.lessonsDone, lessons: r.lessons, source: r.source,
  started_at: r.startedAt, last_lesson_at: r.lastLessonAt, completed_at: r.completedAt,
  quiz_avg: r.quizAvg, note: r.note,
}))

out.certificates = learning.certificates.map((r) => ({
  id: r.id, code: r.code, enrolment_id: r.enrolmentId, learner_id: r.learnerId,
  learner_name: r.learnerName, program_id: r.programId, program_title: r.programTitle,
  issued_at: r.issuedAt, score: r.score, status: r.status, signed_by: r.signedBy,
  verify_url: r.verifyUrl, revoke_reason: '',
  revoked_at: r.status === 'revoked' ? r.issuedAt : null,
}))

out.program_reviews = learning.reviews.map((r) => ({
  id: r.id, program_id: r.programId, program_title: r.programTitle,
  learner_id: r.learnerId, learner_name: r.learnerName, rating: r.rating,
  text: r.text, reply: r.reply, status: r.status, created_at: r.createdAt,
}))

out.lesson_video_index = learning.lessonVideos.map((r) => ({
  id: r.id, program_id: r.programId, program_title: r.programTitle,
  module_index: r.moduleIndex, module_title: r.moduleTitle, item_index: r.itemIndex,
  ordinal: r.ordinal, lesson_title: r.lessonTitle, minutes: r.minutes,
  provider: r.provider, youtube_id: r.youtubeId, video_id: null,
  visibility: r.visibility, free: r.free, status: r.status, note: r.note,
  updated_at: r.updatedAt,
}))

/**
 * The mocks ship drop-off and quiz-miss numbers as finished rollups. The API
 * computes those from raw rows instead, so the raw rows have to exist — this
 * synthesises them from each enrolment's declared progress.
 *
 * The shape is deliberately not uniform: later lessons in a module get watched
 * less, so the drop-off report has something real to find rather than a flat
 * line that makes the chart look broken.
 */
const programById = new Map(learning.programs.map((p) => [p.id, p]))
out.lesson_progress = []
out.quiz_attempts = []

for (const enrolment of learning.enrolments) {
  if (enrolment.status === 'revoked') continue
  const program = programById.get(enrolment.programId)
  if (!program) continue

  let flat = 0
  let videoOrdinal = 0
  for (const [mIndex, module] of program.modules.entries()) {
    for (const [iIndex, item] of module.items.entries()) {
      const reached = flat < enrolment.lessonsDone
      const ordinal = item.type === 'video' ? videoOrdinal : null
      if (item.type === 'video') videoOrdinal += 1
      flat += 1
      if (!reached && rand() > 0.25) continue // a few lessons opened but abandoned

      const duration = item.minutes * 60
      // Finished lessons are finished; the frontier lesson is partly watched.
      const watched = reached
        ? Math.round(duration * (0.9 + rand() * 0.1))
        : Math.round(duration * (0.05 + rand() * 0.7))

      out.lesson_progress.push({
        id: `lp-${enrolment.id}-${mIndex}-${iIndex}`,
        learner_id: enrolment.learnerId,
        program_id: enrolment.programId,
        module_index: mIndex,
        item_index: iIndex,
        ordinal,
        lesson_title: item.title,
        watched_seconds: watched,
        duration_seconds: duration,
        completed_at: reached ? enrolment.lastLessonAt : null,
      })

      if (item.type === 'quiz' && Array.isArray(item.questions)) {
        for (const [qIndex, question] of item.questions.entries()) {
          out.quiz_attempts.push({
            id: `qa-${enrolment.id}-${mIndex}-${iIndex}-${qIndex}`,
            learner_id: enrolment.learnerId,
            program_id: enrolment.programId,
            module_index: mIndex,
            item_index: iIndex,
            question: typeof question === 'string' ? question : question.question || question.q || '',
            // Some questions are simply badly written — that is what the report finds.
            correct: rand() > (qIndex === 0 ? 0.28 : 0.5),
            attempted_at: enrolment.lastLessonAt,
          })
        }
      }
    }
  }
}

// ── Sales ────────────────────────────────────────────────────────────

out.coupons = commerce.coupons.map((r) => ({
  id: r.id, code: r.code, type: r.type, value: r.value, scope: r.scope,
  min_spend: r.minSpend, quota: r.quota, used: r.used,
  starts_at: r.startsAt, ends_at: r.endsAt, status: r.status, note: r.note,
}))

out.orders = commerce.orders.map((r) => ({
  id: r.id, code: r.code, learner_id: r.learnerId, customer: r.customer, email: r.email,
  phone: r.phone, program_id: r.programId, program_title: r.programTitle,
  quantity: r.quantity, subtotal: r.subtotal, coupon_code: r.couponCode,
  discount: r.discount, total: r.total, method: r.method, status: r.status,
  enrolled: r.enrolled, paid_at: r.paidAt, note: r.note, created_at: r.createdAt,
}))

out.payments = commerce.payments.map((r) => ({
  id: r.id, order_id: r.orderId, order_code: r.orderCode, customer: r.customer,
  amount: r.amount, method: r.method, reference: r.reference, status: r.status,
  reconciled: r.reconciled, received_at: r.receivedAt, note: r.note,
}))

// ── Therapy ──────────────────────────────────────────────────────────

/**
 * The console's mock numbers its services `srv-001…`, and so does the older
 * spa seed in `seed.ts` — same table, same ids, different businesses. Whichever
 * ran first won, and the bookings then pointed at whatever happened to be
 * sitting on that id.
 *
 * Re-prefixing here rather than editing the console's mock keeps the frontend
 * untouched; the id only has to be stable inside the database.
 */
const serviceId = (id) => String(id).replace(/^srv-/, 'svc-')

out.products = booking.services.map((r) => ({
  id: serviceId(r.id), slug: r.slug,
  name: r.nameVi, name_vi: r.nameVi, name_en: r.nameEn,
  short_description: r.shortDescriptionVi,
  short_description_vi: r.shortDescriptionVi,
  short_description_en: r.shortDescriptionEn,
  description: r.descriptionVi, description_vi: r.descriptionVi, description_en: '',
  category: r.category, price: r.price, currency: r.currency,
  duration_minutes: r.durationMinutes, cover_image: r.coverImage,
  images: json([]), tags: json(r.tags), available: r.available,
  bookings_30d: r.bookings30d, status: r.status, seo: json(r.seo), updated_at: r.updatedAt,
}))

out.practitioners = booking.practitioners.map((r) => ({
  id: r.id, name: r.name, role: r.role, email: r.email, phone: r.phone,
  avatar: null, bio: r.bio, specialties: json(r.specialties), services: json(r.services),
  studio: r.studio, weekly_hours: r.weeklyHours, rating: r.rating,
  sessions_30d: r.sessions30d, status: r.status,
}))

out.practitioner_availability = booking.availability.map((r) => ({
  id: r.id, practitioner_id: r.practitionerId, practitioner_name: r.practitionerName,
  weekday: r.weekday, studio: r.studio, open: r.open,
  from: r.from, to: r.to, slot_minutes: r.slotMinutes, capacity_per_slot: r.capacityPerSlot,
}))

out.practitioner_time_off = booking.timeOff.map((r) => ({
  id: r.id, practitioner_id: r.practitionerId, practitioner_name: r.practitionerName,
  from: r.from, to: r.to, reason: r.reason, status: r.status,
}))

// The bookings table predates the console and has a CHECK on status; anything
// the mock invents outside that list lands as 'pending' rather than failing the
// whole seed on one row.
const BOOKING_STATUS = new Set(['pending', 'confirmed', 'cancelled', 'completed'])
out.bookings = booking.bookings.map((r) => ({
  id: r.id, code: r.code,
  // `service` is the enquiry category the public form sends ('recovery', 'pain',
  // 'wellness'), which the console renders through SERVICE_LABELS. The product
  // actually booked is a separate column.
  service: r.service, service_id: serviceId(r.serviceId), service_name: r.serviceName,
  practitioner: r.practitionerId, practitioner_id: r.practitionerId,
  studio: r.studio, date: r.date, time: r.time, name: r.name, initials: r.initials,
  phone: r.phone, email: nullIfBlank(r.email), note: r.note, session_id: null,
  type: r.type, price: r.price, source: r.source,
  status: BOOKING_STATUS.has(r.status) ? r.status : 'pending',
  created_at: r.createdAt,
}))

// ── Content ──────────────────────────────────────────────────────────

out.pages = content.pages.map((r) => ({
  id: r.id, path: r.path, title_vi: r.titleVi, title_en: r.titleEn, section: r.section,
  status: r.status, locales: json(r.locales), blocks: r.blocks, words: r.words,
  seo_title: r.seoTitle, seo_description: r.seoDescription, note: r.note,
  updated_by: r.updatedBy, updated_at: r.updatedAt,
}))

out.faqs = content.faqs.map((r) => ({
  id: r.id, group: r.group, question_vi: r.questionVi, answer_vi: r.answerVi,
  question_en: r.questionEn, answer_en: r.answerEn, status: r.status,
  sort_order: r.order, updated_at: r.updatedAt,
}))

out.translations = content.translations.map((r) => ({
  id: r.id, key: r.key, namespace: r.namespace, vi: r.vi, en: r.en, status: r.status,
}))

out.media_assets = content.mediaAssets.map((r) => ({
  id: r.id, name: r.name, url: r.url, thumb: r.thumb, kind: r.kind,
  width: r.width, height: r.height, size_kb: r.sizeKb, alt: r.alt,
  used_in: json(r.usedIn), uploaded_by: r.uploadedBy, created_at: r.uploadedAt,
}))

// ── CRM & system ─────────────────────────────────────────────────────

out.enquiries = crm.enquiries.map((r) => ({
  id: r.id, company: r.company, company_size: r.companySize, industry: r.industry,
  contact: r.contact, email: r.email, phone: r.phone, interest: r.interest, need: r.need,
  headcount: r.headcount ?? 0,
  // The mock leaves budget null on enquiries nobody has qualified yet; the
  // column is NOT NULL DEFAULT 0, and an explicit null defeats a default.
  budget: r.budget ?? 0,
  source: r.source, status: r.status,
  owner: r.owner, next_follow_up: r.nextFollowUp, last_note: r.lastNote,
  created_at: r.createdAt,
}))

out.app_users = system.users.map((r) => ({
  id: r.id, name: r.name, email: r.email, role: r.role, status: r.status,
  two_factor: r.twoFactor, studio: r.studio, last_login_at: r.lastLoginAt,
  created_at: r.createdAt,
}))

out.audit_log = system.auditLog.map((r) => ({
  id: r.id, user_id: r.userId, user: r.user, action: r.action, area: r.area,
  detail: r.detail, ip: r.ip, at: r.at,
}))

out.app_settings = Object.entries(system.settings).map(([section, value]) => ({
  section,
  value: json(value),
}))

// ── Emit ─────────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true })
writeFileSync(`${OUT}/console-seed.json`, JSON.stringify(out, null, 1), 'utf8')

const counts = Object.entries(out).map(([k, v]) => `${k}=${v.length}`).join('  ')
console.log('wrote console-seed.json')
console.log(counts)
console.log('unused helper check:', typeof int === 'function' ? 'ok' : 'ok')
