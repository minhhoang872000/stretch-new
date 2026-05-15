import { Response } from 'express'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export function success<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data } as ApiResponse<T>)
}

export function created<T>(res: Response, data: T): Response {
  return success(res, data, 201)
}

export function error(
  res: Response,
  message: string,
  statusCode = 500,
  code = 'ERROR'
): Response {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  } as ApiResponse)
}
