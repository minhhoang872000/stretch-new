/**
 * Lead tracking — Google Analytics 4 only.
 *
 * Every event goes to GA through `gtag` (see plugins/google-analytics.client.ts,
 * which is a no-op outside the production hostnames). There is no tracking API
 * of our own any more: lead attribution (which source a booking came from) is
 * read back from GA by the CRM, keyed on `booking_id`.
 *
 * GA property setup this relies on (Admin, needs Editor):
 *   - Mark `booking_submit` (and optionally `contact_click`) as Key events, so
 *     they show in the CRM's Conv. column.
 *   - Register event-scoped custom dimensions `booking_id`, `service`,
 *     `form_source`, `contact_method` so they can be queried.
 *
 * Contact-link clicks (tel:, Zalo, Messenger, WhatsApp, mailto:) are tracked
 * site-wide by the GA plugin, not here.
 */
function ga(event: string, params: Record<string, string | null | undefined>): void {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (typeof gtag === 'function') gtag('event', event, params)
}

export function useTracking() {
  /** A call-to-action button was clicked. */
  function trackCTA(ctaName: string, serviceInterest?: string): void {
    ga('cta_click', { cta_name: ctaName, service_interest: serviceInterest })
  }

  /**
   * A booking form was submitted successfully. Call only after the API has
   * accepted it, so failed submissions are not counted.
   */
  function trackBooking(formSource: string, service: string | null | undefined, bookingId: string | null | undefined): void {
    ga('booking_submit', {
      form_source: formSource,
      service: service || undefined,
      booking_id: bookingId || undefined,
    })
  }

  return { trackCTA, trackBooking }
}
