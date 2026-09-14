import { pool } from './config/db'
import { applySchema } from './config/schema'

/**
 * Applies `schema.sql` to the configured database.
 *
 *   npm run db:migrate
 *
 * Exists because `psql` is not installed everywhere the API is, and asking a
 * developer to install Postgres client tools just to create tables is a step
 * that gets skipped. The server also runs the same `applySchema()` on start-up
 * in production (see server.ts), so this command is for local databases and
 * for checking a remote one by hand.
 *
 * It is not a migration framework: there are no versions and no down steps. It
 * is the file that defines the schema, replayed.
 */
async function migrate(): Promise<void> {
  console.log('[Migrate] Applying schema.sql')
  const n = await applySchema()
  console.log(`[Migrate] ✓ Done — ${n} tables in the database`)
}

migrate()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Migrate] Failed:', err.message)
    pool.end().finally(() => process.exit(1))
  })
