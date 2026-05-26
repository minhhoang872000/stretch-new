import { Router } from 'express'
import { blogController } from './blog.controller'
import { validate } from '../../middleware/validate'
import { createBlogPostSchema, updateBlogPostSchema } from './blog.schema'

const router = Router()

// ─── Blog Posts ──────────────────────────────────────────────────────
router.get('/', blogController.list)
router.get('/:slug', blogController.getBySlug)
router.post('/', validate(createBlogPostSchema), blogController.create)
router.patch('/:id', validate(updateBlogPostSchema), blogController.update)
router.delete('/:id', blogController.remove)

export default router
