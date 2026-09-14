import { Router } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { HttpError, type Resource } from '../../core/crud'
import { success } from '../../utils/response'

/**
 * Therapy — the studio side of the business: who works and when they work.
 * (The services catalogue used to live here too; the console dropped that
 * screen, so its routes went with it. The `products` table itself remains.)
 */

const timestamps = {
  createdAt: { type: 'timestamp', readOnly: true },
  updatedAt: { type: 'timestamp', readOnly: true },
} as const

const practitionersResource: Resource = {
  name: 'practitioners',
  table: 'practitioners',
  idPrefix: 'prc',
  defaultOrder: 'name ASC',
  search: ['name', 'email', 'role', 'studio'],
  filters: ['status', 'studio'],
  sortable: ['name', 'rating', 'sessions30d', 'weeklyHours'],
  fields: {
    id: { readOnly: true },
    name: { required: true },
    role: { fallback: '' },
    email: { fallback: '' },
    phone: { fallback: '' },
    avatar: {},
    bio: { fallback: '' },
    specialties: { type: 'json', fallback: [] },
    services: { type: 'json', fallback: [] },
    studio: { fallback: '' },
    weeklyHours: { type: 'int', fallback: 0 },
    rating: { type: 'number', fallback: 0 },
    sessions30d: { column: 'sessions_30d', type: 'int', fallback: 0 },
    status: { fallback: 'active' },
    ...timestamps,
  },
}

const availabilityResource: Resource = {
  name: 'availability',
  table: 'practitioner_availability',
  idPrefix: 'av',
  defaultOrder: 'practitioner_name ASC, weekday ASC',
  filters: ['practitionerId', 'studio', 'open'],
  sortable: ['weekday'],
  fields: {
    id: { readOnly: true },
    practitionerId: { required: true },
    practitionerName: { fallback: '' },
    weekday: { type: 'int', required: true },
    studio: { fallback: '' },
    open: { type: 'bool', fallback: true },
    from: { type: 'text', fallback: '09:00' },
    to: { type: 'text', fallback: '18:00' },
    slotMinutes: { type: 'int', fallback: 60 },
    capacityPerSlot: { type: 'int', fallback: 1 },
    ...timestamps,
  },
}

const timeOffResource: Resource = {
  name: 'timeOff',
  table: 'practitioner_time_off',
  idPrefix: 'off',
  defaultOrder: '"from" DESC',
  search: ['practitioner_name', 'reason'],
  filters: ['practitionerId', 'status'],
  sortable: ['from', 'to', 'status'],
  fields: {
    id: { readOnly: true },
    practitionerId: { required: true },
    practitionerName: { fallback: '' },
    from: { type: 'date', required: true },
    to: { type: 'date', required: true },
    reason: { fallback: '' },
    status: { fallback: 'approved' },
    ...timestamps,
  },
}

// ─── Routers ─────────────────────────────────────────────────────────

/** Fill the practitioner's name so the console's tables need no join. */
async function withPractitionerName(body: Record<string, unknown>) {
  if (body.practitionerId) {
    const found = await pool.query('SELECT name FROM practitioners WHERE id = $1', [
      String(body.practitionerId),
    ])
    if (found.rows.length) body.practitionerName = found.rows[0].name
  }
  return body
}

const practitioners = createCrudRouter(practitionersResource, { publicRead: true })
const availability = createCrudRouter(availabilityResource, {
  publicRead: true,
  beforeWrite: withPractitionerName,
})
const timeOff = createCrudRouter(timeOffResource, { beforeWrite: withPractitionerName })

// ─── Bookable slots ──────────────────────────────────────────────────

const slots = Router()

/**
 * The slots a practitioner can actually be booked into on one date.
 *
 * Three things decide it, in order: the weekly pattern, any dated time off that
 * overrides it, and the bookings already taken. Computing it here rather than
 * in each frontend is what stops the site and the console disagreeing about
 * whether 15:00 is free.
 */
slots.get('/', async (req, res, next) => {
  try {
    const practitionerId = String(req.query.practitionerId || '')
    const date = String(req.query.date || '')
    if (!practitionerId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpError('practitionerId và date (YYYY-MM-DD) là bắt buộc', 400, 'INVALID_QUERY')
    }

    const weekday = new Date(`${date}T00:00:00`).getDay()

    const [pattern, off, taken] = await Promise.all([
      pool.query(
        `SELECT "open", "from", "to", slot_minutes, capacity_per_slot
           FROM practitioner_availability
          WHERE practitioner_id = $1 AND weekday = $2`,
        [practitionerId, weekday],
      ),
      pool.query(
        `SELECT 1 FROM practitioner_time_off
          WHERE practitioner_id = $1 AND status = 'approved'
            AND $2::date BETWEEN "from" AND "to"`,
        [practitionerId, date],
      ),
      pool.query(
        `SELECT time, COUNT(*)::int AS n
           FROM bookings
          WHERE practitioner_id = $1 AND date = $2 AND status <> 'cancelled'
          GROUP BY time`,
        [practitionerId, date],
      ),
    ])

    const rule = pattern.rows[0]
    if (!rule || !rule.open || off.rows.length) {
      success(res, { date, slots: [], reason: off.rows.length ? 'time-off' : 'closed' })
      return
    }

    const bookedBy = new Map<string, number>(taken.rows.map((row) => [row.time, row.n]))
    const toMinutes = (value: string) => {
      const [h, m] = String(value).split(':').map(Number)
      return (h || 0) * 60 + (m || 0)
    }

    const out: { time: string; capacity: number; booked: number; free: boolean }[] = []
    const step = Math.max(15, rule.slot_minutes)
    for (let t = toMinutes(rule.from); t + step <= toMinutes(rule.to); t += step) {
      const time = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
      const booked = bookedBy.get(time) || 0
      out.push({
        time,
        capacity: rule.capacity_per_slot,
        booked,
        free: booked < rule.capacity_per_slot,
      })
    }

    success(res, { date, slots: out, reason: '' })
  } catch (err) {
    next(err)
  }
})

const router = Router()
router.use('/practitioners', practitioners.router)
router.use('/availability', availability.router)
router.use('/time-off', timeOff.router)
router.use('/slots', slots)

export default router
