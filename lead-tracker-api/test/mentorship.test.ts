import { describe, it, expect } from 'vitest'
import { addMinutes, toRfc3339 } from '../src/modules/google-calendar/gcal.service'
import {
  acceptMentorshipSchema,
  createMentorshipSchema,
  updateHoursSchema,
} from '../src/modules/mentorship/mentorship.schema'

/**
 * The time helpers are the part most likely to be quietly wrong: the API runs in
 * UTC on Render while the academy runs in Vietnam, so anything that leans on the
 * server's own clock fields drifts by seven hours.
 */
describe('time helpers', () => {
  it('stamps a local date+time with the fixed offset', () => {
    expect(toRfc3339('2026-09-14', '14:30')).toBe('2026-09-14T14:30:00+07:00')
  })

  it('produces an instant that does not depend on the server timezone', () => {
    // 14:30 in Vietnam is 07:30 UTC, whatever the host thinks local time is.
    expect(new Date(toRfc3339('2026-09-14', '14:30')).toISOString()).toBe('2026-09-14T07:30:00.000Z')
  })

  it('adds minutes across the hour boundary', () => {
    expect(addMinutes('14:30', 30)).toBe('15:00')
    expect(addMinutes('09:45', 30)).toBe('10:15')
    expect(addMinutes('00:00', 90)).toBe('01:30')
  })

  it('clamps instead of wrapping past midnight', () => {
    // Wrapping to 00:15 would make an end time sort BEFORE its start time and
    // silently produce a slot that never closes.
    expect(addMinutes('23:45', 30)).toBe('23:59')
  })

  it('keeps two-digit padding', () => {
    expect(addMinutes('08:05', 5)).toBe('08:10')
    expect(addMinutes('09:55', 5)).toBe('10:00')
  })
})

describe('weekday derivation', () => {
  // Mirrors mentorship.service's weekdayOf: built from the string via UTC so it
  // cannot shift a day for a host west of Greenwich.
  const weekdayOf = (date: string) => {
    const [y = 0, m = 1, d = 1] = date.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  }

  it('maps known dates to the right weekday (0 = Sunday)', () => {
    expect(weekdayOf('2026-08-24')).toBe(1) // Monday
    expect(weekdayOf('2026-08-29')).toBe(6) // Saturday
    expect(weekdayOf('2026-08-30')).toBe(0) // Sunday
  })
})

describe('createMentorshipSchema', () => {
  const base = {
    learner_name: 'Nguyễn Văn A',
    learner_email: 'hocvien@example.com',
    date: '2026-09-14',
    time: '14:30',
  }

  it('accepts a minimal booking', () => {
    expect(createMentorshipSchema.safeParse(base).success).toBe(true)
  })

  it('accepts the optional lesson context', () => {
    const r = createMentorshipSchema.safeParse({
      ...base,
      program_slug: 'giai-phau-van-dong-hoc-ung-dung',
      lesson_key: '2-3',
      lesson_title: 'Khớp vai',
      topic: 'Chưa hiểu phần tầm vận động.',
    })
    expect(r.success).toBe(true)
  })

  it('rejects a malformed date', () => {
    expect(createMentorshipSchema.safeParse({ ...base, date: '14/09/2026' }).success).toBe(false)
  })

  it('rejects a time that is not HH:mm on the 24-hour clock', () => {
    expect(createMentorshipSchema.safeParse({ ...base, time: '9:00' }).success).toBe(false)
    expect(createMentorshipSchema.safeParse({ ...base, time: '24:00' }).success).toBe(false)
    expect(createMentorshipSchema.safeParse({ ...base, time: 'flexible' }).success).toBe(false)
  })

  it('rejects a missing learner email — an accepted session needs somewhere to invite', () => {
    const { learner_email, ...rest } = base
    expect(createMentorshipSchema.safeParse(rest).success).toBe(false)
  })
})

describe('acceptMentorshipSchema', () => {
  it('accepts no meeting link (the API mints one)', () => {
    expect(acceptMentorshipSchema.safeParse({}).success).toBe(true)
    expect(acceptMentorshipSchema.safeParse({ meet_url: '' }).success).toBe(true)
  })

  it('accepts a pasted meeting link', () => {
    expect(acceptMentorshipSchema.safeParse({ meet_url: 'https://meet.google.com/abc-defg-hij' }).success).toBe(true)
  })

  it('rejects something that is not a URL', () => {
    expect(acceptMentorshipSchema.safeParse({ meet_url: 'meet.google.com/abc' }).success).toBe(false)
  })
})

describe('updateHoursSchema', () => {
  const row = { weekday: 1, start_time: '14:00', end_time: '17:00', active: true }

  it('accepts a full week', () => {
    const hours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ ...row, weekday }))
    expect(updateHoursSchema.safeParse({ hours }).success).toBe(true)
  })

  it('rejects an end time before the start time', () => {
    const r = updateHoursSchema.safeParse({ hours: [{ ...row, start_time: '17:00', end_time: '14:00' }] })
    expect(r.success).toBe(false)
  })

  it('rejects an end time equal to the start time', () => {
    const r = updateHoursSchema.safeParse({ hours: [{ ...row, start_time: '14:00', end_time: '14:00' }] })
    expect(r.success).toBe(false)
  })

  it('rejects a weekday outside 0–6', () => {
    expect(updateHoursSchema.safeParse({ hours: [{ ...row, weekday: 7 }] }).success).toBe(false)
  })

  it('rejects more than one window per weekday', () => {
    const hours = Array.from({ length: 8 }, (_, i) => ({ ...row, weekday: i % 7 }))
    expect(updateHoursSchema.safeParse({ hours }).success).toBe(false)
  })
})
