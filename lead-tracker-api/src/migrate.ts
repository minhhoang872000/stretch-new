import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pool } from './config/db'

/**
 * Applies `schema.sql` to the configured database.
 *
 *   npm run db:migrate
 *
 * Exists because `psql` is not installed everywhere the API is, and asking a
 * developer to install Postgres client tools just to create tables is a step
 * that gets skipped. The file is idempotent by construction — every statement
 * is CREATE TABLE / CREATE INDEX IF NOT EXISTS or ALTER TABLE ADD COLUMN IF NOT
 * EXISTS — so running it against an existing database adds what is missing and
 * touches nothing else.
 *
 * It is not a migration framework: there are no versions and no down steps. It
 * is the file that defines the schema, replayed.
 */
async function migrate(): Promise<void> {
  const file = join(__dirname, '..', 'schema.sql')
  const sql = readFileSync(file, 'utf8')

  console.log(`[Migrate] Applying ${file}`)

  // One call, not one per statement: pg's simple query protocol runs the whole
  // script in a single implicit transaction, so a syntax error halfway through
  // leaves nothing half-created.
  await pool.query(sql)

  const tables = await pool.query(
    `SELECT COUNT(*)::int AS n FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  )
  console.log(`[Migrate] ✓ Done — ${tables.rows[0].n} tables in the database`)
}

migrate()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Migrate] Failed:', err.message)
    pool.end().finally(() => process.exit(1))
  })
