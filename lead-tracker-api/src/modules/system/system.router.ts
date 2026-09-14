import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { HttpError, generateId, type Resource } from '../../core/crud'
import { requireAuth } from '../../middleware/requireAuth'
import { success, created } from '../../utils/response'
import countsRouter from './counts.router'

/**
 * System — the operator roster, the audit trail, and settings.
 *
 * `app_users` is a roster, not a credential store. The API still authenticates
 * against the single `ADMIN_EMAIL` / `ADMIN_PASSWORD` pair; a row here grants
 * nothing on its own. That distinction is worth keeping explicit, because a
 * table called `users` in an admin console reads like it controls access, and
 * this one does not.
 */

const usersResource: Resource = {
  name: 'users',
  table: 'app_users',
  idPrefix: 'usr',
  defaultOrder: 'name ASC',
  search: ['name', 'email'],
  filters: ['role', 'status', 'studio'],
  sortable: ['name', 'role', 'lastLoginAt', 'createdAt'],
  fields: {
    id: { readOnly: true },
    name: { required: true },
    email: { required: true },
    role: { fallback: 'staff' },
    status: { fallback: 'active' },
    twoFactor: { type: 'bool', fallback: false },
    studio: { fallback: '' },
    lastLoginAt: { type: 'timestamp' },
    createdAt: { type: 'timestamp', readOnly: true },
    updatedAt: { type: 'timestamp', readOnly: true },
  },
}

const users = createCrudRouter(usersResource, {
  beforeWrite(body) {
    if (body.email) body.email = String(body.email).trim().toLowerCase()
    return body
  },
})

// ─── Audit log ───────────────────────────────────────────────────────

/**
 * Append-only by construction: this router exposes a list and an append, and
 * no update or delete. An audit trail that can be edited is not one, so the
 * omission is the feature.
 */
const audit = Router()

audit.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 100), 500)
    const page = Math.max(1, Number(req.query.page) || 1)
    const area = req.query.area ? String(req.query.area) : null
    const q = req.query.q ? `%${String(req.query.q)}%` : null

    const where = `WHERE ($1::text IS NULL OR area = $1)
                     AND ($2::text IS NULL OR "user" ILIKE $2 OR detail ILIKE $2 OR action ILIKE $2)`

    const [rows, total] = await Promise.all([
      pool.query(
        `SELECT * FROM audit_log ${where} ORDER BY at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
        [area, q],
      ),
      pool.query(`SELECT COUNT(*)::int AS n FROM audit_log ${where}`, [area, q]),
    ])

    success(res, {
      auditLog: rows.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        user: row.user,
        action: row.action,
        area: row.area,
        detail: row.detail,
        ip: row.ip,
        at: row.at,
      })),
      total: total.rows[0].n,
      page,
      limit,
    })
  } catch (err) {
    next(err)
  }
})

audit.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = req.body || {}
    if (!b.action) throw new HttpError('action là bắt buộc', 400, 'INVALID_BODY')

    const admin = (req as any).admin
    const result = await pool.query(
      `INSERT INTO audit_log (id, user_id, "user", action, area, detail, ip, at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, NOW()) RETURNING *`,
      [
        generateId('aud'),
        b.userId ? String(b.userId) : admin?.id || null,
        String(b.user || admin?.name || admin?.email || ''),
        String(b.action),
        String(b.area || ''),
        String(b.detail || ''),
        // The proxy header, not the socket: Render puts the real client behind one.
        String(req.ip || ''),
      ],
    )
    const row = result.rows[0]
    created(res, { id: row.id, action: row.action, at: row.at })
  } catch (err) {
    next(err)
  }
})

// ─── Settings ────────────────────────────────────────────────────────

/**
 * A document per section, saved a section at a time — the unit the console's
 * Settings screen edits, and therefore the unit that has to stay consistent.
 * A key-value row per field would let half a section save.
 */
const settings = Router()

settings.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT section, value FROM app_settings')
    const out: Record<string, unknown> = {}
    for (const row of result.rows) out[row.section] = row.value
    success(res, { settings: out })
  } catch (err) {
    next(err)
  }
})

settings.get('/:section', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT value FROM app_settings WHERE section = $1', [
      String(req.params.section),
    ])
    success(res, { section: req.params.section, value: result.rows[0]?.value ?? {} })
  } catch (err) {
    next(err)
  }
})

settings.patch('/:section', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = String(req.params.section)
    const patch = req.body && typeof req.body === 'object' ? req.body : {}

    // `||` merges at the top level only, which is what a section edit means:
    // the form sends the fields it owns, and the ones it does not send survive.
    const result = await pool.query(
      `INSERT INTO app_settings (section, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (section) DO UPDATE
         SET value = app_settings.value || EXCLUDED.value, updated_at = NOW()
       RETURNING section, value`,
      [section, JSON.stringify(patch)],
    )
    success(res, { section, value: result.rows[0].value })
  } catch (err) {
    next(err)
  }
})

const router = Router()
router.use('/users', users.router)
router.use('/audit-log', audit)
router.use('/settings', settings)
router.use('/console-counts', countsRouter)

export default router
