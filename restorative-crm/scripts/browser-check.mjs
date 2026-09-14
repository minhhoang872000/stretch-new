import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const puppeteer = require('puppeteer-core')
import { readFileSync } from 'node:fs'

/**
 * Opens each console in a real headless Chrome and records every console error,
 * page error and failed request.
 *
 * The bug this exists to catch only happens in the browser: a component that
 * throws during render leaves the page blank, and every check that only asks
 * "did the server return 200" says the app is fine.
 */
// Point CHROME_PATH at another binary if Chrome lives elsewhere.
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const env = Object.fromEntries(
  readFileSync(new URL('../../lead-tracker-api/.env', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let totalFail = 0

/** Ignorable noise: dev-server plumbing, not the app. */
const IGNORE = [
  /favicon/i,
  /\[vite\]/i,
  /Download the Vue Devtools/i,
  /app-manifest/i,
  /picsum.photos/i,
  /Failed to load resource.*404.*\.(png|jpg|svg|webp|ico)/i,
]
const noisy = (text) => IGNORE.some((re) => re.test(text))

async function visit(page, url, label) {
  const errors = []
  const onConsole = (msg) => {
    if (msg.type() === 'error' && !noisy(msg.text())) errors.push(`console: ${msg.text().slice(0, 200)}`)
  }
  const onPageError = (err) => errors.push(`pageerror: ${String(err.message).slice(0, 200)}`)
  const onFailed = (req) => {
    const u = req.url()
    if (!noisy(u)) errors.push(`request failed: ${u.slice(0, 120)} — ${req.failure()?.errorText}`)
  }
  const onResponse = (res) => {
    if (res.status() >= 500 && !noisy(res.url())) errors.push(`HTTP ${res.status()} ${res.url().slice(0, 120)}`)
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  page.on('requestfailed', onFailed)
  page.on('response', onResponse)

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }).catch((e) => {
    errors.push(`navigation: ${e.message.slice(0, 140)}`)
  })
  await sleep(1200)

  // A page that rendered nothing is a failure even with a clean console.
  const text = await page.evaluate(() => document.body.innerText.trim().length).catch(() => 0)

  page.off('console', onConsole)
  page.off('pageerror', onPageError)
  page.off('requestfailed', onFailed)
  page.off('response', onResponse)

  if (errors.length || text < 40) {
    totalFail += 1
    console.log(`  FAIL ${label}  (${text} ký tự hiển thị)`)
    for (const e of [...new Set(errors)].slice(0, 4)) console.log(`        ${e}`)
  } else {
    console.log(`  ok   ${label}  (${text} ký tự hiển thị)`)
  }
}

// ── restorative-crm ────────────────────────────────────────────────
console.log('\n══ restorative-crm :5173 ══')
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
  await page.type('input[type="email"], input[type="text"]', env.ADMIN_EMAIL)
  await page.type('input[type="password"]', env.ADMIN_PASSWORD)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await sleep(2500)
  const signedIn = !page.url().includes('/login')
  console.log(signedIn ? `  ok   đăng nhập → ${page.url()}` : `  FAIL đăng nhập, vẫn ở ${page.url()}`)
  if (!signedIn) totalFail += 1

  for (const [path, label] of [
    ['/dashboard', 'Tổng quan'],
    ['/funnel', 'Phễu chuyển đổi'],
    ['/academy/programs', 'Chương trình'],
    ['/academy/learners', 'Học viên'],
    ['/academy/insights', 'Phân tích học tập'],
    ['/sales/orders', 'Đơn hàng'],
    ['/sales/payments', 'Thanh toán'],
    ['/bookings', 'Lịch hẹn'],
    ['/availability', 'Khung giờ'],
    ['/translations', 'Ngôn ngữ'],
    ['/settings', 'Cài đặt'],
    ['/users', 'Người dùng'],
  ]) {
    await visit(page, `http://localhost:5173${path}`, `${path.padEnd(22)} ${label}`)
  }
  await page.close()
}

// ── instructor-admin ───────────────────────────────────────────────
console.log('\n══ instructor-admin :5180 ══')
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  await page.goto('http://localhost:5180/login', { waitUntil: 'networkidle2' })
  await page.type('#login-email', env.ADMIN_EMAIL)
  await page.type('#login-password', env.ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await sleep(3000)
  const signedIn = !page.url().includes('/login')
  console.log(signedIn ? `  ok   đăng nhập → ${page.url()}` : `  FAIL đăng nhập, vẫn ở ${page.url()}`)
  if (!signedIn) totalFail += 1

  for (const [path, label] of [
    ['/dashboard', 'Tổng quan'],
    ['/courses', 'Chương trình'],
    ['/media', 'Video'],
    ['/sessions', 'Lịch đào tạo'],
    ['/learners', 'Học viên'],
    ['/certificates', 'Chứng nhận'],
    ['/reviews', 'Đánh giá'],
    ['/analytics', 'Phân tích'],
  ]) {
    await visit(page, `http://localhost:5180${path}`, `${path.padEnd(22)} ${label}`)
  }
  await page.close()
}

await browser.close()
console.log(`\n${'─'.repeat(60)}\n${totalFail ? totalFail + ' màn hình lỗi' : 'Tất cả màn hình sạch'}`)
process.exit(totalFail ? 1 : 0)
