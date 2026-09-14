import { Request, Response, NextFunction } from 'express'
import { videosService } from './videos.service'
import { success, created, error } from '../../utils/response'

function adminEmail(req: Request): string | null {
  const admin = (req as any).admin
  return admin?.email || admin?.sub || null
}

export const videosController = {
  /**
   * POST /api/v1/videos/uploads
   * Body: { filename, contentType, sizeBytes, title?, programSlug?, lessonOrdinal? }
   * Returns the multipart ticket the browser uploads with.
   */
  async createUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename, contentType, sizeBytes, title, programSlug, lessonOrdinal } = req.body || {}
      if (!filename || !contentType) {
        error(res, 'filename and contentType are required', 400, 'INVALID_BODY')
        return
      }
      const ticket = await videosService.createUpload({
        filename: String(filename),
        contentType: String(contentType),
        sizeBytes: Number(sizeBytes),
        title: title ? String(title) : undefined,
        programSlug: programSlug ? String(programSlug) : null,
        lessonOrdinal:
          lessonOrdinal === undefined || lessonOrdinal === null || lessonOrdinal === ''
            ? null
            : Number(lessonOrdinal),
        createdBy: adminEmail(req),
      })
      created(res, ticket)
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/videos/uploads/simple
   * One presigned PUT for the whole file — the fallback path, and what small
   * files use. Same body as /uploads.
   */
  async createSimpleUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename, contentType, sizeBytes, title, programSlug, lessonOrdinal } = req.body || {}
      if (!filename || !contentType) {
        error(res, 'filename and contentType are required', 400, 'INVALID_BODY')
        return
      }
      const ticket = await videosService.createSimpleUpload({
        filename: String(filename),
        contentType: String(contentType),
        sizeBytes: Number(sizeBytes) || 0,
        title: title ? String(title) : undefined,
        programSlug: programSlug ? String(programSlug) : null,
        lessonOrdinal:
          lessonOrdinal === undefined || lessonOrdinal === null || lessonOrdinal === ''
            ? null
            : Number(lessonOrdinal),
        createdBy: adminEmail(req),
      })
      created(res, ticket)
    } catch (err) {
      next(err)
    }
  },

  /** POST /api/v1/videos/uploads/:id/confirm — close a simple upload. */
  async confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      success(res, await videosService.confirmUpload((req.params.id as string)))
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/videos/uploads/:id/complete
   * Body: { parts: [{ partNumber, etag }] }
   */
  async completeUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Keep the ETag exactly as R2 returned it (quotes included) — the SDK
      // sends it back verbatim and R2 compares it byte for byte.
      const parts = (req.body?.parts || []).map((p: any) => ({
        partNumber: Number(p.partNumber),
        etag: String(p.etag || ''),
      }))
      const video = await videosService.completeUpload((req.params.id as string), parts)
      success(res, video)
    } catch (err) {
      next(err)
    }
  },

  /** POST /api/v1/videos/uploads/:id/abort */
  async abortUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await videosService.abortUpload((req.params.id as string))
      success(res, { aborted: true })
    } catch (err) {
      next(err)
    }
  },

  /** GET /api/v1/videos?programSlug=&status=&limit= */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitRaw = parseInt(req.query.limit as string, 10)
      const videos = await videosService.list({
        programSlug: (req.query.programSlug as string) || undefined,
        status: (req.query.status as any) || undefined,
        limit: Number.isFinite(limitRaw) ? limitRaw : 50,
      })
      success(res, { videos })
    } catch (err) {
      next(err)
    }
  },

  /** GET /api/v1/videos/:id */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      success(res, await videosService.get((req.params.id as string)))
    } catch (err) {
      next(err)
    }
  },

  /** PATCH /api/v1/videos/:id — bind to a lesson, rename, record duration */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, programSlug, lessonOrdinal, durationSeconds } = req.body || {}
      const video = await videosService.update((req.params.id as string), {
        title: title === undefined ? undefined : String(title),
        programSlug: programSlug === undefined ? undefined : programSlug || null,
        lessonOrdinal:
          lessonOrdinal === undefined
            ? undefined
            : lessonOrdinal === null || lessonOrdinal === ''
              ? null
              : Number(lessonOrdinal),
        durationSeconds:
          durationSeconds === undefined
            ? undefined
            : durationSeconds === null
              ? null
              : Math.round(Number(durationSeconds)),
      })
      success(res, video)
    } catch (err) {
      next(err)
    }
  },

  /** DELETE /api/v1/videos/:id */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await videosService.remove((req.params.id as string))
      success(res, { deleted: true })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/videos/:id/playback
   * Admin (console preview) or the website's server route (learner playback).
   */
  async playback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await videosService.playbackFor((req.params.id as string))
      // The URL is per-request and expires; never let a cache hand it to someone else.
      res.set('Cache-Control', 'no-store')
      success(res, ticket)
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/videos/lesson?slug=&ordinal=
   * What the website asks for: "the video for lesson N of this course, please",
   * answered with a playback ticket so the site needs one round trip, not two.
   */
  async lesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.query.slug || '')
      const ordinal = Number(req.query.ordinal)
      if (!slug || !Number.isInteger(ordinal) || ordinal < 0) {
        error(res, 'slug and a non-negative integer ordinal are required', 400, 'INVALID_QUERY')
        return
      }

      const video = await videosService.findForLesson(slug, ordinal)
      if (!video) {
        res.set('Cache-Control', 'no-store')
        success(res, { video: null })
        return
      }

      const ticket = await videosService.playbackFor(video.id)
      res.set('Cache-Control', 'no-store')
      success(res, {
        video: {
          id: video.id,
          title: video.title,
          contentType: video.contentType,
          durationSeconds: video.durationSeconds,
        },
        playback: ticket,
      })
    } catch (err) {
      next(err)
    }
  },
}
