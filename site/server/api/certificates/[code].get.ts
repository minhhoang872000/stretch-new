/**
 * GET /api/certificates/:code — public certificate lookup, what a verification
 * link (LinkedIn, a printed QR code) resolves to. Proxies the API's public
 * `/certificates/verify/:code`; there is nothing personal here beyond the name
 * printed on the certificate itself.
 */
export default defineEventHandler(async (event) => {
  const code = String(getRouterParam(event, 'code') || '').trim()
  if (!code || code.length > 40) throw createError({ statusCode: 400, message: 'Mã không hợp lệ' })

  const base = String(useRuntimeConfig(event).lessonApiBase || '').replace(/\/$/, '')
  const res = await $fetch<{ data?: { valid: boolean; certificate: Record<string, unknown> | null } }>(
    `${base}/certificates/verify/${encodeURIComponent(code)}`,
    { timeout: 10000 },
  )
  // Short: a revocation should show up within minutes, not a day.
  setHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return res?.data ?? { valid: false, certificate: null }
})
