import { JWT } from 'google-auth-library'
import { env } from '../../config/env'

/**
 * Google Calendar, over REST.
 *
 * Same shape as `search-console/sc.service.ts` — a `JWT` from
 * google-auth-library plus `fetch` — rather than the `googleapis` package,
 * which would pull a very large dependency in for four endpoints.
 *
 * ── Two modes, and why the code branches on it ──────────────────────────────
 *
 * A bare service account may only do what a calendar shared with it allows:
 * create, read and delete events. It may NOT invite attendees and may NOT
 * create a Google Meet link — Google rejects both with a 403, because there is
 * no human identity behind the request to send mail as or host a call as.
 *
 * With domain-wide delegation (`GCAL_IMPERSONATE_SUBJECT`, Workspace only) the
 * service account acts AS that user, and both become available.
 *
 * So `delegated()` decides what we even ask for. On top of that, `createEvent`
 * retries once stripped down if the rich request is refused anyway — a
 * misconfigured delegation should degrade to a plain calendar entry, not lose
 * the booking.
 */

const API = 'https://www.googleapis.com/calendar/v3'
const SCOPE = 'https://www.googleapis.com/auth/calendar'

export interface BusyPeriod {
  /** RFC3339 */
  start: string
  end: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description: string
  /** RFC3339, or a bare date for all-day events. */
  start: string
  end: string
  allDay: boolean
  meetUrl: string | null
  htmlLink: string
  attendees: string[]
  status: string
}

export interface CreateEventInput {
  summary: string
  description?: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  durationMinutes: number
  /** Invited only when delegation is on; otherwise recorded in the description. */
  attendeeEmail?: string
  attendeeName?: string
  /** Ask Google for a Meet link. Ignored without delegation. */
  requestMeet?: boolean
}

export interface CreatedEvent {
  id: string
  meetUrl: string | null
  htmlLink: string
  /** True when the event was created without the attendee/Meet extras. */
  degraded: boolean
}

let client: JWT | null = null

/** Whether the calendar integration has enough config to be used at all. */
export function calendarConfigured(): boolean {
  return Boolean(env.gcal.clientEmail && env.gcal.privateKey && env.gcal.calendarId)
}

/** Whether we can invite attendees and mint Meet links. */
export function delegated(): boolean {
  return Boolean(env.gcal.impersonateSubject)
}

function getClient(): JWT {
  if (!calendarConfigured()) {
    throw new Error(
      'Google Calendar is not configured. Set GCAL_CALENDAR_ID and GCAL_CLIENT_EMAIL/GCAL_PRIVATE_KEY ' +
        '(or reuse GA_CLIENT_EMAIL/GA_PRIVATE_KEY) in .env, enable the Calendar API, and share the ' +
        'calendar with the service-account email.'
    )
  }
  if (!client) {
    client = new JWT({
      email: env.gcal.clientEmail,
      key: env.gcal.privateKey,
      scopes: [SCOPE],
      // Undefined rather than '' — passing an empty subject makes the token request fail.
      subject: env.gcal.impersonateSubject || undefined,
    })
  }
  return client
}

/** A Google API error carrying the upstream status, so callers can branch on it. */
export class CalendarApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'CalendarApiError'
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = await getClient().getAccessToken()
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    let message = body
    try {
      message = JSON.parse(body)?.error?.message || body
    } catch {
      /* not JSON — keep the raw body */
    }
    throw new CalendarApiError(res.status, `Google Calendar ${res.status}: ${message}`)
  }

  // DELETE returns 204 with an empty body.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

const calId = () => encodeURIComponent(env.gcal.calendarId)

// ─── Time helpers ────────────────────────────────────────────────────────────
// Everything is stored as a local date + HH:mm and stamped with a fixed offset.
// Vietnam has no DST, so this is correct year-round and — unlike `new Date()` —
// does not depend on the server's own timezone, which on Render is UTC.

/** `2026-09-14` + `14:30` → `2026-09-14T14:30:00+07:00` */
export function toRfc3339(date: string, time: string): string {
  return `${date}T${time}:00${env.gcal.utcOffset}`
}

/** `14:30` + 30 → `15:00`. Wraps past midnight are clamped to 23:59. */
export function addMinutes(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  if (total >= 24 * 60) return '23:59'
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ─── API surface ─────────────────────────────────────────────────────────────

export const gcalService = {
  /**
   * Busy periods on the calendar between two instants. This is what makes an
   * existing appointment — booked here or typed straight into Google Calendar —
   * remove a slot from what learners are offered.
   */
  async freeBusy(timeMin: string, timeMax: string): Promise<BusyPeriod[]> {
    const body = {
      timeMin,
      timeMax,
      timeZone: env.gcal.timezone,
      items: [{ id: env.gcal.calendarId }],
    }

    const res = await call<{
      calendars?: Record<string, { busy?: BusyPeriod[]; errors?: { reason: string }[] }>
    }>('/freeBusy', { method: 'POST', body: JSON.stringify(body) })

    const entry = res.calendars?.[env.gcal.calendarId]
    if (entry?.errors?.length) {
      throw new CalendarApiError(
        403,
        `Cannot read ${env.gcal.calendarId}: ${entry.errors.map((e) => e.reason).join(', ')}. ` +
          'Share the calendar with the service-account email.'
      )
    }
    return entry?.busy ?? []
  },

  /**
   * Creates the session on the calendar.
   *
   * Returns `degraded: true` when the attendee/Meet extras had to be dropped, so
   * the console can tell an admin to paste a meeting link in by hand instead of
   * silently showing a session with no way to join it.
   */
  async createEvent(input: CreateEventInput): Promise<CreatedEvent> {
    const endTime = addMinutes(input.time, input.durationMinutes)
    const canInvite = delegated()

    // Without delegation the attendee cannot be a real attendee, so their email
    // has to survive somewhere a human will look.
    const description = canInvite
      ? input.description || ''
      : [
          input.description || '',
          '',
          `Học viên: ${input.attendeeName || ''} <${input.attendeeEmail || ''}>`,
        ]
          .join('\n')
          .trim()

    const base: Record<string, unknown> = {
      summary: input.summary,
      description,
      start: { dateTime: toRfc3339(input.date, input.time), timeZone: env.gcal.timezone },
      end: { dateTime: toRfc3339(input.date, endTime), timeZone: env.gcal.timezone },
    }

    const rich: Record<string, unknown> = { ...base }
    if (canInvite && input.attendeeEmail) {
      rich.attendees = [{ email: input.attendeeEmail, displayName: input.attendeeName }]
    }
    if (canInvite && input.requestMeet) {
      rich.conferenceData = {
        createRequest: {
          // Unique per attempt; Google rejects a reused id with different data.
          requestId: `stretch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      }
    }

    const wantsExtras = Object.keys(rich).length > Object.keys(base).length
    const query = new URLSearchParams()
    if (canInvite && input.requestMeet) query.set('conferenceDataVersion', '1')
    if (canInvite && input.attendeeEmail) query.set('sendUpdates', 'all')
    const qs = query.toString() ? `?${query.toString()}` : ''

    type EventResponse = {
      id: string
      htmlLink: string
      hangoutLink?: string
      conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
    }

    const post = (payload: Record<string, unknown>, search: string) =>
      call<EventResponse>(`/calendars/${calId()}/events${search}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

    let created: EventResponse
    let degraded = false

    try {
      created = await post(rich, qs)
    } catch (err) {
      // A delegation that is configured but not actually granted fails here.
      // The booking matters more than the Meet link, so fall back to plain.
      if (!wantsExtras || !(err instanceof CalendarApiError) || err.status < 400 || err.status >= 500) {
        throw err
      }
      console.warn('[gcal] rich event rejected, retrying without attendees/Meet:', err.message)
      created = await post(base, '')
      degraded = true
    }

    const meetUrl =
      created.hangoutLink ||
      created.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
      null

    return {
      id: created.id,
      meetUrl,
      htmlLink: created.htmlLink,
      degraded: degraded || (Boolean(input.requestMeet) && !meetUrl),
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const search = delegated() ? '?sendUpdates=all' : ''
    try {
      await call<void>(`/calendars/${calId()}/events/${encodeURIComponent(eventId)}${search}`, {
        method: 'DELETE',
      })
    } catch (err) {
      // Already gone (deleted in Google Calendar directly) is the outcome we want.
      if (err instanceof CalendarApiError && (err.status === 404 || err.status === 410)) return
      throw err
    }
  },

  /** Events in a window — what the console's calendar tab renders. */
  async listEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
    const query = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
      timeZone: env.gcal.timezone,
    })

    const res = await call<{
      items?: {
        id: string
        summary?: string
        description?: string
        status?: string
        htmlLink?: string
        hangoutLink?: string
        start?: { dateTime?: string; date?: string }
        end?: { dateTime?: string; date?: string }
        attendees?: { email?: string }[]
        conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
      }[]
    }>(`/calendars/${calId()}/events?${query.toString()}`)

    return (res.items ?? []).map((e) => ({
      id: e.id,
      summary: e.summary ?? '(không có tiêu đề)',
      description: e.description ?? '',
      start: e.start?.dateTime ?? e.start?.date ?? '',
      end: e.end?.dateTime ?? e.end?.date ?? '',
      allDay: !e.start?.dateTime,
      meetUrl:
        e.hangoutLink ||
        e.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri ||
        null,
      htmlLink: e.htmlLink ?? '',
      attendees: (e.attendees ?? []).map((a) => a.email ?? '').filter(Boolean),
      status: e.status ?? 'confirmed',
    }))
  },
}
