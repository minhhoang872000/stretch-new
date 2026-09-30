/**
 * Learning Hub catalogue — the unified list behind /learning-hub/programs.
 *
 * Self-paced courses and scheduled workshops are one browsable list here even
 * though they stay separate records in the backend: a visitor shopping for
 * "shoulder rehab" does not care which of the two it is. An item shows lesson
 * counts when it is self-paced and a date + place when it is scheduled.
 *
 * PLACEHOLDER DATA — same arrangement as `useLearningHub`: both language
 * variants live inline instead of in i18n/locales, which would otherwise carry
 * a key per catalogue item. Swap `PROGRAMS` for a `$fetch` when the courses API
 * exists and keep the returned shape.
 */

export type ProgramKind = 'course' | 'mini' | 'workshop'
export type ProgramMode = 'online' | 'offline'
export type ProgramTopic = 'anatomy' | 'assessment' | 'sports' | 'functional'
export type ProgramSort = 'newest' | 'price_asc' | 'price_desc'

export interface CatalogProgram {
  slug: string
  kind: ProgramKind
  mode: ProgramMode
  topic: ProgramTopic
  title: string
  image: string
  /** 0 = free */
  price: number
  /** Self-paced items: lesson count + total length. */
  lessons?: number
  duration?: string
  /** Learners enrolled so far (API only; the fallback list has none). */
  enrolled?: number
  /** Seats still open in the next session (scheduled items). */
  seatsLeft?: number
  /** The instructor's name, from the API. */
  instructor?: string
  /** Scheduled items: start date, hours and place. */
  date?: string
  time?: string
  location?: string
}

export const PROGRAMS_PER_PAGE = 8

export function useLearningCatalog() {
  // The Learning Hub ships in Vietnamese only (2026-08): its audience is local
  // practitioners, and half-translated course copy reads worse than none. The
  // English strings below stay as `pick()`'s second argument — restoring the
  // translation means restoring the locale check here, nothing else.
  const pick = (viText: string, _enText: string) => viText

  function formatPrice(value: number): string {
    if (value <= 0) return pick('Miễn phí', 'Free')
    return `${value.toLocaleString('vi-VN')}đ`
  }

  /**
   * The catalogue, from the API.
   *
   * `useAsyncData` with a fixed key so every component that calls this composable
   * shares one request and one SSR payload — the card, the panel and the filter
   * bar all call it, and three fetches for one list would be three.
   *
   * No placeholder catalogue. There used to be a hand-written FALLBACK list
   * shown whenever this came back empty — which on production meant invented
   * courses, dates, seats and instructors ("Phục hồi vai toàn diện", "Lê Thanh
   * Duy") whenever the payload was missing or the API blinked. The catalogue is
   * real data now: an empty answer renders as empty.
   *
   * Pages that server-render the list must `await ready` so the data is in the
   * SSR payload; otherwise the client hydrates with nothing to show.
   */
  const catalog = useAsyncData(
    'learning-catalog',
    () => $fetch<{ programs: CatalogProgram[] }>('/api/programs'),
    { default: () => ({ programs: [] as CatalogProgram[] }) },
  )
  const { data } = catalog
  /** Await in a page's setup to render with the catalogue in the SSR payload. */
  const ready = catalog.then(() => undefined)

  const programs = computed<CatalogProgram[]>(() => data.value?.programs ?? [])

  /** Facet counts come from the whole catalogue, not the filtered slice —
      otherwise every option would read 0 as soon as a filter narrowed things. */
  function countBy<K extends keyof CatalogProgram>(field: K, value: CatalogProgram[K]) {
    return programs.value.filter((p) => p[field] === value).length
  }

  const counts = computed(() => ({
    total: programs.value.length,
    kind: {
      course: countBy('kind', 'course'),
      mini: countBy('kind', 'mini'),
      workshop: countBy('kind', 'workshop'),
    },
    mode: {
      online: countBy('mode', 'online'),
      offline: countBy('mode', 'offline'),
    },
    topic: {
      anatomy: countBy('topic', 'anatomy'),
      assessment: countBy('topic', 'assessment'),
      sports: countBy('topic', 'sports'),
      functional: countBy('topic', 'functional'),
    },
  }))

  return { programs, counts, formatPrice, PROGRAMS_PER_PAGE, ready }
}

/**
 * Saved programmes ("Đã lưu").
 *
 * Signed in, the list lives on the account (`/api/me/saved`) and follows the
 * learner across devices; signed out, it lives in this browser. localStorage
 * stays underneath either way as the instant-render cache.
 *
 * The first sign-in on a browser merges that browser's list up into the
 * account, so bookmarks made before signing in are kept. After that the
 * account is authoritative — otherwise a programme un-saved on the phone would
 * be put back by the laptop's stale copy. The marker remembers which account
 * the merge was for; another account signing in on the same browser takes its
 * own list rather than inheriting the previous person's.
 */
const SAVED_KEY = 'stretch:saved-programs'
const SAVED_MERGED_KEY = 'stretch:saved-merged'

export function useSavedPrograms() {
  const saved = useState<string[]>('saved-programs', () => [])
  /** idle → loading → done, once per page load across every card that asks. */
  const syncState = useState<'idle' | 'loading' | 'done'>('saved-sync', () => 'idle')
  const { t } = useI18n()
  const { notify } = useNotification()
  const { loggedIn, learner, whenReady } = useHubSession()

  function writeLocal() {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved.value))
    } catch {
      // storage full or blocked — the in-memory list still works this session
    }
  }

  async function syncAccount() {
    if (syncState.value !== 'idle') return
    syncState.value = 'loading'
    await whenReady()
    if (!loggedIn.value) {
      syncState.value = 'done'
      return
    }
    const who = String(learner.value?.email || '')
    let mergedFor = ''
    try {
      mergedFor = localStorage.getItem(SAVED_MERGED_KEY) || ''
    } catch {}
    try {
      const res =
        !mergedFor && saved.value.length
          ? await $fetch<{ slugs: string[] }>('/api/me/saved', { method: 'PUT', body: { slugs: saved.value } })
          : await $fetch<{ slugs: string[] }>('/api/me/saved')
      saved.value = Array.isArray(res?.slugs) ? res.slugs : []
      writeLocal()
      try {
        localStorage.setItem(SAVED_MERGED_KEY, who || '1')
      } catch {}
    } catch {
      // API unreachable: carry on with the local list this visit.
    }
    syncState.value = 'done'
  }

  onMounted(() => {
    if (syncState.value !== 'done') {
      try {
        const raw = localStorage.getItem(SAVED_KEY)
        if (raw) saved.value = JSON.parse(raw)
      } catch {
        // corrupted or unavailable storage — start from an empty list
      }
    }
    void syncAccount()
  })

  /**
   * Save or un-save, and say so: a bookmark that silently flips an icon left
   * people unsure it worked. Pass the title for a more specific toast.
   */
  function toggle(slug: string, title?: string) {
    const wasSaved = saved.value.includes(slug)
    saved.value = wasSaved ? saved.value.filter((s) => s !== slug) : [...saved.value, slug]
    if (wasSaved) notify(title ? t('learning.saved.toast_removed', { title }) : t('learning.saved.toast_removed_generic'), 'info')
    else notify(title ? t('learning.saved.toast_saved', { title }) : t('learning.saved.toast_saved_generic'), 'success')
    writeLocal()
    if (loggedIn.value) {
      const request = wasSaved
        ? $fetch(`/api/me/saved/${encodeURIComponent(slug)}`, { method: 'DELETE' })
        : $fetch('/api/me/saved', { method: 'PUT', body: { slugs: [slug] } })
      // The local list already changed; the account catches up on the next load.
      request.catch(() => {})
    }
  }

  const isSaved = (slug: string) => saved.value.includes(slug)

  return { saved, toggle, isSaved, synced: computed(() => syncState.value === 'done' && loggedIn.value) }
}
