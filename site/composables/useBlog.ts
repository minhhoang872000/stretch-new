/**
 * Client-side blog access — calls the lead-tracker-api DIRECTLY
 * (browser → https://<api>/api/v1/...), no Nuxt server proxy.
 *
 * NOTE: because these run in the browser, the API's CORS_ORIGINS must include
 * this site's origin (e.g. http://localhost:3000 in dev + the deployed domain).
 *
 * The API stores a bilingual shape with CKEditor HTML; we map it here to the
 * flat shape the Sharing Hub pages consume (with a single `html` field).
 */

interface SitePost {
  slug: string
  /** The CMS holds a real English translation (see utils/blogLocale). */
  hasEn: boolean
  title: string
  excerpt: string
  category: string
  categoryKey: string
  image: string
  author: string
  readTime: string
  tags: string[]
  status: 'published' | 'draft'
  date: string
  html: string
  createdAt: string
  updatedAt: string
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function contentToHtml(sections: any[]): string {
  if (!Array.isArray(sections)) return ''
  return sections.map((s) => s?.text || '').filter(Boolean).join('\n')
}

function mapApiPost(p: any, catMap: Record<string, string>, locale: string): SitePost {
  const en = locale === 'en' && postHasEnglish(p)
  const sections = (en ? p.contentEn : (Array.isArray(p.contentVi) && p.contentVi.length ? p.contentVi : p.contentEn)) || []
  return {
    slug: p.slug,
    hasEn: postHasEnglish(p),
    title: (en ? p.titleEn : p.titleVi || p.titleEn) || '',
    excerpt: String((en ? p.excerptEn || p.excerptVi : p.excerptVi || p.excerptEn) || '').trim(),
    category: catMap[p.category] || p.category,
    categoryKey: p.category,
    image: p.coverImage || '',
    author: p.author || 'Stretch Team',
    readTime: p.readTime || '',
    tags: p.tags || [],
    status: p.published ? 'published' : 'draft',
    date: formatDate(p.publishedAt || p.createdAt),
    html: contentToHtml(sections),
    createdAt: p.createdAt || '',
    updatedAt: p.updatedAt || '',
  }
}

interface PostQuery {
  status?: string
  categoryKey?: string
  search?: string
  /** Card listing: ask the API to omit the heavy HTML body. */
  summary?: boolean
  /** Cap the number of rows fetched (defaults to 100). */
  limit?: number
}

// Module-scope (survives across requests on the same warm Worker isolate,
// reset on cold start) last-known-good result for the Sharing Hub listing.
// Purpose: if the lead-tracker API has a slow/failed moment, serve the last
// successful listing instead of an empty one. An empty listing is technically
// a valid page (not an error), but it looks broken to a first-time visitor
// AND to Googlebot re-crawling an already-indexed page — showing "0 posts"
// where yesterday there were 20 is exactly the kind of unreliable-content
// signal that gets a page quietly dropped from the index.
// Kept raw (unmapped) so one cache serves both locales.
let hubIndexCache: { cats: any[]; posts: any[] } | null = null

export function useBlogClient() {
  const base = (useRuntimeConfig().public.trackingApiUrl as string) || ''
  // Read the locale when a fetch runs, not when the composable is created: the
  // same client is reused across a language switch.
  const i18n = useNuxtApp().$i18n as any
  const currentLocale = () => String(i18n?.locale?.value || 'en')
  const map = (p: any, catMap: Record<string, string>) => mapApiPost(p, catMap, currentLocale())

  // ── Low-level fetchers (no category-label resolution) ───────────────
  async function fetchCategoriesRaw(): Promise<any[]> {
    if (!base) return []
    const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`, { timeout: 4000 }).catch(() => null)
    return res?.data?.categories || []
  }

  function buildCatMap(cats: any[]): Record<string, string> {
    const map: Record<string, string> = {}
    for (const c of cats) map[c.key] = c.label
    return map
  }

  async function fetchPostsRaw(filters: PostQuery = {}): Promise<any[]> {
    if (!base) return []
    const query: Record<string, any> = {
      limit: filters.limit ?? 100,
      published: filters.status === 'draft' ? 'false' : 'true',
    }
    if (filters.categoryKey) query.category = filters.categoryKey
    if (filters.search) query.search = filters.search
    if (filters.summary) query.summary = 'true'
    const res = await $fetch<{ data?: { posts: any[] } }>(`${base}/api/v1/blog`, { query, timeout: 6000 }).catch(() => null)
    return res?.data?.posts || []
  }

  /** Same as fetchCategoriesRaw/fetchPostsRaw, but rejects instead of swallowing
   *  the error — so callers that need to tell "API failed" apart from "API
   *  legitimately returned zero rows" (e.g. getHubIndex's stale-cache fallback)
   *  can do so. */
  async function fetchCategoriesOrThrow(): Promise<any[]> {
    if (!base) return []
    const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`, { timeout: 4000 })
    return res?.data?.categories || []
  }
  async function fetchPostsOrThrow(filters: PostQuery = {}): Promise<any[]> {
    if (!base) return []
    const query: Record<string, any> = {
      limit: filters.limit ?? 100,
      published: filters.status === 'draft' ? 'false' : 'true',
    }
    if (filters.categoryKey) query.category = filters.categoryKey
    if (filters.search) query.search = filters.search
    if (filters.summary) query.summary = 'true'
    const res = await $fetch<{ data?: { posts: any[] } }>(`${base}/api/v1/blog`, { query, timeout: 6000 })
    return res?.data?.posts || []
  }

  // ── Public API (resolve category labels, single categories fetch) ───
  async function getPosts(filters: PostQuery = {}): Promise<SitePost[]> {
    const [posts, cats] = await Promise.all([fetchPostsRaw(filters), fetchCategoriesRaw()])
    const catMap = buildCatMap(cats)
    return posts.map((p) => map(p, catMap))
  }

  async function getPostBySlug(slug: string): Promise<SitePost | null> {
    if (!base) return null
    const [res, cats] = await Promise.all([
      $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`).catch(() => null),
      fetchCategoriesRaw(),
    ])
    if (!res?.data?.post) return null
    return map(res.data.post, buildCatMap(cats))
  }

  async function getCategories(): Promise<{ key: string; label: string }[]> {
    return (await fetchCategoriesRaw()).map((c) => ({ key: c.key, label: c.label }))
  }

  /**
   * Sharing Hub index: ONE categories call + ONE posts call, in parallel.
   * Posts come back in summary mode (no HTML body) since the listing only
   * renders cards — saves transferring every post's full content.
   *
   * On a transient API failure, serve the last successful result (module-scope
   * `hubIndexCache`) instead of an empty list — see the comment on that
   * variable. Only falls through to an empty listing on the very first
   * request after a cold start, before anything has ever succeeded.
   */
  async function getHubIndex(): Promise<{ categories: { key: string; label: string }[]; posts: SitePost[] }> {
    let raw: { cats: any[]; posts: any[] }
    try {
      const [cats, posts] = await Promise.all([
        fetchCategoriesOrThrow(),
        fetchPostsOrThrow({ status: 'published', summary: true }),
      ])
      raw = { cats, posts }
      hubIndexCache = raw
    } catch {
      if (!hubIndexCache) return { categories: [], posts: [] }
      raw = hubIndexCache
    }
    const catMap = buildCatMap(raw.cats)
    return {
      categories: raw.cats.map((c) => ({ key: c.key, label: c.label })),
      posts: raw.posts.map((p) => map(p, catMap)),
    }
  }

  /**
   * Article page: the full post + a small pool of related cards + categories,
   * all in parallel sharing a single categories fetch. Related posts use
   * summary mode (cards only) instead of pulling every post's full HTML.
   */
  async function getArticleData(slug: string): Promise<{ article: SitePost | null; related: SitePost[] }> {
    if (!base) return { article: null, related: [] }
    // Related cards + categories are best-effort: a failure just hides them.
    const [related, cats] = await Promise.all([
      fetchPostsRaw({ status: 'published', summary: true, limit: 12 }),
      fetchCategoriesRaw(),
    ])
    // The MAIN post fetch must NOT swallow transient failures. Previously a
    // `.catch(() => null)` turned a timeout / 5xx into `null`, which the page
    // then rendered as a 404 — making Google DEINDEX a live article. Only a
    // real 404 from the API means "no such post"; any other error is rethrown
    // so the page can return 503 (Google retries later and keeps the page).
    let postRes: { data?: { post: any } } | null = null
    try {
      postRes = await $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`, { timeout: 6000 })
    } catch (e: any) {
      const status = e?.statusCode ?? e?.response?.status
      if (status === 404) postRes = null
      else throw e
    }
    const catMap = buildCatMap(cats)
    return {
      article: postRes?.data?.post ? map(postRes.data.post, catMap) : null,
      related: related.map((p) => map(p, catMap)),
    }
  }

  return { getPosts, getPostBySlug, getCategories, getHubIndex, getArticleData }
}
