import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

/**
 * Basic rate limiter per IP.
 */
export const rateLimiterMiddleware = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
  skip: (req) => req.path === '/health',
})
