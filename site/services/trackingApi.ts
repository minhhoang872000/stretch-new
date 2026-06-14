/**
 * Tracking API — DISABLED.
 *
 * The site no longer sends events to /api/v1/tracking/events (or .../batch).
 * These functions are kept as no-ops so existing callers
 * (useTracking, tracking.client plugin) keep working without any network call.
 */

interface TrackingEvent {
  session_id: string
  form_source?: string | null
  page_source?: string | null
  cta_clicked?: string | null
  service_interest?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  referrer?: string | null
  device_type?: 'mobile' | 'tablet' | 'desktop' | null
  timestamp: string
  ga4_client_id?: string | null
  meta_fbp?: string | null
}

/** No-op: tracking events API is disabled. */
async function sendEvent(_baseURL: string, _event: TrackingEvent): Promise<boolean> {
  return true
}

/** No-op: tracking events API is disabled. */
async function flushQueue(_baseURL: string): Promise<void> {
  /* disabled */
}

/** No-op: no offline queue is kept anymore. */
function getQueue(): TrackingEvent[] {
  return []
}

export type { TrackingEvent }
export { sendEvent, flushQueue, getQueue }
