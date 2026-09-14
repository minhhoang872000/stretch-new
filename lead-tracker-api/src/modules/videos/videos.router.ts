import { Router, Request, Response, NextFunction } from 'express'
import { videosController } from './videos.controller'
import { requireAuth } from '../../middleware/requireAuth'
import { requireAdminOrSite } from '../../middleware/requireSite'

const router = Router()

// ─── Playback (admin or website) ─────────────────────────────────────
router.get('/lesson', requireAdminOrSite, videosController.lesson)
router.get('/:id/playback', requireAdminOrSite, videosController.playback)

// ─── Library + uploads (admin only) ──────────────────────────────────
// `/uploads/simple` must be declared before `/uploads/:id/...` would ever be
// reached for it — different shape, same prefix.
router.post('/uploads/simple', requireAuth, videosController.createSimpleUpload)
router.post('/uploads', requireAuth, videosController.createUpload)
router.post('/uploads/:id/complete', requireAuth, videosController.completeUpload)
router.post('/uploads/:id/confirm', requireAuth, videosController.confirmUpload)
router.post('/uploads/:id/abort', requireAuth, videosController.abortUpload)

router.get('/', requireAuth, videosController.list)
router.get('/:id', requireAuth, videosController.get)
router.patch('/:id', requireAuth, videosController.update)
router.delete('/:id', requireAuth, videosController.remove)

export default router
