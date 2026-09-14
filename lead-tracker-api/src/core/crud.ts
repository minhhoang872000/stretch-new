import { pool } from '../config/db'

/**
 * A small CRUD engine, shared by the resources that are genuinely just tables.
 *
 * Roughly twenty of the console's collections are the same five operations over
 * a different column list — coupons, FAQs, pages, translations, instructors,
 * learners and so on. Hand-writing a repository/service/controller trio for each
 * would be two thousand lines that differ only in their string literals, and
 * every one of them a place for a filter or a NULL to be handled slightly
 * differently. So the shape is declared once per resource and the behaviour
 * lives here.
 *
 * What this is NOT for: anything with a rule. Programmes own nested modules,
 * enrolments recompute progress, orders move money. Those keep their own
 * modules and reach for this only where it fits.
 *
 * Safety note: every identifier this builds SQL from — table, column, sort key —
 * comes from a `Resource` literal written in this repo, never from a request.
 * Request data only ever arrives as a bound parameter.
 */

export type FieldType = 'text' | 'int' | 'number' | 'bool' | 'json' | 'date' | 'timestamp'

export interface Field {
  /** Column name. Defaults to snake_case of the field key. */
  column?: string
  type?: FieldType
  /** Rejected with 422 when absent on create. */
  required?: boolean
  /** Accepted on create, ignored on update — ids, created_at, and friends. */
  readOnly?: boolean
  /**
   * A raw SQL expression selected under this field's column name instead of a
   * stored column, and never written. For values that must not go stale between
   * writes — a session is "today" only for a day, and no trigger will notice
   * midnight. The expression is a literal in this repo, never request data.
   */
  computed?: string
  /** Applied on create when the caller omits the field. */
  fallback?: unknown
}

export interface Resource {
  /** Plural, used in error messages: "coupon not found". */
  name: string
  table: string
  /** Prefix for generated ids, e.g. `cpn` → `cpn-m4x2k1-8fa2`. */
  idPrefix: string
  fields: Record<string, Field>
  /** ORDER BY fragment (raw SQL) used when the caller does not ask for one. */
  defaultOrder: string
  /** Field keys that `?q=` searches with ILIKE. */
  search?: string[]
  /** Field keys accepted as exact-match query filters, e.g. `?status=active`. */
  filters?: string[]
  /** Field keys accepted in `?sort=`. `-field` sorts descending. */
  sortable?: string[]
}

export interface ListQuery {
  page?: number
  limit?: number
  sort?: string
  q?: string
  /** Exact-match filters, already narrowed to `resource.filters`. */
  [key: string]: unknown
}

export interface ListResult<T> {
  rows: T[]
  total: number
  page: number
  limit: number
}

export class HttpError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 500, code = 'ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

const MAX_LIMIT = 500

/** `lessonOrdinal` → `lesson_ordinal`. */
export function snake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

/**
 * Double-quote an identifier. Not defence against injection — these strings are
 * repo literals — but against SQL's reserved words: the console has columns
 * called `from`, `to`, `group`, `user` and `open`, and unquoted they are syntax
 * errors rather than columns. Quoting everything means no one has to remember
 * which names are safe.
 */
function quote(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

function columnOf(resource: Resource, key: string): string {
  const field = resource.fields[key]
  if (!field) throw new HttpError(`Unknown field "${key}"`, 400, 'UNKNOWN_FIELD')
  return quote(field.column || snake(key))
}

/** `2026-08-21T00:00:00.000Z` from a DATE column is a day, not an instant. */
function isoDate(value: Date): string {
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** DB row (snake_case) → API object (camelCase), one field at a time. */
export function toApi<T = Record<string, unknown>>(resource: Resource, row: any): T {
  const out: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(resource.fields)) {
    const value = row[field.column || snake(key)]
    if (value === undefined) continue
    if (value instanceof Date) {
      out[key] = field.type === 'date' ? isoDate(value) : value.toISOString()
    } else if (field.type === 'int' || field.type === 'number') {
      // BIGINT and NUMERIC come back as strings from pg; the console wants numbers.
      out[key] = value === null ? null : Number(value)
    } else {
      out[key] = value
    }
  }
  return out as T
}

/** API value → parameter for pg, with the coercions Postgres will not do itself. */
function toDb(field: Field, value: unknown): unknown {
  if (value === null || value === undefined) return null
  switch (field.type) {
    case 'json':
      // pg serialises objects for JSONB, but an array has to be told apart from
      // a Postgres array literal — stringify both and there is no ambiguity.
      return JSON.stringify(value)
    case 'int':
      return Math.round(Number(value))
    case 'number':
      return Number(value)
    case 'bool':
      return value === true || value === 'true' || value === 1 || value === '1'
    default:
      return value
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Builds the WHERE clause shared by `list` and `count`, so a filtered count can
 * never disagree with the page it describes.
 */
function buildWhere(
  resource: Resource,
  query: ListQuery,
): { sql: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  for (const key of resource.filters || []) {
    const raw = query[key]
    if (raw === undefined || raw === '' || raw === 'all') continue
    const field = resource.fields[key]
    if (!field) continue

    // `?status=active,idle` means either — the console's multi-select filters.
    const values = String(raw).split(',').filter(Boolean)
    if (!values.length) continue

    if (values.length === 1) {
      params.push(toDb(field, values[0]))
      clauses.push(`${columnOf(resource, key)} = $${params.length}`)
    } else {
      const placeholders = values.map((value) => {
        params.push(toDb(field, value))
        return `$${params.length}`
      })
      clauses.push(`${columnOf(resource, key)} IN (${placeholders.join(', ')})`)
    }
  }

  if (query.q && resource.search?.length) {
    params.push(`%${String(query.q).trim()}%`)
    const index = params.length
    const ors = resource.search.map((key) => `${columnOf(resource, key)} ILIKE $${index}`)
    clauses.push(`(${ors.join(' OR ')})`)
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

function buildOrder(resource: Resource, sort?: string): string {
  if (!sort) return resource.defaultOrder
  const descending = sort.startsWith('-')
  const key = descending ? sort.slice(1) : sort
  if (!resource.sortable?.includes(key)) return resource.defaultOrder
  return `${columnOf(resource, key)} ${descending ? 'DESC' : 'ASC'} NULLS LAST`
}

export function createRepository<T = Record<string, unknown>>(resource: Resource) {
  const keys = Object.keys(resource.fields)

  // `*` plus one aliased expression per computed field. Computed fields must not
  // also exist as columns, or the row would carry the name twice.
  const selectList = [
    '*',
    ...Object.entries(resource.fields)
      .filter(([, field]) => field.computed)
      .map(([key, field]) => `${field.computed} AS ${quote(field.column || snake(key))}`),
  ].join(', ')

  return {
    resource,

    async list(query: ListQuery = {}): Promise<ListResult<T>> {
      const { sql: where, params } = buildWhere(resource, query)
      const limit = Math.min(Math.max(1, Number(query.limit) || 100), MAX_LIMIT)
      const page = Math.max(1, Number(query.page) || 1)

      const counted = await pool.query(
        `SELECT COUNT(*)::int AS total FROM ${quote(resource.table)} ${where}`,
        params,
      )

      const rows = await pool.query(
        `SELECT ${selectList} FROM ${quote(resource.table)} ${where}
         ORDER BY ${buildOrder(resource, query.sort)}
         LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
        params,
      )

      return {
        rows: rows.rows.map((row) => toApi<T>(resource, row)),
        total: counted.rows[0].total,
        page,
        limit,
      }
    },

    async get(id: string): Promise<T> {
      const result = await pool.query(`SELECT ${selectList} FROM ${quote(resource.table)} WHERE id = $1`, [id])
      if (!result.rows.length) {
        throw new HttpError(`${resource.name} không tồn tại`, 404, 'NOT_FOUND')
      }
      return toApi<T>(resource, result.rows[0])
    },

    /** Null instead of throwing — for callers that treat "missing" as a value. */
    async find(id: string): Promise<T | null> {
      const result = await pool.query(`SELECT ${selectList} FROM ${quote(resource.table)} WHERE id = $1`, [id])
      return result.rows.length ? toApi<T>(resource, result.rows[0]) : null
    },

    async create(body: Record<string, unknown>): Promise<T> {
      const columns: string[] = []
      const values: unknown[] = []

      for (const key of keys) {
        const field = resource.fields[key]!
        if (field.computed) continue
        let value = body[key]
        if (value === undefined) value = field.fallback
        if (value === undefined) {
          if (field.required) {
            throw new HttpError(`Thiếu trường bắt buộc "${key}"`, 422, 'VALIDATION_ERROR')
          }
          continue
        }
        columns.push(quote(field.column || snake(key)))
        values.push(toDb(field, value))
      }

      if (!columns.includes(quote('id'))) {
        columns.unshift(quote('id'))
        values.unshift(generateId(resource.idPrefix))
      }

      const placeholders = values.map((_, i) => `$${i + 1}`)
      const result = await pool.query(
        `INSERT INTO ${quote(resource.table)} (${columns.join(', ')})
         VALUES (${placeholders.join(', ')})
         RETURNING ${selectList}`,
        values,
      )
      return toApi<T>(resource, result.rows[0])
    },

    /** PATCH semantics: only the keys present in `body` are touched. */
    async update(id: string, body: Record<string, unknown>): Promise<T> {
      const sets: string[] = []
      const values: unknown[] = [id]

      for (const key of keys) {
        const field = resource.fields[key]!
        if (key === 'id' || field.readOnly || field.computed) continue
        if (!(key in body)) continue
        values.push(toDb(field, body[key]))
        sets.push(`${quote(field.column || snake(key))} = $${values.length}`)
      }

      if (!sets.length) return this.get(id)

      if (resource.fields.updatedAt) {
        sets.push(`${columnOf(resource, 'updatedAt')} = NOW()`)
      }

      const result = await pool.query(
        `UPDATE ${quote(resource.table)} SET ${sets.join(", ")} WHERE id = $1 RETURNING ${selectList}`,
        values,
      )
      if (!result.rows.length) {
        throw new HttpError(`${resource.name} không tồn tại`, 404, 'NOT_FOUND')
      }
      return toApi<T>(resource, result.rows[0])
    },

    /** The console's bulk actions: one status change across a selection. */
    async updateMany(ids: string[], body: Record<string, unknown>): Promise<number> {
      let changed = 0
      for (const id of ids) {
        try {
          await this.update(id, body)
          changed += 1
        } catch (err) {
          // A row deleted between the selection and the save is not a failure of
          // the bulk action — the rest still applies.
          if (!(err instanceof HttpError) || err.statusCode !== 404) throw err
        }
      }
      return changed
    },

    async remove(id: string): Promise<void> {
      const result = await pool.query(`DELETE FROM ${quote(resource.table)} WHERE id = $1`, [id])
      if (!result.rowCount) {
        throw new HttpError(`${resource.name} không tồn tại`, 404, 'NOT_FOUND')
      }
    },
  }
}

export type Repository<T = Record<string, unknown>> = ReturnType<typeof createRepository<T>>
