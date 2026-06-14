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

export function useBlogClient() {
  const base = (useRuntimeConfig().public.trackingApiUrl as string) || ''

  async function fetchCatMap(): Promise<Record<string, string>> {
    try {
      const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`)
      const map: Record<string, string> = {}
      for (const c of res?.data?.categories || []) map[c.key] = c.label
      return map
    } catch {
      return {}
    }
  }

  async function getPosts(filters: { status?: string; categoryKey?: string; search?: string } = {}): Promise<SitePost[]> {
    if (!base) return []
    const query: Record<string, any> = { limit: 100, published: filters.status === 'draft' ? 'false' : 'true' }
    if (filters.categoryKey) query.category = filters.categoryKey
    if (filters.search) query.search = filters.search
    const [res, catMap] = await Promise.all([
      $fetch<{ data?: { posts: any[] } }>(`${base}/api/v1/blog`, { query }).catch(() => null),
      fetchCatMap(),
    ])
    return (res?.data?.posts || []).map((p) => mapApiPost(p, catMap))
  }

  async function getPostBySlug(slug: string): Promise<SitePost | null> {
    if (!base) return null
    const [res, catMap] = await Promise.all([
      $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`).catch(() => null),
      fetchCatMap(),
    ])
    if (!res?.data?.post) return null
    return mapApiPost(res.data.post, catMap)
  }

  async function getCategories(): Promise<{ key: string; label: string }[]> {
    if (!base) return []
    const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`).catch(() => null)
    return (res?.data?.categories || []).map((c: any) => ({ key: c.key, label: c.label }))
  }

  return { getPosts, getPostBySlug, getCategories }
}
