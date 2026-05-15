import { z } from 'zod'
import { createBooking } from '~/server/utils/db'

const BookingSchema = z.object({
  service: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ không hợp lệ'),
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  note: z.string().optional(),
  practitioner: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const data = BookingSchema.parse(body)

    const booking = createBooking({
      service: data.service,
      date: data.date,
      time: data.time,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      note: data.note || undefined,
      practitioner: data.practitioner || null,
    })

    return {
      success: true,
      message: 'Đặt lịch thành công!',
      booking: {
        id: booking.id,
        status: booking.status,
      },
    }
  } catch (err: any) {
    if (err?.issues) {
      // Zod validation error
      throw createError({
        statusCode: 422,
        message: err.issues.map((i: any) => i.message).join(', '),
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    })
  }
})
