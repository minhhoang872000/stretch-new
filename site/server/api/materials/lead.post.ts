import { learnerFetch } from '~~/server/utils/learnerApi'

/**
 * POST /api/materials/lead — "nhận tài liệu miễn phí": an email address in
 * exchange for the download. The lead goes to the CRM's enquiries (source
 * `free-material`) and the link is emailed too.
 *
 * Public — no sign-in needed, that is the point — so a honeypot field turns
 * away the dumbest bots, and the API validates the address.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  // Hidden field real people never fill in.
  if (body?.website) return { ok: true }

  const email = String(body?.email || '').trim()
  const materialTitle = String(body?.materialTitle || '').trim()
  if (!email || !materialTitle) throw createError({ statusCode: 400, message: 'Thiếu email hoặc tài liệu' })

  setHeader(event, 'cache-control', 'no-store')
  return learnerFetch(event, '/automation/leads/material', {
    method: 'POST',
    body: {
      email,
      name: String(body?.name || '').slice(0, 120),
      phone: String(body?.phone || '').slice(0, 40),
      job: String(body?.job || '').slice(0, 120),
      materialTitle: materialTitle.slice(0, 120),
      url: String(body?.url || '').slice(0, 1000),
    },
  })
})
