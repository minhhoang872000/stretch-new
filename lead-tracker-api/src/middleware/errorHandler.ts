import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

/**
 * Centralized error handler.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // CORS errors
  if (err.message?.startsWith('CORS:')) {
    res.status(403).json({
      success: false,
      error: { code: 'CORS_ERROR', message: err.message },
    })
    return
  }

  // Log
  if (!env.isProd) {
    console.error('[ERROR]', err)
  } else {
    console.error('[ERROR]', err.message)
  }

  const statusCode: number = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: env.isProd ? 'An internal error occurred' : err.message || 'Unknown error',
    },
  })
}
