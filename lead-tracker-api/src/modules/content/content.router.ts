import { Router } from 'express'
import { pool } from '../../config/db'
import { createCrudRouter } from '../../core/crudRouter'
import { type Resource } from '../../core/crud'
import { success } from '../../utils/response'

/**
 * Content — static pages, FAQs, UI translations and the image library.
 *
 * All four are read by the public site and written by the console, so reads are
 * open and writes are not. FAQs and translations additionally get a bundled
 * read (`/faqs/public`, `/translations/bundle`) because that is how the site
 * actually consumes them: one request at render time, not one per row.
 */

const timestamps = {
  createdAt: { type: 'timestamp', readOnly: true },
  updatedAt: { type: 'timestamp', readOnly: true },
} as const

const pagesResource: Resource = {
  name: 'pages',
  table: 'pages',
  idPrefix: 'pg',
  defaultOrder: 'path ASC',
  search: ['path', 'title_vi', 'title_en'],
  filters: ['status', 'section'],
  sortable: ['path', 'updatedAt', 'status', 'words'],
  fields: {
    id: { readOnly: true },
    path: { required: true },
    titleVi: { fallback: '' },
    titleEn: { fallback: '' },
    section: { fallback: '' },
    status: { fallback: 'draft' },
    locales: { type: 'json', fallback: ['vi'] },
    blocks: { type: 'int', fallback: 0 },
    words: { type: 'int', fallback: 0 },
    seoTitle: { fallback: '' },
    seoDescription: { fallback: '' },
    note: { fallback: '' },
    updatedBy: { fallback: '' },
    ...timestamps,
  },
}

const faqsResource: Resource = {
  name: 'faqs',
  table: 'faqs',
  idPrefix: 'faq',
  defaultOrder: '"group" ASC, sort_order ASC',
  search: ['question_vi', 'question_en', 'answer_vi'],
  filters: ['group', 'status'],
  sortable: ['group', 'order', 'status'],
  fields: {
    id: { readOnly: true },
    group: { column: 'group', fallback: 'general' },
    questionVi: { fallback: '' },
    answerVi: { fallback: '' },
    questionEn: { fallback: '' },
    answerEn: { fallback: '' },
    status: { fallback: 'published' },
    order: { column: 'sort_order', type: 'int', fallback: 0 },
    ...timestamps,
  },
}

const translationsResource: Resource = {
  name: 'translations',
  table: 'translations',
  idPrefix: 'tr',
  defaultOrder: 'namespace ASC, key ASC',
  search: ['key', 'vi', 'en'],
  filters: ['namespace', 'status'],
  sortable: ['key', 'namespace', 'status'],
  fields: {
    id: { readOnly: true },
    key: { required: true },
    namespace: { fallback: 'common' },
    vi: { fallback: '' },
    en: { fallback: '' },
    status: { fallback: 'ok' },
    ...timestamps,
  },
}

const mediaResource: Resource = {
  name: 'media',
  table: 'media_assets',
  idPrefix: 'md',
  defaultOrder: 'created_at DESC',
  search: ['name', 'alt'],
  filters: ['kind'],
  sortable: ['name', 'createdAt', 'sizeKb'],
  fields: {
    id: { readOnly: true },
    name: { fallback: '' },
    url: { required: true },
    thumb: { fallback: '' },
    kind: { fallback: 'image' },
    width: { type: 'int', fallback: 0 },
    height: { type: 'int', fallback: 0 },
    sizeKb: { type: 'int', fallback: 0 },
    alt: { fallback: '' },
    usedIn: { type: 'json', fallback: [] },
    uploadedBy: { fallback: '' },
    ...timestamps,
  },
}

const pages = createCrudRouter(pagesResource, {
  publicRead: true,
  publicFilter: { status: 'published' },
})
const media = createCrudRouter(mediaResource, { publicRead: true })

const faqs = createCrudRouter(faqsResource, {
  publicRead: true,
  publicFilter: { status: 'published' },
  extend(sub) {
    /** What a FAQ section renders: published rows only, already grouped. */
    sub.get('/public', async (req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT id, "group", question_vi, answer_vi, question_en, answer_en, sort_order
             FROM faqs WHERE status = 'published'
            ORDER BY "group" ASC, sort_order ASC`,
        )
        const groups: Record<string, unknown[]> = {}
        for (const row of result.rows) {
          ;(groups[row.group] ||= []).push({
            id: row.id,
            questionVi: row.question_vi,
            answerVi: row.answer_vi,
            questionEn: row.question_en,
            answerEn: row.answer_en,
            order: row.sort_order,
          })
        }
        success(res, { groups })
      } catch (err) {
        next(err)
      }
    })
  },
})

const translations = createCrudRouter(translationsResource, {
  publicRead: true,
  async beforeWrite(body, req) {
    // "Translated" is a fact about the row, not a field someone should maintain
    // by hand — a key with an empty locale is missing whatever the form says.
    if (body.vi === undefined && body.en === undefined) return body

    // A PATCH carries only the locale being edited, so the other one has to be
    // read back before judging the pair. Deciding from the request body alone
    // marks a row `partial` the moment you fill in its second language.
    let current: { vi?: unknown; en?: unknown } = {}
    const id = req.params?.id
    if (id) {
      const found = await pool.query('SELECT vi, en FROM translations WHERE id = $1', [String(id)])
      if (found.rows.length) current = found.rows[0]
    }

    const vi = String(body.vi ?? current.vi ?? '').trim()
    const en = String(body.en ?? current.en ?? '').trim()
    if (vi && en) body.status = 'ok'
    else if (!vi && !en) body.status = 'missing'
    else body.status = 'partial'
    return body
  },
  extend(sub) {
    /**
     * One locale as a flat `{ key: value }` bundle — the shape an i18n loader
     * wants. Namespaced keys keep their prefix so two namespaces can share a key.
     */
    sub.get('/bundle/:locale', async (req, res, next) => {
      try {
        const locale = req.params.locale === 'en' ? 'en' : 'vi'
        // `locale` is narrowed to one of two literals above; never interpolated raw.
        const result = await pool.query(
          `SELECT namespace, key, ${locale === 'en' ? 'en' : 'vi'} AS value FROM translations`,
        )
        const bundle: Record<string, string> = {}
        for (const row of result.rows) {
          bundle[`${row.namespace}.${row.key}`] = row.value || ''
        }
        success(res, { locale, bundle, count: result.rows.length })
      } catch (err) {
        next(err)
      }
    })
  },
})

const router = Router()
router.use('/pages', pages.router)
router.use('/faqs', faqs.router)
router.use('/translations', translations.router)
router.use('/media-assets', media.router)

export default router
