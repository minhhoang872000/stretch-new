import { sendEvent, flushQueue } from '~/services/trackingApi'
import type { TrackingEvent } from '~/services/trackingApi'
import { useTrackingStore } from '~/stores/tracking'

/**
 * Composable for tracking lead events.
 *
 * Usage:
 *   const { trackCTA, trackFormSource, trackPageView, trackEvent } = useTracking()
 *
 *   trackCTA('hero-book-now')
 *   trackFormSource('contact-form', 'ems-training')
 *   trackPageView()  // auto tracks current page
 *   trackEvent({ cta_clicked: 'custom', service_interest: 'cryo' })
 */
export function useTracking() {
  const config = useRuntimeConfig()
  const trackingApiUrl = config.public.trackingApiUrl as string
  const store = useTrackingStore()
  const route = useRoute()

  /**
   * Build base payload with session + UTM + device + page context.
   */
  function buildPayload(partial: Partial<TrackingEvent> = {}): TrackingEvent {
    return {
      session_id: store.sessionId,
      page_source: route.fullPath,
      device_type: store.deviceType,
      referrer: store.referrer,
      timestamp: new Date().toISOString(),
      ...store.utm,
      ...partial,
    }
  }

  /**
   * Send a tracking event (fire-and-forget, non-blocking).
   * Handles retry + offline queue internally.
   */
  function trackEvent(partial: Partial<TrackingEvent> = {}): void {
    if (!trackingApiUrl || !store.initialized) return
    const payload = buildPayload(partial)
    // Fire and forget — don't await
    sendEvent(trackingApiUrl, payload).catch(() => {})
  }

  /**
   * Track a CTA button click.
   */
  function trackCTA(ctaName: string, serviceInterest?: string): void {
    trackEvent({
      cta_clicked: ctaName,
      service_interest: serviceInterest || null,
    })
  }

  /**
   * Track a form submission source.
   */
  function trackFormSource(formSource: string, serviceInterest?: string): void {
    trackEvent({
      form_source: formSource,
      service_interest: serviceInterest || null,
    })
  }

  /**
   * Track a page view (call on route change if needed).
   */
  function trackPageView(): void {
    trackEvent({
      page_source: route.fullPath,
    })
  }

  /**
   * Manually flush the offline queue.
   */
  function flush(): void {
    if (!trackingApiUrl) return
    flushQueue(trackingApiUrl).catch(() => {})
  }

  return {
    trackEvent,
    trackCTA,
    trackFormSource,
    trackPageView,
    flush,
  }
}
