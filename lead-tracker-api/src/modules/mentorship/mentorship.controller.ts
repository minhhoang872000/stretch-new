import { Request, Response, NextFunction } from 'express'
import { mentorshipService, MentorshipError } from './mentorship.service'
import { success, created } from '../../utils/response'
import type { MentorshipFilter, MentorshipStatus } from './mentorship.repository'
import type {
  AcceptMentorshipInput,
  CreateMentorshipInput,
  DeclineMentorshipInput,
  UpdateHoursInput,
} from './mentorship.schema'

/** Turns a MentorshipError into its own status; anything else goes to the handler. */
function fail(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof MentorshipError) {
    res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } })
    return
  }
  next(err)
}

const notFound = (res: Response) =>
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mentorship request not found' } })

export const mentorshipController = {
  // ─── Learner-facing ────────────────────────────────────────────

  async availability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const from = typeof req.query.from === 'string' ? req.query.from : undefined
      const to = typeof req.query.to === 'string' ? req.query.to : undefined
      success(res, await mentorshipService.getAvailability(from, to))
    } catch (err) {
      fail(err, res, next)
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = (req as any).validatedBody as CreateMentorshipInput
      const session = await mentorshipService.createRequest(input)
      created(res, {
        message: 'Đã gửi yêu cầu. Giảng viên sẽ xác nhận sớm nhất có thể.',
        session,
      })
    } catch (err) {
      fail(err, res, next)
    }
  },

  /** A learner's own requests — the site passes the email off its Google session. */
  async mine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : ''
      if (!email) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing email parameter' } })
        return
      }
      const sessions = await mentorshipService.listForLearner(email)
      success(res, { sessions, total: sessions.length })
    } catch (err) {
      fail(err, res, next)
    }
  },

  // ─── Console ───────────────────────────────────────────────────

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: MentorshipFilter = {}
      const { status, from, to, email } = req.query
      if (typeof status === 'string' && status !== 'all') filter.status = status as MentorshipStatus
      if (typeof from === 'string') filter.from = from
      if (typeof to === 'string') filter.to = to
      if (typeof email === 'string') filter.learnerEmail = email

      const sessions = await mentorshipService.list(Object.keys(filter).length ? filter : undefined)
      const pending = sessions.filter((s) => s.status === 'pending').length

      success(res, { sessions, total: sessions.length, pending, integration: mentorshipService.status() })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await mentorshipService.getById(req.params.id as string)
      if (!session) {
        notFound(res)
        return
      }
      success(res, { session })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validatedBody as AcceptMentorshipInput
      const { session, warning } = await mentorshipService.accept(
        req.params.id as string,
        body?.meet_url || undefined
      )
      success(res, { message: 'Đã duyệt buổi 1-1 và đưa lên lịch.', session, warning })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async decline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validatedBody as DeclineMentorshipInput
      const session = await mentorshipService.decline(req.params.id as string, body?.reason)
      success(res, { message: 'Đã từ chối yêu cầu.', session })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await mentorshipService.setStatus(req.params.id as string, 'completed')
      success(res, { message: 'Đã đánh dấu hoàn thành.', session })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await mentorshipService.setStatus(req.params.id as string, 'cancelled')
      success(res, { message: 'Đã huỷ buổi học và gỡ khỏi lịch.', session })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await mentorshipService.remove(req.params.id as string)
      if (!deleted) {
        notFound(res)
        return
      }
      success(res, { message: 'Đã xoá yêu cầu.' })
    } catch (err) {
      fail(err, res, next)
    }
  },

  // ─── Opening hours ─────────────────────────────────────────────

  async getHours(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      success(res, { hours: await mentorshipService.getHours(), integration: mentorshipService.status() })
    } catch (err) {
      fail(err, res, next)
    }
  },

  async updateHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validatedBody as UpdateHoursInput
      const hours = await mentorshipService.replaceHours(
        body.hours.map((h) => ({
          weekday: h.weekday,
          startTime: h.start_time,
          endTime: h.end_time,
          active: h.active,
        }))
      )
      success(res, { message: 'Đã lưu khung giờ.', hours })
    } catch (err) {
      fail(err, res, next)
    }
  },

  // ─── Google Calendar passthrough ───────────────────────────────

  async calendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const from = typeof req.query.from === 'string' ? req.query.from : undefined
      const to = typeof req.query.to === 'string' ? req.query.to : undefined
      success(res, await mentorshipService.listCalendar(from, to))
    } catch (err) {
      fail(err, res, next)
    }
  },
}
