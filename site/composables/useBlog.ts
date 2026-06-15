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

function mapApiPost(p: any, catMap: Record<string, string>): SitePost {
  const sections = (Array.isArray(p.contentVi) && p.contentVi.length ? p.contentVi : p.contentEn) || []
  return {
    slug: p.slug,
    title: p.titleVi || p.titleEn || '',
    excerpt: p.excerptVi || p.excerptEn || '',
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

export function useBlogClient() {
  const base = (useRuntimeConfig().public.trackingApiUrl as string) || ''

  // ── Low-level fetchers (no category-label resolution) ───────────────
  async function fetchCategoriesRaw(): Promise<any[]> {
    if (!base) return []
    const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`).catch(() => null)
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
    const res = await $fetch<{ data?: { posts: any[] } }>(`${base}/api/v1/blog`, { query }).catch(() => null)
    return res?.data?.posts || []
  }

  // ── Public API (resolve category labels, single categories fetch) ───
  async function getPosts(filters: PostQuery = {}): Promise<SitePost[]> {
    const [posts, cats] = await Promise.all([fetchPostsRaw(filters), fetchCategoriesRaw()])
    const catMap = buildCatMap(cats)
    return posts.map((p) => mapApiPost(p, catMap))
  }

  async function getPostBySlug(slug: string): Promise<SitePost | null> {
    if (!base) return null
    const [res, cats] = await Promise.all([
      $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`).catch(() => null),
      fetchCategoriesRaw(),
    ])
    if (!res?.data?.post) return null
    return mapApiPost(res.data.post, buildCatMap(cats))
  }

  async function getCategories(): Promise<{ key: string; label: string }[]> {
    return (await fetchCategoriesRaw()).map((c) => ({ key: c.key, label: c.label }))
  }

  /**
   * Sharing Hub index: ONE categories call + ONE posts call, in parallel.
   * Posts come back in summary mode (no HTML body) since the listing only
   * renders cards — saves transferring every post's full content.
   */
  async function getHubIndex(): Promise<{ categories: { key: string; label: string }[]; posts: SitePost[] }> {
    const [cats, posts] = await Promise.all([
      fetchCategoriesRaw(),
      fetchPostsRaw({ status: 'published', summary: true }),
    ])
    const catMap = buildCatMap(cats)
    return {
      categories: cats.map((c) => ({ key: c.key, label: c.label })),
      posts: posts.map((p) => mapApiPost(p, catMap)),
    }
  }

  /**
   * Article page: the full post + a small pool of related cards + categories,
   * all in parallel sharing a single categories fetch. Related posts use
   * summary mode (cards only) instead of pulling every post's full HTML.
   */
  async function getArticleData(slug: string): Promise<{ article: SitePost | null; related: SitePost[] }> {
    if (!base) return { article: null, related: [] }
    const [postRes, related, cats] = await Promise.all([
      $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`).catch(() => null),
      fetchPostsRaw({ status: 'published', summary: true, limit: 12 }),
      fetchCategoriesRaw(),
    ])
    const catMap = buildCatMap(cats)
    return {
      article: postRes?.data?.post ? mapApiPost(postRes.data.post, catMap) : null,
      related: related.map((p) => mapApiPost(p, catMap)),
    }
  }

  return { getPosts, getPostBySlug, getCategories, getHubIndex, getArticleData }
}
