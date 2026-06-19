import { Router } from 'express'
import { scController } from './sc.controller'

const router = Router()

// Site-wide totals (clicks, impressions, ctr, position)
// GET /api/v1/search-console/overview?period=30d
router.get('/overview', scController.getOverview)

// Daily trend
// GET /api/v1/search-console/trend?period=30d
router.get('/trend', scController.getDailyTrend)

// Top search queries
// GET /api/v1/search-console/queries?period=30d
router.get('/queries', scController.getTopQueries)

// Top landing pages
// GET /api/v1/search-console/pages?period=30d
router.get('/pages', scController.getTopPages)

// Country breakdown
// GET /api/v1/search-console/countries?period=30d
router.get('/countries', scController.getCountries)

// Device breakdown
// GET /api/v1/search-console/devices?period=30d
router.get('/devices', scController.getDevices)

export default router
