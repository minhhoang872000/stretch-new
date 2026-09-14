/**
 * A learner's position inside one course: which lessons are finished, and the
 * notes they typed against each one.
 *
 * localStorage, not an API — there is no enrolment backend yet. This is the one
 * part of the player that has to survive a reload to be worth using at all, so
 * it is wired for real rather than mocked: tick a lesson, reload, it is still
 * ticked. When the enrolment API lands, swap the two `read`/`persist` pairs for
 * `$fetch` and nothing else in the player changes.
 *
 * Progress is keyed per course and per lesson, where a lesson key is
 * `moduleIndex-itemIndex` — stable as long as the syllabus does not get
 * reordered, which is exactly the guarantee a server-side lesson id would give.
 */

const progressKey = (slug: string) => `stretch:course-progress:${slug}`
const notesKey = (slug: string) => `stretch:course-notes:${slug}`
const positionKey = (slug: string) => `stretch:course-positions:${slug}`

/** Where the learner stopped in a video lesson, in seconds. */
export interface LessonPosition {
  t: number
  d: number
}

/** Watched this far and the lesson counts as done — the last stretch is credits
    and goodbyes, and nobody should have to sit through it to get the tick. */
export const WATCHED_THRESHOLD = 90

export const lessonKey = (moduleIndex: number, itemIndex: number) => `${moduleIndex}-${itemIndex}`

export function useCourseProgress(slug: string) {
  // useState (not a module-level ref) so two learners rendered by the same
  // server process cannot see each other's progress.
  const done = useState<string[]>(`course-progress-${slug}`, () => [])
  const notes = useState<Record<string, string>>(`course-notes-${slug}`, () => ({}))
  const positions = useState<Record<string, LessonPosition>>(`course-positions-${slug}`, () => ({}))

  /** localStorage is client-only; until this flips, treat the course as fresh. */
  const ready = ref(false)

  onMounted(() => {
    try {
      const rawDone = localStorage.getItem(progressKey(slug))
      if (rawDone) done.value = JSON.parse(rawDone)
      const rawNotes = localStorage.getItem(notesKey(slug))
      if (rawNotes) notes.value = JSON.parse(rawNotes)
      const rawPos = localStorage.getItem(positionKey(slug))
      if (rawPos) positions.value = JSON.parse(rawPos)
    } catch {
      // Corrupt or blocked storage — start clean rather than break the player.
    }
    ready.value = true
  })

  function persist() {
    try {
      localStorage.setItem(progressKey(slug), JSON.stringify(done.value))
      localStorage.setItem(notesKey(slug), JSON.stringify(notes.value))
      localStorage.setItem(positionKey(slug), JSON.stringify(positions.value))
    } catch {
      // Full or blocked storage — the in-memory state still works this session.
    }
  }

  const isDone = (key: string) => done.value.includes(key)

  function markDone(key: string) {
    if (isDone(key)) return
    done.value = [...done.value, key]
    persist()
  }

  function toggleDone(key: string) {
    done.value = isDone(key) ? done.value.filter((k) => k !== key) : [...done.value, key]
    persist()
  }

  function setNote(key: string, text: string) {
    notes.value = { ...notes.value, [key]: text }
    persist()
  }

  const noteFor = (key: string) => notes.value[key] ?? ''

  /**
   * The playhead of a video lesson. Written twice a second by the player, so it
   * is kept in memory and only flushed to storage every few seconds — otherwise
   * a 15-minute lesson would mean ~1,800 localStorage writes.
   */
  let lastFlush = 0

  function setPosition(key: string, t: number, d: number) {
    positions.value[key] = { t: Math.round(t), d: Math.round(d) }
    const now = performance.now()
    if (now - lastFlush < 5000) return
    lastFlush = now
    persist()
  }

  const positionFor = (key: string) => positions.value[key] ?? null

  /** Resume a second early — landing mid-word is worse than a tiny replay. And
      never resume a lesson that was watched to the end; that restarts it. */
  function resumeSeconds(key: string) {
    const pos = positionFor(key)
    if (!pos || pos.d <= 0) return 0
    if ((pos.t / pos.d) * 100 >= WATCHED_THRESHOLD) return 0
    return Math.max(0, pos.t - 1)
  }

  /** Flush whatever the player last reported — called when a lesson is left. */
  function flush() {
    lastFlush = 0
    persist()
  }

  /** Rounded to whole percent — a progress bar that reads "63.6%" is noise. */
  function percent(total: number) {
    if (!total) return 0
    return Math.round((done.value.length / total) * 100)
  }

  /** Reset is offered in the UI because a stuck tick with no way back is worse
      than no tick at all while the backend is still a placeholder. */
  function reset() {
    done.value = []
    positions.value = {}
    persist()
  }

  return {
    done, ready, isDone, markDone, toggleDone,
    setNote, noteFor,
    setPosition, positionFor, resumeSeconds, flush,
    percent, reset,
  }
}
