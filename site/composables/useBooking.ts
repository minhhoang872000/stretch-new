import { getApiInstance } from '~/services/api'
import { useTrackingStore } from '~/stores/tracking'

/**
 * Booking composable — adaptive API calls.
 *
 * When NUXT_PUBLIC_TRACKING_API_URL is configured, calls go to the
 * external lead-tracker-api. Otherwise falls back to Nuxt's internal
 * /api/bookings routes (demo mode).
 *
 * Automatically attaches session_id from tracking store for
 * lead-to-booking attribution.
 */
export function useBooking() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.trackingApiUrl as string
  const trackingStore = useTrackingStore()

  const loading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)

  async function submit(payload: Record<string, any>) {
    loading.value = true
    error.value = null

    // Attach session_id for lead attribution
    const body = {
      ...payload,
      email: payload.email || '',
      note: payload.note || '',
      session_id: trackingStore.sessionId || null,
    }

    try {
      if (apiUrl) {
        // External backend
        const api = getApiInstance(apiUrl)
        await api.post('/api/v1/bookings', body)
      } else {
        // Nuxt internal (demo/template mode)
        await $fetch('/api/bookings', { method: 'POST', body })
      }
      success.value = true
    } catch (e: any) {
      error.value =
        e?.response?.data?.error?.message ||
        e?.data?.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    success.value = false
    error.value = null
  }

  return { submit, loading, success, error, reset }
}
