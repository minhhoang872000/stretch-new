/**
 * A learner's position inside one course: which lessons are finished, where
 * each video stopped, and the notes they typed against each one.
 *
 * The account is the source of truth: signed in, everything is read from and
 * written to the API (`/api/me/progress/:slug` → `lesson_progress`), so a
 * lesson started on a phone resumes on a laptop. localStorage stays underneath
 * as a cache — the player renders from it instantly on load, and it keeps
 * working through a network blip — and whatever it holds from before the
 * account sync existed is merged up on the first load, not lost.
 *
 * Writes are queued per lesson and sent in one batch a couple of seconds after
 * the last change (and at once when the tab is hidden), so a playhead reported
 * twice a second is one request every few seconds, not a stream.
 *
 * Lesson keys are `moduleIndex-itemIndex` — stable as long as the syllabus is
 * not reordered, the same address the API stores.
 */

const progressKey = (slug: string) => `stretch:course-progress:${slug}`
const notesKey = (slug: string) => `stretch:course-notes:${slug}`
const positionKey = (slug: string) => `stretch:course-positions:${slug}`
/** Set once this browser's local copy has been merged into an account. */
const mergedKey = (slug: string) => `stretch:course-merged:${slug}`

/** Where the learner stopped in a video lesson, in seconds. */
export interface LessonPosition {
  t: number
  d: number
}

/** Watched this far and the lesson counts as done — the last stretch is credits
    and goodbyes, and nobody should have to sit through it to get the tick. */
export const WATCHED_THRESHOLD = 90

export const lessonKey = (moduleIndex: number, itemIndex: number) => `${moduleIndex}-${itemIndex}`

export interface EnrolmentState {
  status: string
  percent: number
  certificate: string | null
}

interface LessonWrite {
  moduleIndex: number
  itemIndex: number
  lessonTitle?: string
  positionSeconds?: number
  watchedSeconds?: number
  durationSeconds?: number
  done?: boolean
  note?: string
}

interface ServerProgress {
  lessons: { key: string; done: boolean; t: number; d: number; note: string }[]
  enrolment: EnrolmentState | null
}

const FLUSH_DELAY = 2500

export function useCourseProgress(slug: string, options: { titleFor?: (key: string) => string } = {}) {
  // useState (not a module-level ref) so two learners rendered by the same
  // server process cannot see each other's progress.
  const done = useState<string[]>(`course-progress-${slug}`, () => [])
  const notes = useState<Record<string, string>>(`course-notes-${slug}`, () => ({}))
  const positions = useState<Record<string, LessonPosition>>(`course-positions-${slug}`, () => ({}))
  const enrolment = useState<EnrolmentState | null>(`course-enrolment-${slug}`, () => null)

  const { loggedIn, whenReady } = useHubSession()

  /** localStorage is client-only; until this flips, treat the course as fresh. */
  const ready = ref(false)
  /** True once the account's copy has been loaded — the copy under the player
      can then say "saved to your account" instead of "on this device". */
  const synced = ref(false)

  // ── Local cache ────────────────────────────────────────────────────
  function readLocal() {
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
  }

  function persist() {
    try {
      localStorage.setItem(progressKey(slug), JSON.stringify(done.value))
      localStorage.setItem(notesKey(slug), JSON.stringify(notes.value))
      localStorage.setItem(positionKey(slug), JSON.stringify(positions.value))
    } catch {
      // Full or blocked storage — the in-memory state still works this session.
    }
  }

  // ── Account queue ──────────────────────────────────────────────────
  const queue = new Map<string, LessonWrite>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let sending: Promise<void> | null = null
  /** The account refused (403: previewing a free lesson of a course not
      bought). Stop sending for this visit — the local copy still works. */
  let refused = false

  function enqueue(key: string, patch: Partial<LessonWrite>) {
    if (!import.meta.client) return
    const [mi, ii] = key.split('-').map((n) => Number(n) || 0)
    const prev = queue.get(key) ?? { moduleIndex: mi!, itemIndex: ii! }
    const title = options.titleFor?.(key)
    queue.set(key, { ...prev, ...patch, ...(title ? { lessonTitle: title } : {}) })
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void send(), FLUSH_DELAY)
  }

  /** Send what is queued. On failure the writes go back in the queue (newer
      changes made meanwhile win) and ride along with the next batch. */
  async function send(keepalive = false) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (!loggedIn.value || refused || !queue.size) return
    if (sending && !keepalive) {
      await sending
      if (!queue.size) return
    }
    const batch = [...queue.entries()]
    queue.clear()
    const body = JSON.stringify({ lessons: batch.map(([, w]) => w) })

    if (keepalive) {
      // The tab is going away; `$fetch` would be cancelled with it.
      try {
        fetch(`/api/me/progress/${encodeURIComponent(slug)}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body,
          keepalive: true,
          credentials: 'same-origin',
        })
      } catch {
        // nothing more can be done from an unloading page
      }
      return
    }

    sending = $fetch<{ enrolment: EnrolmentState | null }>(`/api/me/progress/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: { lessons: batch.map(([, w]) => w) },
    })
      .then((res) => {
        if (res?.enrolment) enrolment.value = { ...enrolment.value, ...res.enrolment } as EnrolmentState
      })
      .catch((err: any) => {
        if (err?.statusCode === 403 || err?.response?.status === 403) {
          refused = true
          queue.clear()
          return
        }
        for (const [key, w] of batch) queue.set(key, { ...w, ...(queue.get(key) ?? {}) })
      })
      .finally(() => {
        sending = null
      })
    await sending
  }

  /**
   * Merge the account's copy with this browser's. Ticks are a union — a tick
   * earned anywhere counts. A playhead takes whichever is further along. A note
   * takes the account's unless it is empty there. Whatever this browser knew
   * that the account did not is queued up, which is how progress made before
   * the account sync existed arrives on the account.
   */
  function mergeServer(server: ServerProgress) {
    const serverDone = new Set(server.lessons.filter((l) => l.done).map((l) => l.key))
    const serverBy = new Map(server.lessons.map((l) => [l.key, l]))

    // After the first merge the account is authoritative for ticks: a lesson
    // un-ticked on another device must not be revived by this browser's cache.
    let firstMerge = true
    try {
      firstMerge = !localStorage.getItem(mergedKey(slug))
    } catch {}
    if (firstMerge) {
      for (const key of done.value) {
        if (!serverDone.has(key)) enqueue(key, { done: true })
      }
      done.value = [...new Set([...done.value, ...serverDone])]
      try {
        localStorage.setItem(mergedKey(slug), '1')
      } catch {}
    } else {
      // Ticks still waiting in this tab's queue are newer than the server's copy.
      const pending = [...queue.entries()].filter(([, w]) => typeof w.done === 'boolean')
      const merged = new Set(serverDone)
      for (const [key, w] of pending) w.done ? merged.add(key) : merged.delete(key)
      done.value = [...merged]
    }

    const mergedPos: Record<string, LessonPosition> = { ...positions.value }
    for (const l of server.lessons) {
      const local = mergedPos[l.key]
      if (l.t > 0 && (!local || l.t >= local.t)) mergedPos[l.key] = { t: l.t, d: l.d || local?.d || 0 }
    }
    for (const [key, pos] of Object.entries(positions.value)) {
      const remote = serverBy.get(key)
      if (pos.t > 0 && (!remote || pos.t > remote.t)) {
        enqueue(key, { positionSeconds: pos.t, watchedSeconds: pos.t, durationSeconds: pos.d })
      }
    }
    positions.value = mergedPos

    const mergedNotes: Record<string, string> = { ...notes.value }
    for (const l of server.lessons) if (l.note) mergedNotes[l.key] = l.note
    for (const [key, text] of Object.entries(notes.value)) {
      if (text && !serverBy.get(key)?.note) enqueue(key, { note: text })
    }
    notes.value = mergedNotes

    enrolment.value = server.enrolment
    persist()
  }

  async function loadAccount() {
    await whenReady()
    if (!loggedIn.value) return
    try {
      const server = await $fetch<ServerProgress>(`/api/me/progress/${encodeURIComponent(slug)}`)
      mergeServer(server)
      synced.value = true
      if (queue.size) void send()
    } catch {
      // Not enrolled yet (a free course enrols on the first write) or the API
      // is unreachable: the local copy carries on, and writes still try.
    }
  }

  function onHide() {
    if (document.visibilityState === 'hidden') {
      flushPositions()
      void send(true)
    }
  }

  onMounted(() => {
    readLocal()
    ready.value = true
    void loadAccount()
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', onHide)
    flushPositions()
    void send()
  })

  // ── Ticks ──────────────────────────────────────────────────────────
  const isDone = (key: string) => done.value.includes(key)

  function markDone(key: string) {
    if (isDone(key)) return
    done.value = [...done.value, key]
    persist()
    enqueue(key, { done: true })
  }

  function toggleDone(key: string) {
    const next = !isDone(key)
    done.value = next ? [...done.value, key] : done.value.filter((k) => k !== key)
    persist()
    enqueue(key, { done: next })
  }

  // ── Notes ──────────────────────────────────────────────────────────
  function setNote(key: string, text: string) {
    notes.value = { ...notes.value, [key]: text }
    persist()
    enqueue(key, { note: text })
  }

  const noteFor = (key: string) => notes.value[key] ?? ''

  // ── Playhead ───────────────────────────────────────────────────────
  /**
   * Written twice a second by the player, so it is kept in memory and only
   * flushed to storage (and queued for the account) every few seconds.
   */
  let lastFlush = 0
  const dirtyPositions = new Set<string>()

  function flushPositions() {
    for (const key of dirtyPositions) {
      const pos = positions.value[key]
      if (pos) enqueue(key, { positionSeconds: pos.t, watchedSeconds: pos.t, durationSeconds: pos.d })
    }
    dirtyPositions.clear()
    persist()
  }

  function setPosition(key: string, t: number, d: number) {
    positions.value[key] = { t: Math.round(t), d: Math.round(d) }
    dirtyPositions.add(key)
    const now = performance.now()
    if (now - lastFlush < 5000) return
    lastFlush = now
    flushPositions()
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
    flushPositions()
  }

  /** Rounded to whole percent — a progress bar that reads "63.6%" is noise. */
  function percent(total: number) {
    if (!total) return 0
    return Math.round((done.value.length / total) * 100)
  }

  /** Start over: ticks and playheads cleared here and on the account. Notes
      stay — they are the learner's own writing, not progress. */
  async function reset() {
    queue.clear()
    done.value = []
    positions.value = {}
    persist()
    if (loggedIn.value) {
      try {
        await $fetch(`/api/me/progress/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      } catch {
        // The account keeps its copy; the next load merges it back.
      }
    }
  }

  return {
    done, ready, synced, enrolment, isDone, markDone, toggleDone,
    setNote, noteFor,
    setPosition, positionFor, resumeSeconds, flush,
    percent, reset,
    /** Send queued writes now — e.g. right after the last lesson, so the
        account marks the course completed before the review box asks. */
    sync: () => send(),
  }
}
