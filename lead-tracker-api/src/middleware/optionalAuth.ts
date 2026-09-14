import { Request, Response, NextFunction } from 'express'
import { authService } from '../modules/auth/auth.service'

/**
 * Attaches `req.admin` when a valid bearer token is present, and does nothing
 * when it is not. Never rejects.
 *
 * This is what lets one endpoint serve two audiences: the public site gets the
 * published rows, an authenticated console gets everything, and neither needs a
 * separate URL. `requireAuth` cannot do this — it answers 401 — and leaving the
 * route fully open would publish every draft.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }
  try {
    ;(req as any).admin = authService.verifyToken(header.slice(7))
  } catch {
    // An expired or forged token is simply not a token: the request continues
    // as anonymous rather than failing, because the public view is valid.
  }
  next()
}
