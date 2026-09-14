/**
 * Deterministic helpers for the mock dataset.
 *
 * Everything is generated from a fixed seed so the console shows the same
 * numbers on every reload — a demo where the revenue jumps around between
 * refreshes reads as broken, not as sample data.
 */

/** mulberry32 — tiny seeded PRNG. */
export function rng(seed = 20260821) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)]
}

export function int(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1))
}

/** Weighted pick: pass [[value, weight], …]. */
export function weighted(rand, pairs) {
  const total = pairs.reduce((s, p) => s + p[1], 0)
  let r = rand() * total
  for (const [value, w] of pairs) {
    r -= w
    if (r <= 0) return value
  }
  return pairs[pairs.length - 1][0]
}

/** ISO date `days` before/after the fixed "today" of the dataset. */
export const TODAY = '2026-08-21'

export function shiftDate(days, base = TODAY) {
  const d = new Date(`${base}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function shiftStamp(days, hour = 9, minute = 24) {
  const d = new Date(`${TODAY}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  d.setUTCHours(hour, minute, 0, 0)
  return d.toISOString()
}

export function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Vietnamese full names — the pool every learner/customer is drawn from. */
export const NAMES = [
  'Nguyễn Thu Hà', 'Trần Quốc Duy', 'Lê Minh Khôi', 'Phạm Ngọc Trâm', 'Hoàng Anh Tuấn',
  'Vũ Thị Bích Ngân', 'Đặng Hải Long', 'Bùi Phương Thảo', 'Đỗ Trung Hiếu', 'Ngô Thanh Vân',
  'Dương Khánh Linh', 'Lý Gia Bảo', 'Trịnh Mai Chi', 'Phan Đức Thắng', 'Cao Thuỳ Dương',
  'Võ Nhật Nam', 'Hồ Kim Oanh', 'Tạ Văn Kiên', 'Lâm Yến Nhi', 'Chu Đình Phúc',
  'Nguyễn Hữu Thịnh', 'Trần Lệ Quyên', 'Mai Xuân Hoà', 'Đinh Bảo Châu', 'Hà Tuấn Vinh',
  'Kiều Thanh Tú', 'Lương Nhã Uyên', 'Tô Quang Vũ', 'Phùng Diệu Anh', 'Đoàn Chí Công',
]

const MAIL_HOSTS = ['gmail.com', 'gmail.com', 'gmail.com', 'outlook.com', 'icloud.com', 'yahoo.com']

/**
 * Strip Vietnamese diacritics. NFD splits most vowels into base + combining
 * mark, which the character class then drops — but Đ/đ have no decomposition,
 * so they need their own pass or a slug loses the letter entirely.
 */
function deaccent(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/** Name to email local part: "Nguyễn Thu Hà" → "nguyenthuha". */
export function slugName(name) {
  return deaccent(name).toLowerCase().split(/\s+/).join('')
}

/** Any text to a URL slug. */
export function slug(text) {
  return deaccent(text)
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export function email(rand, name) {
  const host = pick(rand, MAIL_HOSTS)
  const tail = rand() < 0.45 ? String(int(rand, 12, 98)) : ''
  return `${slugName(name)}${tail}@${host}`
}

/** Vietnamese mobile numbers, real prefixes, no repeated tails. */
export function phone(rand) {
  const prefix = pick(rand, ['090', '091', '093', '094', '096', '097', '098', '032', '035', '037', '039', '070', '076', '081', '086'])
  const body = String(int(rand, 1000000, 9999899))
  return `${prefix} ${body.slice(0, 3)} ${body.slice(3)}`
}

/** Money formatted the way Vietnamese admins read it. */
export function vnd(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('vi-VN').format(value) + '₫'
}

export function compact(n) {
  if (n == null) return '0'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

let counter = 4700
/** Sequential ids so newly created rows sort predictably after the seed. */
export function nextId(prefix) {
  counter += 7
  return `${prefix}-${counter}`
}
