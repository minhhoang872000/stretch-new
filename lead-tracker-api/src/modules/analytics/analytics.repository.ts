import { pool } from '../../config/db'
import { RowDataPacket } from 'mysql2'

interface SummaryRow extends RowDataPacket {
  total_leads: number
  total_bookings: number
  conversion_rate: number
  period: string
}

interface LeadRow extends RowDataPacket {
  id: number
  session_id: string
  page_source: string | null
  form_source: string | null
  cta_clicked: string | null
  service_interest: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  referrer: string | null
  device_type: string | null
  ip_address: string | null
  timestamp: string
  created_at: string
  total: number
}

interface CampaignRow extends RowDataPacket {
  utm_campaign: string
  utm_source: string
  leads: number
  bookings: number
}

interface FunnelRow extends RowDataPacket {
  step: string
  count: number
}

interface ChartRow extends RowDataPacket {
  date: string
  leads: number
  bookings: number
}

export const analyticsRepository = {
  /**
   * Get KPI summary for dashboard.
   */
  async getSummary(period: '7d' | '30d' | '90d' = '30d'): Promise<SummaryRow> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const [rows] = await pool.execute<SummaryRow[]>(`
      SELECT
        (SELECT COUNT(*) FROM lead_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)) AS total_leads,
        (SELECT COUNT(*) FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)) AS total_bookings,
        CASE
          WHEN (SELECT COUNT(DISTINCT session_id) FROM lead_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)) = 0 THEN 0
          ELSE ROUND(
            (SELECT COUNT(*) FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)) * 100.0 /
            (SELECT COUNT(DISTINCT session_id) FROM lead_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)),
            1
          )
        END AS conversion_rate,
        '${period}' AS period
    `)

    return rows[0]
  },

  /**
   * List leads with pagination and filters.
   */
  async getLeads(filters: {
    page?: number
    limit?: number
    utm_source?: string
    utm_campaign?: string
    form_source?: string
    cta_clicked?: string
    device_type?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<{ rows: LeadRow[]; total: number }> {
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)
    const offset = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []

    if (filters.utm_source) {
      where += ' AND utm_source = ?'
      params.push(filters.utm_source)
    }
    if (filters.utm_campaign) {
      where += ' AND utm_campaign = ?'
      params.push(filters.utm_campaign)
    }
    if (filters.form_source) {
      where += ' AND form_source = ?'
      params.push(filters.form_source)
    }
    if (filters.cta_clicked) {
      where += ' AND cta_clicked = ?'
      params.push(filters.cta_clicked)
    }
    if (filters.device_type) {
      where += ' AND device_type = ?'
      params.push(filters.device_type)
    }
    if (filters.dateFrom) {
      where += ' AND created_at >= ?'
      params.push(filters.dateFrom)
    }
    if (filters.dateTo) {
      where += ' AND created_at <= ?'
      params.push(filters.dateTo + ' 23:59:59')
    }

    // Get total count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM lead_events ${where}`,
      params.length ? params : undefined
    )
    const total = (countRows as RowDataPacket[])[0].total as number

    // Get paginated rows
    const [rows] = await pool.query(
      `SELECT * FROM lead_events ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params.length ? params : undefined
    )

    return { rows, total }
  },

  /**
   * Get lead detail by session_id — includes all events + linked booking.
   */
  async getLeadDetail(sessionId: string): Promise<{
    events: LeadRow[]
    booking: RowDataPacket | null
  }> {
    const [events] = await pool.execute<LeadRow[]>(
      'SELECT * FROM lead_events WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    )

    const [bookings] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM bookings WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    )

    return {
      events,
      booking: bookings.length ? bookings[0] : null,
    }
  },

  /**
   * UTM campaign performance.
   */
  async getCampaignPerformance(period: '7d' | '30d' | '90d' = '30d'): Promise<CampaignRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const [rows] = await pool.execute<CampaignRow[]>(`
      SELECT
        COALESCE(le.utm_campaign, '(direct)') AS utm_campaign,
        COALESCE(le.utm_source, '(none)') AS utm_source,
        COUNT(DISTINCT le.session_id) AS leads,
        COUNT(DISTINCT b.id) AS bookings
      FROM lead_events le
      LEFT JOIN bookings b ON le.session_id = b.session_id AND b.created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      WHERE le.created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY le.utm_campaign, le.utm_source
      ORDER BY leads DESC
      LIMIT 20
    `)

    return rows
  },

  /**
   * Conversion funnel data.
   */
  async getFunnel(period: '7d' | '30d' | '90d' = '30d'): Promise<FunnelRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const [rows] = await pool.execute<FunnelRow[]>(`
      SELECT 'page_view' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE page_source IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      UNION ALL
      SELECT 'cta_click' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE cta_clicked IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      UNION ALL
      SELECT 'form_start' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE form_source IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      UNION ALL
      SELECT 'booking_completed' AS step, COUNT(DISTINCT session_id) AS count
      FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    `)

    return rows
  },

  /**
   * Chart data: daily/weekly aggregate.
   */
  async getChartData(granularity: 'daily' | 'weekly' | 'monthly' = 'daily', period: '7d' | '30d' | '90d' = '30d'): Promise<ChartRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    let dateFormat: string
    if (granularity === 'weekly') {
      dateFormat = '%Y-%u' // ISO week
    } else if (granularity === 'monthly') {
      dateFormat = '%Y-%m'
    } else {
      dateFormat = '%Y-%m-%d'
    }

    const [rows] = await pool.execute<ChartRow[]>(`
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') AS date,
        COUNT(DISTINCT session_id) AS leads,
        0 AS bookings
      FROM lead_events
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY date ASC
    `)

    // Enrich with booking counts
    const [bookingRows] = await pool.execute<ChartRow[]>(`
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') AS date,
        0 AS leads,
        COUNT(*) AS bookings
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY date ASC
    `)

    // Merge bookings into leads rows
    const bookingMap = new Map(bookingRows.map((r: ChartRow) => [r.date, r.bookings]))
    return rows.map((r: ChartRow) => ({
      ...r,
      bookings: bookingMap.get(r.date) || 0,
      leads: Number(r.leads),
    }))
  },
}
