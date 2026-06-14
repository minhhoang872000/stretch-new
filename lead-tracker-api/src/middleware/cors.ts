import corsLib from 'cors'
import { env } from '../config/env'

/**
 * CORS middleware — restricts access to whitelisted frontend origins.
 */
export const corsMiddleware = corsLib({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true)

    // In development, allow all localhost origins
    if (!env.isProd && origin.startsWith('http://localhost:')) {
      return callback(null, true)
    }

    if (env.corsOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-ID', 'Authorization'],
  credentials: false,
  maxAge: 86400,
})
