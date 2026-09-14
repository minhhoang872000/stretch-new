/**
 * The signed-in learner's enrolments, from `/api/me/courses`.
 *
 * The learner is resolved on the server from the Google session — this
 * composable never sends an id, and there is none to send. A signed-out
 * visitor gets two empty lists rather than an error, because the pages that
 * read this (the account page, the course page's "you already own this"
 * state) render for guests too.
 */

export interface ActiveEnrolment {
  slug: string
  title: string
  image: string
  mode: 'online' | 'offline'
  lesson: number
  lessons: number
  /** 0–100, kept alongside the lesson counter because a lesson is not a
      uniform unit of work — a 20-minute video and a quiz both count as one. */
  percent: number
  nextLesson: string
  timeLeft: string
  updatedAt: string
  /** Where to drop them back in; null before they have opened anything. */
  resume: { moduleIndex: number; itemIndex: number; ordinal: number | null; title: string } | null
}

export interface CompletedEnrolment {
  slug: string
  title: string
  image: string
  completedAt: string
  certificateCode: string
}

export function useMyLearning() {
  const { loggedIn } = useUserSession()

  /**
   * Keyed on the session, so signing in or out refetches rather than showing
   * the previous state. `immediate` is off for guests: an unauthenticated call
   * would only ever 401.
   */
  const { data, refresh } = useAsyncData(
    'my-learning',
    () => $fetch<{ active: ActiveEnrolment[]; completed: CompletedEnrolment[] }>('/api/me/courses'),
    {
      immediate: loggedIn.value,
      watch: [loggedIn],
      default: () => ({ active: [] as ActiveEnrolment[], completed: [] as CompletedEnrolment[] }),
    },
  )

  const active = computed<ActiveEnrolment[]>(() => (loggedIn.value ? data.value?.active ?? [] : []))
  const completed = computed<CompletedEnrolment[]>(() =>
    loggedIn.value ? data.value?.completed ?? [] : [],
  )

  /** Call after finishing a lesson so the counters on other screens catch up. */
  const reload = () => refresh()

  return { active, completed, reload }
}
