import { pool } from '../../config/db'
import type { TrackingEventInput } from './tracking.schema'
import type { RequestMeta } from '../../types'
import { ResultSetHeader } from 'mysql2'

/**
 * Convert ISO 8601 timestamp to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS).
 */
function toMySqlDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Data access layer for lead_events table.
 */
export const trackingRepository = {
  async create(event: TrackingEventInput, meta: RequestMeta = { ip_address: null, user_agent: null }): Promise<number> {
    const sql = `
      INSERT INTO lead_events (
        session_id, form_source, page_source, cta_clicked, service_interest,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        referrer, device_type, ip_address, user_agent,
        ga4_client_id, meta_fbp, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      event.session_id, event.form_source, event.page_source, event.cta_clicked,
      event.service_interest, event.utm_source, event.utm_medium, event.utm_campaign,
      event.utm_content, event.utm_term, event.referrer, event.device_type,
      meta.ip_address, meta.user_agent, event.ga4_client_id, event.meta_fbp,
      toMySqlDateTime(event.timestamp),
    ]

    const [result] = await pool.execute<ResultSetHeader>(sql, params)
    return result.insertId
  },

  async createBatch(events: TrackingEventInput[], meta: RequestMeta = { ip_address: null, user_agent: null }): Promise<number> {
    if (!events.length) return 0

    const placeholders = events
      .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .join(', ')

    const sql = `
      INSERT INTO lead_events (
        session_id, form_source, page_source, cta_clicked, service_interest,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        referrer, device_type, ip_address, user_agent,
        ga4_client_id, meta_fbp, timestamp
      ) VALUES ${placeholders}
    `

    const params = events.flatMap((event) => [
      event.session_id, event.form_source, event.page_source, event.cta_clicked,
      event.service_interest, event.utm_source, event.utm_medium, event.utm_campaign,
      event.utm_content, event.utm_term, event.referrer, event.device_type,
      meta.ip_address, meta.user_agent, event.ga4_client_id, event.meta_fbp,
      toMySqlDateTime(event.timestamp),
    ])

    const [result] = await pool.execute<ResultSetHeader>(sql, params)
    return result.affectedRows
  },
}
