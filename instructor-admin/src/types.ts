/**
 * The console's data shapes.
 *
 * These mirror what the public site already renders (`CatalogProgram`,
 * `ProgramDetail`, `SyllabusItem` in site/composables) plus the records the site
 * only pretends to have today: learners, enrolments, per-lesson progress,
 * certificates. When the API grows the matching tables, these are the response
 * shapes to aim for — the console needs no other change than `services/api.ts`.
 */

export type CourseKind = 'course' | 'mini' | 'workshop'
export type CourseMode = 'online' | 'offline'
export type CourseTopic = 'anatomy' | 'assessment' | 'sports' | 'functional'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'video' | 'reading' | 'quiz'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  /** Index into `options`. */
  answer: number
}

export interface Lesson {
  id: string
  type: LessonType
  title: string
  minutes: number
  /** Playable before enrolling. */
  free: boolean
  /** A YouTube link in any form, or empty. */
  youtube?: string
  /** An object key in the video bucket, e.g. `courses/<slug>/0-1.mp4`. */
  videoKey?: string
  /** Reading lessons only. */
  body?: string
  quiz?: QuizQuestion[]
}

export interface CourseModule {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
}

export interface FaqItem {
  id: string
  q: string
  a: string
}

export interface Course {
  id: string
  slug: string
  status: CourseStatus
  kind: CourseKind
  mode: CourseMode
  topic: CourseTopic
  title: string
  subtitle: string
  description: string
  image: string
  /** VND. 0 = free. */
  price: number
  level: string
  skills: string[]
  outcomes: string[]
  modules: CourseModule[]
  faq: FaqItem[]
  instructorId: string
  updatedAt: string
  /** Denormalised counters the list view needs without loading every lesson. */
  learnerCount: number
  avgProgress: number
  rating: number
}

/** A dated occurrence: a workshop, or a live online class. */
export interface CourseSession {
  id: string
  courseId: string
  courseTitle: string
  /** yyyy-mm-dd. */
  date: string
  startTime: string
  endTime: string
  location: string
  mode: CourseMode
  seatsTotal: number
  attendeeIds: string[]
}

export interface Learner {
  id: string
  name: string
  email: string
  /** Signed in with Google rather than a password. */
  google: boolean
  joinedAt: string
  lastActiveAt: string
  note: string
}

export type EnrolmentStatus = 'active' | 'completed' | 'revoked'

export interface Enrolment {
  id: string
  learnerId: string
  courseId: string
  status: EnrolmentStatus
  /** Manual = granted by an instructor after a bank transfer. */
  source: 'manual' | 'checkout' | 'free'
  enrolledAt: string
  percent: number
  lastLessonId: string | null
}

/** One learner's watch record for one lesson. */
export interface LessonProgress {
  learnerId: string
  courseId: string
  lessonId: string
  watchedSeconds: number
  durationSeconds: number
  completedAt: string | null
}

export interface Certificate {
  id: string
  code: string
  learnerId: string
  learnerName: string
  courseId: string
  courseTitle: string
  issuedAt: string
  revokedAt: string | null
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden'

export interface Review {
  id: string
  learnerId: string
  learnerName: string
  courseId: string
  courseTitle: string
  rating: number
  text: string
  status: ReviewStatus
  createdAt: string
}

export interface MediaAsset {
  id: string
  /** Bucket key. */
  key: string
  courseId: string | null
  lessonId: string | null
  sizeBytes: number
  durationSeconds: number
  width: number
  height: number
  uploadedAt: string
  posterKey: string | null
}

export interface Instructor {
  id: string
  name: string
  role: string
  bio: string
  initials: string
}

/** Dashboard figures, computed server-side once the tables exist. */
export interface DashboardSummary {
  activeLearners: number
  newEnrolmentsThisWeek: number
  enrolmentsByWeek: { week: string; count: number }[]
  avgProgressByCourse: { courseId: string; title: string; percent: number }[]
  upcomingSessions: CourseSession[]
  dropOff: DropOffRow[]
  pendingReviews: number
  certificatesThisMonth: number
}

/** Where learners stop watching — the row the instructor acts on. */
export interface DropOffRow {
  lessonId: string
  courseId: string
  courseTitle: string
  moduleTitle: string
  lessonTitle: string
  /** Share of learners who opened the lesson and never finished it, 0–100. */
  dropRate: number
  /** Median second at which they stopped. */
  medianStopSecond: number
  durationSeconds: number
  starts: number
}

/** Which quiz questions people get wrong — a lesson-quality signal. */
export interface QuizMissRow {
  questionId: string
  courseTitle: string
  lessonTitle: string
  question: string
  attempts: number
  /** Share answered wrong on the first try, 0–100. */
  missRate: number
}
