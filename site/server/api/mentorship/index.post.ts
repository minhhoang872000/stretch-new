import { z } from 'zod'
import { apiBase, requireLearner, serviceToken, upstreamMessage } from '~~/server/utils/mentorshipApi'

/**
 * POST /api/mentorship
 *
 * Books a 1-to-1 for the signed-in learner.
 *
 * The body carries only WHAT is being asked for. WHO is asking comes from the
 * Google session on this server — never from the request — so a crafted body
 * cannot book in somebody else's name or put a stranger's address on a calendar
 * invitation.
 */

const RequestSchema = z.object({
  program_slug: z.string().max(200).optional(),
  lesson_key: z.string().max(20).optional(),
  lesson_title: z.string().max(300).optional(),
  topic: z.string().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ không hợp lệ'),
})

export default defineEventHandler(async (event) => {
  const learner = await requireLearner(event)

  const parsed = RequestSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: parsed.error.issues.map((i) => i.message).join(', ') || 'Dữ liệu không hợp lệ',
    })
  }

  const base = apiBase(event)
  const token = serviceToken(event)
  if (!base || !token) {
    throw createError({ statusCode: 500, message: 'Tính năng đặt buổi 1-1 chưa được cấu hình.' })
  }

  setHeader(event, 'cache-control', 'no-store')

  try {
    const res = await $fetch<{ data?: { message?: string; session?: unknown } }>(
      `${base}/mentorship`,
      {
        method: 'POST',
        headers: { 'x-service-token': token },
        body: {
          ...parsed.data,
          learner_name: learner.name,
          learner_email: learner.email,
          learner_avatar: learner.avatar || undefined,
        },
        timeout: 10000,
      },
    )

    return {
      success: true,
      message: res?.data?.message || 'Đã gửi yêu cầu. Giảng viên sẽ xác nhận sớm.',
      session: res?.data?.session ?? null,
    }
  } catch (err: any) {
    // 409 (slot gone) and 429 (too many pending) are normal outcomes the modal
    // shows as-is, so the upstream status is preserved rather than flattened.
    const status = err?.statusCode || err?.status || 502
    throw createError({
      statusCode: status >= 400 && status < 600 ? status : 502,
      message: upstreamMessage(err, 'Không gửi được yêu cầu. Anh/chị thử lại giúp em nhé.'),
    })
  }
})
