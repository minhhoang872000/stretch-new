import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

/**
 * Tracking API Axios instance.
 * Features:
 * - Configurable base URL via runtime config
 * - 5s timeout
 * - Retry with exponential backoff (3 attempts)
 * - Offline localStorage queue fallback
 */

const QUEUE_KEY = 'lt_offline_queue'
const MAX_RETRIES = 3
const RETRY_BASE_DELAY = 1000 // 1s

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

let apiInstance: AxiosInstance | null = null

/**
 * Get or create the Axios instance.
 * Must be called after Nuxt runtime config is available.
 */
function getApi(baseURL: string): AxiosInstance {
  if (apiInstance) return apiInstance

  apiInstance = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return apiInstance
}

/**
 * Sleep utility for exponential backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Send a single tracking event with retry logic.
 * On final failure, queues to localStorage.
 */
async function sendEvent(baseURL: string, event: TrackingEvent): Promise<boolean> {
  const api = getApi(baseURL)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await api.post('/api/v1/tracking/events', event)
      return true
    } catch (err) {
      const axiosErr = err as AxiosError

      // Don't retry on validation errors (422) — event is malformed
      if (axiosErr.response?.status === 422) {
        console.warn('[Tracking] Event rejected by server (422):', axiosErr.response.data)
        return false
      }

      // Don't retry on rate limit (429) — respect the limit
      if (axiosErr.response?.status === 429) {
        console.warn('[Tracking] Rate limited, queuing event for later')
        enqueue(event)
        return false
      }

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt) // 1s, 2s, 4s
        await sleep(delay)
      }
    }
  }

  // All retries exhausted — queue for later
  console.warn('[Tracking] All retries failed, queuing event offline')
  enqueue(event)
  return false
}

/**
 * Flush the offline queue (called when back online).
 */
async function flushQueue(baseURL: string): Promise<void> {
  const queue = getQueue()
  if (queue.length === 0) return

  const api = getApi(baseURL)

  try {
    // Send as batch
    await api.post('/api/v1/tracking/events/batch', { events: queue })
    clearQueue()
    console.log(`[Tracking] Flushed ${queue.length} queued event(s)`)
  } catch (err) {
    console.warn('[Tracking] Queue flush failed, will retry later')
  }
}

// ─── LocalStorage Queue Helpers ─────────────────────────────────────

function enqueue(event: TrackingEvent): void {
  try {
    const queue = getQueue()
    queue.push(event)
    // Cap queue at 200 events to avoid localStorage bloat
    if (queue.length > 200) queue.splice(0, queue.length - 200)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // localStorage might be full or unavailable
  }
}

function getQueue(): TrackingEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY)
  } catch {
    // ignore
  }
}

export type { TrackingEvent }
export { sendEvent, flushQueue, getQueue }
