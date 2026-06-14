import emailjs from '@emailjs/browser'
import { getApiInstance } from '~/services/api'
import { useTrackingStore } from '~/stores/tracking'

/**
 * Booking composable — adaptive API calls + EmailJS notification.
 *
 * When NUXT_PUBLIC_TRACKING_API_URL is configured, calls go to the
 * external lead-tracker-api. Otherwise falls back to Nuxt's internal
 * /api/bookings routes (demo mode).
 *
 * Additionally sends a notification email via EmailJS so the team
 * receives booking details immediately.
 *
 * Automatically attaches session_id from tracking store for
 * lead-to-booking attribution.
 */
export function useBooking() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.trackingApiUrl as string
  const trackingStore = useTrackingStore()

  // EmailJS credentials from runtime config
  const emailjsServiceId = config.public.emailjsServiceId as string
  const emailjsTemplateId = config.public.emailjsTemplateId as string
  const emailjsAdminTemplateId = config.public.emailjsAdminTemplateId as string
  const emailjsPublicKey = config.public.emailjsPublicKey as string

  const loading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)

  /**
   * Send booking notification email via EmailJS.
   * Throws error on failure so the submit function can handle it.
   */
  async function sendEmailNotification(payload: Record<string, any>) {
    // Skip if EmailJS is not configured
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
      throw new Error('Cấu hình EmailJS chưa được thiết lập. Vui lòng kiểm tra lại file .env')
    }

    // Map booking payload to EmailJS template parameters
    const templateParams: Record<string, string> = {
      from_name: payload.name || '',
      from_email: payload.email || '',
      phone: payload.phone || '',
      service: payload.service || '',
      date: payload.date || '',
      time: payload.time || '',
      note: payload.note || '',
      practitioner: payload.practitioner || 'Not specified',
    }

    // Gửi email qua các template được cấu hình
    const promises = []

    // 1. Template gửi cho Khách hàng (hoặc template mặc định)
    promises.push(
      emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        templateParams,
        emailjsPublicKey,
      )
    )

    // 2. Template gửi riêng cho Chủ website (Admin) nếu có cấu hình
    if (emailjsAdminTemplateId) {
      promises.push(
        emailjs.send(
          emailjsServiceId,
          emailjsAdminTemplateId,
          templateParams,
          emailjsPublicKey,
        )
      )
    }

    await Promise.all(promises)
    console.log('[useBooking] EmailJS notifications sent successfully.')
  }

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
      // Lưu booking vào database
      if (apiUrl) {
        await getApiInstance(apiUrl).post('/api/v1/bookings', body)
      } else {
        await $fetch('/api/bookings', { method: 'POST', body })
      }

      // Gửi email thông báo qua EmailJS (không chặn luồng chính)
      sendEmailNotification(body).catch((e: any) => {
        console.warn('[useBooking] Email notification failed (non-blocking):', e?.message || e)
      })

      success.value = true
    } catch (e: any) {
      console.error('[useBooking] Booking submit error:', e)
      error.value =
        e?.text ||
        e?.message ||
        'Đã có lỗi xảy ra khi gửi email đặt lịch. Vui lòng thử lại.'
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
