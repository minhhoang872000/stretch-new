import { Router } from 'express'
import { trackingController } from './tracking.controller'
import { validate } from '../../middleware/validate'
import { trackingEventSchema } from './tracking.schema'

const router = Router()

router.post('/events', validate(trackingEventSchema), trackingController.createEvent)
router.post('/events/batch', trackingController.createBatchEvents)

export default router
