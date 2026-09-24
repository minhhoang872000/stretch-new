import { fetchProgramBySlug } from '~~/server/utils/academyApi'
import { learnerFetch } from '~~/server/utils/learnerApi'

/**
 * GET /api/me/materials/:slug — the files of every lesson this visitor may take.
 *
 *   { items: { "<moduleIndex>-<itemIndex>": Attachment[] } }
 *
 * Free lessons and free courses: for everybody. Paid lessons: only for a
 * signed-in learner the API says has access. Keyed like the player keys its
 * lessons, so the lesson page can look a lesson's files up directly.
 */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) throw createError({ statusCode: 400, message: 'slug là bắt buộc' })
  setHeader(event, 'cache-control', 'private, no-store')

  const program = await fetchProgramBySlug(event, slug)
  if (!program) throw createError({ statusCode: 404, message: 'Không tìm thấy chương trình' })

  const programFree = Number(program.price) <= 0
  let hasAccess = programFree
  if (!hasAccess) {
    const session = await getUserSession(event)
    const learnerId = (session?.user as any)?.learner?.id
    if (learnerId) {
      try {
        const access = await learnerFetch<{ allowed?: boolean }>(
          event,
          `/learner/${encodeURIComponent(learnerId)}/access/${encodeURIComponent(slug)}`,
        )
        hasAccess = !!access?.allowed
      } catch {
        hasAccess = false
      }
    }
  }

  const items: Record<string, any[]> = {}
  ;(program.modules || []).forEach((module: any, mi: number) => {
    ;(Array.isArray(module?.items) ? module.items : []).forEach((item: any, ii: number) => {
      const files = Array.isArray(item?.attachments) ? item.attachments.filter((a: any) => a?.url) : []
      if (!files.length) return
      if (!hasAccess && !item.free) return
      items[`${mi}-${ii}`] = files.map((a: any) => ({
        name: String(a.name || 'Tài liệu'),
        url: String(a.url),
        size: Number(a.size) || 0,
        mime: String(a.mime || ''),
      }))
    })
  })

  return { items, hasAccess }
})
