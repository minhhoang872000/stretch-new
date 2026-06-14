import { Router } from 'express'
import { blogController } from './blog.controller'
import { validate } from '../../middleware/validate'
import { createBlogPostSchema, updateBlogPostSchema } from './blog.schema'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

// ─── Admin stats (must come before /:slug so "stats" isn't read as a slug) ──
router.get('/stats', requireAuth, blogController.getStats)

// ─── Public (site reads blog posts) ──────────────────────────────────
router.get('/', blogController.list)
router.get('/:slug', blogController.getBySlug)

// ─── Admin only ──────────────────────────────────────────────────────
router.post('/', requireAuth, validate(createBlogPostSchema), blogController.create)
router.patch('/:id', requireAuth, validate(updateBlogPostSchema), blogController.update)
router.delete('/:id', requireAuth, blogController.remove)

export default router
