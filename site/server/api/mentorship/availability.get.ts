import { apiBase, upstreamMessage } from '~~/server/utils/mentorshipApi'

/**
 * GET /api/mentorship/availability?from=&to=
 *
 * Open slots for the booking modal. Public on purpose — the modal needs this
 * before anyone commits to anything, and it only reveals which half-hours the
 * academy has free, never who is in the other ones.
 */

interface DayAvailability {
  date: string
  weekday: number
  slots: string[]
}

interface AvailabilityResponse {
  days: DayAvailability[]
  slotMinutes: number
  from: string
  to: string
  /** False when the API could not reach Google Calendar. */
  calendarChecked: boolean
}

export default defineEventHandler(async (event): Promise<AvailabilityResponse> => {
  const query = getQuery(event)
  const base = apiBase(event)

  const empty: AvailabilityResponse = {
    days: [],
    slotMinutes: 30,
    from: '',
    to: '',
    calendarChecked: false,
  }

  if (!base) return empty

  setHeader(event, 'cache-control', 'no-store')

  try {
    const res = await $fetch<{ success: boolean; data?: AvailabilityResponse }>(
      `${base}/mentorship/availability`,
      {
        query: {
          from: query.from ? String(query.from) : undefined,
          to: query.to ? String(query.to) : undefined,
        },
        timeout: 8000,
      },
    )
    return res?.data ?? empty
  } catch (err: any) {
    // An availability lookup that fails must not break the lesson page; the
    // modal shows "no slots" and the learner can try again.
    console.error('[mentorship/availability]', upstreamMessage(err, 'lookup failed'))
    return empty
  }
})
