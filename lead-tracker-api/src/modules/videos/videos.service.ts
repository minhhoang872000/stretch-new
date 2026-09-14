import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { pool } from '../../config/db'
import { env } from '../../config/env'

/**
 * Lesson videos on Cloudflare R2.
 *
 * Two deliberate choices:
 *
 * 1. **Bytes never pass through this API.** The browser gets presigned URLs and
 *    PUTs straight to R2, so a 1.5 GB lecture is not limited by Render's request
 *    size or timeouts, and this process stays small. Two shapes are offered:
 *    multipart (`createUpload`) for per-part progress, per-part retry and
 *    parallelism, and a single PUT (`createSimpleUpload`) which Cloudflare
 *    documents explicitly — the client tries multipart and falls back if R2
 *    rejects a presigned part.
 *
 * 2. **Playback is a short-lived presigned GET.** R2 serves it directly with
 *    Range support, so seeking works and egress is free. The video bucket must
 *    stay private: a public bucket makes the signing decorative.
 *
 * What this does NOT do: transcode. R2 is storage, not Stream — one MP4 in, the
 * same MP4 out, no HLS ladder. Instructors upload H.264/AAC MP4 and the browser
 * plays it progressively. If adaptive bitrate becomes a requirement, that is the
 * point to move to Cloudflare Stream, and only `playbackFor()` changes shape.
 */

const MIN_PART_BYTES = 5 * 1024 * 1024 // R2/S3 floor for every part except the last

export type VideoStatus = 'uploading' | 'ready' | 'failed'

export interface LessonVideoRow {
  id: string
  objectKey: string
  title: string
  programSlug: string | null
  lessonOrdinal: number | null
  contentType: string
  sizeBytes: number
  durationSeconds: number | null
  status: VideoStatus
  uploadId: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface UploadTicket {
  videoId: string
  objectKey: string
  uploadId: string
  partSize: number
  partCount: number
  parts: { partNumber: number; url: string }[]
  expiresAt: string
}

export interface PlaybackTicket {
  videoId: string
  url: string
  contentType: string
  sizeBytes: number
  durationSeconds: number | null
  expiresAt: string
}

class HttpError extends Error {
  statusCode: number
  code: string
  constructor(message: string, statusCode = 500, code = 'VIDEO_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

function assertConfigured(): void {
  const { accountId, accessKeyId, secretAccessKey } = env.r2
  const bucket = env.video.bucket
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new HttpError(
      'Cloudflare R2 is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_VIDEO_BUCKET or R2_BUCKET)',
      503,
      'VIDEO_SERVICE_UNAVAILABLE'
    )
  }
}

let _client: S3Client | null = null
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      // `auto` is required for R2 — the SDK refuses to sign without a region.
      region: 'auto',
      endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
    })
  }
  return _client
}

const EXT_BY_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'video/mpeg': 'mpeg',
}

/** One folder per video keeps future siblings (poster, captions) together. */
function buildKey(videoId: string, filename: string, contentType: string): string {
  const fromName = (filename.match(/\.([a-zA-Z0-9]+)$/)?.[1] || '').toLowerCase()
  const ext = EXT_BY_MIME[contentType] || fromName || 'mp4'
  const prefix = env.video.prefix ? `${env.video.prefix}/` : ''
  return `${prefix}${videoId}/source.${ext}`
}

/**
 * Part size must satisfy three things at once: R2's 5 MB floor, R2's 10,000-part
 * ceiling, and our own cap on how many presigned URLs one response carries.
 */
function planParts(sizeBytes: number): { partSize: number; partCount: number } {
  const maxParts = Math.max(1, Math.min(env.video.maxParts, 10_000))
  let partSize = Math.max(MIN_PART_BYTES, env.video.partSizeBytes)
  if (Math.ceil(sizeBytes / partSize) > maxParts) {
    partSize = Math.ceil(sizeBytes / maxParts / MIN_PART_BYTES) * MIN_PART_BYTES
  }
  return { partSize, partCount: Math.max(1, Math.ceil(sizeBytes / partSize)) }
}

function rowToVideo(r: any): LessonVideoRow {
  return {
    id: r.id,
    objectKey: r.object_key,
    title: r.title || '',
    programSlug: r.program_slug ?? null,
    lessonOrdinal: r.lesson_ordinal ?? null,
    contentType: r.content_type,
    sizeBytes: Number(r.size_bytes || 0),
    durationSeconds: r.duration_seconds ?? null,
    status: r.status,
    uploadId: r.upload_id ?? null,
    createdBy: r.created_by ?? null,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }
}

async function findById(videoId: string): Promise<LessonVideoRow> {
  const { rows } = await pool.query('SELECT * FROM lesson_videos WHERE id = $1', [videoId])
  if (!rows.length) throw new HttpError('Video not found', 404, 'VIDEO_NOT_FOUND')
  return rowToVideo(rows[0])
}

export const videosService = {
  /**
   * Step 1 of an upload: reserve a row, open a multipart upload, and hand back
   * one presigned URL per part. Nothing is stored yet — an abandoned upload is
   * auto-aborted by R2 after 7 days, and the row stays `uploading` until the
   * client completes it.
   */
  async createUpload(input: {
    filename: string
    contentType: string
    sizeBytes: number
    title?: string
    programSlug?: string | null
    lessonOrdinal?: number | null
    createdBy?: string | null
  }): Promise<UploadTicket> {
    assertConfigured()

    if (!/^video\//.test(input.contentType)) {
      throw new HttpError('Only video files are allowed', 415, 'UNSUPPORTED_MEDIA_TYPE')
    }
    if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
      throw new HttpError('sizeBytes is required', 400, 'INVALID_SIZE')
    }
    if (input.sizeBytes > env.video.maxUploadBytes) {
      const gb = (env.video.maxUploadBytes / 1024 / 1024 / 1024).toFixed(1)
      throw new HttpError(`File exceeds the maximum size of ${gb} GB`, 413, 'FILE_TOO_LARGE')
    }

    const videoId = randomUUID()
    const objectKey = buildKey(videoId, input.filename, input.contentType)
    const { partSize, partCount } = planParts(input.sizeBytes)

    const created = await client().send(
      new CreateMultipartUploadCommand({
        Bucket: env.video.bucket,
        Key: objectKey,
        ContentType: input.contentType,
        // Videos are immutable once uploaded; a new upload gets a new key.
        CacheControl: 'private, max-age=31536000, immutable',
      })
    )
    const uploadId = created.UploadId
    if (!uploadId) throw new HttpError('R2 did not return an upload id', 502, 'MULTIPART_FAILED')

    const parts: { partNumber: number; url: string }[] = []
    for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
      const url = await getSignedUrl(
        client(),
        new UploadPartCommand({
          Bucket: env.video.bucket,
          Key: objectKey,
          UploadId: uploadId,
          PartNumber: partNumber,
        }),
        { expiresIn: env.video.uploadUrlTtl }
      )
      parts.push({ partNumber, url })
    }

    await pool.query(
      `INSERT INTO lesson_videos
         (id, object_key, title, program_slug, lesson_ordinal, content_type,
          size_bytes, status, upload_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'uploading', $8, $9)`,
      [
        videoId,
        objectKey,
        input.title || input.filename,
        input.programSlug ?? null,
        input.lessonOrdinal ?? null,
        input.contentType,
        input.sizeBytes,
        uploadId,
        input.createdBy ?? null,
      ]
    )

    return {
      videoId,
      objectKey,
      uploadId,
      partSize,
      partCount,
      parts,
      expiresAt: new Date(Date.now() + env.video.uploadUrlTtl * 1000).toISOString(),
    }
  },

  /**
   * Step 2: stitch the parts. `etag` comes from each PUT response, which means
   * the bucket's CORS policy has to expose the ETag header — without it the
   * browser reads `null` and this call fails with an invalid part list.
   */
  async completeUpload(
    videoId: string,
    parts: { partNumber: number; etag: string }[]
  ): Promise<LessonVideoRow> {
    assertConfigured()
    const video = await findById(videoId)
    if (!video.uploadId) throw new HttpError('This upload has no open multipart id', 409, 'NO_OPEN_UPLOAD')
    if (!Array.isArray(parts) || !parts.length) {
      throw new HttpError('parts[] is required', 400, 'NO_PARTS')
    }

    const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber)
    if (ordered.some((p) => !p.etag)) {
      throw new HttpError(
        'A part is missing its ETag — check the bucket CORS policy exposes the ETag header',
        400,
        'MISSING_ETAG'
      )
    }

    try {
      await client().send(
        new CompleteMultipartUploadCommand({
          Bucket: env.video.bucket,
          Key: video.objectKey,
          UploadId: video.uploadId,
          MultipartUpload: {
            Parts: ordered.map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
          },
        })
      )
    } catch (err: any) {
      await pool.query(
        `UPDATE lesson_videos SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [videoId]
      )
      throw new HttpError(err?.message || 'Completing the upload failed', 502, 'MULTIPART_COMPLETE_FAILED')
    }

    // Trust the bucket, not the client, for the final size.
    let sizeBytes = video.sizeBytes
    try {
      const head = await client().send(
        new HeadObjectCommand({ Bucket: env.video.bucket, Key: video.objectKey })
      )
      if (head.ContentLength) sizeBytes = head.ContentLength
    } catch {
      /* Head is a nice-to-have; the completed upload already succeeded. */
    }

    const { rows } = await pool.query(
      `UPDATE lesson_videos
          SET status = 'ready', size_bytes = $2, upload_id = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [videoId, sizeBytes]
    )
    return rowToVideo(rows[0])
  },

  /**
   * The simple path: one presigned PUT for the whole file.
   *
   * Cloudflare documents presigned URLs for GET/HEAD/PUT/DELETE but says nothing
   * about presigning `UploadPart`, so the client tries multipart first and falls
   * back here if R2 refuses a part. Also the right path for a small file, where
   * splitting into parts buys nothing. Single PUT tops out at R2's 5 GiB object
   * limit for one request, well above our own cap.
   *
   * The signature covers Content-Type: the browser must send the same value it
   * declared, or R2 rejects the PUT.
   */
  async createSimpleUpload(input: {
    filename: string
    contentType: string
    sizeBytes: number
    title?: string
    programSlug?: string | null
    lessonOrdinal?: number | null
    createdBy?: string | null
  }): Promise<{ videoId: string; objectKey: string; uploadUrl: string; expiresAt: string }> {
    assertConfigured()

    if (!/^video\//.test(input.contentType)) {
      throw new HttpError('Only video files are allowed', 415, 'UNSUPPORTED_MEDIA_TYPE')
    }
    if (input.sizeBytes > env.video.maxUploadBytes) {
      const gb = (env.video.maxUploadBytes / 1024 / 1024 / 1024).toFixed(1)
      throw new HttpError(`File exceeds the maximum size of ${gb} GB`, 413, 'FILE_TOO_LARGE')
    }

    const videoId = randomUUID()
    const objectKey = buildKey(videoId, input.filename, input.contentType)

    const uploadUrl = await getSignedUrl(
      client(),
      new PutObjectCommand({
        Bucket: env.video.bucket,
        Key: objectKey,
        ContentType: input.contentType,
        CacheControl: 'private, max-age=31536000, immutable',
      }),
      { expiresIn: env.video.uploadUrlTtl }
    )

    await pool.query(
      `INSERT INTO lesson_videos
         (id, object_key, title, program_slug, lesson_ordinal, content_type,
          size_bytes, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'uploading', $8)`,
      [
        videoId,
        objectKey,
        input.title || input.filename,
        input.programSlug ?? null,
        input.lessonOrdinal ?? null,
        input.contentType,
        input.sizeBytes,
        input.createdBy ?? null,
      ]
    )

    return {
      videoId,
      objectKey,
      uploadUrl,
      expiresAt: new Date(Date.now() + env.video.uploadUrlTtl * 1000).toISOString(),
    }
  },

  /**
   * Close a simple upload. HEAD is the proof: if the object is not in the bucket
   * the row is marked failed rather than left claiming to be ready.
   */
  async confirmUpload(videoId: string): Promise<LessonVideoRow> {
    assertConfigured()
    const video = await findById(videoId)

    let sizeBytes = video.sizeBytes
    try {
      const head = await client().send(
        new HeadObjectCommand({ Bucket: env.video.bucket, Key: video.objectKey })
      )
      if (head.ContentLength) sizeBytes = head.ContentLength
    } catch {
      await pool.query(
        `UPDATE lesson_videos SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [videoId]
      )
      throw new HttpError('The object is not in the bucket — the upload did not finish', 409, 'UPLOAD_INCOMPLETE')
    }

    const { rows } = await pool.query(
      `UPDATE lesson_videos
          SET status = 'ready', size_bytes = $2, upload_id = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [videoId, sizeBytes]
    )
    return rowToVideo(rows[0])
  },

  /** Cancel: drop the parts R2 is holding, and the row with them. */
  async abortUpload(videoId: string): Promise<void> {
    assertConfigured()
    const video = await findById(videoId)
    if (video.uploadId) {
      try {
        await client().send(
          new AbortMultipartUploadCommand({
            Bucket: env.video.bucket,
            Key: video.objectKey,
            UploadId: video.uploadId,
          })
        )
      } catch {
        /* Already gone or expired — nothing left to clean up. */
      }
    }
    await pool.query('DELETE FROM lesson_videos WHERE id = $1', [videoId])
  },

  /**
   * A URL the browser can put in `<video src>`. Short-lived on purpose: within
   * its window the link is copyable, so keep the TTL near a lesson's length
   * rather than a day, and mint a fresh one per playback request.
   */
  async playbackFor(videoId: string): Promise<PlaybackTicket> {
    assertConfigured()
    const video = await findById(videoId)
    if (video.status !== 'ready') {
      throw new HttpError('Video is not ready yet', 409, 'VIDEO_NOT_READY')
    }

    const url = await getSignedUrl(
      client(),
      new GetObjectCommand({
        Bucket: env.video.bucket,
        Key: video.objectKey,
        ResponseContentDisposition: 'inline',
        ResponseContentType: video.contentType,
      }),
      { expiresIn: env.video.playbackUrlTtl }
    )

    return {
      videoId: video.id,
      url,
      contentType: video.contentType,
      sizeBytes: video.sizeBytes,
      durationSeconds: video.durationSeconds,
      expiresAt: new Date(Date.now() + env.video.playbackUrlTtl * 1000).toISOString(),
    }
  },

  /** The video bound to one lesson slot, if any. */
  async findForLesson(programSlug: string, lessonOrdinal: number): Promise<LessonVideoRow | null> {
    const { rows } = await pool.query(
      `SELECT * FROM lesson_videos
        WHERE program_slug = $1 AND lesson_ordinal = $2 AND status = 'ready'
        ORDER BY updated_at DESC
        LIMIT 1`,
      [programSlug, lessonOrdinal]
    )
    return rows.length ? rowToVideo(rows[0]) : null
  },

  async list({
    programSlug,
    status,
    limit = 50,
  }: { programSlug?: string; status?: VideoStatus; limit?: number } = {}): Promise<LessonVideoRow[]> {
    const where: string[] = []
    const params: any[] = []
    if (programSlug) {
      params.push(programSlug)
      where.push(`program_slug = $${params.length}`)
    }
    if (status) {
      params.push(status)
      where.push(`status = $${params.length}`)
    }
    params.push(Math.min(Math.max(1, limit), 200))

    const { rows } = await pool.query(
      `SELECT * FROM lesson_videos
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    )
    return rows.map(rowToVideo)
  },

  async get(videoId: string): Promise<LessonVideoRow> {
    return findById(videoId)
  },

  /** Bind a finished video to a lesson slot, rename it, or record its duration. */
  async update(
    videoId: string,
    patch: {
      title?: string
      programSlug?: string | null
      lessonOrdinal?: number | null
      durationSeconds?: number | null
    }
  ): Promise<LessonVideoRow> {
    await findById(videoId)

    const sets: string[] = []
    const params: any[] = [videoId]
    const push = (column: string, value: any) => {
      params.push(value)
      sets.push(`${column} = $${params.length}`)
    }
    if (patch.title !== undefined) push('title', patch.title)
    if (patch.programSlug !== undefined) push('program_slug', patch.programSlug)
    if (patch.lessonOrdinal !== undefined) push('lesson_ordinal', patch.lessonOrdinal)
    if (patch.durationSeconds !== undefined) push('duration_seconds', patch.durationSeconds)
    if (!sets.length) return findById(videoId)

    const { rows } = await pool.query(
      `UPDATE lesson_videos SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      params
    )
    return rowToVideo(rows[0])
  },

  /** Delete the object and the row. There is no undo — R2 has no recycle bin. */
  async remove(videoId: string): Promise<void> {
    assertConfigured()
    const video = await findById(videoId)
    try {
      await client().send(new DeleteObjectCommand({ Bucket: env.video.bucket, Key: video.objectKey }))
    } catch (err: any) {
      throw new HttpError(err?.message || 'Deleting from R2 failed', 502, 'VIDEO_DELETE_FAILED')
    }
    await pool.query('DELETE FROM lesson_videos WHERE id = $1', [videoId])
  },
}
