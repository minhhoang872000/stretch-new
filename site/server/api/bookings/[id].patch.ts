import { z } from 'zod'
import { updateBookingStatus, getBookingById } from '~/server/utils/db'

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const body = await readBody(event)
  
  try {
    const { status } = UpdateStatusSchema.parse(body)
    
    const booking = updateBookingStatus(id, status)
    
    if (!booking) {
      throw createError({ statusCode: 404, message: 'Booking not found' })
    }

    return {
      success: true,
      message: 'Booking status updated successfully',
      booking,
    }
  } catch (err: any) {
    if (err?.issues) {
      throw createError({
        statusCode: 422,
        message: err.issues.map((i: any) => i.message).join(', '),
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to update booking status',
    })
  }
})
