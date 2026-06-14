import { Router } from 'express'
import { authController } from './auth.controller'
import { validate } from '../../middleware/validate'
import { loginSchema } from './auth.schema'
import { requireAuth } from '../../middleware/requireAuth'

const router = Router()

router.post('/login', validate(loginSchema), authController.login)
router.get('/me', requireAuth, authController.me)

export default router
