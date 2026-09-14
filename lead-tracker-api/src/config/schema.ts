import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pool } from './db'

/**
 * Applies `schema.sql` to the configured database and reports the table count.
 *
 * `schema.sql` is idempotent by construction — every statement is
 * CREATE ... IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS, or an INSERT
 * with ON CONFLICT DO NOTHING — so replaying it against an existing database
 * adds what is missing and touches nothing else. That is what makes it safe to
 * run both from the CLI (`npm run db:migrate`) and at server start-up, where it
 * closes the gap between "code deployed" and "someone remembered to migrate":
 * a host like Render deploys on push and there is no hook between the two.
 *
 * pg's simple query protocol runs the whole file in one implicit transaction,
 * so a syntax error halfway through leaves nothing half-created.
 */
export async function applySchema(): Promise<number> {
  const file = join(__dirname, '..', '..', 'schema.sql')
  const sql = readFileSync(file, 'utf8')
  await pool.query(sql)

  const tables = await pool.query(
    `SELECT COUNT(*)::int AS n FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  )
  return tables.rows[0].n as number
}
