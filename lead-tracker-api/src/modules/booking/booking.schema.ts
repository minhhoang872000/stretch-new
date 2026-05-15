import { z } from 'zod'

export const createBookingSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(/^(\d{2}:\d{2}|flexible)$/, 'Time must be HH:mm or "flexible"'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Phone number is invalid'),
  email: z.string().email('Email is invalid').optional().or(z.literal('')),
  note: z.string().optional(),
  practitioner: z.string().nullable().optional(),
  session_id: z.string().max(64).nullable().optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
