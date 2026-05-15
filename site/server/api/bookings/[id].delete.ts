import { deleteBooking } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const deleted = deleteBooking(id)
  
  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  return {
    success: true,
    message: 'Booking deleted successfully',
  }
})
