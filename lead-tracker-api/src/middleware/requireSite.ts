import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { requireAuth } from './requireAuth'

/**
 * The website vouching for a learner.
 *
 * The learner's browser never talks to this API. It talks to stretch.vn, which
 * holds the Google session, checks who is signed in, and only then calls here
 * with `x-service-token`. That token says "a server I trust has already
 * identified this person" — it is not a learner credential and grants nothing
 * on its own, which is why every route using it still names the learner it is
 * acting for and checks that learner owns the row.
 *
 * Keeping it out of the browser is the whole point: a token the client can read
 * is a token that can read every learner's data.
 */

/** True when this request came from the site with a valid service token. */
export function isSiteCaller(req: Request): boolean {
  const token = req.headers['x-service-token']
  return (
    typeof token === 'string' &&
    !!token &&
    !!env.siteServiceToken &&
    token === env.siteServiceToken
  )
}

/** Site OR admin. Used by anything both the console and the website read. */
export function requireAdminOrSite(req: Request, res: Response, next: NextFunction): void {
  if (isSiteCaller(req)) {
    ;(req as any).caller = 'site'
    next()
    return
  }
  requireAuth(req, res, next)
}

/**
 * Site only. For the learner-facing writes an admin has no business making on
 * someone's behalf — recording that a lesson was watched, say.
 */
export function requireSite(req: Request, res: Response, next: NextFunction): void {
  if (isSiteCaller(req)) {
    ;(req as any).caller = 'site'
    next()
    return
  }
  res.status(401).json({
    success: false,
    error: { code: 'UNAUTHORIZED', message: 'Service token không hợp lệ' },
  })
}
