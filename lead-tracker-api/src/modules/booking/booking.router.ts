import { Router } from 'express'
import { bookingController } from './booking.controller'
import { validate } from '../../middleware/validate'
import { createBookingSchema, updateBookingStatusSchema } from './booking.schema'

const router = Router()

// ─── Bookings ────────────────────────────────────────────────────────
router.post('/', validate(createBookingSchema), bookingController.create)
router.get('/', bookingController.list)
router.get('/availability', bookingController.availability)
router.get('/:id', bookingController.getById)
router.patch('/:id', validate(updateBookingStatusSchema), bookingController.updateStatus)
router.delete('/:id', bookingController.remove)

// ─── Products ────────────────────────────────────────────────────────
router.get('/products', bookingController.listProducts)
router.get('/products/:slug', bookingController.getProductBySlug)

// ─── Practitioners ───────────────────────────────────────────────────
router.get('/practitioners', bookingController.listPractitioners)

export default router
