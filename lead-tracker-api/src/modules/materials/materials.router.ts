import { Router, type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { pool } from '../../config/db'
import { env } from '../../config/env'
import { HttpError } from '../../core/crud'
import { requireAuth } from '../../middleware/requireAuth'
import { success, created } from '../../utils/response'

/**
 * Lesson materials — the files a lesson hands out (PDF handouts, slides,
 * worksheets, checklists).
 *
 * Why not /images/upload: that route accepts images only and re-encodes them
 * to WebP, which is right for blog art and wrong for a PDF somebody has to
 * print. Materials are stored byte-for-byte, under their own key prefix in the
 * same public bucket, with the original file name as the download name.
 *
 * Where they live: on the lesson itself, `programs.modules[].items[].attachments`
 * = [{ name, url, key, size, mime }]. The programme is saved whole, so no new
 * table — this router only uploads bytes and reads the free ones back out.
 *
 *   POST /api/v1/materials/upload   admin/instructor (Bearer)   multipart "file"
 *   GET  /api/v1/materials/free     public — attachments of free lessons and
 *                                   free programmes, published programmes only
 */

const MAX_BYTES = Number(process.env.MATERIALS_MAX_BYTES) || 25 * 1024 * 1024
const PREFIX = (process.env.MATERIALS_PREFIX || 'materials').replace(/\/+$/, '')

/** What a learner would reasonably download from a lesson. No executables, no HTML. */
const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true)
    else cb(new Error('Định dạng không được hỗ trợ. Dùng PDF, Word, PowerPoint, Excel, TXT, CSV, ZIP hoặc ảnh.'))
  },
})

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: any) => {
    if (!err) return next()
    const isSize = err.code === 'LIMIT_FILE_SIZE'
    res.status(isSize ? 413 : 400).json({
      success: false,
      error: {
        code: isSize ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
        message: isSize ? `Tệp vượt quá ${Math.round(MAX_BYTES / 1024 / 1024)}MB` : err.message || 'Upload error',
      },
    })
  })
}

let _client: S3Client | null = null
function client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl } = env.r2
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new HttpError('Cloudflare R2 chưa được cấu hình (R2_*)', 503, 'STORAGE_UNAVAILABLE')
  }
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }
  return _client
}

/** A name that is safe in a header but still reads like the original. */
function cleanName(original: string): string {
  const name = String(original || 'tai-lieu').replace(/[\\/\r\n"]/g, ' ').trim()
  return name.slice(0, 180) || 'tai-lieu'
}

export interface Attachment {
  name: string
  url: string
  key: string
  size: number
  mime: string
}

const router = Router()

router.post('/upload', requireAuth, handleUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) throw new HttpError('Chưa có tệp (field "file")', 400, 'NO_FILE')

    const s3 = client()
    const ext = ALLOWED[file.mimetype] || 'bin'
    const key = `${PREFIX}/${randomUUID()}.${ext}`
    const name = cleanName(file.originalname)

    await s3.send(
      new PutObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Opens in the browser when it can (PDF, images), and saves under the
        // real file name — not the UUID — when downloaded.
        ContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    const attachment: Attachment = {
      name,
      url: `${env.r2.publicBaseUrl.replace(/\/$/, '')}/${key}`,
      key,
      size: file.size,
      mime: file.mimetype,
    }
    created(res, attachment)
  } catch (err) {
    next(err)
  }
})

/**
 * Every attachment a visitor may take without paying: those on lessons marked
 * free, and all of them on programmes that cost nothing. Published only — a
 * draft programme's handouts are not public just because a lesson is ticked.
 */
router.get('/free', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, title, price, modules FROM programs
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST, created_at DESC`,
    )

    const materials: (Attachment & {
      programSlug: string
      programTitle: string
      lessonTitle: string
      moduleIndex: number
      itemIndex: number
    })[] = []
    const seen = new Set<string>()

    for (const program of rows) {
      const freeProgram = Number(program.price) <= 0
      const modules = Array.isArray(program.modules) ? program.modules : []
      modules.forEach((module: any, mi: number) => {
        const items = Array.isArray(module?.items) ? module.items : []
        items.forEach((item: any, ii: number) => {
          if (!freeProgram && !item?.free) return
          for (const a of Array.isArray(item?.attachments) ? item.attachments : []) {
            if (!a?.url || seen.has(a.url)) continue
            seen.add(a.url)
            materials.push({
              name: String(a.name || 'Tài liệu'),
              url: String(a.url),
              key: String(a.key || ''),
              size: Number(a.size) || 0,
              mime: String(a.mime || ''),
              programSlug: program.slug,
              programTitle: program.title,
              lessonTitle: String(item.title || ''),
              moduleIndex: mi,
              itemIndex: ii,
            })
          }
        })
      })
    }

    res.setHeader('Cache-Control', 'public, max-age=60')
    success(res, { materials, total: materials.length })
  } catch (err) {
    next(err)
  }
})

export default router
