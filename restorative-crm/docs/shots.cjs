const puppeteer = require('puppeteer-core')
const path = require('path')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'
const OUT = path.join(__dirname, 'shots')
const EMAIL = 'admin@stretch.vn'
const PASSWORD = process.env.CRM_PW

const PAGES = [
  { route: '/dashboard',        file: '02-dashboard.png' },
  { route: '/bookings',         file: '03-bookings.png' },
  { route: '/calendar',         file: '04-calendar.png' },
  { route: '/categories',       file: '05-categories.png' },
  { route: '/blog',             file: '06-blog.png' },
  { route: '/google-analytics', file: '07-analytics.png' },
  { route: '/leads',            file: '08-leads.png' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const fs = require('fs')
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: [
      '--no-sandbox',
      '--hide-scrollbars',
      // production backend whitelists only deployed origins → bypass CORS
      // locally just so the headless browser can call the live API for shots
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--user-data-dir=' + path.join(__dirname, '.chrome-tmp'),
    ],
  })
  const page = await browser.newPage()
  page.on('console', (m) => { if (m.type() === 'error') console.log('  page-err:', m.text().slice(0, 120)) })

  // 1) Login page (clean) ------------------------------------------------
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await sleep(800)
  await page.screenshot({ path: path.join(OUT, '01-login.png') })
  console.log('shot: 01-login')

  // 2) Perform login -----------------------------------------------------
  await page.type('#email', EMAIL, { delay: 15 })
  await page.type('#password', PASSWORD, { delay: 15 })
  await page.click('button[type="submit"]')
  // wait until the token actually lands in localStorage (login is async)
  await page.waitForFunction(() => !!localStorage.getItem('auth_token'), { timeout: 60000 })
  await sleep(1500)
  console.log('logged in OK, url =', page.url())

  // 3) Each protected page ----------------------------------------------
  for (const p of PAGES) {
    await page.goto(`${BASE}${p.route}`, { waitUntil: 'networkidle2' })
    // extra wait for charts / remote API (Render can be slow)
    await sleep(p.route.includes('analytics') ? 6000 : 3500)
    await page.screenshot({ path: path.join(OUT, p.file) })
    console.log('shot:', p.file)
  }

  await browser.close()
  console.log('DONE')
})().catch((e) => { console.error('ERR', e); process.exit(1) })
