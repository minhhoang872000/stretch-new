import morgan from 'morgan'
import { env } from '../config/env'

/**
 * HTTP request logger.
 */
export const loggerMiddleware = morgan(env.isProd ? 'combined' : 'dev')
