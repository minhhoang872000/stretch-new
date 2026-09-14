import { env } from '../../config/env'
import {
  gcalService,
  calendarConfigured,
  delegated,
  toRfc3339,
  addMinutes,
  CalendarApiError,
  type CalendarEvent,
} from '../google-calendar/gcal.service'
import {
  mentorshipRepository,
  PG_UNIQUE_VIOLATION,
  type MentorshipFilter,
  type MentorshipHour,
  type MentorshipSession,
} from './mentorship.repository'
import type { CreateMentorshipInput } from './mentorship.schema'

/** Carries an HTTP status so the controller does not have to guess. */
export class MentorshipError extends Error {
  constructor(public status: number, message: string, public code = 'MENTORSHIP_ERROR') {
    super(message)
    this.name = 'MentorshipError'
  }
}

// ─── Date/time helpers ───────────────────────────────────────────────────────
// All of these avoid the server's own timezone. Render runs in UTC while the
// academy runs in Vietnam, so `new Date().getDay()` would be wrong for three
// hours every evening.

const pad = (n: number) => String(n).padStart(2, '0')

function offsetMinutes(): number {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(env.gcal.utcOffset)
  if (!m) return 0
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
}

/** The instant shifted so that `getUTC*` reads calendar-local wall-clock fields. */
function nowLocal(): Date {
  return new Date(Date.now() + offsetMinutes() * 60_000)
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** 0 = Sunday, computed from the string alone. */
function weekdayOf(date: string): number {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function addDays(date: string, days: number): string {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number)
  return isoDate(new Date(Date.UTC(y, m - 1, d) + days * 86_400_000))
}

function eachDate(from: string, to: string, cap = 120): string[] {
  const out: string[] = []
  let cur = from
  while (cur <= to && out.length < cap) {
    out.push(cur)
    cur = addDays(cur, 1)
  }
  return out
}

/** Absolute instant of a local date+time, via the fixed offset. */
function instantOf(date: string, time: string): number {
  return Date.parse(toRfc3339(date, time))
}

interface Range {
  s: number
  e: number
}

const overlaps = (a: Range, b: Range) => a.s < b.e && a.e > b.s

// ─── Availability ────────────────────────────────────────────────────────────

export interface DayAvailability {
  date: string
  weekday: number
  slots: string[]
}

export interface AvailabilityResult {
  days: DayAvailability[]
  slotMinutes: number
  from: string
  to: string
  /** False when Google Calendar is not set up — slots then reflect this DB only. */
  calendarChecked: boolean
}

async function buildAvailability(fromInput?: string, toInput?: string): Promise<AvailabilityResult> {
  const slotMinutes = Math.max(5, env.mentorship.slotMinutes)
  const today = isoDate(nowLocal())
  const latest = addDays(today, Math.max(1, env.mentorship.bookAheadDays))

  const from = fromInput && fromInput > today ? fromInput : today
  const to = toInput && toInput < latest ? toInput : latest

  if (from > to) {
    return { days: [], slotMinutes, from, to, calendarChecked: false }
  }

  const hours = (await mentorshipRepository.getHours()).filter((h) => h.active)
  const byWeekday = new Map<number, MentorshipHour>(hours.map((h) => [h.weekday, h]))

  // Every slot the opening hours would allow, before anything is subtracted.
  const candidates: DayAvailability[] = []
  for (const date of eachDate(from, to)) {
    const window = byWeekday.get(weekdayOf(date))
    if (!window) continue

    const slots: string[] = []
    let t = window.startTime
    // `addMinutes` clamps at 23:59, so also stop if the cursor stops moving.
    for (let guard = 0; guard < 200; guard++) {
      const end = addMinutes(t, slotMinutes)
      if (end > window.endTime || end === t) break
      slots.push(t)
      t = end
    }
    if (slots.length) candidates.push({ date, weekday: weekdayOf(date), slots })
  }

  if (!candidates.length) {
    return { days: [], slotMinutes, from, to, calendarChecked: false }
  }

  const blocked: Range[] = (await mentorshipRepository.getTakenSlots(from, to)).map((t) => {
    const s = instantOf(t.date, t.time)
    return { s, e: s + t.durationMinutes * 60_000 }
  })

  // Anything already on the academy's calendar closes the slot too — that is the
  // whole reason for talking to Google here rather than trusting this table.
  let calendarChecked = false
  if (calendarConfigured()) {
    try {
      const busy = await gcalService.freeBusy(toRfc3339(from, '00:00'), toRfc3339(to, '23:59'))
      for (const b of busy) blocked.push({ s: Date.parse(b.start), e: Date.parse(b.end) })
      calendarChecked = true
    } catch (err) {
      // Offering slots from the DB alone beats showing an empty calendar; the
      // accept step checks Google again before anything is committed.
      console.warn('[mentorship] freeBusy failed, falling back to DB-only availability:', err)
    }
  }

  const earliest = Date.now() + env.mentorship.leadTimeHours * 3_600_000

  const days = candidates
    .map((day) => ({
      ...day,
      slots: day.slots.filter((time) => {
        const s = instantOf(day.date, time)
        const range = { s, e: s + slotMinutes * 60_000 }
        if (s < earliest) return false
        return !blocked.some((b) => overlaps(range, b))
      }),
    }))
    .filter((d) => d.slots.length > 0)

  return { days, slotMinutes, from, to, calendarChecked }
}

// ─── Event composition ───────────────────────────────────────────────────────

function eventSummary(s: MentorshipSession): string {
  return `Buổi 1-1 · ${s.learnerName}`
}

function eventDescription(s: MentorshipSession): string {
  const lines: string[] = []
  if (s.topic) lines.push(s.topic, '')
  if (s.lessonTitle) lines.push(`Bài học: ${s.lessonTitle}`)
  if (s.programSlug) {
    const path = s.lessonKey
      ? `/vi/learning-hub/learn/${s.programSlug}?lesson=${s.lessonKey}`
      : `/vi/learning-hub/programs/${s.programSlug}`
    lines.push(`Mở bài học: ${env.siteBaseUrl}${path}`)
  }
  lines.push('', `Yêu cầu #${s.id} · đặt qua Learning Hub`)
  return lines.join('\n').trim()
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const mentorshipService = {
  getAvailability: buildAvailability,

  async getHours(): Promise<MentorshipHour[]> {
    return mentorshipRepository.getHours()
  },

  async replaceHours(hours: MentorshipHour[]): Promise<MentorshipHour[]> {
    return mentorshipRepository.replaceHours(hours)
  },

  async list(filter?: MentorshipFilter): Promise<MentorshipSession[]> {
    return mentorshipRepository.list(filter)
  },

  async getById(id: string): Promise<MentorshipSession | null> {
    return mentorshipRepository.getById(id)
  },

  async listForLearner(email: string): Promise<MentorshipSession[]> {
    return mentorshipRepository.list({ learnerEmail: email })
  },

  /**
   * Books a slot for a learner. Re-derives availability rather than trusting the
   * browser: the modal may have been open for a while, and the slot it is asking
   * for may have been taken or closed since.
   */
  async createRequest(input: CreateMentorshipInput): Promise<MentorshipSession> {
    const open = await buildAvailability(input.date, input.date)
    const day = open.days.find((d) => d.date === input.date)
    if (!day || !day.slots.includes(input.time)) {
      throw new MentorshipError(
        409,
        'Khung giờ này vừa có người đặt hoặc không còn mở. Anh/chị chọn giúp giờ khác nhé.',
        'SLOT_UNAVAILABLE'
      )
    }

    const pending = await mentorshipRepository.countPending(input.learner_email)
    if (pending >= env.mentorship.maxPendingPerLearner) {
      throw new MentorshipError(
        429,
        `Bạn đang có ${pending} yêu cầu chờ duyệt. Vui lòng đợi phản hồi trước khi đặt thêm.`,
        'TOO_MANY_PENDING'
      )
    }

    try {
      return await mentorshipRepository.create(input, open.slotMinutes)
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new MentorshipError(
          409,
          'Khung giờ này vừa có người đặt. Anh/chị chọn giúp giờ khác nhé.',
          'SLOT_UNAVAILABLE'
        )
      }
      throw err
    }
  },

  /**
   * Accepts a request and puts it on the calendar.
   *
   * Returns a `warning` instead of failing when the event could not carry a Meet
   * link — the session is real either way, and the console offers a box to paste
   * a link into.
   */
  async accept(
    id: string,
    meetUrlOverride?: string
  ): Promise<{ session: MentorshipSession; warning: string | null }> {
    const existing = await mentorshipRepository.getById(id)
    if (!existing) throw new MentorshipError(404, 'Mentorship request not found', 'NOT_FOUND')
    if (existing.status === 'accepted' && existing.googleEventId) {
      throw new MentorshipError(409, 'Yêu cầu này đã được duyệt.', 'ALREADY_ACCEPTED')
    }
    if (existing.status === 'declined' || existing.status === 'cancelled') {
      throw new MentorshipError(409, 'Yêu cầu này đã bị từ chối hoặc đã huỷ.', 'NOT_PENDING')
    }

    if (!calendarConfigured()) {
      const session = await mentorshipRepository.markAccepted(id, {
        googleEventId: null,
        googleHtmlLink: null,
        meetUrl: meetUrlOverride || null,
      })
      return {
        session: session!,
        warning:
          'Đã duyệt, nhưng Google Calendar chưa được cấu hình nên buổi học chưa lên lịch. ' +
          'Cần đặt GCAL_CALENDAR_ID và bật Calendar API.',
      }
    }

    // The calendar may have filled up between the request and this click.
    const start = instantOf(existing.date, existing.time)
    const end = start + existing.durationMinutes * 60_000
    try {
      const busy = await gcalService.freeBusy(new Date(start).toISOString(), new Date(end).toISOString())
      const clash = busy.some((b) => overlaps({ s: start, e: end }, { s: Date.parse(b.start), e: Date.parse(b.end) }))
      if (clash) {
        throw new MentorshipError(
          409,
          'Giờ này trên Google Calendar đã có lịch khác. Hãy từ chối và hẹn lại giờ trống.',
          'CALENDAR_BUSY'
        )
      }
    } catch (err) {
      if (err instanceof MentorshipError) throw err
      console.warn('[mentorship] busy re-check failed, creating event anyway:', err)
    }

    let created
    try {
      created = await gcalService.createEvent({
        summary: eventSummary(existing),
        description: eventDescription(existing),
        date: existing.date,
        time: existing.time,
        durationMinutes: existing.durationMinutes,
        attendeeEmail: existing.learnerEmail,
        attendeeName: existing.learnerName,
        requestMeet: !meetUrlOverride,
      })
    } catch (err) {
      const detail = err instanceof CalendarApiError ? err.message : String(err)
      throw new MentorshipError(502, `Không tạo được sự kiện trên Google Calendar. ${detail}`, 'CALENDAR_FAILED')
    }

    const session = await mentorshipRepository.markAccepted(id, {
      googleEventId: created.id,
      googleHtmlLink: created.htmlLink,
      // A hand-pasted link wins: an admin who typed one knows something we do not.
      meetUrl: meetUrlOverride || created.meetUrl,
    })

    let warning: string | null = null
    if (!meetUrlOverride && !created.meetUrl) {
      warning = delegated()
        ? 'Đã lên lịch, nhưng Google không cấp link Meet cho lần này. Hãy dán link họp thủ công.'
        : 'Đã lên lịch. Tài khoản chưa bật uỷ quyền toàn miền nên không có link Meet tự động — hãy dán link họp thủ công.'
    }

    return { session: session!, warning }
  },

  async decline(id: string, reason?: string): Promise<MentorshipSession> {
    const existing = await mentorshipRepository.getById(id)
    if (!existing) throw new MentorshipError(404, 'Mentorship request not found', 'NOT_FOUND')

    // Declining something already on the calendar must also take it off.
    if (existing.googleEventId && calendarConfigured()) {
      try {
        await gcalService.deleteEvent(existing.googleEventId)
        await mentorshipRepository.clearEvent(id)
      } catch (err) {
        console.warn('[mentorship] could not remove calendar event on decline:', err)
      }
    }

    const session = await mentorshipRepository.setStatus(id, 'declined', reason || null)
    return session!
  },

  async setStatus(id: string, status: 'completed' | 'cancelled'): Promise<MentorshipSession> {
    const existing = await mentorshipRepository.getById(id)
    if (!existing) throw new MentorshipError(404, 'Mentorship request not found', 'NOT_FOUND')

    if (status === 'cancelled' && existing.googleEventId && calendarConfigured()) {
      try {
        await gcalService.deleteEvent(existing.googleEventId)
        await mentorshipRepository.clearEvent(id)
      } catch (err) {
        console.warn('[mentorship] could not remove calendar event on cancel:', err)
      }
    }

    const session = await mentorshipRepository.setStatus(id, status)
    return session!
  },

  async remove(id: string): Promise<boolean> {
    const existing = await mentorshipRepository.getById(id)
    if (!existing) return false

    if (existing.googleEventId && calendarConfigured()) {
      try {
        await gcalService.deleteEvent(existing.googleEventId)
      } catch (err) {
        console.warn('[mentorship] could not remove calendar event on delete:', err)
      }
    }
    return mentorshipRepository.remove(id)
  },

  /** The console's calendar tab — read straight from Google, not from this DB. */
  async listCalendar(from?: string, to?: string): Promise<{ events: CalendarEvent[]; connected: boolean }> {
    if (!calendarConfigured()) return { events: [], connected: false }

    const today = isoDate(nowLocal())
    const start = from || addDays(today, -7)
    const end = to || addDays(today, 30)

    const events = await gcalService.listEvents(toRfc3339(start, '00:00'), toRfc3339(end, '23:59'))
    return { events, connected: true }
  },

  /** What the console shows about the integration itself. */
  status() {
    return {
      configured: calendarConfigured(),
      delegated: delegated(),
      calendarId: env.gcal.calendarId,
      serviceAccount: env.gcal.clientEmail || null,
      slotMinutes: env.mentorship.slotMinutes,
      bookAheadDays: env.mentorship.bookAheadDays,
      leadTimeHours: env.mentorship.leadTimeHours,
    }
  },
}
