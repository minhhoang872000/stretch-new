import { z } from 'zod'

/**
 * Zod schema for tracking event payload.
 */
export const trackingEventSchema = z.object({
  session_id: z.string().min(1, 'session_id is required').max(64),
  form_source: z.string().max(100).nullish().transform((v) => v || null),
  page_source: z.string().max(200).nullish().transform((v) => v || null),
  cta_clicked: z.string().max(100).nullish().transform((v) => v || null),
  service_interest: z.string().max(100).nullish().transform((v) => v || null),
  utm_source: z.string().max(100).nullish().transform((v) => v || null),
  utm_medium: z.string().max(100).nullish().transform((v) => v || null),
  utm_campaign: z.string().max(100).nullish().transform((v) => v || null),
  utm_content: z.string().max(100).nullish().transform((v) => v || null),
  utm_term: z.string().max(100).nullish().transform((v) => v || null),
  referrer: z.string().max(500).nullish().transform((v) => v || null),
  device_type: z.enum(['mobile', 'tablet', 'desktop']).nullish().transform((v) => v || null),
  timestamp: z.string().datetime({ message: 'Must be ISO 8601 datetime' }),
  ga4_client_id: z.string().max(100).nullish().transform((v) => v || null),
  meta_fbp: z.string().max(100).nullish().transform((v) => v || null),
})

export type TrackingEventInput = z.infer<typeof trackingEventSchema>
