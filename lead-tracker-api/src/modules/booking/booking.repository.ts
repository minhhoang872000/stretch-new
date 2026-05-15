import { pool } from '../../config/db'
import type { Booking, BookingFilter, Product, Practitioner } from '../../types'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

function toMySqlDateTime(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Data access layer for bookings, products, and practitioners.
 */
export const bookingRepository = {
  // ─── Bookings ────────────────────────────────────────────────────

  async createBooking(data: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    const id = `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = toMySqlDateTime()

    const sql = `
      INSERT INTO bookings (id, service, practitioner, date, time, name, phone, email, note, session_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `
    await pool.execute<ResultSetHeader>(sql, [
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

    if (filter?.status) {
      sql += ' AND status = ?'
      params.push(filter.status)
    }
    if (filter?.date) {
      sql += ' AND date = ?'
      params.push(filter.date)
    }
    if (filter?.service) {
      sql += ' AND service = ?'
      params.push(filter.service)
    }

    sql += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
    return rows.map(mapBookingRow)
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    )
    return rows.length ? mapBookingRow(rows[0]) : null
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking | null> {
    const now = toMySqlDateTime()
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?',
      [status, now, id]
    )

    if (result.affectedRows === 0) return null
    return this.getBookingById(id)
  },

  async deleteBooking(id: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM bookings WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  },

  async getAvailableSlots(practitionerId: string | null, date: string): Promise<string[]> {
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00',
    ]

    let sql = "SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'"
    const params: any[] = [date]

    if (practitionerId && practitionerId !== 'any') {
      sql += ' AND practitioner = ?'
      params.push(practitionerId)
    }

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
    const bookedSet = new Set(rows.map((r: any) => r.time))
    return allSlots.filter((s) => !bookedSet.has(s))
  },

  // ─── Products ──────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM products WHERE available = true ORDER BY created_at ASC"
    )
    return rows.map(mapProductRow)
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE slug = ?',
      [slug]
    )
    return rows.length ? mapProductRow(rows[0]) : null
  },

  // ─── Practitioners ─────────────────────────────────────────────

  async getPractitioners(serviceId?: string): Promise<Practitioner[]> {
    if (serviceId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT p.* FROM practitioners p
         JOIN practitioner_services ps ON p.id = ps.practitioner_id
         WHERE ps.service_id = ?`,
        [serviceId]
      )
      return rows.map(mapPractitionerRow)
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM practitioners')
    return rows.map(mapPractitionerRow)
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
    images: JSON.parse(row.images || '[]'),
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    available: !!row.available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPractitionerRow(row: any): Practitioner {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    bio: row.bio,
    specialties: JSON.parse(row.specialties || '[]'),
    services: JSON.parse(row.services || '[]'),
  }
}
