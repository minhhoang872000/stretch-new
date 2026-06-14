import { Router } from 'express'
import { bookingController } from './booking.controller'
import { validate } from '../../middleware/validate'
import { createBookingSchema, updateBookingStatusSchema } from './booking.schema'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

// ─── Public (site form uses these) ───────────────────────────────────
router.post('/', validate(createBookingSchema), bookingController.create)
router.get('/availability', bookingController.availability)
router.get('/products', bookingController.listProducts)
router.get('/products/:slug', bookingController.getProductBySlug)
router.get('/practitioners', bookingController.listPractitioners)

// ─── Admin only ──────────────────────────────────────────────────────
router.get('/', requireAuth, bookingController.list)
router.get('/:id', requireAuth, bookingController.getById)
router.patch('/:id', requireAuth, validate(updateBookingStatusSchema), bookingController.updateStatus)
router.delete('/:id', requireAuth, bookingController.remove)

export default router
