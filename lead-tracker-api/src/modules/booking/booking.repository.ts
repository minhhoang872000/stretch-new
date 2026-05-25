import { pool } from '../../config/db'
import type { Booking, BookingFilter, Product, Practitioner } from '../../types'

/**
 * Data access layer for bookings, products, and practitioners.
 */
export const bookingRepository = {
  // ─── Bookings ────────────────────────────────────────────────────

  async createBooking(data: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    const id = `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()

    const sql = `
      INSERT INTO bookings (id, service, practitioner, date, time, name, phone, email, note, session_id, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
    `
    await pool.query(sql, [
      id, data.service, data.practitioner || null, data.date, data.time,
      data.name, data.phone, data.email || null, data.note || null,
      (data as any).session_id || null, now,
    ])

    return {
      id,
      ...data,
      status: 'pending',
      createdAt: now,
    }
  },

  async getBookings(filter?: BookingFilter): Promise<Booking[]> {
    let sql = 'SELECT * FROM bookings WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (filter?.status) {
      sql += ` AND status = $${paramIndex++}`
      params.push(filter.status)
    }
    if (filter?.date) {
      sql += ` AND date = $${paramIndex++}`
      params.push(filter.date)
    }
    if (filter?.service) {
      sql += ` AND service = $${paramIndex++}`
      params.push(filter.service)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapBookingRow)
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    )
    return result.rows.length ? mapBookingRow(result.rows[0]) : null
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking | null> {
    const now = new Date().toISOString()
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = $2 WHERE id = $3',
      [status, now, id]
    )

    if ((result.rowCount ?? 0) === 0) return null
    return this.getBookingById(id)
  },

  async deleteBooking(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM bookings WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  },

  async getAvailableSlots(practitionerId: string | null, date: string): Promise<string[]> {
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00',
    ]

    let sql = "SELECT time FROM bookings WHERE date = $1 AND status != 'cancelled'"
    const params: any[] = [date]
    let paramIndex = 2

    if (practitionerId && practitionerId !== 'any') {
      sql += ` AND practitioner = $${paramIndex++}`
      params.push(practitionerId)
    }

    const result = await pool.query(sql, params)
    const bookedSet = new Set(result.rows.map((r: any) => r.time))
    return allSlots.filter((s) => !bookedSet.has(s))
  },

  // ─── Products ──────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const result = await pool.query(
      "SELECT * FROM products WHERE available = true ORDER BY created_at ASC"
    )
    return result.rows.map(mapProductRow)
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const result = await pool.query(
      'SELECT * FROM products WHERE slug = $1',
      [slug]
    )
    return result.rows.length ? mapProductRow(result.rows[0]) : null
  },

  // ─── Practitioners ─────────────────────────────────────────────

  async getPractitioners(serviceId?: string): Promise<Practitioner[]> {
    if (serviceId) {
      const result = await pool.query(
        `SELECT p.* FROM practitioners p
         JOIN practitioner_services ps ON p.id = ps.practitioner_id
         WHERE ps.service_id = $1`,
        [serviceId]
      )
      return result.rows.map(mapPractitionerRow)
    }

    const result = await pool.query('SELECT * FROM practitioners')
    return result.rows.map(mapPractitionerRow)
  },
}

// ─── Row Mappers ─────────────────────────────────────────────────────

function mapBookingRow(row: any): Booking {
  return {
    id: row.id,
    service: row.service,
    practitioner: row.practitioner,
    date: row.date,
    time: row.time,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    note: row.note || undefined,
    session_id: row.session_id || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  }
}

function mapProductRow(row: any): Product {
  // PostgreSQL JSONB columns are returned as parsed objects already
  const images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || [])
  const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    nameVi: row.name_vi,
    shortDescription: row.short_description,
    shortDescriptionEn: row.short_description_en,
    shortDescriptionVi: row.short_description_vi,
    description: row.description,
    price: row.price,
    currency: row.currency,
    coverImage: row.cover_image,
    images,
    category: row.category,
    tags,
    available: !!row.available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPractitionerRow(row: any): Practitioner {
  const specialties = typeof row.specialties === 'string' ? JSON.parse(row.specialties) : (row.specialties || [])
  const services = typeof row.services === 'string' ? JSON.parse(row.services) : (row.services || [])

  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    bio: row.bio,
    specialties,
    services,
  }
}
