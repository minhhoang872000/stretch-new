/**
 * Checks the seed snapshot against schema.sql without needing a database.
 *
 * Catches the two failures that would otherwise only appear at `npm run seed`:
 * a column in the snapshot that the table does not have, and a NOT NULL column
 * with no default that the snapshot never fills.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sql = readFileSync(`${ROOT}/schema.sql`, 'utf8')
const seed = JSON.parse(readFileSync(`${ROOT}/src/data/seed/console-seed.json`, 'utf8'))

/** table -> { column -> { notNull, hasDefault } } */
const tables = {}

for (const match of sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)) {
  const [, name, body] = match
  const columns = {}
  for (let line of body.split('\n')) {
    line = line.trim().replace(/--.*$/, '').trim()
    if (!line) continue
    if (/^(PRIMARY KEY|UNIQUE|FOREIGN KEY|CHECK|CONSTRAINT)\b/i.test(line)) continue
    const col = line.match(/^"?([a-z_0-9]+)"?\s+[A-Z]/)
    if (!col) continue
    columns[col[1]] = {
      notNull: /NOT NULL/i.test(line),
      hasDefault: /DEFAULT/i.test(line),
    }
  }
  tables[name] = columns
}

// ALTER TABLE ... ADD COLUMN additions
for (const match of sql.matchAll(
  /ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS\s+"?([a-z_0-9]+)"?\s+([^;]+);/g,
)) {
  const [, table, column, rest] = match
  if (!tables[table]) tables[table] = {}
  tables[table][column] = { notNull: /NOT NULL/i.test(rest), hasDefault: /DEFAULT/i.test(rest) }
}

let problems = 0

for (const [table, rows] of Object.entries(seed)) {
  const schema = tables[table]
  if (!schema) {
    console.log(`✗ ${table}: no CREATE TABLE found in schema.sql`)
    problems += 1
    continue
  }
  if (!rows.length) continue

  const seedColumns = new Set()
  for (const row of rows) for (const key of Object.keys(row)) seedColumns.add(key)

  const unknown = [...seedColumns].filter((c) => !schema[c])
  if (unknown.length) {
    console.log(`✗ ${table}: columns not in table -> ${unknown.join(', ')}`)
    problems += 1
  }

  const requiredMissing = Object.entries(schema)
    .filter(([col, def]) => def.notNull && !def.hasDefault && !seedColumns.has(col))
    .map(([col]) => col)
  if (requiredMissing.length) {
    console.log(`✗ ${table}: NOT NULL with no default, never seeded -> ${requiredMissing.join(', ')}`)
    problems += 1
  }

  // A NOT NULL column the snapshot fills with null is the same failure, later.
  for (const [col, def] of Object.entries(schema)) {
    if (!def.notNull || !seedColumns.has(col)) continue
    const nulls = rows.filter((r) => r[col] === null || r[col] === undefined).length
    if (nulls) {
      console.log(`✗ ${table}.${col}: NOT NULL but ${nulls}/${rows.length} seed rows are null`)
      problems += 1
    }
  }
}

console.log(problems ? `\n${problems} problem(s)` : '\n✓ seed snapshot matches schema.sql')
