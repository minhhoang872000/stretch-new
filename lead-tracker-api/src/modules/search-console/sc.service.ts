import { JWT } from 'google-auth-library'
import { env } from '../../config/env'

type Period = '7d' | '30d' | '90d'

const API = 'https://searchconsole.googleapis.com/webmasters/v3'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

function getClient(): JWT {
  if (!env.gsc.clientEmail || !env.gsc.privateKey) {
    throw new Error('Search Console credentials not configured. Set GSC_CLIENT_EMAIL/GSC_PRIVATE_KEY (or reuse GA_CLIENT_EMAIL/GA_PRIVATE_KEY) in .env')
  }
  return new JWT({ email: env.gsc.clientEmail, key: env.gsc.privateKey, scopes: [SCOPE] })
}

/** GSC uses explicit dates (not "7daysAgo"). Data lags ~2 days; recent days just
 *  come back empty, which is fine. */
function periodToDates(period: Period): { startDate: string; endDate: string } {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (days - 1))
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: fmt(start), endDate: fmt(end) }
}

interface ScRow {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

/** Shared metric mapping for every row: ctr as a percentage, position to 1dp. */
function metrics(r: ScRow) {
  return {
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: round((r.ctr ?? 0) * 100, 2),
    position: round(r.position ?? 0, 1),
  }
}

async function runQuery(period: Period, body: Record<string, unknown> = {}): Promise<ScRow[]> {
  const client = getClient()
  const { startDate, endDate } = periodToDates(period)
  const site = encodeURIComponent(env.gsc.siteUrl)
  const { data } = await client.request<{ rows?: ScRow[] }>({
    url: `${API}/sites/${site}/searchAnalytics/query`,
    method: 'POST',
    data: { startDate, endDate, type: 'web', ...body },
  })
  return data.rows || []
}

export const scService = {
  /** Site-wide totals for the period (no dimensions → one aggregate row). */
  async getOverview(period: Period = '30d') {
    const rows = await runQuery(period)
    const { startDate, endDate } = periodToDates(period)
    return { ...metrics(rows[0] || {}), period, startDate, endDate }
  },

  /** Daily series for charting clicks / impressions over time. */
  async getDailyTrend(period: Period = '30d') {
    const rows = await runQuery(period, { dimensions: ['date'], rowLimit: 1000 })
    return rows.map((r) => ({ date: r.keys?.[0] || '', ...metrics(r) }))
  },

  /** Top search queries (what people typed to find the site). */
  async getTopQueries(period: Period = '30d', limit = 100) {
    const rows = await runQuery(period, { dimensions: ['query'], rowLimit: limit })
    return rows.map((r) => ({ query: r.keys?.[0] || '', ...metrics(r) }))
  },

  /** Top landing pages from organic search. */
  async getTopPages(period: Period = '30d', limit = 100) {
    const rows = await runQuery(period, { dimensions: ['page'], rowLimit: limit })
    return rows.map((r) => ({ page: r.keys?.[0] || '', ...metrics(r) }))
  },

  /** Breakdown by country (ISO-3 code). */
  async getCountries(period: Period = '30d', limit = 50) {
    const rows = await runQuery(period, { dimensions: ['country'], rowLimit: limit })
    return rows.map((r) => ({ country: r.keys?.[0] || '', ...metrics(r) }))
  },

  /** Breakdown by device (desktop / mobile / tablet). */
  async getDevices(period: Period = '30d') {
    const rows = await runQuery(period, { dimensions: ['device'] })
    return rows.map((r) => ({ device: r.keys?.[0] || '', ...metrics(r) }))
  },
}
