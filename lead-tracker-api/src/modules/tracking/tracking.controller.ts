import { Request, Response, NextFunction } from 'express'
import { trackingService } from './tracking.service'
import { trackingEventSchema } from './tracking.schema'
import { created } from '../../utils/response'

export const trackingController = {
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await trackingService.recordEvent((req as any).validatedBody, req)
      created(res, { id: result.id, message: 'Event recorded successfully' })
    } catch (err) {
      next(err)
    }
  },

  async createBatchEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { events } = req.body

      if (!Array.isArray(events) || events.length === 0) {
        res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'events must be a non-empty array' },
        })
        return
      }

      if (events.length > 50) {
        res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Batch size cannot exceed 50 events' },
        })
        return
      }

      const validatedEvents: any[] = []
      const errors: any[] = []

      for (let i = 0; i < events.length; i++) {
        const result = trackingEventSchema.safeParse(events[i])
        if (result.success) {
          validatedEvents.push(result.data)
        } else {
          errors.push({ index: i, issues: result.error.issues })
        }
      }

      if (errors.length > 0) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `${errors.length} event(s) failed validation`,
            details: errors,
          },
        })
        return
      }

      const result = await trackingService.recordBatch(validatedEvents, req)
      created(res, { count: result.count, message: `${result.count} event(s) recorded successfully` })
    } catch (err) {
      next(err)
    }
  },
}
