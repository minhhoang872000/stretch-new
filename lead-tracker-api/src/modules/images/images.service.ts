import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { env } from '../../config/env'

export interface UploadedImage {
  /** Object key in the bucket */
  key: string
  /** Public delivery URL */
  url: string
}

export interface MediaItem {
  /** Object key in the bucket */
  key: string
  /** Public delivery URL */
  url: string
  /** Size in bytes */
  size: number
  /** ISO upload timestamp (LastModified), or null if unavailable */
  uploadedAt: string | null
}

export interface MediaPage {
  images: MediaItem[]
  /** Opaque token to fetch the next page, or null when there are no more. */
  cursor: string | null
}

export interface DirectUploadTicket {
  /** Presigned PUT URL the browser uploads the file to (valid ~5 min) */
  uploadURL: string
  /** Final public URL the object will be served from */
  url: string
  key: string
}

class HttpError extends Error {
  statusCode: number
  code: string
  constructor(message: string, statusCode = 500, code = 'IMAGE_UPLOAD_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

function assertConfigured(): void {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl } = env.r2
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new HttpError(
      'Cloudflare R2 is not configured (missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_BASE_URL)',
      503,
      'IMAGE_SERVICE_UNAVAILABLE'
    )
  }
}

let _client: S3Client | null = null
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
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
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

/** Build a unique, URL-safe object key, preserving the original extension. */
function buildKey(filename: string, mimetype: string): string {
  const fromName = (filename.match(/\.([a-zA-Z0-9]+)$/)?.[1] || '').toLowerCase()
  const ext = EXT_BY_MIME[mimetype] || fromName || 'bin'
  const prefix = env.r2.prefix ? `${env.r2.prefix.replace(/\/$/, '')}/` : ''
  return `${prefix}${randomUUID()}.${ext}`
}

function publicUrl(key: string): string {
  return `${env.r2.publicBaseUrl}/${key}`
}

/**
 * Resize (down) and re-encode raster images to WebP to shrink storage/bandwidth.
 * Vector (SVG) and animated (GIF) formats are passed through untouched.
 * Falls back to the original bytes if sharp can't decode the input.
 */
async function processImage(
  buffer: Buffer,
  mimetype: string
): Promise<{ buffer: Buffer; contentType: string }> {
  if (mimetype === 'image/svg+xml' || mimetype === 'image/gif') {
    return { buffer, contentType: mimetype }
  }
  try {
    let pipeline = sharp(buffer).rotate() // honor EXIF orientation
    if (env.r2.imageMaxWidth > 0) {
      pipeline = pipeline.resize({ width: env.r2.imageMaxWidth, withoutEnlargement: true })
    }
    const out = await pipeline.webp({ quality: env.r2.imageQuality }).toBuffer()
    return { buffer: out, contentType: 'image/webp' }
  } catch {
    return { buffer, contentType: mimetype }
  }
}

export const imagesService = {
  /**
   * Upload a file buffer to R2 via the server and return its public URL.
   */
  async upload(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<UploadedImage> {
    assertConfigured()
    const processed = await processImage(buffer, mimetype)
    const key = buildKey(filename, processed.contentType)

    try {
      await client().send(
        new PutObjectCommand({
          Bucket: env.r2.bucket,
          Key: key,
          Body: processed.buffer,
          ContentType: processed.contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      )
    } catch (err: any) {
      throw new HttpError(err?.message || 'R2 upload failed', 502, 'IMAGE_UPLOAD_FAILED')
    }

    return { key, url: publicUrl(key) }
  },

  /**
   * Create a presigned PUT URL so the browser can upload directly to R2
   * without proxying bytes through this API (good for large files).
   */
  async createDirectUpload(
    filename: string,
    mimetype: string
  ): Promise<DirectUploadTicket> {
    assertConfigured()
    const key = buildKey(filename, mimetype)

    const uploadURL = await getSignedUrl(
      client(),
      new PutObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
        ContentType: mimetype,
      }),
      { expiresIn: 300 }
    )

    return { uploadURL, url: publicUrl(key), key }
  },

  /**
   * List uploaded images straight from the bucket (under the configured prefix).
   * Paginated via an opaque cursor (R2 continuation token). Newest-first within
   * each page. No DB needed — the bucket is the source of truth.
   */
  async list({ limit = 60, cursor }: { limit?: number; cursor?: string } = {}): Promise<MediaPage> {
    assertConfigured()
    const prefix = env.r2.prefix ? `${env.r2.prefix.replace(/\/$/, '')}/` : ''
    const res = await client().send(
      new ListObjectsV2Command({
        Bucket: env.r2.bucket,
        Prefix: prefix || undefined,
        MaxKeys: Math.min(Math.max(1, limit), 100),
        ContinuationToken: cursor || undefined,
      })
    )

    const isImage = (k: string) => /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(k)
    const images: MediaItem[] = (res.Contents || [])
      .filter((o) => o.Key && isImage(o.Key))
      .map((o) => ({
        key: o.Key as string,
        url: publicUrl(o.Key as string),
        size: o.Size ?? 0,
        uploadedAt: o.LastModified ? o.LastModified.toISOString() : null,
      }))
      .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''))

    return { images, cursor: res.IsTruncated ? res.NextContinuationToken ?? null : null }
  },

  /**
   * Crop an existing image (by key) to the given rectangle (in source pixels),
   * re-encode to WebP, and store it as a NEW object. The original is untouched
   * (R2 objects are immutable + long-cached). Returns the new image.
   */
  async cropByKey(
    key: string,
    rect: { left: number; top: number; width: number; height: number }
  ): Promise<UploadedImage> {
    assertConfigured()
    const prefix = env.r2.prefix ? `${env.r2.prefix.replace(/\/$/, '')}/` : ''
    if (prefix && !key.startsWith(prefix)) {
      throw new HttpError('Refusing to read a key outside the upload prefix', 400, 'INVALID_KEY')
    }

    // Fetch the source bytes from R2
    let srcBuffer: Buffer
    try {
      const obj = await client().send(new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }))
      const bytes = await obj.Body?.transformToByteArray()
      if (!bytes) throw new Error('empty object body')
      srcBuffer = Buffer.from(bytes)
    } catch (err: any) {
      throw new HttpError(err?.message || 'Could not read source image', 502, 'IMAGE_READ_FAILED')
    }

    // Crop + re-encode with sharp (clamp the rect to the real image bounds)
    let outBuffer: Buffer
    try {
      const img = sharp(srcBuffer).rotate()
      const meta = await img.metadata()
      const maxW = meta.width || 0
      const maxH = meta.height || 0
      const left = Math.max(0, Math.min(Math.round(rect.left), Math.max(0, maxW - 1)))
      const top = Math.max(0, Math.min(Math.round(rect.top), Math.max(0, maxH - 1)))
      const width = Math.max(1, Math.min(Math.round(rect.width), maxW - left))
      const height = Math.max(1, Math.min(Math.round(rect.height), maxH - top))
      outBuffer = await sharp(srcBuffer)
        .rotate()
        .extract({ left, top, width, height })
        .webp({ quality: env.r2.imageQuality })
        .toBuffer()
    } catch (err: any) {
      throw new HttpError(err?.message || 'Crop failed', 422, 'IMAGE_CROP_FAILED')
    }

    const newKey = buildKey('crop.webp', 'image/webp')
    try {
      await client().send(
        new PutObjectCommand({
          Bucket: env.r2.bucket,
          Key: newKey,
          Body: outBuffer,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      )
    } catch (err: any) {
      throw new HttpError(err?.message || 'R2 upload failed', 502, 'IMAGE_UPLOAD_FAILED')
    }

    return { key: newKey, url: publicUrl(newKey) }
  },

  /** Delete one object by its bucket key (used by the media library). */
  async deleteByKey(key: string): Promise<void> {
    assertConfigured()
    if (!key) return
    // Only allow deleting within our own prefix, never arbitrary bucket keys.
    const prefix = env.r2.prefix ? `${env.r2.prefix.replace(/\/$/, '')}/` : ''
    if (prefix && !key.startsWith(prefix)) {
      throw new HttpError('Refusing to delete a key outside the upload prefix', 400, 'INVALID_KEY')
    }
    try {
      await client().send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }))
    } catch (err: any) {
      throw new HttpError(err?.message || 'R2 delete failed', 502, 'IMAGE_DELETE_FAILED')
    }
  },

  /** True if a URL points at our R2 public base (i.e. we own/can delete it). */
  isOwnedUrl(url: string): boolean {
    return !!env.r2.publicBaseUrl && typeof url === 'string' && url.startsWith(env.r2.publicBaseUrl + '/')
  },

  /** Best-effort delete of one object given its public URL. Silently ignores non-R2 URLs. */
  async deleteByUrl(url: string): Promise<void> {
    if (!this.isOwnedUrl(url)) return
    const key = url.slice(env.r2.publicBaseUrl.length + 1)
    if (!key) return
    try {
      await client().send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }))
    } catch {
      // best-effort; orphaned object is harmless and can be GC'd later
    }
  },

  /** Best-effort delete of many URLs (deduped). */
  async deleteManyByUrls(urls: string[]): Promise<void> {
    const owned = [...new Set(urls.filter((u) => this.isOwnedUrl(u)))]
    await Promise.all(owned.map((u) => this.deleteByUrl(u)))
  },
}

/** Extract every R2-owned image URL referenced by a blog post (cover + inline). */
export function collectPostImageUrls(post: {
  coverImage?: string | null
  contentEn?: any[]
  contentVi?: any[]
}): string[] {
  const urls: string[] = []
  if (post.coverImage) urls.push(post.coverImage)

  const base = env.r2.publicBaseUrl
  const urlRe = base
    ? new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^\\s"'<>)]+`, 'g')
    : null

  for (const sections of [post.contentEn, post.contentVi]) {
    if (!Array.isArray(sections)) continue
    for (const s of sections) {
      if (s?.image) urls.push(s.image)
      if (typeof s?.text === 'string' && urlRe) {
        urls.push(...(s.text.match(urlRe) || []))
      }
    }
  }
  return urls
}
