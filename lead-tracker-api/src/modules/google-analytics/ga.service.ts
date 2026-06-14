import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { env } from '../../config/env'

type Period = '7d' | '30d' | '90d'

export interface UTMFilters {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

function getClient() {
  if (!env.ga.propertyId || !env.ga.clientEmail || !env.ga.privateKey) {
    throw new Error('Google Analytics credentials not configured. Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY in .env')
  }
  return new BetaAnalyticsDataClient({
    credentials: { client_email: env.ga.clientEmail, private_key: env.ga.privateKey },
  })
}

function periodToDaysAgo(period: Period): string {
  return period === '7d' ? '7daysAgo' : period === '90d' ? '90daysAgo' : '30daysAgo'
}

function mv(row: any, i: number): number {
  return parseFloat(row.metricValues?.[i]?.value ?? '0')
}

function dv(row: any, i: number): string {
  return row.dimensionValues?.[i]?.value ?? ''
}

function pct(n: number, total: number) {
  return Math.round((n / (total || 1)) * 100)
}

export const gaService = {
  // ─── Overview ────────────────────────────────────────────────────────────────
  async getOverview(period: Period = '30d') {
    const client = getClient()
    const dateRanges = [{ startDate: periodToDaysAgo(period), endDate: 'today' }]
    const property = `properties/${env.ga.propertyId}`

    // GA4 limits 10 metrics per request — split into two
    const [res1, res2] = await Promise.all([
      client.runReport({
        property, dateRanges,
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'screenPageViewsPerSession' },
          { name: 'bounceRate' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      client.runReport({
        property, dateRanges,
        metrics: [
          { name: 'eventCount' },
          { name: 'conversions' },
        ],
      }),
    ])

    const r1 = res1[0].rows?.[0]
    const r2 = res2[0].rows?.[0]
    return {
      sessions: r1 ? mv(r1, 0) : 0,
      activeUsers: r1 ? mv(r1, 1) : 0,
      totalUsers: r1 ? mv(r1, 2) : 0,
      newUsers: r1 ? mv(r1, 3) : 0,
      pageViews: r1 ? mv(r1, 4) : 0,
      pagesPerSession: r1 ? Math.round(mv(r1, 5) * 10) / 10 : 0,
      bounceRate: r1 ? Math.round(mv(r1, 6) * 1000) / 10 : 0,
      engagedSessions: r1 ? mv(r1, 7) : 0,
      engagementRate: r1 ? Math.round(mv(r1, 8) * 1000) / 10 : 0,
      avgSessionDuration: r1 ? Math.round(mv(r1, 9)) : 0,
      eventCount: r2 ? mv(r2, 0) : 0,
      conversions: r2 ? mv(r2, 1) : 0,
      period,
    }
  },

  // ─── Channel Breakdown ───────────────────────────────────────────────────────
  async getChannelBreakdown(period: Period = '30d') {
    const client = getClient()
    const [res] = await client.runReport({
      property: `properties/${env.ga.propertyId}`,
      dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'engagementRate' },
        { name: 'conversions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })
    const rows = (res.rows || []).map(row => ({
      channel: dv(row, 0) || 'Direct',
      sessions: mv(row, 0),
      users: mv(row, 1),
      bounceRate: Math.round(mv(row, 2) * 1000) / 10,
      engagementRate: Math.round(mv(row, 3) * 1000) / 10,
      conversions: mv(row, 4),
      avgDuration: Math.round(mv(row, 5)),
    }))
    const total = rows.reduce((s, r) => s + r.sessions, 0)
    return rows.map(r => ({ ...r, percent: pct(r.sessions, total) }))
  },

  // ─── Daily Trend ─────────────────────────────────────────────────────────────
  async getDailyTrend(period: Period = '30d') {
    const client = getClient()
    const [res] = await client.runReport({
      property: `properties/${env.ga.propertyId}`,
      dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'conversions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    })
    return (res.rows || []).map(row => {
      const raw = dv(row, 0)
      return {
        date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
        sessions: mv(row, 0),
        users: mv(row, 1),
        engagedSessions: mv(row, 2),
        conversions: mv(row, 3),
        pageViews: mv(row, 4),
      }
    })
  },

  // ─── Top Pages ───────────────────────────────────────────────────────────────
  async getTopPages(period: Period = '30d') {
    const client = getClient()
    const [res] = await client.runReport({
      property: `properties/${env.ga.propertyId}`,
      dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagementRate' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 25,
    })
    return (res.rows || []).map(row => ({
      path: dv(row, 0),
      title: dv(row, 1),
      pageViews: mv(row, 0),
      users: mv(row, 1),
      avgDuration: Math.round(mv(row, 2)),
      bounceRate: Math.round(mv(row, 3) * 1000) / 10,
      engagementRate: Math.round(mv(row, 4) * 1000) / 10,
      conversions: mv(row, 5),
    }))
  },

  // ─── UTM Tracking ────────────────────────────────────────────────────────────
  async getUTMReport(period: Period = '30d', filters: UTMFilters = {}) {
    const client = getClient()

    const filterExprs: any[] = []
    if (filters.source) filterExprs.push({ filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'CONTAINS', value: filters.source } } })
    if (filters.medium) filterExprs.push({ filter: { fieldName: 'sessionMedium', stringFilter: { matchType: 'CONTAINS', value: filters.medium } } })
    if (filters.campaign) filterExprs.push({ filter: { fieldName: 'sessionCampaignName', stringFilter: { matchType: 'CONTAINS', value: filters.campaign } } })
    if (filters.content) filterExprs.push({ filter: { fieldName: 'sessionManualAdContent', stringFilter: { matchType: 'CONTAINS', value: filters.content } } })
    if (filters.term) filterExprs.push({ filter: { fieldName: 'sessionManualTerm', stringFilter: { matchType: 'CONTAINS', value: filters.term } } })

    const dimensionFilter =
      filterExprs.length === 1 ? filterExprs[0] :
      filterExprs.length > 1 ? { andGroup: { expressions: filterExprs } } :
      undefined

    const [res] = await client.runReport({
      property: `properties/${env.ga.propertyId}`,
      dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
        { name: 'sessionManualAdContent' },
        { name: 'sessionManualTerm' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'bounceRate' },
        { name: 'engagementRate' },
        { name: 'conversions' },
        { name: 'averageSessionDuration' },
      ],
      ...(dimensionFilter ? { dimensionFilter } : {}),
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 100,
    })

    return (res.rows || []).map(row => ({
      source: dv(row, 0) || '(direct)',
      medium: dv(row, 1) || '(none)',
      campaign: dv(row, 2) || '(not set)',
      content: dv(row, 3) || '(not set)',
      term: dv(row, 4) || '(not set)',
      sessions: mv(row, 0),
      users: mv(row, 1),
      newUsers: mv(row, 2),
      bounceRate: Math.round(mv(row, 3) * 1000) / 10,
      engagementRate: Math.round(mv(row, 4) * 1000) / 10,
      conversions: mv(row, 5),
      avgDuration: Math.round(mv(row, 6)),
    }))
  },

  // ─── UTM Source/Medium/Campaign lists (for filter dropdowns) ─────────────────
  async getUTMSources(period: Period = '30d') {
    const client = getClient()
    const [srcRes, medRes, campRes] = await Promise.all([
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 30,
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'sessionCampaignName' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      }),
    ])
    return {
      sources: (srcRes[0].rows || []).map(r => dv(r, 0)).filter(Boolean),
      mediums: (medRes[0].rows || []).map(r => dv(r, 0)).filter(Boolean),
      campaigns: (campRes[0].rows || []).map(r => dv(r, 0)).filter(Boolean),
    }
  },

  // ─── Devices ─────────────────────────────────────────────────────────────────
  async getDeviceReport(period: Period = '30d') {
    const client = getClient()
    const [devRes, osRes, brRes, screenRes] = await Promise.all([
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'conversions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'operatingSystem' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'browser' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'screenResolution' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ])

    const total = (devRes[0].rows || []).reduce((s: number, r: any) => s + mv(r, 0), 0)
    return {
      devices: (devRes[0].rows || []).map(row => ({
        category: dv(row, 0),
        sessions: mv(row, 0),
        users: mv(row, 1),
        bounceRate: Math.round(mv(row, 2) * 1000) / 10,
        conversions: mv(row, 3),
        percent: pct(mv(row, 0), total),
      })),
      os: (osRes[0].rows || []).map(row => ({ os: dv(row, 0), sessions: mv(row, 0), users: mv(row, 1) })),
      browsers: (brRes[0].rows || []).map(row => ({ browser: dv(row, 0), sessions: mv(row, 0), users: mv(row, 1) })),
      screens: (screenRes[0].rows || []).map(row => ({ resolution: dv(row, 0), sessions: mv(row, 0) })),
    }
  },

  // ─── Geo ─────────────────────────────────────────────────────────────────────
  async getGeoReport(period: Period = '30d') {
    const client = getClient()
    const [countryRes, cityRes] = await Promise.all([
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'country' }, { name: 'countryId' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'conversions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 30,
      }),
      client.runReport({
        property: `properties/${env.ga.propertyId}`,
        dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
        dimensions: [{ name: 'city' }, { name: 'country' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 25,
      }),
    ])
    const total = (countryRes[0].rows || []).reduce((s: number, r: any) => s + mv(r, 0), 0)
    return {
      countries: (countryRes[0].rows || []).map(row => ({
        country: dv(row, 0),
        countryCode: dv(row, 1),
        sessions: mv(row, 0),
        users: mv(row, 1),
        bounceRate: Math.round(mv(row, 2) * 1000) / 10,
        conversions: mv(row, 3),
        percent: pct(mv(row, 0), total),
      })),
      cities: (cityRes[0].rows || []).map(row => ({
        city: dv(row, 0),
        country: dv(row, 1),
        sessions: mv(row, 0),
        users: mv(row, 1),
      })),
    }
  },

  // ─── Events ──────────────────────────────────────────────────────────────────
  async getEventReport(period: Period = '30d', eventName?: string) {
    const client = getClient()
    const dimensionFilter = eventName ? {
      filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: eventName } },
    } : undefined

    const [res] = await client.runReport({
      property: `properties/${env.ga.propertyId}`,
      dateRanges: [{ startDate: periodToDaysAgo(period), endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' },
        { name: 'eventCountPerUser' },
        { name: 'conversions' },
      ],
      ...(dimensionFilter ? { dimensionFilter } : {}),
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 50,
    })

    return (res.rows || []).map(row => ({
      eventName: dv(row, 0),
      count: mv(row, 0),
      users: mv(row, 1),
      countPerUser: Math.round(mv(row, 2) * 10) / 10,
      conversions: mv(row, 3),
    }))
  },

  // ─── Social Media Platforms ──────────────────────────────────────────────────
  async getSocialReport(period: Period = '30d') {
    const client = getClient()
    const property = `properties/${env.ga.propertyId}`
    const dateRanges = [{ startDate: periodToDaysAgo(period), endDate: 'today' }]

    const SOCIAL_SOURCES = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'x', 'linkedin', 'pinterest', 'zalo', 'threads', 'snapchat']

    const dimensionFilter = {
      orGroup: {
        expressions: SOCIAL_SOURCES.map(s => ({
          filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'CONTAINS', value: s } },
        })),
      },
    }

    const [platformRes, campaignRes] = await Promise.all([
      client.runReport({
        property, dateRanges, dimensionFilter,
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'engagementRate' },
          { name: 'conversions' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      client.runReport({
        property, dateRanges, dimensionFilter,
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionCampaignName' }],
        metrics: [{ name: 'sessions' }, { name: 'conversions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      }),
    ])

    const total = (platformRes[0].rows || []).reduce((s: number, r: any) => s + mv(r, 0), 0)
    return {
      platforms: (platformRes[0].rows || []).map(row => ({
        source: dv(row, 0),
        medium: dv(row, 1),
        sessions: mv(row, 0),
        users: mv(row, 1),
        newUsers: mv(row, 2),
        engagedSessions: mv(row, 3),
        bounceRate: Math.round(mv(row, 4) * 1000) / 10,
        engagementRate: Math.round(mv(row, 5) * 1000) / 10,
        conversions: mv(row, 6),
        avgDuration: Math.round(mv(row, 7)),
        percent: pct(mv(row, 0), total),
      })),
      campaigns: (campaignRes[0].rows || []).map(row => ({
        source: dv(row, 0),
        campaign: dv(row, 1) || '(not set)',
        sessions: mv(row, 0),
        conversions: mv(row, 1),
      })),
      total,
    }
  },

  // ─── Realtime ────────────────────────────────────────────────────────────────
  async getRealtime() {
    const client = getClient()
    const [res] = await client.runRealtimeReport({
      property: `properties/${env.ga.propertyId}`,
      dimensions: [{ name: 'country' }, { name: 'unifiedScreenName' }, { name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    })

    const totalActive = (res.rows || []).reduce((s: number, r: any) => s + mv(r, 0), 0)
    return {
      totalActive,
      byPage: (res.rows || []).slice(0, 15).map(row => ({
        country: dv(row, 0),
        page: dv(row, 1),
        device: dv(row, 2),
        activeUsers: mv(row, 0),
      })),
    }
  },
}
