import { Request, Response, NextFunction } from 'express'
import { imagesService } from './images.service'
import { success, created } from '../../utils/response'

export const imagesController = {
  /**
   * POST /api/v1/images/upload
   * Multipart form upload (field name: "file"). Proxies the file to Cloudflare Images.
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined
      if (!file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided (expected multipart field "file")' },
        })
        return
      }

      const result = await imagesService.upload(file.buffer, file.originalname, file.mimetype)
      created(res, result)
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/images?limit=&cursor=
   * List uploaded images (media library), paginated.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitRaw = parseInt(req.query.limit as string, 10)
      const cursor = typeof req.query.cursor === 'string' && req.query.cursor ? req.query.cursor : undefined
      const result = await imagesService.list({
        limit: Number.isFinite(limitRaw) ? limitRaw : 60,
        cursor,
      })
      success(res, result)
    } catch (err) {
      next(err)
    }
  },

  /**
   * DELETE /api/v1/images?key=...
   * Remove one uploaded image by its bucket key.
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = (req.query.key as string) || (req.body && req.body.key)
      if (typeof key !== 'string' || !key) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_KEY', message: 'Query/body field "key" is required' },
        })
        return
      }
      await imagesService.deleteByKey(key)
      success(res, { deleted: true, key })
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/images/crop
   * Body: { key, left, top, width, height }. Crops an existing image to a new one.
   */
  async crop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, left, top, width, height } = req.body || {}
      const nums = [left, top, width, height]
      if (typeof key !== 'string' || !key || nums.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CROP', message: 'Required: key (string) and numeric left, top, width, height' },
        })
        return
      }
      if (width <= 0 || height <= 0) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CROP', message: 'width and height must be positive' },
        })
        return
      }
      const result = await imagesService.cropByKey(key, { left, top, width, height })
      created(res, result)
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/images/direct-upload
   * Body: { filename, contentType }. Returns a presigned PUT URL for the browser
   * to upload directly to R2.
   */
  async directUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename, contentType } = req.body || {}
      if (typeof contentType !== 'string' || !/^image\//.test(contentType)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CONTENT_TYPE', message: 'contentType must be an image/* MIME type' },
        })
        return
      }
      const ticket = await imagesService.createDirectUpload(
        typeof filename === 'string' ? filename : 'upload',
        contentType
      )
      created(res, ticket)
    } catch (err) {
      next(err)
    }
  },
}
