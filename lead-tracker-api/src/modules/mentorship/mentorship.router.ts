import { Router, Request, Response, NextFunction } from 'express'
import { mentorshipController } from './mentorship.controller'
import { validate } from '../../middleware/validate'
import { requireAuth } from '../../middleware/requireAuth'
import { env } from '../../config/env'
import {
  acceptMentorshipSchema,
  createMentorshipSchema,
  declineMentorshipSchema,
  updateHoursSchema,
} from './mentorship.schema'

const router = Router()

/**
 * Booking a 1-to-1 requires a signed-in learner, and that session lives on the
 * website — not here. So the site's server route checks it and vouches with the
 * shared service token, exactly as it already does for lesson video playback
 * (see `videos.router.ts`). The learner's browser never calls this API directly.
 *
 * The admin JWT is accepted too, so the console can create a session on a
 * learner's behalf over the phone.
 */
function requireSiteOrAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-service-token']
  if (typeof token === 'string' && token && env.siteServiceToken && token === env.siteServiceToken) {
    ;(req as any).caller = 'site'
    next()
    return
  }
  requireAuth(req, res, next)
}

// ─── Learner-facing (through the website) ────────────────────────────
// Availability is public: the modal needs it before anything is submitted, and
// it reveals only which half-hours are free.
router.get('/availability', mentorshipController.availability)
router.post('/', requireSiteOrAdmin, validate(createMentorshipSchema), mentorshipController.create)
router.get('/mine', requireSiteOrAdmin, mentorshipController.mine)

// ─── Opening hours (admin) ───────────────────────────────────────────
// Declared before `/:id` so "hours" is never read as an id.
router.get('/hours', requireAuth, mentorshipController.getHours)
router.put('/hours', requireAuth, validate(updateHoursSchema), mentorshipController.updateHours)

// ─── Google Calendar (admin) ─────────────────────────────────────────
router.get('/calendar', requireAuth, mentorshipController.calendar)

// ─── Requests (admin) ────────────────────────────────────────────────
router.get('/', requireAuth, mentorshipController.list)
router.get('/:id', requireAuth, mentorshipController.getById)
router.patch('/:id/accept', requireAuth, validate(acceptMentorshipSchema), mentorshipController.accept)
router.patch('/:id/decline', requireAuth, validate(declineMentorshipSchema), mentorshipController.decline)
router.patch('/:id/complete', requireAuth, mentorshipController.complete)
router.patch('/:id/cancel', requireAuth, mentorshipController.cancel)
router.delete('/:id', requireAuth, mentorshipController.remove)

export default router
