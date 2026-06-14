import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { success } from '../../utils/response'

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = (req as any).validatedBody
      const result = await authService.login(email, password)
      success(res, result)
    } catch (err: any) {
      if (err.code === 'INVALID_CREDENTIALS') {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' },
        })
        return
      }
      next(err)
    }
  },

  me(req: Request, res: Response): void {
    success(res, { admin: (req as any).admin })
  },
}
