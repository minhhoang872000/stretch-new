/** Shared formatters, so a figure never renders two different ways in two screens. */

export const vnd = (value: number): string =>
  value <= 0 ? 'Miễn phí' : `${value.toLocaleString('vi-VN')}đ`

/** 754 → "12:34". */
export const clock = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export const minutes = (seconds: number): string => `${Math.round(seconds / 60)} phút`

export const mb = (bytes: number): string => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  return `${Math.round(bytes / 1e6)} MB`
}

/** Average bitrate in Mbps — the number that decides whether a file is watchable. */
export const bitrateMbps = (bytes: number, seconds: number): number =>
  seconds > 0 ? Number(((bytes * 8) / seconds / 1e6).toFixed(2)) : 0

/** yyyy-mm-dd → dd/mm/yyyy. */
export const date = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return d ? `${d}/${m}/${y}` : iso
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export const weekday = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()] ?? ''
}

/** Vietnamese search: fold diacritics so "phuc hoi" finds "Phục hồi". */
export const fold = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
