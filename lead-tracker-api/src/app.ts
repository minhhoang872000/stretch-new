import express from 'express'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors'
import { loggerMiddleware } from './middleware/logger'
import { rateLimiterMiddleware } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import trackingRouter from './modules/tracking/tracking.router'
import bookingRouter from './modules/booking/booking.router'
import analyticsRouter from './modules/analytics/analytics.router'
import blogRouter from './modules/blog/blog.router'
import categoryRouter from './modules/category/category.router'
import imagesRouter from './modules/images/images.router'
import gaRouter from './modules/google-analytics/ga.router'
import authRouter from './modules/auth/auth.router'
import { requireAuth } from './middleware/requireAuth'
import { success } from './utils/response'

const app = express()

// ─── Security ────────────────────────────────────────────────────────
app.use(helmet())

// ─── Trust proxy (Render is behind a reverse proxy) ──────────────────
app.set('trust proxy', 1)

// ─── Global Middleware ───────────────────────────────────────────────
app.use(corsMiddleware)
app.use(loggerMiddleware)
app.use(rateLimiterMiddleware)
app.use(express.json({ limit: '100kb' }))

// ─── Health Check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  success(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/tracking', trackingRouter)          // fully public (site tracking)
app.use('/api/v1/bookings', bookingRouter)           // mixed: POST/availability public, rest admin
app.use('/api/v1/blog', blogRouter)                  // mixed: GET public, write admin
app.use('/api/v1/categories', categoryRouter)        // mixed: GET public, write admin
app.use('/api/v1/images', requireAuth, imagesRouter)         // admin only (uploads)
app.use('/api/v1/analytics', requireAuth, analyticsRouter)
app.use('/api/v1/google-analytics', requireAuth, gaRouter)

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
})

// ─── Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler)

export default app
