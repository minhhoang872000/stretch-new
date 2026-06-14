// Date formatting helpers — all dates display as Năm - Tháng - Ngày (YYYY-MM-DD).

/** Format a date value (ISO string, Date, or "YYYY-MM-DD") as "YYYY-MM-DD". */
export function formatDate(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Format a date value as "YYYY-MM-DD HH:mm". */
export function formatDateTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} ${hh}:${mm}`
}
