import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { imagesController } from './images.controller'
import { env } from '../../config/env'

const router = Router()

// ─── Multer (in-memory; file is forwarded to Cloudflare, never written to disk) ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.r2.maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

/** Translate multer errors into the standard API error envelope. */
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      const isSize = err.code === 'LIMIT_FILE_SIZE'
      res.status(isSize ? 413 : 400).json({
        success: false,
        error: {
          code: isSize ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
          message: isSize
            ? `File exceeds the maximum size of ${Math.round(env.r2.maxUploadBytes / 1024 / 1024)}MB`
            : err.message || 'Upload error',
        },
      })
      return
    }
    next()
  })
}

// ─── Image Endpoints ─────────────────────────────────────────────────
router.post('/upload', handleUpload, imagesController.upload)
router.post('/direct-upload', imagesController.directUpload)

export default router
