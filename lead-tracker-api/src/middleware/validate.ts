import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

/**
 * Zod-based validation middleware factory.
 * Validates req.body and attaches parsed data to req.validatedBody.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: errors,
        },
      })
      return
    }

    // Attach parsed (sanitized) data
    ;(req as any).validatedBody = result.data
    next()
  }
}
