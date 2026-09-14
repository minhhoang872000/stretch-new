// Formatting helpers shared by every table, tile and detail panel.
import { formatDate, formatDateTime } from '@/utils/date.js'

/** 2.490.000₫ — the way a Vietnamese admin reads money. */
export function vnd(value) {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('vi-VN').format(value) + '₫'
}

/** Money without the symbol, for columns that already carry a ₫ header. */
export function num(value) {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('vi-VN').format(value)
}

/** 18.420 → 18,4K. Used only where the exact figure does not matter. */
export function compact(value) {
  if (value == null) return '0'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + 'M'
  if (abs >= 1000) return (value / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'K'
  return String(value)
}

export function percent(value, digits = 0) {
  if (value == null) return '—'
  return `${Number(value).toFixed(digits).replace('.', ',')}%`
}

/**
 * Dates render as YYYY-MM-DD everywhere.
 *
 * That is the convention the older screens already declare (see utils/date.js),
 * and mixing it with DD/MM/YYYY in the newer ones would leave two date formats
 * in the same table row. These wrappers delegate so there is one implementation.
 */
export function date(value) {
  if (!value) return '—'
  return formatDate(value) || String(value)
}

export function dateTime(value) {
  if (!value) return '—'
  return formatDateTime(value) || String(value)
}

const DAY = 86400000

/**
 * "3 ngày trước". Anchored to the dataset's fixed today so relative labels
 * stay consistent with the seeded dates instead of drifting with the clock.
 */
export function ago(value, now = new Date()) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const diff = now.getTime() - d.getTime()
  const abs = Math.abs(diff)
  const future = diff < 0
  const fmt = (n, unit) => (future ? `sau ${n} ${unit}` : `${n} ${unit} trước`)
  if (abs < 60000) return 'vừa xong'
  if (abs < 3600000) return fmt(Math.round(abs / 60000), 'phút')
  if (abs < DAY) return fmt(Math.round(abs / 3600000), 'giờ')
  if (abs < DAY * 30) return fmt(Math.round(abs / DAY), 'ngày')
  if (abs < DAY * 365) return fmt(Math.round(abs / (DAY * 30)), 'tháng')
  return fmt(Math.round(abs / (DAY * 365)), 'năm')
}

/** 148 minutes → "2h 28′" */
export function duration(minutes) {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m}′`
  return m ? `${h}h ${m}′` : `${h}h`
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/)
  if (!parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Look up a label in a `[{ value, label }]` option list. */
export function labelOf(options, value, fallback = '—') {
  const hit = (options || []).find((o) => o.value === value)
  return hit ? hit.label : fallback
}
