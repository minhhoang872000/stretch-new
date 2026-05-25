import { pool } from '../../config/db'
import type { TrackingEventInput } from './tracking.schema'
import type { RequestMeta } from '../../types'

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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `

    const params = [
      event.session_id, event.form_source, event.page_source, event.cta_clicked,
      event.service_interest, event.utm_source, event.utm_medium, event.utm_campaign,
      event.utm_content, event.utm_term, event.referrer, event.device_type,
      meta.ip_address, meta.user_agent, event.ga4_client_id, event.meta_fbp,
      event.timestamp, // PostgreSQL accepts ISO 8601 directly
    ]

    const result = await pool.query(sql, params)
    return result.rows[0].id
  },

  async createBatch(events: TrackingEventInput[], meta: RequestMeta = { ip_address: null, user_agent: null }): Promise<number> {
    if (!events.length) return 0

    const params: any[] = []
    const placeholders = events.map((event, i) => {
      const offset = i * 17
      params.push(
        event.session_id, event.form_source, event.page_source, event.cta_clicked,
        event.service_interest, event.utm_source, event.utm_medium, event.utm_campaign,
        event.utm_content, event.utm_term, event.referrer, event.device_type,
        meta.ip_address, meta.user_agent, event.ga4_client_id, event.meta_fbp,
        event.timestamp,
      )
      const indices = Array.from({ length: 17 }, (_, j) => `$${offset + j + 1}`)
      return `(${indices.join(', ')})`
    })

    const sql = `
      INSERT INTO lead_events (
        session_id, form_source, page_source, cta_clicked, service_interest,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        referrer, device_type, ip_address, user_agent,
        ga4_client_id, meta_fbp, timestamp
      ) VALUES ${placeholders.join(', ')}
    `

    const result = await pool.query(sql, params)
    return result.rowCount ?? 0
  },
}
