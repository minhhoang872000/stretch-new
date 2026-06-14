import { Request, Response, NextFunction } from 'express'
import { authService } from '../modules/auth/auth.service'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
    return
  }

  try {
    const token = authHeader.slice(7)
    const payload = authService.verifyToken(token)
    ;(req as any).admin = payload
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token không hợp lệ hoặc đã hết hạn' },
    })
  }
}
