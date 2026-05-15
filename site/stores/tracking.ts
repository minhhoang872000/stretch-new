import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

interface UTMParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
}

interface TrackingState {
  sessionId: string
  utm: UTMParams
  referrer: string | null
  deviceType: 'mobile' | 'tablet' | 'desktop'
  initialized: boolean
}

const SESSION_KEY = 'lt_session_id'

/**
 * Detect device type from screen width.
 */
function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Get or create session ID (persisted in sessionStorage).
 */
function getSessionId(): string {
  if (typeof sessionStorage === 'undefined') return uuidv4()
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = uuidv4()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

/**
 * Parse UTM parameters from current URL.
 */
function parseUTM(): UTMParams {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null }
  }
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

export const useTrackingStore = defineStore('tracking', {
  state: (): TrackingState => ({
    sessionId: '',
    utm: {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    },
    referrer: null,
    deviceType: 'desktop',
    initialized: false,
  }),

  actions: {
    /**
     * Initialize tracking state — call once on app load (client-side only).
     */
    init() {
      if (this.initialized) return

      this.sessionId = getSessionId()
      this.utm = parseUTM()
      this.referrer = typeof document !== 'undefined' ? document.referrer || null : null
      this.deviceType = detectDevice()
      this.initialized = true
    },
  },
})
