import { getBookingById } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const booking = getBookingById(id)
  
  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  return {
    success: true,
    booking,
  }
})
