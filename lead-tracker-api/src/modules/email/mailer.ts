import { pool } from '../../config/db'
import { env } from '../../config/env'
import { generateId } from '../../core/crud'

/**
 * Transactional email through Cloudflare Email Sending's REST API.
 *
 * Every send goes through `sendOnce(kind, ref, …)`, which claims the
 * `(kind, ref)` pair in `email_log` BEFORE calling out. The unique key is the
 * guard: an hourly job that overlaps the previous run, a retried request, or a
 * learner signing in twice in a second all resolve to one email, because the
 * second claim fails and nothing is sent.
 *
 * Without EMAIL_API_TOKEN the claim is still written, as `skipped`. That keeps
 * the API behaving identically before the sending domain is onboarded — and it
 * means switching email on later does not mail every learner who ever signed
 * up a "welcome" in one burst.
 */

export interface Mail {
  to: string
  subject: string
  html: string
  text: string
}

export const emailEnabled = () => !!(env.email.apiToken && env.email.accountId)

async function deliver(mail: Mail): Promise<void> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.email.accountId}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: mail.to,
        from: { address: env.email.from, name: env.email.fromName },
        reply_to: env.email.replyTo,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      signal: AbortSignal.timeout(15000),
    },
  )
  const body: any = await res.json().catch(() => null)
  if (!res.ok || body?.success === false) {
    const reason = body?.errors?.map((e: any) => `${e.code} ${e.message}`).join('; ') || `HTTP ${res.status}`
    throw new Error(reason)
  }
  if (body?.result?.permanent_bounces?.length) {
    throw new Error(`permanent bounce: ${body.result.permanent_bounces.join(', ')}`)
  }
}

/**
 * Send `mail` unless a `(kind, ref)` email already went out. Never throws — an
 * email is a courtesy, and a failed one must not fail the sign-in or the order
 * that triggered it. Returns what happened, for the job report.
 */
export async function sendOnce(
  kind: string,
  ref: string,
  mail: Mail,
): Promise<'sent' | 'skipped' | 'duplicate' | 'failed'> {
  const to = String(mail.to || '').trim()
  if (!to || !to.includes('@')) return 'skipped'

  const status = emailEnabled() ? 'sent' : 'skipped'
  const claim = await pool
    .query(
      `INSERT INTO email_log (id, kind, ref, recipient, status)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (kind, ref) DO NOTHING
       RETURNING id`,
      [generateId('eml'), kind, ref, to, status],
    )
    .catch((err) => {
      console.error('[Email] log claim failed:', err?.message || err)
      return null
    })
  if (!claim || !claim.rows.length) return claim ? 'duplicate' : 'failed'
  if (status === 'skipped') return 'skipped'

  try {
    await deliver({ ...mail, to })
    return 'sent'
  } catch (err: any) {
    console.error(`[Email] ${kind} → ${to} failed:`, err?.message || err)
    await pool
      .query(`UPDATE email_log SET status = 'failed', error = $2 WHERE id = $1`, [
        claim.rows[0].id,
        String(err?.message || err).slice(0, 1000),
      ])
      .catch(() => {})
    return 'failed'
  }
}

/** Fire-and-forget from a request handler: the response never waits on SMTP. */
export function sendOnceInBackground(kind: string, ref: string, mail: Mail): void {
  sendOnce(kind, ref, mail).catch(() => {})
}
