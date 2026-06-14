import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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
