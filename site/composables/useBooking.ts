import emailjs from '@emailjs/browser'

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
 * After a successful submit, `bookingId` holds the new booking's id; the
 * booking flows send it to GA so the CRM can look up the booking's source.
 */
export function useBooking() {
  const config = useRuntimeConfig()

  // EmailJS credentials from runtime config
  const emailjsServiceId = config.public.emailjsServiceId as string
  const emailjsTemplateId = config.public.emailjsTemplateId as string
  const emailjsAdminTemplateId = config.public.emailjsAdminTemplateId as string
  const emailjsPublicKey = config.public.emailjsPublicKey as string

  const loading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const bookingId = ref<string | null>(null)

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
    bookingId.value = null

    const body = {
      ...payload,
      email: payload.email || '',
      note: payload.note || '',
    }

    try {
      // Booking is a client-side POST (no SSR path), so calling the API directly
      // from the browser would be blocked by CORS. Go through the Nuxt server
      // route instead → it forwards to the lead-tracker-api server-to-server.
      const res = await $fetch<{ booking?: { id?: string } | null }>('/api/bookings', { method: 'POST', body })
      bookingId.value = res?.booking?.id || null

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
    bookingId.value = null
  }

  return { submit, loading, success, error, bookingId, reset }
}
