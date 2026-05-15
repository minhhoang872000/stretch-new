import { getBookings } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const filter: {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    date?: string
    service?: string
  } = {}

  if (query.status && typeof query.status === 'string') {
    filter.status = query.status as any
  }
  if (query.date && typeof query.date === 'string') {
    filter.date = query.date
  }
  if (query.service && typeof query.service === 'string') {
    filter.service = query.service
  }

  const bookings = getBookings(Object.keys(filter).length ? filter : undefined)
  
  return {
    success: true,
    bookings,
    total: bookings.length,
  }
})
