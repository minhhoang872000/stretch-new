import { Request, Response, NextFunction } from 'express'
import { bookingService } from './booking.service'
import { success, created } from '../../utils/response'
import type { BookingFilter } from '../../types'

export const bookingController = {
  // ─── Bookings ──────────────────────────────────────────────────

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.createBooking((req as any).validatedBody)
      created(res, {
        message: 'Booking created successfully',
        booking: { id: booking.id, status: booking.status },
      })
    } catch (err) {
      next(err)
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: BookingFilter = {}
      const { status, date, service } = req.query

      if (typeof status === 'string') filter.status = status as any
      if (typeof date === 'string') filter.date = date
      if (typeof service === 'string') filter.service = service

      const bookings = await bookingService.getBookings(
        Object.keys(filter).length ? filter : undefined
      )

      success(res, { bookings, total: bookings.length })
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const booking = await bookingService.getBookingById(id)

      if (!booking) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } })
        return
      }

      success(res, { booking })
    } catch (err) {
      next(err)
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const booking = await bookingService.updateBookingStatus(id, (req as any).validatedBody)

      if (!booking) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } })
        return
      }

      success(res, { message: 'Booking status updated', booking })
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const deleted = await bookingService.deleteBooking(id)

      if (!deleted) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } })
        return
      }

      success(res, { message: 'Booking deleted successfully' })
    } catch (err) {
      next(err)
    }
  },

  async availability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const practitioner = req.query.practitioner as string | undefined
      const date = req.query.date as string | undefined

      if (!date) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing date parameter' } })
        return
      }

      const slots = await bookingService.getAvailableSlots(practitioner || null, date)
      success(res, slots)
    } catch (err) {
      next(err)
    }
  },

  // ─── Products ──────────────────────────────────────────────────

  async listProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await bookingService.getProducts()
      success(res, products)
    } catch (err) {
      next(err)
    }
  },

  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string
      const product = await bookingService.getProductBySlug(slug)

      if (!product) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } })
        return
      }

      success(res, product)
    } catch (err) {
      next(err)
    }
  },

  // ─── Practitioners ─────────────────────────────────────────────

  async listPractitioners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = req.query.service as string | undefined
      const practitioners = await bookingService.getPractitioners(serviceId)
      success(res, practitioners)
    } catch (err) {
      next(err)
    }
  },
}
