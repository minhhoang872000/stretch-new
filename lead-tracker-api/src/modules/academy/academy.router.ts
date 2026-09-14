import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { HttpError, generateId } from '../../core/crud'
import { requireAuth } from '../../middleware/requireAuth'
import { optionalAuth } from '../../middleware/optionalAuth'
import { success, created } from '../../utils/response'
import {
  certificatesResource,
  enrolmentsResource,
  instructorsResource,
  learnersResource,
  programsResource,
  progressResource,
  reviewsResource,
  sessionsResource,
  videoIndexResource,
} from './academy.resources'

/**
 * The Academy API.
 *
 * Most of it is the generic CRUD engine over a column map. What lives here is
 * the part that is not: keeping a programme's derived counts honest, filling
 * the denormalised names so they cannot drift from the row they copy, and the
 * three reports the consoles open with.
 *
 * Reads are public where the public site needs them — the catalogue, one
 * programme, approved reviews — and admin-only everywhere else. Learner rows,
 * enrolments and progress are never public: they are personal data.
 */

const router = Router()

// ─── Helpers ─────────────────────────────────────────────────────────

/** "Giải phẫu ứng dụng" → "giai-phau-ung-dung". */
function slugify(input: string): string {
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Lesson and minute totals are a property of the syllabus, not something a
 * client should be trusted to send: a console that saves a module but forgets
 * to recount leaves the catalogue advertising the wrong length.
 */
function countSyllabus(modules: unknown): { lessons: number; minutes: number } {
  if (!Array.isArray(modules)) return { lessons: 0, minutes: 0 }
  let lessons = 0
  let minutes = 0
  for (const module of modules) {
    const items = Array.isArray((module as any)?.items) ? (module as any).items : []
    lessons += items.length
    for (const item of items) minutes += Number((item as any)?.minutes) || 0
  }
  return { lessons, minutes }
}

async function lookup(table: string, id: unknown): Promise<any | null> {
  if (!id) return null
  // `table` is a literal from this file, never request data.
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [String(id)])
  return result.rows[0] || null
}

// ─── Instructors, learners, certificates, sessions ───────────────────

const instructors = createCrudRouter(instructorsResource, { publicRead: true })
const learners = createCrudRouter(learnersResource)
const certificates = createCrudRouter(certificatesResource, {
  extend(sub, repo) {
    /**
     * Revoking keeps the record. A certificate that was issued and later
     * withdrawn is a different fact from one that never existed, and the person
     * verifying a code needs to be told which.
     */
    sub.post('/:id/revoke', requireAuth, async (req, res, next) => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        success(res, await repo.update(String(req.params.id), { status: 'revoked', revokedAt: today }))
      } catch (err) {
        next(err)
      }
    })

    /** Public: what a QR code on a printed certificate resolves to. */
    sub.get('/verify/:code', async (req, res, next) => {
      try {
        const result = await pool.query('SELECT * FROM certificates WHERE code = $1', [
          String(req.params.code),
        ])
        const row = result.rows[0]
        if (!row) {
          success(res, { valid: false, certificate: null })
          return
        }
        success(res, {
          valid: row.status === 'valid',
          certificate: {
            code: row.code,
            learnerName: row.learner_name,
            programTitle: row.program_title,
            issuedAt: row.issued_at,
            status: row.status,
          },
        })
      } catch (err) {
        next(err)
      }
    })
  },
})

const sessions = createCrudRouter(sessionsResource, {
  publicRead: true,
  async beforeWrite(body) {
    const program = await lookup('programs', body.programId)
    if (program) {
      body.programTitle = program.title
      body.kind ??= program.kind
      body.mode ??= program.mode
      body.instructorId ??= program.instructor_id
    }
    return body
  },
  extend(sub) {
    /** Who is marked present, with the names the register needs to print. */
    sub.get('/:id/attendees', requireAuth, async (req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT sa.learner_id, l.name, l.email, l.phone, sa.marked_at
             FROM session_attendees sa
             JOIN learners l ON l.id = sa.learner_id
            WHERE sa.session_id = $1
            ORDER BY l.name`,
          [String(req.params.id)],
        )
        success(res, {
          attendees: result.rows.map((row) => ({
            learnerId: row.learner_id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            markedAt: row.marked_at,
          })),
          attendeeIds: result.rows.map((row) => row.learner_id),
        })
      } catch (err) {
        next(err)
      }
    })

    /**
     * Toggle one person's attendance, and keep `booked` in step.
     *
     * Both writes in one transaction: a register that says twelve people came
     * while the seat count says eleven is a register nobody trusts, and that is
     * exactly what a half-applied toggle produces.
     */
    sub.post('/:id/attendance', requireAuth, async (req, res, next) => {
      const client = await pool.connect()
      try {
        const sessionId = String(req.params.id)
        const learnerId = String(req.body?.learnerId || '')
        if (!learnerId) throw new HttpError('learnerId là bắt buộc', 400, 'INVALID_BODY')

        await client.query('BEGIN')
        const existing = await client.query(
          'SELECT 1 FROM session_attendees WHERE session_id = $1 AND learner_id = $2',
          [sessionId, learnerId],
        )
        const present = !existing.rows.length

        if (present) {
          await client.query(
            'INSERT INTO session_attendees (session_id, learner_id) VALUES ($1, $2)',
            [sessionId, learnerId],
          )
        } else {
          await client.query(
            'DELETE FROM session_attendees WHERE session_id = $1 AND learner_id = $2',
            [sessionId, learnerId],
          )
        }

        const counted = await client.query(
          `UPDATE program_sessions ps
              SET booked = (SELECT COUNT(*) FROM session_attendees WHERE session_id = $1),
                  updated_at = NOW()
            WHERE ps.id = $1
            RETURNING booked, capacity`,
          [sessionId],
        )
        await client.query('COMMIT')

        const row = counted.rows[0]
        success(res, {
          learnerId,
          present,
          booked: row?.booked ?? 0,
          seatsLeft: row ? Math.max(0, row.capacity - row.booked) : 0,
        })
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {})
        next(err)
      } finally {
        client.release()
      }
    })
  },
})

// ─── Programmes ──────────────────────────────────────────────────────

const programs = createCrudRouter(programsResource, {
  publicRead: true,
  // The site sees the catalogue; a draft belongs to whoever is writing it.
  publicFilter: { status: 'published' },
  async beforeWrite(body) {
    if (body.title && !body.slug) body.slug = slugify(String(body.title))
    if (body.slug) body.slug = slugify(String(body.slug))
    if (body.modules !== undefined) {
      const counted = countSyllabus(body.modules)
      body.lessons = counted.lessons
      body.minutes = counted.minutes
    }
    // Publishing stamps the date once; re-publishing does not move it.
    if (body.status === 'published' && body.publishedAt === undefined) {
      body.publishedAt = new Date().toISOString().slice(0, 10)
    }
    return body
  },
  extend(sub, repo) {
    /**
     * The site addresses programmes by slug, never by id.
     *
     * This route sits outside the generic handlers, so it has to enforce the
     * draft rule itself — otherwise knowing a slug would be enough to read an
     * unpublished programme, which is exactly the hole `publicFilter` closes on
     * every other route.
     */
    sub.get('/slug/:slug', optionalAuth, async (req, res, next) => {
      try {
        const result = await pool.query('SELECT id, status FROM programs WHERE slug = $1', [
          String(req.params.slug),
        ])
        const row = result.rows[0]
        const visible = row && (row.status === 'published' || (req as any).admin)
        if (!visible) throw new HttpError('Chương trình không tồn tại', 404, 'NOT_FOUND')
        success(res, await repo.get(row.id))
      } catch (err) {
        next(err)
      }
    })

    /**
     * Duplicate as a draft. The copy takes a new id and slug and drops every
     * earned figure — enrolments, revenue and ratings belong to the programme
     * that earned them, and a copy that inherits them lies on the catalogue.
     */
    sub.post('/:id/duplicate', requireAuth, async (req, res, next) => {
      try {
        const source = (await repo.get(String(req.params.id))) as Record<string, unknown>
        const copy = {
          ...source,
          id: undefined,
          title: `${source.title} (bản sao)`,
          slug: `${source.slug}-copy-${Date.now().toString(36)}`,
          status: 'draft',
          publishedAt: null,
          enrolled: 0,
          revenue: 0,
          rating: 0,
          reviewCount: 0,
          createdAt: undefined,
          updatedAt: undefined,
        }
        created(res, await repo.create(copy))
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Enrolments ──────────────────────────────────────────────────────

const enrolments = createCrudRouter(enrolmentsResource, {
  async beforeWrite(body) {
    const learner = await lookup('learners', body.learnerId)
    if (learner) body.learnerName = learner.name
    const program = await lookup('programs', body.programId)
    if (program) {
      body.programTitle = program.title
      body.mode ??= program.mode
      body.lessons ??= program.lessons
    }
    return body
  },
  extend(sub, repo) {
    /**
     * The manual grant — the button that matters while there is no checkout:
     * money arrives by transfer, someone opens the learner and grants access.
     *
     * Re-granting a revoked enrolment revives the existing row rather than
     * failing on the unique constraint or creating a second one, because the
     * learner's progress is attached to it.
     */
    sub.post('/grant', requireAuth, async (req, res, next) => {
      try {
        const learnerId = String(req.body?.learnerId || '')
        const programId = String(req.body?.programId || '')
        if (!learnerId || !programId) {
          throw new HttpError('learnerId và programId là bắt buộc', 400, 'INVALID_BODY')
        }

        const existing = await pool.query(
          'SELECT id FROM enrolments WHERE learner_id = $1 AND program_id = $2',
          [learnerId, programId],
        )
        if (existing.rows.length) {
          success(res, await repo.update(existing.rows[0].id, { status: 'active', note: '' }))
          return
        }

        const learner = await lookup('learners', learnerId)
        const program = await lookup('programs', programId)
        if (!learner || !program) throw new HttpError('Học viên hoặc chương trình không tồn tại', 404, 'NOT_FOUND')

        created(
          res,
          await repo.create({
            learnerId,
            learnerName: learner.name,
            programId,
            programTitle: program.title,
            mode: program.mode,
            status: 'active',
            source: String(req.body?.source || 'manual'),
            lessons: program.lessons,
            startedAt: new Date().toISOString().slice(0, 10),
          }),
        )
      } catch (err) {
        next(err)
      }
    })

    /** Revoke, keeping the row so the history and the progress survive. */
    sub.post('/:id/revoke', requireAuth, async (req, res, next) => {
      try {
        success(
          res,
          await repo.update(String(req.params.id), {
            status: 'revoked',
            note: String(req.body?.reason || 'Thu hồi quyền học.'),
          }),
        )
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Reviews ─────────────────────────────────────────────────────────

const reviews = createCrudRouter(reviewsResource, {
  async beforeWrite(body) {
    const program = await lookup('programs', body.programId)
    if (program) body.programTitle = program.title
    const learner = await lookup('learners', body.learnerId)
    if (learner) body.learnerName = learner.name
    return body
  },
  extend(sub) {
    /**
     * Public: what a course page shows. Deliberately a separate route from the
     * admin list, so "approved only" is a property of the endpoint rather than
     * a query parameter a caller could forget.
     */
    sub.get('/public/:programId', async (req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT id, program_id, learner_name, rating, text, reply, created_at
             FROM program_reviews
            WHERE program_id = $1 AND status = 'approved'
            ORDER BY created_at DESC
            LIMIT 100`,
          [String(req.params.programId)],
        )
        success(res, {
          reviews: result.rows.map((row) => ({
            id: row.id,
            programId: row.program_id,
            learnerName: row.learner_name,
            rating: row.rating,
            text: row.text,
            reply: row.reply,
            createdAt: row.created_at,
          })),
        })
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Lesson progress ─────────────────────────────────────────────────

const progress = createCrudRouter(progressResource, {
  extend(sub) {
    /**
     * What the player calls as a lesson plays. Upsert, not insert: the same
     * learner watching the same lesson again is one row moving forward, and the
     * unique key is what enforces that rather than a read-then-write race.
     *
     * Recomputing the parent enrolment here — rather than on a nightly job —
     * is what keeps "62%" on the console the same number the learner sees.
     */
    sub.post('/track', requireAuth, async (req, res, next) => {
      try {
        const b = req.body || {}
        const learnerId = String(b.learnerId || '')
        const programId = String(b.programId || '')
        if (!learnerId || !programId) {
          throw new HttpError('learnerId và programId là bắt buộc', 400, 'INVALID_BODY')
        }

        const moduleIndex = Number(b.moduleIndex) || 0
        const itemIndex = Number(b.itemIndex) || 0
        const watched = Math.max(0, Math.round(Number(b.watchedSeconds) || 0))
        const duration = Math.max(0, Math.round(Number(b.durationSeconds) || 0))
        // 90% counts as watched — the same threshold the drop-off report uses.
        const completed = duration > 0 && watched / duration >= 0.9

        await pool.query(
          `INSERT INTO lesson_progress
             (id, learner_id, program_id, module_index, item_index, ordinal, lesson_title,
              watched_seconds, duration_seconds, completed_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
           ON CONFLICT (learner_id, program_id, module_index, item_index) DO UPDATE SET
             -- Never let a re-watch from the start erase the furthest point reached.
             watched_seconds  = GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
             duration_seconds = EXCLUDED.duration_seconds,
             ordinal          = COALESCE(EXCLUDED.ordinal, lesson_progress.ordinal),
             lesson_title     = COALESCE(NULLIF(EXCLUDED.lesson_title, ''), lesson_progress.lesson_title),
             completed_at     = COALESCE(lesson_progress.completed_at, EXCLUDED.completed_at),
             updated_at       = NOW()`,
          [
            generateId('lp'),
            learnerId,
            programId,
            moduleIndex,
            itemIndex,
            b.ordinal === undefined || b.ordinal === null ? null : Number(b.ordinal),
            String(b.lessonTitle || ''),
            watched,
            duration,
            completed ? new Date().toISOString() : null,
          ],
        )

        const rolled = await pool.query(
          `UPDATE enrolments e SET
             lessons_done = sub.done,
             percent = CASE WHEN e.lessons > 0
                            THEN LEAST(100, ROUND(100.0 * sub.done / e.lessons))
                            ELSE 0 END,
             last_lesson_at = NOW(),
             updated_at = NOW()
           FROM (SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS done
                   FROM lesson_progress
                  WHERE learner_id = $1 AND program_id = $2) sub
           WHERE e.learner_id = $1 AND e.program_id = $2
           RETURNING e.percent, e.lessons_done, e.lessons`,
          [learnerId, programId],
        )

        success(res, {
          tracked: true,
          completed,
          enrolment: rolled.rows[0]
            ? {
                percent: Number(rolled.rows[0].percent),
                lessonsDone: Number(rolled.rows[0].lessons_done),
                lessons: Number(rolled.rows[0].lessons),
              }
            : null,
        })
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Video slots ─────────────────────────────────────────────────────

const videoIndex = createCrudRouter(videoIndexResource, {
  async beforeWrite(body) {
    const program = await lookup('programs', body.programId)
    if (program) body.programTitle = program.title
    // A slot is ready when it actually points at something playable. Letting a
    // client set `status` directly is how a course ends up claiming a video it
    // does not have.
    if (body.provider !== undefined || body.youtubeId !== undefined || body.videoId !== undefined) {
      const hasSource = body.provider === 'r2' ? !!body.videoId : !!body.youtubeId
      body.status = hasSource ? 'ready' : 'missing'
    }
    return body
  },
  extend(sub) {
    /** The console's working list: every lesson still without a source. */
    sub.get('/missing', requireAuth, async (_req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT program_id, program_title, COUNT(*)::int AS missing
             FROM lesson_video_index
            WHERE status = 'missing'
            GROUP BY program_id, program_title
            ORDER BY missing DESC`,
        )
        success(res, {
          byProgram: result.rows.map((row) => ({
            programId: row.program_id,
            programTitle: row.program_title,
            missing: row.missing,
          })),
          total: result.rows.reduce((sum, row) => sum + row.missing, 0),
        })
      } catch (err) {
        next(err)
      }
    })
  },
})

// ─── Reports ─────────────────────────────────────────────────────────

const insights = Router()

/**
 * Where each lesson loses people.
 *
 * Two questions per lesson: how many started it, and of those, how many stopped
 * before the 90% mark and never came back. The median stop second is what says
 * WHERE it loses them — a drop at 0:40 is an intro problem; a drop at 11:00 of
 * a 12-minute lesson is people skipping the outro, which is not a problem.
 */
insights.get('/drop-off', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT lp.program_id,
              p.title AS program_title,
              lp.module_index,
              lp.item_index,
              -- The module's name comes out of the syllabus document rather than
              -- being copied onto every progress row: renaming a module should
              -- change the report, not leave it describing the old outline.
              p.modules -> lp.module_index ->> 'title' AS module_title,
              MAX(lp.lesson_title) AS lesson_title,
              COUNT(*)::int AS starts,
              COUNT(*) FILTER (
                WHERE lp.completed_at IS NULL
                  AND lp.duration_seconds > 0
                  AND lp.watched_seconds::numeric / lp.duration_seconds < 0.9
              )::int AS dropped,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lp.watched_seconds), 0)::int
                AS median_stop_second,
              MAX(lp.duration_seconds)::int AS duration_seconds
         FROM lesson_progress lp
         JOIN programs p ON p.id = lp.program_id
        WHERE ($1::text IS NULL OR lp.program_id = $1)
        GROUP BY lp.program_id, p.title, lp.module_index, lp.item_index, p.modules
       HAVING COUNT(*) > 0`,
      [req.query.programId ? String(req.query.programId) : null],
    )

    const rows = result.rows
      .map((row) => ({
        programId: row.program_id,
        programTitle: row.program_title,
        moduleIndex: row.module_index,
        itemIndex: row.item_index,
        moduleTitle: row.module_title || '',
        lessonTitle: row.lesson_title,
        starts: row.starts,
        dropped: row.dropped,
        dropRate: row.starts ? Math.round((row.dropped / row.starts) * 100) : 0,
        medianStopSecond: row.median_stop_second,
        durationSeconds: row.duration_seconds,
      }))
      .filter((row) => row.dropped > 0)
      // Rank by how many people it costs, not by rate alone: a 100% drop on a
      // lesson two people opened is not the lesson to fix first.
      .sort((a, b) => b.dropRate * b.starts - a.dropRate * a.starts)

    success(res, { dropOff: rows })
  } catch (err) {
    next(err)
  }
})

/**
 * How a cohort thins out across a course.
 *
 * A different question from `/drop-off`, which asks "which single lesson loses
 * people". This one asks "how much of the class is still with us by lesson N" —
 * the curve you read to see whether a course bleeds steadily or falls off a
 * cliff, and the two consoles ask each of them separately.
 *
 * A lesson nobody has opened has no progress rows, so it is absent from the
 * curve rather than plotted at zero: "nobody got here" and "we have no data"
 * look identical on a chart and are not the same fact.
 */
insights.get('/retention', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `WITH enrolled AS (
         SELECT program_id, COUNT(*)::int AS total
           FROM enrolments WHERE status <> 'revoked'
          GROUP BY program_id
       ),
       done AS (
         SELECT program_id, module_index, item_index,
                COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int AS finished
           FROM lesson_progress
          GROUP BY program_id, module_index, item_index
       )
       SELECT p.id AS program_id, p.title AS program_title, e.total,
              d.finished,
              ROW_NUMBER() OVER (
                PARTITION BY p.id ORDER BY d.module_index, d.item_index
              )::int AS lesson_no
         FROM programs p
         JOIN enrolled e ON e.program_id = p.id
         JOIN done d     ON d.program_id = p.id
        WHERE ($1::text IS NULL OR p.id = $1)
        ORDER BY p.id, d.module_index, d.item_index`,
      [req.query.programId ? String(req.query.programId) : null],
    )

    const byProgram = new Map<string, { programId: string; programTitle: string; points: { lesson: number; retained: number }[] }>()
    for (const row of result.rows) {
      let entry = byProgram.get(row.program_id)
      if (!entry) {
        entry = { programId: row.program_id, programTitle: row.program_title, points: [] }
        byProgram.set(row.program_id, entry)
      }
      entry.points.push({
        lesson: row.lesson_no,
        retained: row.total ? Math.round((row.finished / row.total) * 100) : 0,
      })
    }

    const retention = [...byProgram.values()]
      .filter((row) => row.points.length > 1)
      .map((row) => {
        // The steepest single fall, which is the lesson worth opening first.
        let worstLesson = row.points[0]!.lesson
        let worstDrop = 0
        for (let i = 1; i < row.points.length; i += 1) {
          const drop = row.points[i - 1]!.retained - row.points[i]!.retained
          if (drop > worstDrop) {
            worstDrop = drop
            worstLesson = row.points[i]!.lesson
          }
        }
        return {
          ...row,
          worstLesson,
          worstDrop,
          completion: row.points[row.points.length - 1]!.retained,
        }
      })
      .sort((a, b) => a.completion - b.completion)

    success(res, { retention })
  } catch (err) {
    next(err)
  }
})

/** The questions learners get wrong — a syllabus problem, not a learner one. */
insights.get('/quiz-misses', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT qa.program_id,
              p.title AS program_title,
              qa.module_index,
              qa.item_index,
              p.modules -> qa.module_index -> 'items' -> qa.item_index ->> 'title' AS lesson_title,
              qa.question,
              COUNT(*)::int AS attempts,
              ROUND(100.0 * COUNT(*) FILTER (WHERE NOT qa.correct) / COUNT(*))::int AS miss_rate
         FROM quiz_attempts qa
         JOIN programs p ON p.id = qa.program_id
        WHERE ($1::text IS NULL OR qa.program_id = $1)
        GROUP BY qa.program_id, p.title, p.modules, qa.module_index, qa.item_index, qa.question
        ORDER BY miss_rate DESC, attempts DESC
        LIMIT 50`,
      [req.query.programId ? String(req.query.programId) : null],
    )

    success(res, {
      quizMisses: result.rows.map((row) => ({
        // Stable enough to key a list on: the same question in the same slot.
        questionId: `${row.program_id}-${row.module_index}-${row.item_index}`,
        programId: row.program_id,
        programTitle: row.program_title,
        moduleIndex: row.module_index,
        itemIndex: row.item_index,
        lessonTitle: row.lesson_title || '',
        question: row.question,
        attempts: row.attempts,
        missRate: row.miss_rate,
      })),
    })
  } catch (err) {
    next(err)
  }
})

/** The figures both consoles open on. One round trip, not eight. */
insights.get('/dashboard', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [active, weekly, byProgram, upcoming, pending, certs] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT learner_id)::int AS n FROM enrolments WHERE status = 'active'`,
      ),
      pool.query(
        `SELECT to_char(date_trunc('week', created_at), 'DD/MM') AS week, COUNT(*)::int AS count
           FROM enrolments
          WHERE created_at > NOW() - INTERVAL '8 weeks'
          GROUP BY date_trunc('week', created_at)
          ORDER BY date_trunc('week', created_at)`,
      ),
      pool.query(
        `SELECT p.id AS program_id, p.title,
                COALESCE(ROUND(AVG(e.percent)), 0)::int AS percent,
                COUNT(e.id)::int AS learners
           FROM programs p
           LEFT JOIN enrolments e ON e.program_id = p.id AND e.status <> 'revoked'
          WHERE p.status = 'published'
          GROUP BY p.id, p.title
         HAVING COUNT(e.id) > 0
          ORDER BY percent DESC`,
      ),
      pool.query(
        `SELECT id, program_id, program_title, date, time, location, capacity, booked
           FROM program_sessions
          WHERE date >= CURRENT_DATE
          ORDER BY date ASC
          LIMIT 5`,
      ),
      pool.query(`SELECT COUNT(*)::int AS n FROM program_reviews WHERE status = 'pending'`),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM certificates
          WHERE issued_at >= date_trunc('month', CURRENT_DATE)`,
      ),
    ])

    success(res, {
      activeLearners: active.rows[0].n,
      newEnrolmentsThisWeek: weekly.rows.length ? weekly.rows[weekly.rows.length - 1].count : 0,
      enrolmentsByWeek: weekly.rows,
      avgProgressByProgram: byProgram.rows.map((row) => ({
        programId: row.program_id,
        title: row.title,
        percent: row.percent,
        learners: row.learners,
      })),
      upcomingSessions: upcoming.rows.map((row) => ({
        id: row.id,
        programId: row.program_id,
        programTitle: row.program_title,
        date: row.date,
        time: row.time,
        location: row.location,
        capacity: row.capacity,
        booked: row.booked,
        seatsLeft: Math.max(0, row.capacity - row.booked),
      })),
      pendingReviews: pending.rows[0].n,
      certificatesThisMonth: certs.rows[0].n,
    })
  } catch (err) {
    next(err)
  }
})

// ─── Mount ───────────────────────────────────────────────────────────

router.use('/programs', programs.router)
router.use('/instructors', instructors.router)
router.use('/learners', learners.router)
router.use('/enrolments', enrolments.router)
router.use('/program-sessions', sessions.router)
router.use('/certificates', certificates.router)
router.use('/reviews', reviews.router)
router.use('/lesson-progress', progress.router)
router.use('/lesson-video-index', videoIndex.router)
router.use('/academy-insights', insights)

export default router
