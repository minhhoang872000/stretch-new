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
