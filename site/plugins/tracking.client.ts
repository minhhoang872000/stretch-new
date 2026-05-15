import { useTrackingStore } from '~/stores/tracking'
import { flushQueue } from '~/services/trackingApi'

/**
 * Client-only plugin that initializes lead tracking on app load.
 *
 * - Initializes session ID, UTM params, device type, referrer
 * - Flushes any pending offline queue events
 * - Registers online/offline listeners for auto-flush
 * - Auto-tracks page views on route change
 */
export default defineNuxtPlugin(() => {
  const store = useTrackingStore()
  const config = useRuntimeConfig()
  const trackingApiUrl = config.public.trackingApiUrl as string
  const router = useRouter()

  // Initialize tracking state
  store.init()

  // Flush any events queued while offline
  if (trackingApiUrl) {
    flushQueue(trackingApiUrl).catch(() => {})
  }

  // Auto-flush when coming back online
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      if (trackingApiUrl) {
        flushQueue(trackingApiUrl).catch(() => {})
      }
    })
  }

  // Auto-track page views on route change (skip initial load — first page
  // view should be tracked by the page component itself or on mounted)
  let isFirstRoute = true
  router.afterEach((to) => {
    if (isFirstRoute) {
      isFirstRoute = false
      return // Skip initial route (app load); track via onMounted in pages
    }
    if (!trackingApiUrl || !store.initialized) return

    // Dynamically import to avoid SSR issues
    import('~/services/trackingApi').then(({ sendEvent }) => {
      sendEvent(trackingApiUrl, {
        session_id: store.sessionId,
        page_source: to.fullPath,
        device_type: store.deviceType,
        referrer: store.referrer,
        timestamp: new Date().toISOString(),
        ...store.utm,
      }).catch(() => {})
    })
  })
})
