import { Pool } from 'pg'
import { env } from './env'

/**
 * PostgreSQL connection pool.
 * Prefers DATABASE_URL (provided by Render) over individual credentials.
 */
export const pool: Pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
      max: 10,
    })
  : new Pool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
      max: 10,
    })

/**
 * Test DB connection on startup.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    console.log('[DB] ✓ PostgreSQL connected successfully')
    return true
  } catch (err: any) {
    console.error('[DB] ✗ PostgreSQL connection failed:', err.message)
    return false
  }
}
