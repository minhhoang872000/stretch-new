/**
 * Proxies available time-slots from the lead-tracker-api so the landing page
 * reflects real bookings. Returns a plain string[] of slots.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const date = query.date as string
  const practitioner = query.practitioner as string | undefined

  if (!date) {
    throw createError({ statusCode: 400, message: 'Missing date parameter' })
  }

  const base = useRuntimeConfig().public.trackingApiUrl
  if (!base) return []

  try {
    const res = await $fetch<{ data?: string[] }>(`${base}/api/v1/bookings/availability`, {
      query: { date, practitioner: practitioner || undefined },
      timeout: 6000,
    })
    return res?.data || []
  } catch {
    return []
  }
})
