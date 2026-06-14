import { Request, Response, NextFunction } from 'express'
import { gaService, UTMFilters } from './ga.service'
import { success } from '../../utils/response'

function period(req: Request): '7d' | '30d' | '90d' {
  const p = req.query.period as string
  return (p === '7d' || p === '90d') ? p : '30d'
}

function handleGAError(err: any, res: Response, next: NextFunction) {
  if (err.message?.includes('credentials not configured')) {
    res.status(503).json({ success: false, error: { code: 'GA_NOT_CONFIGURED', message: err.message } })
    return
  }
  next(err)
}

export const gaController = {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getOverview(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getChannelBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getChannelBreakdown(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getDailyTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getDailyTrend(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getTopPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getTopPages(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getUTMReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: UTMFilters = {
        source: req.query.source as string | undefined,
        medium: req.query.medium as string | undefined,
        campaign: req.query.campaign as string | undefined,
        content: req.query.content as string | undefined,
        term: req.query.term as string | undefined,
      }
      success(res, await gaService.getUTMReport(period(req), filters))
    } catch (err: any) { handleGAError(err, res, next) }
  },

  async getUTMSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getUTMSources(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getDeviceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getDeviceReport(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getGeoReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getGeoReport(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getEventReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventName = req.query.event as string | undefined
      success(res, await gaService.getEventReport(period(req), eventName))
    } catch (err: any) { handleGAError(err, res, next) }
  },

  async getSocialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getSocialReport(period(req))) }
    catch (err: any) { handleGAError(err, res, next) }
  },

  async getRealtime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { success(res, await gaService.getRealtime()) }
    catch (err: any) { handleGAError(err, res, next) }
  },
}
