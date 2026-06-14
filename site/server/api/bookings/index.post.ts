import { z } from 'zod'

const BookingSchema = z.object({
  service: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  time: z.string().regex(/^(\d{2}:\d{2}|flexible)$/, 'Giờ không hợp lệ'),
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  note: z.string().optional(),
  practitioner: z.string().nullable().optional(),
  session_id: z.string().max(64).nullable().optional(),
})

/**
 * Forwards the landing-page booking to the lead-tracker-api (Postgres source of
 * truth) so it shows up in the CRM. Validates locally first for nice messages.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let data
  try {
    data = BookingSchema.parse(body)
  } catch (err: any) {
    throw createError({
      statusCode: 422,
      message: err?.issues?.map((i: any) => i.message).join(', ') || 'Dữ liệu không hợp lệ',
    })
  }

  const base = useRuntimeConfig().public.trackingApiUrl
  if (!base) {
    throw createError({ statusCode: 500, message: 'Booking API chưa được cấu hình.' })
  }

  try {
    const res = await $fetch<{ data?: { message?: string; booking?: any } }>(
      `${base}/api/v1/bookings`,
      {
        method: 'POST',
        body: {
          service: data.service,
          date: data.date,
          time: data.time,
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          note: data.note || undefined,
          practitioner: data.practitioner || null,
          session_id: data.session_id || null,
        },
        timeout: 8000,
      },
    )

    return {
      success: true,
      message: res?.data?.message || 'Đặt lịch thành công!',
      booking: res?.data?.booking || null,
    }
  } catch (err: any) {
    const msg = err?.data?.error?.message || err?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    throw createError({ statusCode: err?.statusCode || 502, message: msg })
  }
})
