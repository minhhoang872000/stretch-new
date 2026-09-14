/**
 * Direct-to-R2 video upload.
 *
 * The bytes never touch the API: it hands out presigned `UploadPart` URLs and
 * the browser PUTs each part straight to Cloudflare. That is what makes a 1.5 GB
 * lecture uploadable at all — the API host would reject or time out on a request
 * that size, and it would pay for the bandwidth twice.
 *
 * Flow: create → PUT parts (3 at a time, retried individually) → complete.
 * Anything that throws aborts the multipart upload so R2 is not left holding
 * orphaned parts (it drops them after 7 days anyway, but not silently on us).
 *
 * REQUIRED bucket CORS — without `ExposeHeaders: ["ETag"]` the browser cannot
 * read the ETag of each part and `complete` fails:
 *
 *   [{ "AllowedOrigins": ["https://admin.stretch.vn", "http://localhost:5173"],
 *      "AllowedMethods": ["PUT"],
 *      "AllowedHeaders": ["content-type"],
 *      "ExposeHeaders":  ["ETag"],
 *      "MaxAgeSeconds":  3600 }]
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://stretch-new.onrender.com/api/v1'

/** Parts uploaded at once. Three keeps a home connection busy without starving it. */
const CONCURRENCY = 3
/** Per-part retries before the whole upload gives up. */
const PART_RETRIES = 2

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `HTTP ${res.status}`)
  }
  return json.data
}

/**
 * PUT one part with XHR (not fetch) — `upload.onprogress` is the only way to get
 * bytes-in-flight, which is what makes the progress bar move on a single big
 * part instead of jumping once per part.
 */
function putPart({ url, blob, signal, onBytes, contentType }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    // Only set it when the signature covers it (the single-PUT path). Adding an
    // unsigned header to a presigned part request is what makes R2 return 403.
    if (contentType) xhr.setRequestHeader('Content-Type', contentType)

    let lastLoaded = 0
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onBytes(event.loaded - lastLoaded)
      lastLoaded = event.loaded
    }

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const err = new Error(`R2 rejected a part (HTTP ${xhr.status})`)
        // 401/403 on the very first part means the signature itself was refused,
        // not that the network hiccuped — the caller uses this to switch to the
        // single-PUT path instead of retrying something that cannot work.
        if (xhr.status === 401 || xhr.status === 403) err.presignRejected = true
        reject(err)
        return
      }
      const etag = xhr.getResponseHeader('ETag') || xhr.getResponseHeader('etag')
      if (!etag) {
        const err = new Error(
          'R2 không trả header ETag — thêm "ExposeHeaders": ["ETag"] vào CORS của bucket.',
        )
        err.missingEtag = true
        reject(err)
        return
      }
      resolve(etag)
    }
    xhr.onerror = () => reject(new Error('Mất kết nối khi tải phần này lên R2.'))
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'))

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
        return
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(blob)
  })
}

/**
 * Upload one video file.
 *
 * @param {object} options
 * @param {File}   options.file
 * @param {string} [options.title]
 * @param {string} [options.programSlug]  Bind straight to a lesson slot…
 * @param {number} [options.lessonOrdinal] …at this video ordinal.
 * @param {(p: {percent: number, uploaded: number, total: number, part: number, parts: number}) => void} [options.onProgress]
 * @returns {{ promise: Promise<object>, abort: () => void }}
 */
export function uploadVideo({ file, title, programSlug, lessonOrdinal, onProgress }) {
  const controller = new AbortController()

  const meta = () => ({
    filename: file.name,
    contentType: file.type || 'video/mp4',
    sizeBytes: file.size,
    title: title || file.name,
    programSlug: programSlug ?? null,
    lessonOrdinal: lessonOrdinal ?? null,
  })

  /**
   * One presigned PUT for the whole file. Cloudflare documents this shape
   * explicitly, so it is the safety net when a presigned *part* is refused —
   * and the sane choice for a small file. No resumability: a dropped connection
   * means starting over, which is why it is the fallback and not the default.
   */
  const simple = async () => {
    const ticket = await apiPost('/videos/uploads/simple', meta())
    let uploaded = 0
    try {
      await putPart({
        url: ticket.uploadUrl,
        blob: file,
        signal: controller.signal,
        contentType: file.type || 'video/mp4',
        onBytes: (delta) => {
          uploaded += delta
          onProgress?.({
            percent: Math.min(99, Math.round((uploaded / file.size) * 100)),
            uploaded,
            total: file.size,
            part: 1,
            parts: 1,
          })
        },
      }).catch((err) => {
        // The single PUT has no ETag requirement — ignore that complaint.
        if (!err.missingEtag) throw err
      })
      const video = await apiPost(`/videos/uploads/${ticket.videoId}/confirm`, {})
      onProgress?.({ percent: 100, uploaded: file.size, total: file.size, part: 1, parts: 1 })
      return video
    } catch (err) {
      await apiPost(`/videos/uploads/${ticket.videoId}/abort`, {}).catch(() => {})
      throw err
    }
  }

  const multipart = (async () => {
    const ticket = await apiPost('/videos/uploads', meta())

    const { videoId, partSize, parts } = ticket
    let uploaded = 0
    let finished = 0
    const results = new Array(parts.length)

    const report = () => {
      onProgress?.({
        percent: Math.min(99, Math.round((uploaded / file.size) * 100)),
        uploaded,
        total: file.size,
        part: finished,
        parts: parts.length,
      })
    }
    report()

    try {
      // A shared cursor instead of chunking the array: parts finish at different
      // speeds, so workers should pick up the next pending one, not wait for a batch.
      let cursor = 0
      const worker = async () => {
        while (cursor < parts.length) {
          const index = cursor
          cursor += 1
          const part = parts[index]
          const start = index * partSize
          const blob = file.slice(start, Math.min(start + partSize, file.size))

          let attempt = 0
          for (;;) {
            const before = uploaded
            try {
              const etag = await putPart({
                url: part.url,
                blob,
                signal: controller.signal,
                onBytes: (delta) => {
                  uploaded += delta
                  report()
                },
              })
              results[index] = { partNumber: part.partNumber, etag }
              finished += 1
              report()
              break
            } catch (err) {
              if (err.name === 'AbortError') throw err
              attempt += 1
              if (attempt > PART_RETRIES) throw err
              // Rewind this part's contribution before retrying, or the bar overshoots.
              uploaded = before
              report()
              await new Promise((r) => setTimeout(r, 500 * attempt))
            }
          }
        }
      }

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, parts.length) }, worker))

      const video = await apiPost(`/videos/uploads/${videoId}/complete`, { parts: results })
      onProgress?.({ percent: 100, uploaded: file.size, total: file.size, part: parts.length, parts: parts.length })
      return video
    } catch (err) {
      // Best-effort cleanup; never mask the original failure with a cleanup error.
      await apiPost(`/videos/uploads/${videoId}/abort`, {}).catch(() => {})
      throw err
    }
  })

  const promise = (async () => {
    try {
      return await multipart()
    } catch (err) {
      if (err.name === 'AbortError') throw err
      // R2 refused the presigned part (or would not expose its ETag): the
      // multipart shape is not usable on this bucket, so take the documented
      // single-PUT path instead of failing the instructor's upload.
      if (err.presignRejected || err.missingEtag) {
        return await simple()
      }
      throw err
    }
  })()

  return { promise, abort: () => controller.abort() }
}

/** A fresh, short-lived playback URL for the console's own preview player. */
export async function fetchPlayback(videoId) {
  const res = await fetch(`${API_BASE}/videos/${videoId}/playback`, {
    cache: 'no-store',
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.data
}

export async function listVideos({ programSlug, status, limit = 50 } = {}) {
  const query = new URLSearchParams()
  if (programSlug) query.set('programSlug', programSlug)
  if (status) query.set('status', status)
  query.set('limit', String(limit))
  const res = await fetch(`${API_BASE}/videos?${query}`, { cache: 'no-store', headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.data.videos || []
}

export async function patchVideo(videoId, patch) {
  const res = await fetch(`${API_BASE}/videos/${videoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.data
}

export async function deleteVideo(videoId) {
  const res = await fetch(`${API_BASE}/videos/${videoId}`, { method: 'DELETE', headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return true
}
