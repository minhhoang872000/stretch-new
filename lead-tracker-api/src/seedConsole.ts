import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pool } from './config/db'

/**
 * Seeds the console tables from `src/data/seed/console-seed.json`.
 *
 *   npm run seed:console
 *
 * The snapshot was generated from the mock data the three frontends were built
 * against, so a fresh local database shows the same figures the consoles were
 * designed around — a schema with no rows makes every screen look broken and
 * every chart look wrong.
 *
 * Separate from `seed.ts`, which owns the older public-site tables (spa
 * products, blog posts, the admin login). Running one does not disturb the
 * other, and this one is safe to re-run: every insert is ON CONFLICT DO
 * NOTHING, so it fills gaps and never overwrites work.
 */

interface Snapshot {
  [table: string]: Record<string, unknown>[]
}

/**
 * Insert order is foreign-key order. `programs` needs `instructors`,
 * `enrolments` needs both `learners` and `programs`, `payments` needs `orders`.
 * Getting this wrong shows up as a constraint violation halfway through, with
 * half the database seeded — hence one explicit list rather than Object.keys.
 */
const ORDER: string[] = [
  'instructors',
  'programs',
  'program_sessions',
  'learners',
  'enrolments',
  // Needs both a session and a learner to exist first.
  'session_attendees',
  'certificates',
  'program_reviews',
  'lesson_video_index',
  'lesson_progress',
  'quiz_attempts',
  'coupons',
  'orders',
  'payments',
  'products',
  'practitioners',
  'practitioner_availability',
  'practitioner_time_off',
  'bookings',
  'pages',
  'faqs',
  'translations',
  'media_assets',
  'enquiries',
  'app_users',
  'audit_log',
  'app_settings',
]

/** Tables whose conflict target is not a plain `id`. Composite keys allowed. */
const CONFLICT_TARGET: Record<string, string[]> = {
  app_settings: ['section'],
  session_attendees: ['session_id', 'learner_id'],
}

function quote(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

async function insertRows(table: string, rows: Record<string, unknown>[]): Promise<number> {
  if (!rows.length) return 0

  // Every row in a collection has the same keys — the generator builds them
  // from one mapper — so the statement is prepared once per table.
  const columns = Object.keys(rows[0]!)
  const sql = `INSERT INTO ${quote(table)} (${columns.map(quote).join(', ')})
               VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
               ON CONFLICT (${(CONFLICT_TARGET[table] || ['id']).map(quote).join(', ')}) DO NOTHING`

  let inserted = 0
  for (const row of rows) {
    const result = await pool.query(
      sql,
      columns.map((column) => {
        const value = row[column]
        return value === undefined ? null : value
      }),
    )
    inserted += result.rowCount || 0
  }
  return inserted
}

async function seedConsole(): Promise<void> {
  const file = join(__dirname, 'data', 'seed', 'console-seed.json')
  const snapshot: Snapshot = JSON.parse(readFileSync(file, 'utf8'))

  console.log('[SeedConsole] Starting...')

  let total = 0
  for (const table of ORDER) {
    const rows = snapshot[table]
    if (!rows) {
      console.warn(`[SeedConsole] ! no rows for ${table} in the snapshot — skipped`)
      continue
    }
    try {
      const inserted = await insertRows(table, rows)
      total += inserted
      const skipped = rows.length - inserted
      console.log(
        `[SeedConsole] ${table.padEnd(28)} +${String(inserted).padStart(4)}` +
          (skipped ? `  (${skipped} đã có, bỏ qua)` : ''),
      )
    } catch (err: any) {
      // Report the table rather than dying with a bare constraint name: with
      // twenty-six of them, "violates foreign key constraint" alone says nothing.
      console.error(`[SeedConsole] ✗ ${table}: ${err.message}`)
      throw err
    }
  }

  // Anything the snapshot carries that the ordered list forgot would silently
  // never be seeded, and the omission would look like an empty screen later.
  for (const table of Object.keys(snapshot)) {
    if (!ORDER.includes(table)) {
      console.warn(`[SeedConsole] ! ${table} is in the snapshot but not in ORDER — not seeded`)
    }
  }

  console.log(`[SeedConsole] ✓ Done — ${total} rows inserted`)
}

seedConsole()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[SeedConsole] Failed:', err.message)
    pool.end().finally(() => process.exit(1))
  })
