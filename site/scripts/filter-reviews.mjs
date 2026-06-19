/**
 * Lọc & làm sạch Google Reviews -> site/data/reviews.json
 *
 * Dùng 1 lần: lấy data thô (Outscraper / SerpApi / script scrape / Places API)
 * lưu thành 1 file JSON, rồi chạy script này để lọc 4-5 sao, bỏ review trống,
 * cắt bớt review quá dài và chuẩn hoá về 1 schema gọn cho frontend.
 *
 * Cách chạy (từ thư mục site/):
 *   node scripts/filter-reviews.mjs [input.json] [output.json]
 *
 * Mặc định:
 *   input  = site/scripts/raw-reviews.json
 *   output = site/data/reviews.json
 *
 * Input chấp nhận:
 *   - 1 mảng review:                [ {...}, {...} ]
 *   - object bọc mảng:              { reviews: [...] } | { data: [...] } | { results: [...] }
 *   - Outscraper (mảng địa điểm):   [ { reviews_data: [...] } ]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const siteRoot = resolve(__dirname, '..')

// ---- Cấu hình ----
const MIN_RATING = 4 // chỉ giữ review >= 4 sao
const MAX_LEN = 320 // cắt nội dung dài hơn (ký tự), cắt theo ranh giới từ
const MAX_OUTPUT = 0 // 0 = không giới hạn; >0 = chỉ lấy N review tốt nhất

const inputPath = resolve(process.cwd(), process.argv[2] || resolve(__dirname, 'raw-reviews.json'))
const outputPath = resolve(process.cwd(), process.argv[3] || resolve(siteRoot, 'data/reviews.json'))

// ---- Tiện ích lấy field theo nhiều tên khác nhau giữa các nguồn ----
const pick = (obj, keys) => {
  for (const k of keys) {
    const v = k.split('.').reduce((o, part) => (o == null ? o : o[part]), obj)
    if (v != null && v !== '') return v
  }
  return undefined
}

const toRating = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/([0-5](?:[.,]\d)?)/)
    if (m) return parseFloat(m[1].replace(',', '.'))
  }
  return undefined
}

const clean = (text) => {
  if (!text || typeof text !== 'string') return ''
  let t = text.replace(/\s+/g, ' ').trim()
  if (t.length > MAX_LEN) {
    const cut = t.slice(0, MAX_LEN)
    const lastSpace = cut.lastIndexOf(' ')
    t = (lastSpace > MAX_LEN * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…'
  }
  return t
}

// ---- Đọc input ----
if (!existsSync(inputPath)) {
  console.error(`✗ Không tìm thấy file input: ${inputPath}`)
  console.error(`  Hãy export review thô (Outscraper/SerpApi/...) ra file đó rồi chạy lại.`)
  process.exit(1)
}

let raw
try {
  raw = JSON.parse(readFileSync(inputPath, 'utf8'))
} catch (e) {
  console.error(`✗ File input không phải JSON hợp lệ: ${e.message}`)
  process.exit(1)
}

// Chuẩn hoá về 1 mảng review thô
let rawReviews = []
if (Array.isArray(raw)) {
  // có thể là mảng review, hoặc mảng địa điểm Outscraper có reviews_data
  if (raw.length && Array.isArray(raw[0]?.reviews_data)) {
    rawReviews = raw.flatMap((place) => place.reviews_data || [])
  } else {
    rawReviews = raw
  }
} else if (raw && typeof raw === 'object') {
  rawReviews = raw.reviews || raw.data || raw.results || raw.reviews_data || []
  if (!Array.isArray(rawReviews)) rawReviews = []
}

if (!rawReviews.length) {
  console.error('✗ Không tìm thấy review nào trong file input.')
  process.exit(1)
}

// ---- Chuẩn hoá từng review ----
const normalize = (r) => ({
  author: pick(r, ['author_title', 'author', 'name', 'reviewer', 'authorAttribution.displayName', 'user.name']) || 'Khách hàng',
  avatar: pick(r, ['author_image', 'avatar', 'profile_photo_url', 'authorAttribution.photoUri', 'user.image']) || '',
  rating: toRating(pick(r, ['review_rating', 'rating', 'stars', 'score', 'starRating'])),
  text: pick(r, ['review_text', 'text.text', 'text', 'snippet', 'content', 'comment', 'review']) || '',
  time: pick(r, ['review_datetime_utc', 'relativePublishTimeDescription', 'time', 'date', 'datetime', 'published_at']) || '',
  link: pick(r, ['review_link', 'link', 'url', 'googleMapsUri']) || '',
})

const seen = new Set()
let reviews = rawReviews
  .map(normalize)
  .filter((r) => {
    if (r.rating == null || r.rating < MIN_RATING) return false // chỉ 4-5 sao
    const text = clean(r.text)
    if (!text) return false // bỏ review không có nội dung
    r.text = text
    const key = `${r.author}|${text.slice(0, 40)}`
    if (seen.has(key)) return false // bỏ trùng
    seen.add(key)
    return true
  })
  .sort((a, b) => b.rating - a.rating)

if (MAX_OUTPUT > 0) reviews = reviews.slice(0, MAX_OUTPUT)

// ---- Ghi output ----
const out = {
  source: 'google',
  minRating: MIN_RATING,
  count: reviews.length,
  reviews,
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(out, null, 2) + '\n', 'utf8')

console.log(`✓ Đọc ${rawReviews.length} review thô`)
console.log(`✓ Giữ lại ${reviews.length} review (>= ${MIN_RATING} sao, có nội dung, không trùng)`)
console.log(`✓ Đã ghi: ${outputPath}`)
