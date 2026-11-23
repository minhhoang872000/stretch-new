import { ref } from 'vue'
import { fetchBookingSources } from '@/services/api.js'

/**
 * Where each booking came from, read from Google Analytics.
 *
 * The site sends a `booking_submit` event with the booking's id; the API looks
 * those events up in GA. GA lags by a few hours and misses visitors who block
 * it, so a booking without an entry is "unknown", never "direct".
 *
 * Loaded once and shared by every screen that shows a source.
 */
const sources = ref({})
// null = not loaded yet, false = booking_id not registered in GA yet, true = ok
const configured = ref(null)
let pending = null

export function useBookingSources() {
  function load(force = false) {
    if (pending && !force) return pending
    pending = fetchBookingSources('90d')
      .then((data) => {
        sources.value = data?.sources || {}
        configured.value = !!data?.configured
      })
      .catch((e) => {
        console.warn('[booking sources]', e?.message || e)
        configured.value = false
        pending = null
      })
    return pending
  }

  /** e.g. "google / organic", "facebook / cpc · spring_sale", or "" if unknown. */
  function sourceLabel(id) {
    const s = sources.value[id]
    if (!s) return ''
    const base = `${s.source} / ${s.medium}`
    return s.campaign && !s.campaign.startsWith('(') ? `${base} · ${s.campaign}` : base
  }

  /** What to show when a booking has no source. */
  function emptyLabel() {
    if (configured.value === null) return '…'
    if (configured.value === false) return 'Chưa bật trong GA'
    return 'Chưa rõ'
  }

  return { sources, configured, load, sourceLabel, emptyLabel }
}
