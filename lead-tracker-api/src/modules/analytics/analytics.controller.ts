import { Request, Response, NextFunction } from 'express'
import { analyticsService } from './analytics.service'
import { success } from '../../utils/response'

export const analyticsController = {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as '7d' | '30d' | '90d') || '30d'
      const data = await analyticsService.getSummary(period)
      success(res, data)
    } catch (err) {
      next(err)
    }
  },

  async getLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        utm_source: req.query.utm_source as string | undefined,
        utm_campaign: req.query.utm_campaign as string | undefined,
        form_source: req.query.form_source as string | undefined,
        cta_clicked: req.query.cta_clicked as string | undefined,
        device_type: req.query.device_type as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      }

      const data = await analyticsService.getLeads(filters)
      success(res, data)
    } catch (err) {
      next(err)
    }
  },

  async getLeadDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params
      const data = await analyticsService.getLeadDetail(sessionId)

      if (!data.events.length) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Lead not found' },
        })
        return
      }

      success(res, data)
    } catch (err) {
      next(err)
    }
  },

  async getCampaignPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as '7d' | '30d' | '90d') || '30d'
      const data = await analyticsService.getCampaignPerformance(period)
      success(res, data)
    } catch (err) {
      next(err)
    }
  },

  async getFunnel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as '7d' | '30d' | '90d') || '30d'
      const data = await analyticsService.getFunnel(period)
      success(res, data)
    } catch (err) {
      next(err)
    }
  },

  async getChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const granularity = (req.query.granularity as 'daily' | 'weekly' | 'monthly') || 'daily'
      const period = (req.query.period as '7d' | '30d' | '90d') || '30d'
      const data = await analyticsService.getChartData(granularity, period)
      success(res, data)
    } catch (err) {
      next(err)
    }
  },
}
