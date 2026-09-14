/**
 * The training calendar — every catalogue item that happens on a date.
 *
 * Built from `useLearningCatalog` rather than from a second list: a scheduled
 * workshop already IS a catalogue record with a date, and keeping a separate
 * schedule array is how the hub panel and the catalogue drifted apart before
 * (same courses, different prices and dates).
 *
 * Dates are authored `dd/mm/yyyy` because that is what the cards display; this
 * is the one place that parses them, so nothing else has to.
 */
import type { CatalogProgram, ProgramKind, ProgramMode } from '~/composables/useLearningCatalog'

export type SeatStatus = 'open' | 'few' | 'full'

export interface ScheduleEntry {
  slug: string
  title: string
  kind: ProgramKind
  mode: ProgramMode
  image: string
  price: number
  /** As authored: dd/mm/yyyy. */
  date: string
  /** yyyy-mm-dd — what the calendar grid matches on. */
  iso: string
  day: number
  /** 0 = Monday, matching the calendar grid's column order. */
  weekdayIndex: number
  month: number
  year: number
  time: string
  location: string
  seatsLeft: number
  status: SeatStatus
  instructor: string
  program: CatalogProgram
}

export interface ScheduleMonth {
  /** yyyy-mm — stable key for grouping and for the month picker. */
  key: string
  label: string
  entries: ScheduleEntry[]
}

const WEEKDAYS_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTHS_SHORT = ['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8', 'TH9', 'TH10', 'TH11', 'TH12']

/** `24/09/2026` → a local Date at midnight, or null if it is not a date. */
function parseDate(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? null : d
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useLearningSchedule() {
  const { programs } = useLearningCatalog()
  const { detailFor } = useProgramDetail()

  /**
   * "Today" is read once per call rather than per computed: a schedule that
   * re-partitioned itself mid-session would move rows under the reader, and on
   * the server it would also disagree with the client's clock during hydration
   * of an SWR-cached page.
   */
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const all = computed<ScheduleEntry[]>(() => {
    const rows: ScheduleEntry[] = []

    for (const program of programs.value) {
      if (!program.date) continue
      const when = parseDate(program.date)
      if (!when) continue

      // Seats and the instructor come from the same detail builder the course
      // page uses, so both pages quote the same numbers.
      const detail = detailFor(program.slug)
      const seatsLeft = detail?.seatsLeft ?? 0

      rows.push({
        slug: program.slug,
        title: program.title,
        kind: program.kind,
        mode: program.mode,
        image: program.image,
        price: program.price,
        date: program.date,
        iso: toIso(when),
        day: when.getDate(),
        weekdayIndex: (when.getDay() + 6) % 7,
        month: when.getMonth(),
        year: when.getFullYear(),
        time: program.time ?? '08:30 – 16:30',
        location: program.location ?? '',
        seatsLeft,
        status: seatsLeft === 0 ? 'full' : seatsLeft <= 3 ? 'few' : 'open',
        instructor: detail?.instructor.name ?? '',
        program,
      })
    }

    return rows.sort((a, b) => a.iso.localeCompare(b.iso))
  })

  const upcoming = computed(() => all.value.filter((e) => new Date(e.iso) >= today))
  const past = computed(() => all.value.filter((e) => new Date(e.iso) < today).reverse())

  /** Groups a list into months, in date order, skipping months with nothing in them. */
  function groupByMonth(entries: ScheduleEntry[]): ScheduleMonth[] {
    const months = new Map<string, ScheduleMonth>()
    for (const entry of entries) {
      const key = `${entry.year}-${String(entry.month + 1).padStart(2, '0')}`
      if (!months.has(key)) {
        months.set(key, { key, label: `Tháng ${entry.month + 1}, ${entry.year}`, entries: [] })
      }
      months.get(key)!.entries.push(entry)
    }
    return [...months.values()]
  }

  const weekdayShort = (index: number) => WEEKDAYS_SHORT[index] ?? ''
  const monthShort = (month: number) => MONTHS_SHORT[month] ?? ''
  const monthLabel = (month: number, year: number) => `Tháng ${month + 1}, ${year}`

  /**
   * A Google Calendar "add event" URL. A link is deliberate: an .ics download is
   * blocked in enough embedded browsers that it looks broken, and this works
   * everywhere without shipping a file.
   */
  function googleCalendarUrl(entry: ScheduleEntry): string {
    const [from = '08:30', to = '16:30'] = entry.time.split(/\s*[–-]\s*/)
    const stamp = (hhmm: string) => `${entry.iso.replace(/-/g, '')}T${hhmm.replace(':', '')}00`
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${entry.title} — Stretch Academy`,
      dates: `${stamp(from)}/${stamp(to)}`,
      details: `Chương trình đào tạo của Stretch Academy. Chi tiết: https://stretch.vn/vi/learning-hub/programs/${entry.slug}`,
      location: entry.location,
      ctz: 'Asia/Ho_Chi_Minh',
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return { all, upcoming, past, groupByMonth, weekdayShort, monthShort, monthLabel, googleCalendarUrl }
}
