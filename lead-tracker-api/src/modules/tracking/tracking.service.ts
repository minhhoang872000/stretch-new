import { Request } from 'express'
import { trackingRepository } from './tracking.repository'
import type { TrackingEventInput } from './tracking.schema'
import type { RequestMeta } from '../../types'

function extractMeta(req: Request): RequestMeta {
  return {
    ip_address: (req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress) ?? null,
    user_agent: (req.headers['user-agent'] as string) || null,
  }
}

export const trackingService = {
  async recordEvent(eventData: TrackingEventInput, req: Request): Promise<{ id: number }> {
    const meta = extractMeta(req)
    const id = await trackingRepository.create(eventData, meta)
    return { id }
  },

  async recordBatch(events: TrackingEventInput[], req: Request): Promise<{ count: number }> {
    const meta = extractMeta(req)
    const count = await trackingRepository.createBatch(events, meta)
    return { count }
  },
}
