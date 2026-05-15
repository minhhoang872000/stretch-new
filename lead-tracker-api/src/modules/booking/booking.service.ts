import { bookingRepository } from './booking.repository'
import type { CreateBookingInput, UpdateBookingStatusInput } from './booking.schema'
import type { Booking, BookingFilter, Product, Practitioner } from '../../types'

/**
 * Business logic for bookings, products, and practitioners.
 */
export const bookingService = {
  // ─── Bookings ──────────────────────────────────────────────────

  async createBooking(data: CreateBookingInput): Promise<Booking> {
    return bookingRepository.createBooking({
      service: data.service,
      date: data.date,
      time: data.time,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      note: data.note || undefined,
      practitioner: data.practitioner || null,
      session_id: data.session_id || null,
    } as any)
  },

  async getBookings(filter?: BookingFilter): Promise<Booking[]> {
    return bookingRepository.getBookings(filter)
  },

  async getBookingById(id: string): Promise<Booking | null> {
    return bookingRepository.getBookingById(id)
  },

  async updateBookingStatus(id: string, data: UpdateBookingStatusInput): Promise<Booking | null> {
    return bookingRepository.updateBookingStatus(id, data.status)
  },

  async deleteBooking(id: string): Promise<boolean> {
    return bookingRepository.deleteBooking(id)
  },

  async getAvailableSlots(practitionerId: string | null, date: string): Promise<string[]> {
    return bookingRepository.getAvailableSlots(practitionerId, date)
  },

  // ─── Products ──────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    return bookingRepository.getProducts()
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return bookingRepository.getProductBySlug(slug)
  },

  // ─── Practitioners ─────────────────────────────────────────────

  async getPractitioners(serviceId?: string): Promise<Practitioner[]> {
    return bookingRepository.getPractitioners(serviceId)
  },
}
