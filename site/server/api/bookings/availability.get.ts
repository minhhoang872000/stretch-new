import { getAvailableSlots } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const practitioner = query.practitioner as string
  const date = query.date as string

  if (!date) {
    throw createError({ statusCode: 400, message: 'Missing date parameter' })
  }

  // If no practitioner specified, return all slots
  const practitionerId = practitioner || 'any'

  return getAvailableSlots(practitionerId, date)
})
