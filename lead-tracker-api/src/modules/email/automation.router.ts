import { Router, type Request, type Response, type NextFunction } from 'express'
import { pool } from '../../config/db'
import { HttpError, generateId } from '../../core/crud'
import { requireSite } from '../../middleware/requireSite'
import { success } from '../../utils/response'
import { runJobs } from './jobs'
import { emailEnabled, sendOnceInBackground } from './mailer'
import { materialEmail } from './templates'

/**
 * Automation endpoints, all behind the site's service token:
 *
 *   POST /automation/jobs/run      — the hourly sweep (the `stretch-cron` Worker)
 *   POST /automation/leads/material — "nhận tài liệu miễn phí qua email"
 */
const router = Router()

router.post('/jobs/run', requireSite, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const started = Date.now()
    const result = await runJobs()
    success(res, { ...result, emailEnabled: emailEnabled(), ms: Date.now() - started })
  } catch (err) {
    next(err)
  }
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * A free material, exchanged for an email address. The lead lands in the CRM's
 * enquiries (source `free-material`, the material in `interest`) the same way a
 * contact-form enquiry does, so sales follows it up from the screen they
 * already use; the download link is emailed as well as revealed, so the
 * address has a reason to be real.
 *
 * Repeat requests from the same email for the same material add no second
 * lead — the existing one is touched instead, so the pipeline counts people.
 */
router.post('/leads/material', requireSite, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const name = String(req.body?.name || '').trim().slice(0, 120)
    const phone = String(req.body?.phone || '').trim().slice(0, 40)
    const title = String(req.body?.materialTitle || '').trim().slice(0, 120)
    const url = String(req.body?.url || '').trim()
    const job = String(req.body?.job || '').trim().slice(0, 120)
    if (!EMAIL_RE.test(email)) throw new HttpError('Email không hợp lệ', 400, 'INVALID_BODY')
    if (!title) throw new HttpError('Thiếu tên tài liệu', 400, 'INVALID_BODY')

    const existing = await pool.query(
      `SELECT id FROM enquiries WHERE LOWER(email) = $1 AND source = 'free-material' AND interest = $2 LIMIT 1`,
      [email, title],
    )
    let created = false
    if (existing.rows.length) {
      await pool.query(`UPDATE enquiries SET updated_at = NOW() WHERE id = $1`, [existing.rows[0].id])
    } else {
      await pool.query(
        `INSERT INTO enquiries (id, company, industry, contact, email, phone, interest, need, source, status)
         VALUES ($1,$2,'Tài liệu miễn phí',$3,$4,$5,$6,$7,'free-material','new')`,
        [
          generateId('enq'),
          // An individual, not a company — the CRM list headlines this column.
          name || email,
          name || email.split('@')[0],
          email,
          phone,
          title,
          `Tải tài liệu miễn phí "${title}"${job ? ` · Nghề nghiệp: ${job}` : ''}`,
        ],
      )
      created = true
    }

    if (/^https?:\/\//.test(url)) {
      sendOnceInBackground('material', `${email}:${title}`.slice(0, 200), materialEmail({ email, name, title, url }))
    }
    success(res, { ok: true, created })
  } catch (err) {
    next(err)
  }
})

export default router
