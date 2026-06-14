import { Router } from 'express'
import { categoryController } from './category.controller'
import { validate } from '../../middleware/validate'
import { createCategorySchema, updateCategorySchema } from './category.schema'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

// ─── Public (site reads categories) ──────────────────────────────────
router.get('/', categoryController.list)
router.get('/:id', categoryController.getById)

// ─── Admin only ──────────────────────────────────────────────────────
router.post('/', requireAuth, validate(createCategorySchema), categoryController.create)
router.patch('/:id', requireAuth, validate(updateCategorySchema), categoryController.update)
router.delete('/:id', requireAuth, categoryController.remove)

export default router
