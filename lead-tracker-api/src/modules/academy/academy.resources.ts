import type { Resource } from '../../core/crud'

/**
 * Column maps for the Academy tables.
 *
 * Each one is the contract between a table and the three frontends that read
 * it: field names here are exactly the keys `instructor-admin`,
 * `restorative-crm/academy` and the site's composables already use, so nothing
 * downstream has to rename anything.
 *
 * `filters` is the allow-list for query-string filtering, `search` the columns
 * `?q=` scans, `sortable` the columns `?sort=` will accept. A key absent from
 * those lists is simply ignored rather than trusted — that is what keeps a
 * query string from reaching the SQL builder.
 */

const timestamps = {
  createdAt: { type: 'timestamp', readOnly: true },
  updatedAt: { type: 'timestamp', readOnly: true },
} as const

export const instructorsResource: Resource = {
  name: 'instructors',
  table: 'instructors',
  idPrefix: 'ins',
  defaultOrder: 'name ASC',
  search: ['name', 'email', 'role'],
  filters: ['status'],
  sortable: ['name', 'rating', 'learners', 'programs', 'joinedAt'],
  fields: {
    id: { readOnly: true },
    name: { required: true },
    role: {},
    email: {},
    phone: {},
    bio: {},
    specialties: { type: 'json', fallback: [] },
    programs: { type: 'int', fallback: 0 },
    learners: { type: 'int', fallback: 0 },
    rating: { type: 'number', fallback: 0 },
    status: { fallback: 'active' },
    joinedAt: { type: 'date' },
    ...timestamps,
  },
}

export const learnersResource: Resource = {
  name: 'learners',
  table: 'learners',
  idPrefix: 'lrn',
  defaultOrder: 'created_at DESC',
  search: ['name', 'email', 'phone', 'city'],
  filters: ['status', 'source', 'city'],
  sortable: ['name', 'joinedAt', 'lastActiveAt', 'status'],
  fields: {
    id: { readOnly: true },
    name: { required: true },
    initials: {},
    email: { required: true },
    phone: {},
    city: {},
    job: {},
    source: {},
    google: { type: 'bool', fallback: false },
    joinedAt: { type: 'date' },
    lastActiveAt: { type: 'timestamp' },
    status: { fallback: 'active' },
    note: { fallback: '' },
    ...timestamps,
  },
}

/**
 * `seatsLeft`, `seatStatus` and `status` are computed, not stored.
 *
 * A session is "today" for exactly one day. Stored, that value is wrong by the
 * next morning and nothing in the system would notice; computed against
 * CURRENT_DATE it cannot be. Same reasoning for the seat count, which is
 * capacity minus bookings and has no business being separately writable.
 */
export const sessionsResource: Resource = {
  name: 'sessions',
  table: 'program_sessions',
  idPrefix: 'ses',
  defaultOrder: 'date ASC',
  search: ['program_title', 'location'],
  filters: ['programId', 'instructorId', 'mode', 'kind'],
  sortable: ['date', 'capacity', 'booked'],
  fields: {
    id: { readOnly: true },
    programId: { required: true },
    programTitle: { fallback: '' },
    kind: {},
    mode: {},
    date: { type: 'date', required: true },
    time: { fallback: '' },
    location: { fallback: '' },
    instructorId: {},
    capacity: { type: 'int', fallback: 0 },
    booked: { type: 'int', fallback: 0 },
    note: { fallback: '' },
    seatsLeft: { type: 'int', computed: 'GREATEST(0, capacity - booked)' },
    // The register, inlined. Without it the console asks for each session's
    // attendees separately — one screen with sixteen sessions became seventeen
    // requests, which is how a page trips a rate limit on its own.
    attendeeIds: {
      type: 'json',
      computed: `COALESCE((
        SELECT json_agg(sa.learner_id ORDER BY sa.learner_id)
          FROM session_attendees sa
         WHERE sa.session_id = program_sessions.id
      ), '[]'::json)`,
    },
    seatStatus: {
      computed: `CASE
        WHEN capacity - booked <= 0 THEN 'full'
        WHEN capacity - booked <= 3 THEN 'few'
        ELSE 'open' END`,
    },
    status: {
      computed: `CASE
        WHEN date < CURRENT_DATE THEN 'done'
        WHEN date = CURRENT_DATE THEN 'today'
        ELSE 'upcoming' END`,
    },
    ...timestamps,
  },
}

export const enrolmentsResource: Resource = {
  name: 'enrolments',
  table: 'enrolments',
  idPrefix: 'enr',
  defaultOrder: 'created_at DESC',
  search: ['learner_name', 'program_title'],
  filters: ['status', 'programId', 'learnerId', 'source', 'mode'],
  sortable: ['startedAt', 'percent', 'lastLessonAt', 'status'],
  fields: {
    id: { readOnly: true },
    learnerId: { required: true },
    learnerName: { fallback: '' },
    programId: { required: true },
    programTitle: { fallback: '' },
    mode: {},
    status: { fallback: 'active' },
    percent: { type: 'int', fallback: 0 },
    lessonsDone: { type: 'int', fallback: 0 },
    lessons: { type: 'int', fallback: 0 },
    source: { fallback: 'manual' },
    startedAt: { type: 'date' },
    lastLessonAt: { type: 'timestamp' },
    completedAt: { type: 'date' },
    quizAvg: { type: 'int' },
    note: { fallback: '' },
    ...timestamps,
  },
}

export const certificatesResource: Resource = {
  name: 'certificates',
  table: 'certificates',
  idPrefix: 'crt',
  defaultOrder: 'issued_at DESC',
  search: ['code', 'learner_name', 'program_title'],
  filters: ['status', 'programId', 'learnerId'],
  sortable: ['issuedAt', 'score', 'status'],
  fields: {
    id: { readOnly: true },
    code: { required: true },
    enrolmentId: {},
    learnerId: { required: true },
    learnerName: { fallback: '' },
    programId: { required: true },
    programTitle: { fallback: '' },
    issuedAt: { type: 'date', required: true },
    score: { type: 'int' },
    status: { fallback: 'valid' },
    signedBy: { fallback: '' },
    verifyUrl: { fallback: '' },
    revokedAt: { type: 'date' },
    revokeReason: { fallback: '' },
    ...timestamps,
  },
}

export const reviewsResource: Resource = {
  name: 'reviews',
  table: 'program_reviews',
  idPrefix: 'rev',
  defaultOrder: 'created_at DESC',
  search: ['learner_name', 'program_title', 'text'],
  filters: ['status', 'programId', 'rating'],
  sortable: ['createdAt', 'rating', 'status'],
  fields: {
    id: { readOnly: true },
    programId: { required: true },
    programTitle: { fallback: '' },
    learnerId: {},
    learnerName: { fallback: '' },
    rating: { type: 'int', fallback: 5 },
    text: { fallback: '' },
    reply: { fallback: '' },
    status: { fallback: 'pending' },
    ...timestamps,
  },
}

export const progressResource: Resource = {
  name: 'progress',
  table: 'lesson_progress',
  idPrefix: 'lp',
  defaultOrder: 'updated_at DESC',
  filters: ['learnerId', 'programId'],
  sortable: ['updatedAt', 'watchedSeconds'],
  fields: {
    id: { readOnly: true },
    learnerId: { required: true },
    programId: { required: true },
    moduleIndex: { type: 'int', fallback: 0 },
    itemIndex: { type: 'int', fallback: 0 },
    ordinal: { type: 'int' },
    lessonTitle: { fallback: '' },
    watchedSeconds: { type: 'int', fallback: 0 },
    durationSeconds: { type: 'int', fallback: 0 },
    completedAt: { type: 'timestamp' },
    updatedAt: { type: 'timestamp', readOnly: true },
  },
}

/**
 * The video slot index. Its `status` is the console's working list: a lesson
 * with no source yet is a row here, not a missing row, which is the only way
 * "12 lessons still have no video" can be asked at all.
 */
export const videoIndexResource: Resource = {
  name: 'videoIndex',
  table: 'lesson_video_index',
  idPrefix: 'vid',
  defaultOrder: 'program_title ASC, ordinal ASC',
  search: ['lesson_title', 'program_title', 'module_title'],
  filters: ['programId', 'status', 'provider', 'visibility', 'free'],
  sortable: ['ordinal', 'minutes', 'status', 'updatedAt'],
  fields: {
    id: { readOnly: true },
    programId: { required: true },
    programTitle: { fallback: '' },
    moduleIndex: { type: 'int', fallback: 0 },
    moduleTitle: { fallback: '' },
    itemIndex: { type: 'int', fallback: 0 },
    ordinal: { type: 'int', fallback: 0 },
    lessonTitle: { fallback: '' },
    minutes: { type: 'int', fallback: 0 },
    provider: { fallback: 'youtube' },
    youtubeId: { fallback: '' },
    videoId: {},
    // These three live on the R2 upload, not on the slot. Read through the link
    // rather than copied, so a re-upload cannot leave the index describing a
    // file that is no longer there.
    objectKey: {
      computed: '(SELECT lv.object_key FROM lesson_videos lv WHERE lv.id = lesson_video_index.video_id)',
    },
    sizeBytes: {
      type: 'int',
      computed: '(SELECT lv.size_bytes FROM lesson_videos lv WHERE lv.id = lesson_video_index.video_id)',
    },
    durationSeconds: {
      type: 'int',
      computed: '(SELECT lv.duration_seconds FROM lesson_videos lv WHERE lv.id = lesson_video_index.video_id)',
    },
    programSlug: {
      computed: '(SELECT p.slug FROM programs p WHERE p.id = lesson_video_index.program_id)',
    },
    visibility: { fallback: 'unlisted' },
    free: { type: 'bool', fallback: false },
    status: { fallback: 'missing' },
    note: { fallback: '' },
    ...timestamps,
  },
}

export const programsResource: Resource = {
  name: 'programs',
  table: 'programs',
  idPrefix: 'prg',
  defaultOrder: 'updated_at DESC',
  search: ['title', 'slug', 'subtitle'],
  filters: ['status', 'kind', 'mode', 'topic', 'instructorId'],
  sortable: ['title', 'price', 'enrolled', 'rating', 'updatedAt', 'publishedAt'],
  fields: {
    id: { readOnly: true },
    slug: {},
    title: { required: true },
    subtitle: { fallback: '' },
    description: { fallback: '' },
    kind: { fallback: 'course' },
    mode: { fallback: 'online' },
    topic: {},
    level: { fallback: '' },
    language: { fallback: 'vi' },
    price: { type: 'int', fallback: 0 },
    compareAtPrice: { type: 'int' },
    status: { fallback: 'draft' },
    badge: {},
    certificate: { type: 'bool', fallback: false },
    instructorId: {},
    image: { fallback: '' },
    outcomes: { type: 'json', fallback: [] },
    skills: { type: 'json', fallback: [] },
    modules: { type: 'json', fallback: [] },
    faq: { type: 'json', fallback: [] },
    seo: { type: 'json', fallback: {} },
    lessons: { type: 'int', fallback: 0 },
    minutes: { type: 'int', fallback: 0 },
    enrolled: { type: 'int', fallback: 0 },
    rating: { type: 'number', fallback: 0 },
    reviewCount: { type: 'int', fallback: 0 },
    revenue: { type: 'int', fallback: 0 },
    publishedAt: { type: 'date' },
    ...timestamps,
  },
}
