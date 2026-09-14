import type { ApiProgram } from '~~/server/utils/academyApi'
import {
  displayDate,
  durationLabel,
  fetchApprovedReviews,
  fetchInstructor,
  fetchProgramBySlug,
  fetchSessions,
  nextSessionByProgram,
} from '~~/server/utils/academyApi'

/**
 * GET /api/programs/:slug — everything the course page renders.
 *
 * Assembled server-side from four calls (programme, its sessions, its approved
 * reviews, its instructor) so the page makes one request and the API token —
 * or rather the API's address — never reaches the browser.
 *
 * Two fields are deliberately NOT invented here: `agenda` and `includes`. The
 * API has nowhere to store them, and a fabricated agenda on a real course page
 * is worse than an absent one. They come back empty and the page hides the
 * section; filling them means adding the columns, not guessing.
 */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) throw createError({ statusCode: 400, message: 'slug is required' })

  const program = await fetchProgramBySlug(event, slug)
  if (!program) throw createError({ statusCode: 404, message: 'Không tìm thấy chương trình' })

  const [sessions, reviews, instructor] = await Promise.all([
    fetchSessions(event),
    fetchApprovedReviews(event, program.id),
    fetchInstructor(event, program.instructorId),
  ])

  const session = nextSessionByProgram(sessions).get(program.id)

  /**
   * The rating shown on the page is computed from the approved reviews it also
   * shows, not from the programme's stored average. A page that says 4.8 above
   * three reviews averaging 4.0 invites exactly one question.
   */
  const distribution = [0, 0, 0, 0, 0]
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 0)))
    distribution[star - 1] += 1
  }
  const avg = reviews.length
    ? Number((reviews.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1))
    : Number(program.rating) || 0

  setHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')

  return {
    program: {
      slug: program.slug,
      kind: program.kind,
      mode: program.mode,
      topic: program.topic,
      title: program.title,
      image: program.image || '/images/man-neck-pain.png',
      price: program.price,
      ...(program.lessons
        ? { lessons: program.lessons, duration: durationLabel(program.minutes) }
        : {}),
      ...(session
        ? { date: displayDate(session.date), time: session.time, location: session.location }
        : {}),
    },
    scheduled: !!session,
    subtitle: program.subtitle || '',
    // The editor writes one block of text; the page lays out paragraphs.
    description: String(program.description || program.subtitle || '')
      .split(/\n{2,}|\r\n\r\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    level: program.level || '',
    language: program.language || 'Tiếng Việt',
    certificate: !!program.certificate,
    skills: program.skills || [],
    outcomes: program.outcomes || [],
    // Already the site's SyllabusModule shape — stored that way on purpose.
    modules: (program.modules || []).map((module: ApiProgram["modules"][number]) => ({
      title: module.title || '',
      summary: module.summary || '',
      items: Array.isArray(module.items) ? module.items : [],
      minutes:
        module.minutes ??
        (Array.isArray(module.items)
          ? module.items.reduce((s: number, i: any) => s + (Number(i?.minutes) || 0), 0)
          : 0),
    })),
    agenda: [],
    includes: [],
    instructor: instructor
      ? {
          name: instructor.name,
          initials: initials(instructor.name),
          role: instructor.role || '',
          bio: instructor.bio || '',
          courses: Number(instructor.programs) || 0,
          learners: Number(instructor.learners) || 0,
        }
      : null,
    rating: { avg, count: reviews.length, distribution },
    reviews: reviews.map((review: any) => ({
      name: review.learnerName || 'Học viên',
      initials: initials(review.learnerName || ''),
      rating: Number(review.rating) || 0,
      date: String(review.createdAt || '').slice(0, 10),
      text: review.text || '',
    })),
    faq: program.faq || [],
    enrolled: Number(program.enrolled) || 0,
    seatsLeft: session ? session.seatsLeft : 0,
    totalMinutes: Number(program.minutes) || 0,
  }
})

/** "Nguyễn Hải Đăng" → "NĐ". */
function initials(name: string): string {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0]![0]!
  const last = words.length > 1 ? words[words.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}
