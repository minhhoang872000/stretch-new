import type {
  Course,
  CourseModule,
  CourseSession,
  Enrolment,
  Lesson,
  LessonType,
  QuizQuestion,
} from '~/types'

/**
 * Translation between this console's vocabulary and the API's.
 *
 * The API speaks the Learning Hub's language — a `program` with `modules[].items[]`
 * — because that is what the public site and `restorative-crm` were built
 * against first. This console says `course` with `modules[].lessons[]`. Neither
 * name is wrong, and renaming either side would mean rewriting a working app,
 * so the seam lives here and nowhere else.
 *
 * The one thing worth knowing: **a lesson's id is positional**. The API stores
 * the syllabus as one JSON document with no per-lesson ids, so `m0-l2` is
 * derived from where the lesson sits. Reordering the syllabus renumbers them,
 * which is fine for list keys and for the round trip through this file, and is
 * why nothing outside a single editing session stores a lesson id.
 */

export const lessonId = (moduleIndex: number, itemIndex: number) => `m${moduleIndex}-l${itemIndex}`
export const moduleId = (moduleIndex: number) => `m${moduleIndex}`

/** `m0-l2` → `{ moduleIndex: 0, itemIndex: 2 }`, or null if it is not one. */
export function parseLessonId(id: string): { moduleIndex: number; itemIndex: number } | null {
  const match = /^m(\d+)-l(\d+)$/.exec(String(id))
  return match ? { moduleIndex: Number(match[1]), itemIndex: Number(match[2]) } : null
}

const LESSON_TYPES: LessonType[] = ['video', 'reading', 'quiz']
const asLessonType = (value: unknown): LessonType =>
  LESSON_TYPES.includes(value as LessonType) ? (value as LessonType) : 'video'

/**
 * Quiz questions arrive in two shapes: the seeded syllabus stores them as bare
 * strings, this console writes them back as objects. Read both, write one.
 */
function toQuiz(questions: unknown, prefix: string): QuizQuestion[] | undefined {
  if (!Array.isArray(questions) || !questions.length) return undefined
  return questions.map((raw, index) => {
    const id = `${prefix}-q${index}`
    if (typeof raw === 'string') return { id, question: raw, options: [], answer: 0 }
    const q = raw as Partial<QuizQuestion> & { q?: string }
    return {
      id: q.id || id,
      question: q.question || q.q || '',
      options: Array.isArray(q.options) ? q.options : [],
      answer: Number(q.answer) || 0,
    }
  })
}

// ── Programme → Course ───────────────────────────────────────────────

export function toCourse(program: any): Course {
  const modules: CourseModule[] = (Array.isArray(program.modules) ? program.modules : []).map(
    (module: any, mi: number): CourseModule => ({
      id: moduleId(mi),
      title: module?.title || '',
      summary: module?.summary || '',
      lessons: (Array.isArray(module?.items) ? module.items : []).map(
        (item: any, li: number): Lesson => {
          const type = asLessonType(item?.type)
          const lesson: Lesson = {
            id: lessonId(mi, li),
            type,
            title: item?.title || '',
            minutes: Number(item?.minutes) || 0,
            free: !!item?.free,
          }
          if (item?.youtube) lesson.youtube = item.youtube
          if (item?.videoKey) lesson.videoKey = item.videoKey
          if (item?.body) lesson.body = item.body
          if (type === 'quiz') {
            const quiz = toQuiz(item?.questions, lessonId(mi, li))
            if (quiz) lesson.quiz = quiz
          }
          return lesson
        },
      ),
    }),
  )

  return {
    id: program.id,
    slug: program.slug || '',
    status: program.status || 'draft',
    kind: program.kind || 'course',
    mode: program.mode || 'online',
    topic: program.topic || 'anatomy',
    title: program.title || '',
    subtitle: program.subtitle || '',
    description: program.description || '',
    image: program.image || '',
    price: Number(program.price) || 0,
    level: program.level || '',
    skills: Array.isArray(program.skills) ? program.skills : [],
    outcomes: Array.isArray(program.outcomes) ? program.outcomes : [],
    modules,
    faq: (Array.isArray(program.faq) ? program.faq : []).map((entry: any, i: number) => ({
      id: entry?.id || `faq-${i}`,
      q: entry?.q || '',
      a: entry?.a || '',
    })),
    instructorId: program.instructorId || '',
    updatedAt: String(program.updatedAt || '').slice(0, 10),
    learnerCount: Number(program.enrolled) || 0,
    // Filled in by the caller from the enrolment rollup — the programme row does
    // not carry it, and guessing would put a number on screen that means nothing.
    avgProgress: 0,
    rating: Number(program.rating) || 0,
  }
}

/** Course → the programme body the API accepts. Positional ids are dropped. */
export function toProgramBody(course: Course): Record<string, unknown> {
  return {
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    kind: course.kind,
    mode: course.mode,
    topic: course.topic,
    level: course.level,
    price: course.price,
    status: course.status,
    instructorId: course.instructorId || null,
    image: course.image,
    outcomes: course.outcomes,
    skills: course.skills,
    faq: course.faq.map(({ q, a }) => ({ q, a })),
    modules: course.modules.map((module) => ({
      title: module.title,
      summary: module.summary,
      minutes: module.lessons.reduce((sum, lesson) => sum + (Number(lesson.minutes) || 0), 0),
      items: module.lessons.map((lesson) => {
        const item: Record<string, unknown> = {
          type: lesson.type,
          title: lesson.title,
          minutes: lesson.minutes,
          free: lesson.free,
        }
        if (lesson.youtube) item.youtube = lesson.youtube
        if (lesson.videoKey) item.videoKey = lesson.videoKey
        if (lesson.body) item.body = lesson.body
        if (lesson.type === 'quiz' && lesson.quiz?.length) {
          item.questions = lesson.quiz.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          }))
          item.passScore = 70
        }
        return item
      }),
    })),
  }
}

// ── Session ──────────────────────────────────────────────────────────

/**
 * The API keeps one `time` string ("09:00 – 12:00") because that is what a
 * schedule page prints; this console edits a start and an end separately.
 */
export function splitTime(time: string): { startTime: string; endTime: string } {
  const [start = '', end = ''] = String(time || '')
    .split(/\s*[–\-—]\s*/)
    .map((part) => part.trim())
  return { startTime: start, endTime: end }
}

export const joinTime = (startTime: string, endTime: string) =>
  endTime ? `${startTime} – ${endTime}` : startTime

export function toSession(row: any, attendeeIds: string[] = []): CourseSession {
  return {
    id: row.id,
    courseId: row.programId,
    courseTitle: row.programTitle || '',
    date: String(row.date || '').slice(0, 10),
    ...splitTime(row.time),
    location: row.location || '',
    mode: row.mode || 'online',
    seatsTotal: Number(row.capacity) || 0,
    attendeeIds,
  }
}

export function toSessionBody(session: CourseSession): Record<string, unknown> {
  return {
    programId: session.courseId,
    date: session.date,
    time: joinTime(session.startTime, session.endTime),
    location: session.location,
    mode: session.mode,
    capacity: session.seatsTotal,
  }
}

// ── Enrolment ────────────────────────────────────────────────────────

const ENROLMENT_SOURCES: Enrolment['source'][] = ['manual', 'checkout', 'free']

export function toEnrolment(row: any): Enrolment {
  // The API records where access came from as 'order'; this console calls the
  // same thing 'checkout'.
  const source = row.source === 'order' ? 'checkout' : row.source
  return {
    id: row.id,
    learnerId: row.learnerId,
    courseId: row.programId,
    status: row.status,
    source: ENROLMENT_SOURCES.includes(source) ? source : 'manual',
    enrolledAt: String(row.startedAt || row.createdAt || '').slice(0, 10),
    percent: Number(row.percent) || 0,
    // Positional lesson ids are meaningless across sessions, so the API does not
    // store a "last lesson" pointer and this stays null rather than inventing one.
    lastLessonId: null,
  }
}
