import { apiFetch, ApiError } from '~/services/http'

/**
 * Lesson videos on Cloudflare R2.
 *
 * The bytes never pass through `lead-tracker-api`: it hands out presigned URLs
 * and the browser PUTs straight to the bucket. That is what makes a 1.5 GB
 * lecture uploadable at all — Render caps request bodies and times out long
 * before a file that size finishes.
 *
 * Two shapes, tried in that order:
 *
 *  1. **Multipart** — one presigned URL per part. Per-part progress, per-part
 *     retry, three parts in flight at once. This is the path that survives a
 *     dropped 4G packet forty minutes into an upload.
 *  2. **Single PUT** — the whole file in one request. Cloudflare documents
 *     presigned PUT explicitly but says nothing about presigning `UploadPart`,
 *     so if R2 ever refuses a part we fall back here rather than failing.
 *
 * `fetch` is deliberately not used for the uploads: it cannot report upload
 * progress, and progress is the difference between "is this frozen?" and a bar
 * that moves. XHR can, so XHR it is.
 */

export type VideoStatus = 'uploading' | 'ready' | 'failed'

export interface LessonVideo {
  id: string
  objectKey: string
  title: string
  programSlug: string | null
  lessonOrdinal: number | null
  contentType: string
  sizeBytes: number
  durationSeconds: number | null
  status: VideoStatus
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface PlaybackTicket {
  videoId: string
  url: string
  contentType: string
  sizeBytes: number
  durationSeconds: number | null
  expiresAt: string
}

interface MultipartTicket {
  videoId: string
  objectKey: string
  uploadId: string
  partSize: number
  partCount: number
  parts: { partNumber: number; url: string }[]
  expiresAt: string
}

interface SimpleTicket {
  videoId: string
  objectKey: string
  uploadUrl: string
  expiresAt: string
}

/** How the video is filed: which course, and which video-lesson slot in it. */
export interface VideoBinding {
  title?: string
  programSlug?: string | null
  lessonOrdinal?: number | null
}

export interface UploadHooks {
  /** Bytes accepted by R2 so far, against the file size. */
  onProgress?: (loaded: number, total: number) => void
  onPhase?: (phase: UploadPhase) => void
  signal?: AbortSignal
}

export type UploadPhase = 'preparing' | 'uploading' | 'finishing'

/** Parts in flight. Three is the sweet spot: it saturates a home line without
 *  starving the retry of a part that just failed. */
const CONCURRENCY = 3
/** Network wobble is expected on a long upload; a 4xx is not, and is not retried. */
const PART_ATTEMPTS = 3

// ── Library ──────────────────────────────────────────────────────────────────

export function listVideos(params: { programSlug?: string; status?: VideoStatus; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.programSlug) query.set('programSlug', params.programSlug)
  if (params.status) query.set('status', params.status)
  query.set('limit', String(params.limit ?? 200))
  return apiFetch<{ videos: LessonVideo[] }>(`/videos?${query}`).then((r) => r.videos)
}

export const getVideo = (id: string) => apiFetch<LessonVideo>(`/videos/${id}`)

export const updateVideo = (
  id: string,
  patch: VideoBinding & { durationSeconds?: number | null },
) => apiFetch<LessonVideo>(`/videos/${id}`, { method: 'PATCH', body: patch })

export const deleteVideo = (id: string) =>
  apiFetch<{ deleted: boolean }>(`/videos/${id}`, { method: 'DELETE' })

/** A short-lived signed URL — mint one per preview, never cache it. */
export const playbackTicket = (id: string) => apiFetch<PlaybackTicket>(`/videos/${id}/playback`)

// ── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload one file and return the finished row.
 *
 * Cancelling through `hooks.signal` also tells R2 to drop the parts it is
 * holding — an abandoned multipart upload is billed until R2 expires it after
 * seven days, so cleaning up is not optional politeness.
 */
export async function uploadVideo(
  file: File,
  binding: VideoBinding & { durationSeconds?: number | null } = {},
  hooks: UploadHooks = {},
): Promise<LessonVideo> {
  const { onProgress, onPhase, signal } = hooks
  const contentType = file.type || 'video/mp4'
  const request = {
    filename: file.name,
    contentType,
    sizeBytes: file.size,
    title: binding.title || file.name,
    programSlug: binding.programSlug ?? null,
    lessonOrdinal: binding.lessonOrdinal ?? null,
  }

  onPhase?.('preparing')
  throwIfAborted(signal)

  let video: LessonVideo | null = null

  // ── 1. Multipart ───────────────────────────────────────────────────
  let ticket: MultipartTicket | null = null
  try {
    ticket = await apiFetch<MultipartTicket>('/videos/uploads', { method: 'POST', body: request })
  } catch (err) {
    // A rejected *ticket* is usually a server-side verdict the single PUT will
    // not change — R2 unconfigured, file too large, wrong media type. Only a
    // failure of the multipart machinery itself is worth falling back from.
    if (!(err instanceof ApiError) || err.code !== 'MULTIPART_FAILED') throw err
  }

  if (ticket) {
    onPhase?.('uploading')
    try {
      const parts = await uploadParts(file, ticket, { onProgress, signal })
      onPhase?.('finishing')
      video = await apiFetch<LessonVideo>(`/videos/uploads/${ticket.videoId}/complete`, {
        method: 'POST',
        body: { parts },
      })
    } catch (err) {
      await abortUpload(ticket.videoId)
      if (!canRetrySimple(err)) throw err
      onProgress?.(0, file.size)
    }
  }

  // ── 2. Single PUT — only reached when multipart was unavailable ──
  // A small file still goes through multipart above: `partCount` is 1, the extra
  // round trip is one request, and having one path exercised on every upload is
  // worth more than saving it.
  if (!video) {
    onPhase?.('preparing')
    const simple = await apiFetch<SimpleTicket>('/videos/uploads/simple', {
      method: 'POST',
      body: request,
    })
    onPhase?.('uploading')
    try {
      // The signature covers Content-Type: send back exactly what was declared,
      // or R2 rejects the PUT as a signature mismatch.
      await putToR2(simple.uploadUrl, file, {
        contentType,
        signal,
        onProgress: (loaded) => onProgress?.(loaded, file.size),
      })
      onPhase?.('finishing')
      video = await apiFetch<LessonVideo>(`/videos/uploads/${simple.videoId}/confirm`, { method: 'POST' })
    } catch (err) {
      await abortUpload(simple.videoId)
      throw err
    }
  }

  // Duration is measured in the browser off the real file; the API has nowhere
  // else to learn it, and the site reads it straight from this row.
  if (binding.durationSeconds != null && binding.durationSeconds > 0) {
    try {
      video = await updateVideo(video.id, { durationSeconds: Math.round(binding.durationSeconds) })
    } catch {
      // The file is safely in the bucket; a missing duration is cosmetic.
    }
  }

  return video
}

/**
 * Whether a failed multipart upload is worth retrying as one PUT.
 *
 * Two cases, both of them R2 declining to play the multipart game rather than
 * anything wrong with the file: it refuses a presigned `UploadPart` (Cloudflare
 * documents presigned GET/HEAD/PUT/DELETE and is silent on UploadPart), or the
 * bucket's CORS policy hides the ETag the completion needs. A single PUT needs
 * neither. Anything else — a cancel, a dead network, a 5xx from our own API —
 * would fail the same way twice.
 */
function canRetrySimple(err: unknown): boolean {
  if (isAbort(err) || !(err instanceof ApiError)) return false
  if (err.code === 'MISSING_ETAG') return true
  return err.code === 'R2_PUT_FAILED' && err.status >= 400 && err.status < 500
}

/** Best-effort cleanup: drops the open multipart upload and the row with it. */
export async function abortUpload(videoId: string): Promise<void> {
  try {
    await apiFetch(`/videos/uploads/${videoId}/abort`, { method: 'POST' })
  } catch {
    // Already gone, or the API is what failed in the first place.
  }
}

async function uploadParts(
  file: File,
  ticket: MultipartTicket,
  { onProgress, signal }: { onProgress?: (loaded: number, total: number) => void; signal?: AbortSignal },
): Promise<{ partNumber: number; etag: string }[]> {
  const loaded = new Array<number>(ticket.parts.length).fill(0)
  const report = () => onProgress?.(loaded.reduce((sum, n) => sum + n, 0), file.size)

  const results = new Array<{ partNumber: number; etag: string }>(ticket.parts.length)
  let next = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const index = next++
      if (index >= ticket.parts.length) return
      throwIfAborted(signal)

      const part = ticket.parts[index]!
      const start = (part.partNumber - 1) * ticket.partSize
      const blob = file.slice(start, Math.min(start + ticket.partSize, file.size))

      const { etag } = await withRetry(
        (attempt) => {
          // A retried part starts its byte count over, or the bar walks backwards.
          loaded[index] = 0
          if (attempt > 1) report()
          return putToR2(part.url, blob, {
            signal,
            onProgress: (bytes) => {
              loaded[index] = bytes
              report()
            },
          })
        },
        PART_ATTEMPTS,
        signal,
      )

      if (!etag) {
        throw new ApiError(
          'R2 không trả về ETag cho part đã tải lên — thêm ETag vào ExposeHeaders trong CORS policy của bucket.',
          0,
          'MISSING_ETAG',
        )
      }

      loaded[index] = blob.size
      report()
      results[index] = { partNumber: part.partNumber, etag }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ticket.parts.length) }, worker))
  return results
}

/**
 * One PUT to R2 with progress. Resolves with the ETag, which the multipart
 * completion needs verbatim — quotes included, exactly as R2 wrote it.
 */
function putToR2(
  url: string,
  body: Blob,
  options: { contentType?: string; onProgress?: (loaded: number) => void; signal?: AbortSignal } = {},
): Promise<{ etag: string | null }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    if (options.contentType) xhr.setRequestHeader('Content-Type', options.contentType)

    const onAbort = () => xhr.abort()
    options.signal?.addEventListener('abort', onAbort, { once: true })
    const cleanup = () => options.signal?.removeEventListener('abort', onAbort)

    xhr.upload.onprogress = (event) => options.onProgress?.(event.loaded)

    xhr.onload = () => {
      cleanup()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ etag: xhr.getResponseHeader('ETag') })
        return
      }
      reject(new ApiError(`R2 từ chối (HTTP ${xhr.status})`, xhr.status, 'R2_PUT_FAILED'))
    }
    xhr.onerror = () => {
      cleanup()
      reject(new ApiError('Mất kết nối tới R2 khi đang tải lên', 0, 'R2_NETWORK_ERROR'))
    }
    xhr.onabort = () => {
      cleanup()
      reject(abortError())
    }

    xhr.send(body)
  })
}

/** Retries network failures and 5xx; a 4xx from R2 means the request is wrong. */
async function withRetry<T>(
  attemptFn: (attempt: number) => Promise<T>,
  attempts: number,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    throwIfAborted(signal)
    try {
      return await attemptFn(attempt)
    } catch (err) {
      if (isAbort(err)) throw err
      const status = err instanceof ApiError ? err.status : 0
      if (status >= 400 && status < 500) throw err
      lastError = err
      await delay(500 * attempt, signal)
    }
  }
  throw lastError
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(abortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function abortError(): DOMException {
  return new DOMException('Đã huỷ tải lên', 'AbortError')
}

export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError()
}
