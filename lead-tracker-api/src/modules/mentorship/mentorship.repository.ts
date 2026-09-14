import { pool } from '../../config/db'
import type { CreateMentorshipInput } from './mentorship.schema'

export type MentorshipStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

/** Statuses that hold a slot. Declined/cancelled release it. */
export const BLOCKING_STATUSES: MentorshipStatus[] = ['pending', 'accepted', 'completed']

export interface MentorshipSession {
  id: string
  programSlug: string | null
  lessonKey: string | null
  lessonTitle: string | null
  learnerName: string
  learnerEmail: string
  learnerAvatar: string | null
  topic: string | null
  date: string
  time: string
  durationMinutes: number
  status: MentorshipStatus
  googleEventId: string | null
  googleHtmlLink: string | null
  meetUrl: string | null
  declineReason: string | null
  createdAt: string
  updatedAt: string
}

export interface MentorshipHour {
  weekday: number
  startTime: string
  endTime: string
  active: boolean
}

export interface MentorshipFilter {
  status?: MentorshipStatus
  from?: string
  to?: string
  learnerEmail?: string
}

/** Postgres unique-violation — the slot was taken between the check and the insert. */
export const PG_UNIQUE_VIOLATION = '23505'

function mapRow(r: any): MentorshipSession {
  return {
    id: r.id,
    programSlug: r.program_slug,
    lessonKey: r.lesson_key,
    lessonTitle: r.lesson_title,
    learnerName: r.learner_name,
    learnerEmail: r.learner_email,
    learnerAvatar: r.learner_avatar,
    topic: r.topic,
    date: r.date,
    time: r.time,
    durationMinutes: r.duration_minutes,
    status: r.status,
    googleEventId: r.google_event_id,
    googleHtmlLink: r.google_html_link,
    meetUrl: r.meet_url,
    declineReason: r.decline_reason,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }
}

function mapHour(r: any): MentorshipHour {
  return {
    weekday: Number(r.weekday),
    startTime: r.start_time,
    endTime: r.end_time,
    active: Boolean(r.active),
  }
}

export const mentorshipRepository = {
  // ─── Opening hours ───────────────────────────────────────────────

  async getHours(): Promise<MentorshipHour[]> {
    const result = await pool.query('SELECT * FROM mentorship_hours ORDER BY weekday ASC')
    return result.rows.map(mapHour)
  },

  /**
   * Replaces the whole week in one transaction. The console always sends all
   * seven rows, so a partial write would silently drop a day.
   */
  async replaceHours(hours: MentorshipHour[]): Promise<MentorshipHour[]> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const h of hours) {
        await client.query(
          `INSERT INTO mentorship_hours (weekday, start_time, end_time, active, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (weekday) DO UPDATE
             SET start_time = EXCLUDED.start_time,
                 end_time   = EXCLUDED.end_time,
                 active     = EXCLUDED.active,
                 updated_at = NOW()`,
          [h.weekday, h.startTime, h.endTime, h.active]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
    return this.getHours()
  },

  // ─── Sessions ────────────────────────────────────────────────────

  async create(
    data: CreateMentorshipInput,
    durationMinutes: number
  ): Promise<MentorshipSession> {
    const id = `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

    await pool.query(
      `INSERT INTO mentorship_sessions
         (id, program_slug, lesson_key, lesson_title, learner_name, learner_email,
          learner_avatar, topic, date, time, duration_minutes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')`,
      [
        id,
        data.program_slug || null,
        data.lesson_key || null,
        data.lesson_title || null,
        data.learner_name,
        data.learner_email.toLowerCase().trim(),
        data.learner_avatar || null,
        data.topic || null,
        data.date,
        data.time,
        durationMinutes,
      ]
    )

    const row = await this.getById(id)
    if (!row) throw new Error('Session vanished immediately after insert')
    return row
  },

  async list(filter?: MentorshipFilter): Promise<MentorshipSession[]> {
    let sql = 'SELECT * FROM mentorship_sessions WHERE 1=1'
    const params: any[] = []
    let i = 1

    if (filter?.status) {
      sql += ` AND status = $${i++}`
      params.push(filter.status)
    }
    if (filter?.from) {
      sql += ` AND date >= $${i++}`
      params.push(filter.from)
    }
    if (filter?.to) {
      sql += ` AND date <= $${i++}`
      params.push(filter.to)
    }
    if (filter?.learnerEmail) {
      sql += ` AND learner_email = $${i++}`
      params.push(filter.learnerEmail.toLowerCase().trim())
    }

    // Pending first — that is the queue an admin is here to clear — then by when
    // the session actually happens.
    sql += `
      ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
               date ASC, time ASC`

    const result = await pool.query(sql, params)
    return result.rows.map(mapRow)
  },

  async getById(id: string): Promise<MentorshipSession | null> {
    const result = await pool.query('SELECT * FROM mentorship_sessions WHERE id = $1', [id])
    return result.rows.length ? mapRow(result.rows[0]) : null
  },

  /** Slots already spoken for in a date range — used to build availability. */
  async getTakenSlots(from: string, to: string): Promise<{ date: string; time: string; durationMinutes: number }[]> {
    const result = await pool.query(
      `SELECT date, time, duration_minutes FROM mentorship_sessions
        WHERE date BETWEEN $1 AND $2 AND status = ANY($3)`,
      [from, to, BLOCKING_STATUSES]
    )
    return result.rows.map((r: any) => ({
      date: r.date,
      time: r.time,
      durationMinutes: Number(r.duration_minutes),
    }))
  },

  async countPending(learnerEmail: string): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS n FROM mentorship_sessions WHERE learner_email = $1 AND status = 'pending'",
      [learnerEmail.toLowerCase().trim()]
    )
    return result.rows[0]?.n ?? 0
  },

  async markAccepted(
    id: string,
    event: { googleEventId: string | null; googleHtmlLink: string | null; meetUrl: string | null }
  ): Promise<MentorshipSession | null> {
    const result = await pool.query(
      `UPDATE mentorship_sessions
          SET status = 'accepted', google_event_id = $2, google_html_link = $3,
              meet_url = $4, decline_reason = NULL, updated_at = NOW()
        WHERE id = $1`,
      [id, event.googleEventId, event.googleHtmlLink, event.meetUrl]
    )
    if ((result.rowCount ?? 0) === 0) return null
    return this.getById(id)
  },

  async setStatus(
    id: string,
    status: MentorshipStatus,
    reason?: string | null
  ): Promise<MentorshipSession | null> {
    const result = await pool.query(
      `UPDATE mentorship_sessions
          SET status = $2, decline_reason = $3, updated_at = NOW()
        WHERE id = $1`,
      [id, status, reason ?? null]
    )
    if ((result.rowCount ?? 0) === 0) return null
    return this.getById(id)
  },

  /** Clears the Google link after the event is removed upstream. */
  async clearEvent(id: string): Promise<void> {
    await pool.query(
      `UPDATE mentorship_sessions
          SET google_event_id = NULL, google_html_link = NULL, meet_url = NULL, updated_at = NOW()
        WHERE id = $1`,
      [id]
    )
  },

  async remove(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM mentorship_sessions WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
