/**
 * The referral code a visitor arrived with (`?ref=CODE`).
 *
 * Kept in two places on purpose: a cookie, because the Google sign-in callback
 * runs on the server and has to read it to stamp the new learner with their
 * referrer; and localStorage, so the checkout can pre-fill the code for the
 * friend's discount. Thirty days — someone who clicks a link today often buys
 * next week.
 */
const KEY = 'stretch-ref'
const MAX_AGE = 30 * 24 * 3600
export const REFERRAL_RE = /^[A-Z0-9]{4,20}$/

export function rememberReferral(raw: string | null | undefined) {
  const code = String(raw || '').trim().toUpperCase()
  if (!REFERRAL_RE.test(code)) return
  try {
    document.cookie = `${KEY}=${code}; max-age=${MAX_AGE}; path=/; samesite=lax`
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }))
  } catch {
    // storage blocked — the link simply does not carry over
  }
}

/** The remembered code, if still within thirty days. */
export function referralFromStorage(): string {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return ''
    const { code, at } = JSON.parse(raw)
    if (Date.now() - Number(at) > MAX_AGE * 1000) return ''
    return REFERRAL_RE.test(String(code)) ? String(code) : ''
  } catch {
    return ''
  }
}
