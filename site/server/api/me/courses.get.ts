import { learnerFetch, requireLearner } from '~~/server/utils/learnerApi'

/**
 * GET /api/me/courses — the signed-in learner's enrolments.
 *
 * Shaped for `useMyLearning`, which the account page and the course page both
 * read: two lists, each already carrying where to resume.
 */
interface ApiCourse {
  slug: string
  title: string
  image: string
  mode: string
  lesson: number
  lessons: number
  percent: number
  startedAt: string | null
  completedAt: string | null
  certificate: string | null
  resume: { moduleIndex: number; itemIndex: number; ordinal: number | null; title: string } | null
}

export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)
  const data = await learnerFetch<{ active: ApiCourse[]; completed: ApiCourse[] }>(
    event,
    `/learner/${encodeURIComponent(learner.id)}/courses`,
  )

  // Never cached: this is one person's data, and a shared cache is how it
  // becomes someone else's.
  setHeader(event, 'cache-control', 'no-store')

  return {
    active: (data.active || []).map((course) => ({
      slug: course.slug,
      title: course.title,
      image: course.image,
      mode: course.mode === 'offline' ? 'offline' : 'online',
      lesson: course.lesson,
      lessons: course.lessons,
      percent: course.percent,
      nextLesson: course.resume?.title || 'Bắt đầu từ bài đầu tiên',
      // Estimated from lessons left, not stored: an estimate that updates with
      // the syllabus beats a number saved when the course was published.
      timeLeft: timeLeft(course.lessons - course.lesson),
      updatedAt: displayDate(course.startedAt),
      resume: course.resume,
    })),
    completed: (data.completed || []).map((course) => ({
      slug: course.slug,
      title: course.title,
      image: course.image,
      completedAt: displayDate(course.completedAt),
      certificateCode: course.certificate || '',
    })),
  }
})

/** Rough, and labelled as such on the page. ~12 minutes a lesson. */
function timeLeft(lessonsLeft: number): string {
  const minutes = Math.max(0, lessonsLeft) * 12
  if (!minutes) return 'Sắp xong'
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`
}

/** `2026-08-30` → `30/08/2026`. */
function displayDate(iso: string | null): string {
  const [y, m, d] = String(iso || '').slice(0, 10).split('-')
  return d ? `${d}/${m}/${y}` : ''
}
