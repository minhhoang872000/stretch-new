import { lessonVideo } from '~~/server/utils/lessonVideos'

/**
 * GET /api/lessons/video?slug=<program>&ordinal=<n>
 *
 * Where a lesson's video actually comes from. Two sources, checked in order:
 *
 *  1. **R2** — a file an instructor uploaded through the console. The API holds
 *     the mapping and mints a short-lived signed URL; this route asks for it with
 *     a service token *after* it has checked the learner is signed in, so the
 *     browser never talks to the video API directly and never sees the token.
 *  2. **YouTube** — the older path, ids kept in server/utils/lessonVideos.ts so
 *     they stay out of the page payload.
 *
 * Nothing here is cacheable: the signed URL is per-request and expires.
 */

interface LessonVideoResponse {
  kind: 'r2' | 'youtube' | 'none'
  /** R2: signed playback URL, valid until `expiresAt`. */
  url?: string
  expiresAt?: string
  contentType?: string
  durationSeconds?: number | null
  /** YouTube: the id the IFrame player needs. */
  id?: string
  /** YouTube: this is a borrowed demo video, not Stretch's own footage. */
  demo?: boolean
}

export default defineEventHandler(async (event): Promise<LessonVideoResponse> => {
  const query = getQuery(event)
  const slug = String(query.slug || '').trim()
  const ordinal = Number(query.ordinal)

  if (!slug || !Number.isInteger(ordinal) || ordinal < 0) {
    throw createError({ statusCode: 400, statusMessage: 'slug and ordinal are required' })
  }

  /**
   * Gate. Only a real Google session gets a playback URL. The moment enrolments
   * are real, this is the single place that has to check them: everything below
   * already assumes the caller has been vetted.
   */
  const session = await getUserSession(event)
  const signedIn = !!(session?.user as any)?.email
  if (!signedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to watch this lesson' })
  }

  setHeader(event, 'cache-control', 'no-store')

  const config = useRuntimeConfig(event)
  const apiBase = String(config.lessonApiBase || '').replace(/\/$/, '')
  const serviceToken = String(config.siteServiceToken || '')

  // ── 1. An uploaded file in R2 wins over the YouTube fallback ──
  if (apiBase && serviceToken) {
    try {
      const res = await $fetch<{
        success: boolean
        data?: {
          video: { id: string; contentType: string; durationSeconds: number | null } | null
          playback?: { url: string; expiresAt: string }
        }
      }>(`${apiBase}/videos/lesson`, {
        query: { slug, ordinal },
        headers: { 'x-service-token': serviceToken },
        timeout: 6000,
      })

      const playback = res?.data?.playback
      if (playback?.url) {
        return {
          kind: 'r2',
          url: playback.url,
          expiresAt: playback.expiresAt,
          contentType: res?.data?.video?.contentType,
          durationSeconds: res?.data?.video?.durationSeconds ?? null,
        }
      }
    } catch (err: any) {
      // A video API that is down must not take the lesson down with it: fall
      // through to YouTube and log enough to tell the two cases apart.
      console.error('[lessons/video] R2 lookup failed:', err?.message || err)
    }
  }

  // ── 2. YouTube, ids resolved server-side ──
  const fallback = lessonVideo(slug, ordinal)
  if (!fallback) return { kind: 'none' }

  const id = youtubeId(fallback.video)
  if (!id) return { kind: 'none' }

  return { kind: 'youtube', id, demo: fallback.demo }
})

/**
 * Links in lessonVideos.ts are authored in whatever form was pasted; normalise
 * here so the client gets an id and does not have to parse a URL it was handed.
 */
function youtubeId(input: string): string | null {
  const raw = String(input || '').trim()
  if (!raw) return null
  if (/^[\w-]{11}$/.test(raw)) return raw
  const match = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return match ? match[1] : null
}
