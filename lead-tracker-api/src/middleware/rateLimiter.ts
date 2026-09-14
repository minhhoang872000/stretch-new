import rateLimit from 'express-rate-limit'
import type { Request } from 'express'
import { env } from '../config/env'
import { isSiteCaller } from './requireSite'

/**
 * Per-IP rate limiting, with two buckets.
 *
 * The limiter exists to protect the endpoints anyone can reach — tracking,
 * public booking, the enquiry form — from being hammered. It was applying the
 * same allowance to the admin consoles, and that broke them: a console screen
 * legitimately loads several collections, so clicking through eight screens
 * spent the whole minute's budget and the ninth screen rendered an error.
 *
 * So a request that has already proved who it is gets a much larger allowance.
 * It is not unlimited — a runaway loop in a console should still be stopped —
 * but it is sized for a person using the app rather than for an anonymous
 * stranger. Anonymous traffic keeps the original, tighter limit.
 *
 * "Proved who it is" means a bearer token or the site's service token. Neither
 * is checked for validity here; that is `requireAuth`'s job on the route
 * itself. A forged token buys the larger bucket and then a 401, which is a
 * trade worth making to keep this middleware cheap and off the database.
 */

/** Bearer token present, valid or not — verification happens per route. */
function looksAuthenticated(req: Request): boolean {
  const header = req.headers.authorization
  return (typeof header === 'string' && header.startsWith('Bearer ')) || isSiteCaller(req)
}

const shared = {
  windowMs: env.rateLimit.windowMs,
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
}

/** Anonymous callers: the public site and whoever else finds the URL. */
const anonymousLimiter = rateLimit({
  ...shared,
  max: env.rateLimit.max,
  skip: (req) => req.path === '/health' || looksAuthenticated(req),
})

/** Signed-in consoles and the website's own server. */
const authenticatedLimiter = rateLimit({
  ...shared,
  max: env.rateLimit.authenticatedMax,
  skip: (req) => req.path === '/health' || !looksAuthenticated(req),
})

export const rateLimiterMiddleware = [anonymousLimiter, authenticatedLimiter]
