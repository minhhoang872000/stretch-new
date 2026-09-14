import { apiFetch } from '~/services/http'
import {
  joinTime,
  toCourse,
  toEnrolment,
  toProgramBody,
  toSession,
  toSessionBody,
} from '~/services/adapters'
import type {
  Certificate,
  Course,
  CourseSession,
  DashboardSummary,
  DropOffRow,
  Enrolment,
  Instructor,
  Learner,
  LessonProgress,
  MediaAsset,
  QuizMissRow,
  Review,
  ReviewStatus,
} from '~/types'

/**
 * The console's only data boundary.
 *
 * Everything here calls `lead-tracker-api`. The function names and return
 * shapes are unchanged from when this file was a mock store, so no view had to
 * be rewritten — what changed is that the numbers are now real, and that the
 * derived reports are computed by the database rather than in this file.
 *
 * The API speaks of programmes and this console speaks of courses; the mapping
 * lives in `adapters.ts` and nowhere else.
 */

/** A lesson counts as watched at 90% — the same threshold the API reports on. */
export const WATCHED_THRESHOLD = 90

/** Today, as the console's date inputs expect it. */
export const TODAY = new Date().toISOString().slice(0, 10)

const listLimit = '?limit=500'

export const api = {
  // ── Courses ────────────────────────────────────────────────────────
  /** GET /programs */
  async listCourses(): Promise<Course[]> {
    const [{ programs }, progress] = await Promise.all([
      apiFetch<{ programs: any[] }>(`/programs${listLimit}`),
      // The programme row carries no average progress; the enrolment rollup on
      // the dashboard is where that number actually comes from.
      apiFetch<{ avgProgressByProgram: { programId: string; percent: number }[] }>(
        '/academy-insights/dashboard',
      ).catch(() => ({ avgProgressByProgram: [] })),
    ])
    const byProgram = new Map(progress.avgProgressByProgram.map((row) => [row.programId, row.percent]))
    return programs.map((program) => {
      const course = toCourse(program)
      course.avgProgress = byProgram.get(course.id) ?? 0
      return course
    })
  },

  /** GET /programs/:id */
  async getCourse(id: string): Promise<Course | null> {
    try {
      return toCourse(await apiFetch<any>(`/programs/${id}`))
    } catch {
      return null
    }
  },

  /** PATCH /programs/:id */
  async saveCourse(course: Course): Promise<Course> {
    return toCourse(
      await apiFetch<any>(`/programs/${course.id}`, {
        method: 'PATCH',
        body: toProgramBody(course),
      }),
    )
  },

  /** POST /programs */
  async createCourse(): Promise<Course> {
    const instructors = await this.listInstructors()
    return toCourse(
      await apiFetch<any>('/programs', {
        method: 'POST',
        body: {
          title: 'Khóa học mới',
          status: 'draft',
          kind: 'course',
          mode: 'online',
          topic: 'anatomy',
          level: 'Cơ bản — không cần kiến thức nền',
          price: 0,
          instructorId: instructors[0]?.id ?? null,
          outcomes: [],
          skills: [],
          modules: [],
          faq: [],
        },
      }),
    )
  },

  /** GET /instructors */
  async listInstructors(): Promise<Instructor[]> {
    const { instructors } = await apiFetch<{ instructors: any[] }>(`/instructors${listLimit}`)
    return instructors.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role || '',
      bio: row.bio || '',
      initials: initialsOf(row.name),
    }))
  },

  // ── Learners & enrolments ──────────────────────────────────────────
  /** GET /learners */
  async listLearners(): Promise<Array<Learner & { courses: number; avgPercent: number }>> {
    const [{ learners }, { enrolments }] = await Promise.all([
      apiFetch<{ learners: any[] }>(`/learners${listLimit}`),
      apiFetch<{ enrolments: any[] }>(`/enrolments${listLimit}`),
    ])

    const byLearner = new Map<string, { count: number; total: number }>()
    for (const row of enrolments) {
      if (row.status === 'revoked') continue
      const entry = byLearner.get(row.learnerId) || { count: 0, total: 0 }
      entry.count += 1
      entry.total += Number(row.percent) || 0
      byLearner.set(row.learnerId, entry)
    }

    return learners.map((row) => {
      const stats = byLearner.get(row.id)
      return {
        ...toLearner(row),
        courses: stats?.count ?? 0,
        avgPercent: stats?.count ? Math.round(stats.total / stats.count) : 0,
      }
    })
  },

  /** GET /learners/:id, plus everything the detail page shows about them. */
  async getLearner(id: string) {
    const learner = await apiFetch<any>(`/learners/${id}`).catch(() => null)
    if (!learner) return null

    const [{ enrolments }, { certificates }, { progress }] = await Promise.all([
      apiFetch<{ enrolments: any[] }>(`/enrolments?learnerId=${id}&limit=500`),
      apiFetch<{ certificates: any[] }>(`/certificates?learnerId=${id}&limit=500`),
      apiFetch<{ progress: any[] }>(`/lesson-progress?learnerId=${id}&limit=500`),
    ])

    return {
      learner: toLearner(learner),
      enrolments: enrolments.map((row) => ({
        ...toEnrolment(row),
        courseTitle: row.programTitle || '—',
      })),
      certificates: certificates.map(toCertificate),
      progress: progress.map(toProgress),
    }
  },

  /** PATCH /learners/:id */
  async saveLearnerNote(id: string, note: string): Promise<void> {
    await apiFetch(`/learners/${id}`, { method: 'PATCH', body: { note } })
  },

  /**
   * POST /enrolments/grant — the manual grant. This is the button that matters
   * while there is no checkout: money arrives by bank transfer, an instructor
   * opens the learner and grants the course.
   */
  async grantAccess(learnerId: string, courseId: string): Promise<Enrolment> {
    return toEnrolment(
      await apiFetch<any>('/enrolments/grant', {
        method: 'POST',
        body: { learnerId, programId: courseId, source: 'manual' },
      }),
    )
  },

  /** POST /enrolments/:id/revoke — keeps the row, and the progress on it. */
  async revokeAccess(enrolmentId: string): Promise<void> {
    await apiFetch(`/enrolments/${enrolmentId}/revoke`, { method: 'POST', body: {} })
  },

  // ── Sessions ───────────────────────────────────────────────────────
  /**
   * GET /program-sessions — the register comes inlined on each row.
   *
   * It used to be fetched per session, which made one screen with sixteen
   * sessions issue seventeen requests and trip the API's rate limit on its own.
   */
  async listSessions(): Promise<CourseSession[]> {
    const { sessions } = await apiFetch<{ sessions: any[] }>(`/program-sessions${listLimit}`)
    return sessions.map((row) => toSession(row, row.attendeeIds || []))
  },

  /** POST|PATCH /program-sessions */
  async saveSession(next: CourseSession): Promise<void> {
    const body = toSessionBody(next)
    if (next.id) await apiFetch(`/program-sessions/${next.id}`, { method: 'PATCH', body })
    else await apiFetch('/program-sessions', { method: 'POST', body })
  },

  /** POST /program-sessions/:id/attendance — toggles one learner. */
  async toggleAttendance(sessionId: string, learnerId: string): Promise<void> {
    await apiFetch(`/program-sessions/${sessionId}/attendance`, {
      method: 'POST',
      body: { learnerId },
    })
  },

  /** Attendee list as CSV — Excel opens this directly. */
  async attendeesCsv(session: CourseSession): Promise<string> {
    const { attendees } = await apiFetch<{
      attendees: { name: string; email: string; phone: string }[]
    }>(`/program-sessions/${session.id}/attendees`)

    const header = ['Học viên', 'Email', 'Điện thoại', 'Ngày', 'Địa điểm']
    const rows = attendees.map((a) => [
      a.name,
      a.email || '',
      a.phone || '',
      session.date,
      session.location,
    ])
    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
  },

  // ── Certificates ───────────────────────────────────────────────────
  /** GET /certificates */
  async listCertificates(): Promise<Certificate[]> {
    const { certificates } = await apiFetch<{ certificates: any[] }>(`/certificates${listLimit}`)
    return certificates.map(toCertificate)
  },

  /** POST /certificates */
  async issueCertificate(learnerId: string, courseId: string): Promise<Certificate | null> {
    const [learner, course] = await Promise.all([
      apiFetch<any>(`/learners/${learnerId}`).catch(() => null),
      apiFetch<any>(`/programs/${courseId}`).catch(() => null),
    ])
    if (!learner || !course) return null

    // The code is printed, quoted over the phone and typed into a verify page,
    // so it is generated once here and never derived from a database id.
    const code = `${course.slug.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now()
      .toString(36)
      .slice(-4)
      .toUpperCase()}`

    return toCertificate(
      await apiFetch<any>('/certificates', {
        method: 'POST',
        body: {
          code,
          learnerId,
          learnerName: learner.name,
          programId: courseId,
          programTitle: course.title,
          issuedAt: TODAY,
          status: 'valid',
          verifyUrl: `https://stretch.vn/verify/${code}`,
        },
      }),
    )
  },

  /** POST /certificates/:id/revoke — the record survives the revocation. */
  async revokeCertificate(id: string): Promise<void> {
    await apiFetch(`/certificates/${id}/revoke`, { method: 'POST', body: {} })
  },

  // ── Reviews ────────────────────────────────────────────────────────
  /** GET /reviews */
  async listReviews(): Promise<Review[]> {
    const { reviews } = await apiFetch<{ reviews: any[] }>(`/reviews${listLimit}`)
    return reviews.map((row) => ({
      id: row.id,
      learnerId: row.learnerId || '',
      learnerName: row.learnerName || '',
      courseId: row.programId,
      courseTitle: row.programTitle || '',
      rating: Number(row.rating) || 0,
      text: row.text || '',
      status: row.status,
      createdAt: String(row.createdAt || '').slice(0, 10),
    }))
  },

  /** PATCH /reviews/:id */
  async setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
    await apiFetch(`/reviews/${id}`, { method: 'PATCH', body: { status } })
  },

  // ── Media ──────────────────────────────────────────────────────────
  /**
   * GET /videos — the R2 uploads, in the shape the syllabus screens expect.
   *
   * The uploader itself lives in `services/videos.ts`; this is the read the
   * course editor uses to answer "does this lesson have a file behind it".
   */
  async listMedia(): Promise<MediaAsset[]> {
    const { videos } = await apiFetch<{ videos: any[] }>(`/videos${listLimit}`)
    return videos.map((video) => ({
      id: video.id,
      key: video.objectKey,
      courseId: null,
      lessonId: null,
      sizeBytes: Number(video.sizeBytes) || 0,
      durationSeconds: Number(video.durationSeconds) || 0,
      // R2 stores the file, not its pixel dimensions; the console measures those
      // in the browser at upload time and does not persist them.
      width: 0,
      height: 0,
      uploadedAt: String(video.createdAt || '').slice(0, 10),
      posterKey: null,
    }))
  },

  /** DELETE /videos/:id — removes the object from R2 as well as the row. */
  async deleteMedia(id: string): Promise<void> {
    await apiFetch(`/videos/${id}`, { method: 'DELETE' })
  },

  // ── Reports ────────────────────────────────────────────────────────
  /** GET /academy-insights/dashboard */
  async getDashboard(): Promise<DashboardSummary> {
    const [summary, dropOff] = await Promise.all([
      apiFetch<any>('/academy-insights/dashboard'),
      this.getDropOff(),
    ])

    return {
      activeLearners: summary.activeLearners,
      newEnrolmentsThisWeek: summary.newEnrolmentsThisWeek,
      enrolmentsByWeek: summary.enrolmentsByWeek,
      avgProgressByCourse: summary.avgProgressByProgram.map((row: any) => ({
        courseId: row.programId,
        title: row.title,
        percent: row.percent,
      })),
      upcomingSessions: summary.upcomingSessions.map((row: any) =>
        toSession({ ...row, time: row.time || '' }),
      ),
      dropOff: dropOff.slice(0, 5),
      pendingReviews: summary.pendingReviews,
      certificatesThisMonth: summary.certificatesThisMonth,
    }
  },

  /** GET /academy-insights/drop-off */
  async getDropOff(): Promise<DropOffRow[]> {
    const { dropOff } = await apiFetch<{ dropOff: any[] }>('/academy-insights/drop-off')
    return dropOff.map((row) => ({
      lessonId: `m${row.moduleIndex}-l${row.itemIndex}`,
      courseId: row.programId,
      courseTitle: row.programTitle,
      moduleTitle: row.moduleTitle || '',
      lessonTitle: row.lessonTitle || '',
      dropRate: row.dropRate,
      medianStopSecond: row.medianStopSecond,
      durationSeconds: row.durationSeconds,
      starts: row.starts,
    }))
  },

  /** GET /academy-insights/quiz-misses */
  async getQuizMisses(): Promise<QuizMissRow[]> {
    const { quizMisses } = await apiFetch<{ quizMisses: any[] }>('/academy-insights/quiz-misses')
    return quizMisses.map((row) => ({
      questionId: row.questionId,
      courseTitle: row.programTitle,
      lessonTitle: row.lessonTitle || '',
      question: row.question,
      attempts: row.attempts,
      missRate: row.missRate,
    }))
  },
}

// ── Row mappers used by more than one call ───────────────────────────

function toLearner(row: any): Learner {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    google: !!row.google,
    joinedAt: String(row.joinedAt || '').slice(0, 10),
    lastActiveAt: String(row.lastActiveAt || '').slice(0, 10),
    note: row.note || '',
  }
}

function toCertificate(row: any): Certificate {
  return {
    id: row.id,
    code: row.code,
    learnerId: row.learnerId,
    learnerName: row.learnerName || '',
    courseId: row.programId,
    courseTitle: row.programTitle || '',
    issuedAt: String(row.issuedAt || '').slice(0, 10),
    revokedAt: row.revokedAt ? String(row.revokedAt).slice(0, 10) : null,
  }
}

function toProgress(row: any): LessonProgress {
  return {
    learnerId: row.learnerId,
    courseId: row.programId,
    lessonId: `m${row.moduleIndex}-l${row.itemIndex}`,
    watchedSeconds: Number(row.watchedSeconds) || 0,
    durationSeconds: Number(row.durationSeconds) || 0,
    completedAt: row.completedAt ? String(row.completedAt).slice(0, 10) : null,
  }
}

/** "Nguyễn Hải Đăng" → "NĐ". */
function initialsOf(name: string): string {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0]![0]!
  const last = words.length > 1 ? words[words.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}

// ── Date helpers the views import ────────────────────────────────────

/** yyyy-mm-dd ± days, without pulling in a date library. */
export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y!, m! - 1, d! + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** The Monday of the week a date falls in, as `dd/mm`. */
export function weekLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y!, m! - 1, d!)
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return `${String(monday.getDate()).padStart(2, '0')}/${String(monday.getMonth() + 1).padStart(2, '0')}`
}

export { joinTime }
