import { Request } from 'express'

// ─── Tracking ────────────────────────────────────────────────────────

export interface TrackingEvent {
  id?: number
  session_id: string
  form_source: string | null
  page_source: string | null
  cta_clicked: string | null
  service_interest: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  referrer: string | null
  device_type: 'mobile' | 'tablet' | 'desktop' | null
  ip_address?: string | null
  user_agent?: string | null
  ga4_client_id: string | null
  meta_fbp: string | null
  timestamp: string
  created_at?: string
}

// ─── Products / Services ─────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name: string
  nameEn: string
  nameVi: string
  shortDescription: string
  shortDescriptionEn: string
  shortDescriptionVi: string
  description: string
  price: number
  currency: string
  coverImage: string
  images: string[]
  category: string
  tags: string[]
  available: boolean
  createdAt: string
  updatedAt: string
}

// ─── Practitioners ───────────────────────────────────────────────────

export interface Practitioner {
  id: string
  name: string
  avatar: string
  bio: string
  specialties: string[]
  services: string[]
}

// ─── Bookings ────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  service: string
  practitioner: string | null
  date: string
  time: string
  name: string
  phone: string
  email?: string
  note?: string
  session_id?: string | null
  status: BookingStatus
  createdAt: string
  updatedAt?: string
}

export interface BookingFilter {
  status?: BookingStatus
  date?: string
  service?: string
}

// ─── Request Extensions ──────────────────────────────────────────────

export interface ValidatedRequest<T = unknown> extends Request {
  validatedBody: T
}

// ─── Server Metadata ─────────────────────────────────────────────────

export interface RequestMeta {
  ip_address: string | null
  user_agent: string | null
}
