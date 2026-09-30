/**
 * stretch-cron — the clock behind the API's automated emails.
 *
 * Render's free plan has no cron and sleeps when idle, so a timer inside the
 * API would never fire. This Worker's cron trigger runs every hour, wakes the
 * API (a cold start takes up to a minute) and calls the one sweep endpoint:
 *
 *   POST {API_BASE}/automation/jobs/run   (x-service-token)
 *
 * which sends 24-hour session reminders, "học tiếp" nudges, payment
 * confirmations, referral rewards and any missing certificates. Every job is
 * idempotent (email_log), so a doubled or missed run is harmless.
 *
 * Deploy:  npx wrangler deploy            (from this folder)
 * Secret:  npx wrangler secret put SITE_SERVICE_TOKEN
 * Test:    curl -X POST https://stretch-cron.<account>.workers.dev/run -H "x-service-token: …"
 */

async function wake(base) {
  const origin = base.replace(/\/api\/v1\/?$/, '')
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(75000) })
      if (res.ok) return true
    } catch {
      // still booting — try again
    }
  }
  return false
}

async function run(env) {
  const base = String(env.API_BASE || '').replace(/\/$/, '')
  if (!base || !env.SITE_SERVICE_TOKEN) {
    console.error('[cron] API_BASE or SITE_SERVICE_TOKEN missing')
    return { ok: false, error: 'not configured' }
  }
  const awake = await wake(base)
  const res = await fetch(`${base}/automation/jobs/run`, {
    method: 'POST',
    headers: { 'x-service-token': env.SITE_SERVICE_TOKEN, 'content-type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(120000),
  })
  const text = await res.text()
  console.log(`[cron] awake=${awake} status=${res.status} ${text.slice(0, 500)}`)
  return { ok: res.ok, status: res.status, body: text.slice(0, 2000) }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(run(env))
  },

  /** Manual trigger for testing — same token the site uses. */
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/run' && request.method === 'POST') {
      if (request.headers.get('x-service-token') !== env.SITE_SERVICE_TOKEN) {
        return new Response('forbidden', { status: 403 })
      }
      return Response.json(await run(env))
    }
    return new Response('stretch-cron: hourly jobs for the Stretch API', { status: 200 })
  },
}
