import { analyticsRepository } from './analytics.repository'

export const analyticsService = {
  getSummary(period: '7d' | '30d' | '90d' = '30d') {
    return analyticsRepository.getSummary(period)
  },

  getLeads(filters: any) {
    return analyticsRepository.getLeads(filters)
  },

  getLeadDetail(sessionId: string) {
    return analyticsRepository.getLeadDetail(sessionId)
  },

  getCampaignPerformance(period: '7d' | '30d' | '90d' = '30d') {
    return analyticsRepository.getCampaignPerformance(period)
  },

  getFunnel(period: '7d' | '30d' | '90d' = '30d') {
    return analyticsRepository.getFunnel(period)
  },

  getChartData(granularity: 'daily' | 'weekly' | 'monthly' = 'daily', period: '7d' | '30d' | '90d' = '30d') {
    return analyticsRepository.getChartData(granularity, period)
  },
}
