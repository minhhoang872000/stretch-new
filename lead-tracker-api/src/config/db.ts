import mysql, { Pool } from 'mysql2/promise'
import { env } from './env'

/**
 * MySQL connection pool.
 * Uses mysql2/promise for async/await support.
 */
export const pool: Pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: true,
})

/**
 * Test DB connection on startup.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log('[DB] ✓ MySQL connected successfully')
    return true
  } catch (err: any) {
    console.error('[DB] ✗ MySQL connection failed:', err.message)
    return false
  }
}
