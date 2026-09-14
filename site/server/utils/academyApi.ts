/**
 * Server-side reader for the Academy API.
 *
 * Lives on the server, not in a composable, for three reasons: the API base is
 * private runtime config, the catalogue needs two calls merged into one shape,
 * and a slow or dead API must degrade into an empty list rather than into a
 * page that throws during SSR.
 */

export interface ApiProgram {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  kind: string
  mode: string
  topic: string
  level: string
  language: string
  price: number
  status: string
  certificate: boolean
  instructorId: string | null
  image: string
  outcomes: string[]
  skills: string[]
  modules: { title: string; summary: string; items: any[]; minutes?: number }[]
  faq: { q: string; a: string }[]
  lessons: number
  minutes: number
  enrolled: number
  rating: number
  reviewCount: number
  publishedAt: string | null
}

export interface ApiSession {
  id: string
  programId: string
  date: string
  time: string
  location: string
  mode: string
  capacity: number
  booked: number
  seatsLeft: number
  seatStatus: 'open' | 'few' | 'full'
  status: 'done' | 'today' | 'upcoming'
}

function base(event: any): string {
  const config = useRuntimeConfig(event)
  return String(config.lessonApiBase || '').replace(/\/$/, '')
}

/**
 * One place that swallows API failures.
 *
 * The Learning Hub is a marketing surface: an API that is down should cost the
 * visitor a course list, not the whole page. Callers get an empty result and
 * decide what to render; the reason is logged once, here.
 */
async function read<T>(event: any, path: string, fallback: T): Promise<T> {
  const apiBase = base(event)
  if (!apiBase) return fallback
  try {
    const res = await $fetch<{ success: boolean; data?: T }>(`${apiBase}${path}`, { timeout: 6000 })
    return (res?.data as T) ?? fallback
  } catch (err: any) {
    console.error(`[academyApi] ${path} failed:`, err?.message || err)
    return fallback
  }
}

/** Published programmes only — the endpoint enforces that for anonymous callers. */
export async function fetchPrograms(event: any): Promise<ApiProgram[]> {
  const data = await read<{ programs: ApiProgram[] }>(event, '/programs?limit=200', { programs: [] })
  return data.programs || []
}

export async function fetchProgramBySlug(event: any, slug: string): Promise<ApiProgram | null> {
  const apiBase = base(event)
  if (!apiBase) return null
  try {
    const res = await $fetch<{ data?: ApiProgram }>(
      `${apiBase}/programs/slug/${encodeURIComponent(slug)}`,
      { timeout: 6000 },
    )
    return res?.data ?? null
  } catch {
    // A 404 here is an ordinary "no such course", not an incident.
    return null
  }
}

export async function fetchSessions(event: any): Promise<ApiSession[]> {
  const data = await read<{ sessions: ApiSession[] }>(event, '/program-sessions?limit=200', {
    sessions: [],
  })
  return data.sessions || []
}

export async function fetchApprovedReviews(event: any, programId: string) {
  const data = await read<{ reviews: any[] }>(event, `/reviews/public/${programId}`, { reviews: [] })
  return data.reviews || []
}

export async function fetchInstructor(event: any, id: string | null) {
  if (!id) return null
  const apiBase = base(event)
  if (!apiBase) return null
  try {
    const res = await $fetch<{ data?: any }>(`${apiBase}/instructors/${id}`, { timeout: 6000 })
    return res?.data ?? null
  } catch {
    return null
  }
}

// ── Shaping ──────────────────────────────────────────────────────────

/** `495` → `~8 giờ`, which is what the catalogue card prints. */
export function durationLabel(minutes: number): string {
  if (!minutes) return ''
  if (minutes < 60) return `~${minutes} phút`
  return `~${Math.round(minutes / 60)} giờ`
}

/** `2026-09-24` → `24/09/2026`, the form the cards are authored in. */
export function displayDate(iso: string): string {
  const [y, m, d] = String(iso || '').slice(0, 10).split('-')
  return d ? `${d}/${m}/${y}` : ''
}

/**
 * The next session for each programme.
 *
 * A programme can run many times; a catalogue card shows one date, and the one
 * a visitor cares about is the next one they could still attend. Past sessions
 * are skipped, and a programme whose dates have all passed falls back to
 * showing its lesson count instead — which is what a self-paced item shows.
 */
export function nextSessionByProgram(sessions: ApiSession[]): Map<string, ApiSession> {
  const out = new Map<string, ApiSession>()
  const upcoming = sessions
    .filter((s) => s.status !== 'done')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  for (const session of upcoming) {
    if (!out.has(session.programId)) out.set(session.programId, session)
  }
  return out
}
