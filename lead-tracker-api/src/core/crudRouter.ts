import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { optionalAuth } from '../middleware/optionalAuth'
import { success, created, error } from '../utils/response'
import { createRepository, HttpError, type Repository, type Resource, type ListQuery } from './crud'

/**
 * The HTTP half of the CRUD engine — six routes over one `Resource`.
 *
 *   GET    /            list, filtered/sorted/paged
 *   GET    /:id         one row
 *   POST   /            create
 *   PATCH  /            bulk: { ids: [], patch: {} }
 *   PATCH  /:id         partial update
 *   DELETE /:id         delete
 *
 * The bulk PATCH is declared before `/:id` on purpose: Express matches in
 * registration order, and `/` and `/:id` are different paths, but keeping the
 * pair adjacent and ordered is what stops a later edit from inverting them.
 *
 * A list answers `{ <name>: rows, total, page, limit }` rather than a bare
 * array. The console pages every table, and a total that arrives separately
 * from the rows is a total that eventually disagrees with them.
 */

export interface CrudRouterOptions<T> {
  /** Allow unauthenticated GETs — for what the public site reads. */
  publicRead?: boolean
  /**
   * Forced filter for anonymous readers, e.g. `{ status: 'published' }`.
   *
   * Without it, `publicRead` publishes drafts: a catalogue endpoint that is
   * open to the site returns every row in the table, including the programme
   * someone is halfway through writing. An authenticated console request is
   * unaffected and still sees everything.
   */
  publicFilter?: Record<string, string>
  /** Extra routes, mounted before the generic ones so they win on conflicts. */
  extend?: (router: Router, repo: Repository<T>) => void
  /**
   * Last chance to reject or reshape a create/update body. Async because the
   * useful cases need the database: filling a denormalised `programTitle` from
   * the programme it points at, or recomputing a lesson count from a syllabus.
   */
  beforeWrite?: (
    body: Record<string, unknown>,
    req: Request,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export function createCrudRouter<T = Record<string, unknown>>(
  resource: Resource,
  options: CrudRouterOptions<T> = {},
): { router: Router; repo: Repository<T> } {
  const repo = createRepository<T>(resource)
  const router = Router()
  // A public resource still decodes the token when one is sent, so the same
  // route can widen for an authenticated console.
  const guard = options.publicRead ? [optionalAuth] : [requireAuth]
  const prepare = options.beforeWrite || ((body: Record<string, unknown>) => body)
  const publicFilter = options.publicFilter

  const isAdmin = (req: Request) => !!(req as any).admin

  options.extend?.(router, repo)

  /** Narrow the raw query string to the keys this resource actually accepts. */
  function listQuery(req: Request): ListQuery {
    const query: ListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort ? String(req.query.sort) : undefined,
      q: req.query.q ? String(req.query.q) : undefined,
    }
    for (const key of resource.filters || []) {
      if (req.query[key] !== undefined) query[key] = String(req.query[key])
    }
    // Applied last so a caller cannot widen it back with a query parameter.
    if (publicFilter && !isAdmin(req)) Object.assign(query, publicFilter)
    return query
  }

  router.get('/', ...guard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await repo.list(listQuery(req))
      success(res, {
        [resource.name]: result.rows,
        total: result.total,
        page: result.page,
        limit: result.limit,
      })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await repo.create(await prepare(req.body || {}, req)))
    } catch (err) {
      next(err)
    }
  })

  router.patch('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : []
      if (!ids.length) {
        error(res, 'ids[] là bắt buộc', 400, 'INVALID_BODY')
        return
      }
      const changed = await repo.updateMany(ids, await prepare(req.body?.patch || {}, req))
      success(res, { changed })
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', ...guard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = (await repo.get(String(req.params.id))) as Record<string, unknown>
      // A draft must not be readable by guessing its id either — 404, not 403,
      // so the endpoint does not confirm that the row exists.
      if (publicFilter && !isAdmin(req)) {
        for (const [key, value] of Object.entries(publicFilter)) {
          if (String(row[key]) !== value) {
            throw new HttpError(`${resource.name} không tồn tại`, 404, 'NOT_FOUND')
          }
        }
      }
      success(res, row)
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      success(res, await repo.update(String(req.params.id), await prepare(req.body || {}, req)))
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.remove(String(req.params.id))
      success(res, { deleted: true })
    } catch (err) {
      next(err)
    }
  })

  return { router, repo }
}
