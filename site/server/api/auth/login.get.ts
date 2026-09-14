/**
 * The one link every "Sign in with Google" button points at.
 *
 * It exists for a single reason: to remember where the person was. Google's
 * redirect always lands on /api/auth/google, which has no idea which course
 * page or locale (/vi/...) started the sign-in. So this route notes the start
 * page in a short-lived cookie and only then hands over to the OAuth flow;
 * `google.get.ts` reads that cookie back and sends the person home.
 *
 *   ?next=/vi/learning-hub/programs/abc   explicit target (wins)
 *   Referer header                        same-origin page the click came from
 *   (neither)                             "/" — google.get.ts's default
 *
 * Only same-origin paths are accepted, so this can never be turned into an
 * open redirect.
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  let next = typeof query.next === 'string' ? query.next : ''

  if (!next) {
    const referer = getRequestHeader(event, 'referer') || ''
    try {
      const url = new URL(referer)
      const host = getRequestHost(event)
      if (url.host === host && !url.pathname.startsWith('/api/')) {
        next = url.pathname + url.search
      }
    } catch {
      /* no or malformed referer — fall through to "/" */
    }
  }

  if (next && next.startsWith('/') && !next.startsWith('//')) {
    setCookie(event, 'stretch-auth-next', next, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.dev,
      path: '/',
      maxAge: 60 * 10,
    })
  } else {
    deleteCookie(event, 'stretch-auth-next')
  }

  return sendRedirect(event, '/api/auth/google')
})
