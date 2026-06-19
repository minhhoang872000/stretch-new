import { Request, Response, NextFunction } from 'express'
import { scService } from './sc.service'
import { success } from '../../utils/response'

function period(req: Request): '7d' | '30d' | '90d' {
  const p = req.query.period as string
  return (p === '7d' || p === '90d') ? p : '30d'
}

function handleScError(err: any, res: Response, next: NextFunction) {
  if (err.message?.includes('credentials not configured')) {
    res.status(503).json({ success: false, error: { code: 'SC_NOT_CONFIGURED', message: err.message } })
    return
  }
  next(err)
}

export const scController = {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getOverview(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },

  async getDailyTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getDailyTrend(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },

  async getTopQueries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getTopQueries(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },

  async getTopPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getTopPages(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },

  async getCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getCountries(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },

  async getDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await scService.getDevices(period(req))) }
    catch (err: any) { handleScError(err, res, next) }
  },
}
