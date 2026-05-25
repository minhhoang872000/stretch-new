import { pool } from '../../config/db'

export interface SummaryRow {
  total_leads: number
  total_bookings: number
  conversion_rate: number
  period: string
}

export interface LeadRow {
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

export interface CampaignRow {
  utm_campaign: string
  utm_source: string
  leads: number
  bookings: number
}

export interface FunnelRow {
  step: string
  count: number
}

export interface ChartRow {
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

    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM lead_events WHERE created_at >= NOW() - INTERVAL '${days} days') AS total_leads,
        (SELECT COUNT(*) FROM bookings WHERE created_at >= NOW() - INTERVAL '${days} days') AS total_bookings,
        CASE
          WHEN (SELECT COUNT(DISTINCT session_id) FROM lead_events WHERE created_at >= NOW() - INTERVAL '${days} days') = 0 THEN 0
          ELSE ROUND(
            (SELECT COUNT(*) FROM bookings WHERE created_at >= NOW() - INTERVAL '${days} days') * 100.0 /
            (SELECT COUNT(DISTINCT session_id) FROM lead_events WHERE created_at >= NOW() - INTERVAL '${days} days'),
            1
          )
        END AS conversion_rate,
        '${period}' AS period
    `)

    return result.rows[0]
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
    let paramIndex = 1

    if (filters.utm_source) {
      where += ` AND utm_source = $${paramIndex++}`
      params.push(filters.utm_source)
    }
    if (filters.utm_campaign) {
      where += ` AND utm_campaign = $${paramIndex++}`
      params.push(filters.utm_campaign)
    }
    if (filters.form_source) {
      where += ` AND form_source = $${paramIndex++}`
      params.push(filters.form_source)
    }
    if (filters.cta_clicked) {
      where += ` AND cta_clicked = $${paramIndex++}`
      params.push(filters.cta_clicked)
    }
    if (filters.device_type) {
      where += ` AND device_type = $${paramIndex++}`
      params.push(filters.device_type)
    }
    if (filters.dateFrom) {
      where += ` AND created_at >= $${paramIndex++}`
      params.push(filters.dateFrom)
    }
    if (filters.dateTo) {
      where += ` AND created_at <= $${paramIndex++}`
      params.push(filters.dateTo + ' 23:59:59')
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM lead_events ${where}`,
      params
    )
    const total = parseInt(countResult.rows[0].total, 10)

    // Get paginated rows
    const dataResult = await pool.query(
      `SELECT * FROM lead_events ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    return { rows: dataResult.rows, total }
  },

  /**
   * Get lead detail by session_id — includes all events + linked booking.
   */
  async getLeadDetail(sessionId: string): Promise<{
    events: LeadRow[]
    booking: any | null
  }> {
    const eventsResult = await pool.query(
      'SELECT * FROM lead_events WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    )

    const bookingsResult = await pool.query(
      'SELECT * FROM bookings WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    )

    return {
      events: eventsResult.rows,
      booking: bookingsResult.rows.length ? bookingsResult.rows[0] : null,
    }
  },

  /**
   * UTM campaign performance.
   */
  async getCampaignPerformance(period: '7d' | '30d' | '90d' = '30d'): Promise<CampaignRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const result = await pool.query(`
      SELECT
        COALESCE(le.utm_campaign, '(direct)') AS utm_campaign,
        COALESCE(le.utm_source, '(none)') AS utm_source,
        COUNT(DISTINCT le.session_id) AS leads,
        COUNT(DISTINCT b.id) AS bookings
      FROM lead_events le
      LEFT JOIN bookings b ON le.session_id = b.session_id AND b.created_at >= NOW() - INTERVAL '${days} days'
      WHERE le.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY le.utm_campaign, le.utm_source
      ORDER BY leads DESC
      LIMIT 20
    `)

    return result.rows
  },

  /**
   * Conversion funnel data.
   */
  async getFunnel(period: '7d' | '30d' | '90d' = '30d'): Promise<FunnelRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const result = await pool.query(`
      SELECT 'page_view' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE page_source IS NOT NULL AND created_at >= NOW() - INTERVAL '${days} days'
      UNION ALL
      SELECT 'cta_click' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE cta_clicked IS NOT NULL AND created_at >= NOW() - INTERVAL '${days} days'
      UNION ALL
      SELECT 'form_start' AS step, COUNT(DISTINCT session_id) AS count
      FROM lead_events WHERE form_source IS NOT NULL AND created_at >= NOW() - INTERVAL '${days} days'
      UNION ALL
      SELECT 'booking_completed' AS step, COUNT(DISTINCT session_id) AS count
      FROM bookings WHERE created_at >= NOW() - INTERVAL '${days} days'
    `)

    return result.rows
  },

  /**
   * Chart data: daily/weekly aggregate.
   */
  async getChartData(granularity: 'daily' | 'weekly' | 'monthly' = 'daily', period: '7d' | '30d' | '90d' = '30d'): Promise<ChartRow[]> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    let dateFormat: string
    if (granularity === 'weekly') {
      dateFormat = 'IYYY-IW' // ISO week
    } else if (granularity === 'monthly') {
      dateFormat = 'YYYY-MM'
    } else {
      dateFormat = 'YYYY-MM-DD'
    }

    const leadsResult = await pool.query(`
      SELECT
        TO_CHAR(created_at, '${dateFormat}') AS date,
        COUNT(DISTINCT session_id) AS leads,
        0 AS bookings
      FROM lead_events
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY TO_CHAR(created_at, '${dateFormat}')
      ORDER BY date ASC
    `)

    // Enrich with booking counts
    const bookingResult = await pool.query(`
      SELECT
        TO_CHAR(created_at, '${dateFormat}') AS date,
        0 AS leads,
        COUNT(*) AS bookings
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY TO_CHAR(created_at, '${dateFormat}')
      ORDER BY date ASC
    `)

    // Merge bookings into leads rows
    const bookingMap = new Map(bookingResult.rows.map((r: ChartRow) => [r.date, Number(r.bookings)]))
    return leadsResult.rows.map((r: ChartRow) => ({
      ...r,
      bookings: bookingMap.get(r.date) || 0,
      leads: Number(r.leads),
    }))
  },
}
