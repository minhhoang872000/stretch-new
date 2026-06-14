import { Router } from 'express'
import { gaController } from './ga.controller'

const router = Router()

// Overview KPIs (expanded)
// GET /api/v1/google-analytics/overview?period=30d
router.get('/overview', gaController.getOverview)

// Channel breakdown
// GET /api/v1/google-analytics/channels?period=30d
router.get('/channels', gaController.getChannelBreakdown)

// Daily trend
// GET /api/v1/google-analytics/trend?period=30d
router.get('/trend', gaController.getDailyTrend)

// Top pages
// GET /api/v1/google-analytics/pages?period=30d
router.get('/pages', gaController.getTopPages)

// UTM tracking with filters
// GET /api/v1/google-analytics/utm?period=30d&source=google&medium=cpc&campaign=spring&content=&term=
router.get('/utm', gaController.getUTMReport)

// UTM source/medium/campaign lists for filter dropdowns
// GET /api/v1/google-analytics/utm/sources?period=30d
router.get('/utm/sources', gaController.getUTMSources)

// Device / OS / Browser breakdown
// GET /api/v1/google-analytics/devices?period=30d
router.get('/devices', gaController.getDeviceReport)

// Geo: country + city
// GET /api/v1/google-analytics/geo?period=30d
router.get('/geo', gaController.getGeoReport)

// Social media platform breakdown (Facebook, Instagram, TikTok, YouTube, etc.)
// GET /api/v1/google-analytics/social?period=30d
router.get('/social', gaController.getSocialReport)

// GA4 Events
// GET /api/v1/google-analytics/events?period=30d&event=click
router.get('/events', gaController.getEventReport)

// Realtime active users
// GET /api/v1/google-analytics/realtime
router.get('/realtime', gaController.getRealtime)

export default router
