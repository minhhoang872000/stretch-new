import { Router } from 'express'
import { analyticsController } from './analytics.controller'

const router = Router()

// Dashboard KPI summary
router.get('/summary', analyticsController.getSummary)

// Leads list with filters
router.get('/leads', analyticsController.getLeads)

// Single lead detail (with booking attribution)
router.get('/leads/:sessionId', analyticsController.getLeadDetail)

// UTM campaign performance
router.get('/campaigns', analyticsController.getCampaignPerformance)

// Conversion funnel
router.get('/funnel', analyticsController.getFunnel)

// Daily/weekly/monthly chart data
router.get('/chart', analyticsController.getChartData)

export default router
