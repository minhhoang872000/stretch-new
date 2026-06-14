/**
 * Blog data — proxied from the lead-tracker-api (Postgres, the source the CMS
 * writes to). The API stores a bilingual shape with CKEditor HTML content;
 * here we map it to the flat shape the Sharing Hub pages consume, exposing a
 * single `html` field for v-html rendering.
 */

export interface SitePost {
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

function apiBase(): string {
  const cfg = useRuntimeConfig()
  return cfg.public.trackingApiUrl
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Join the CKEditor section(s) into a single HTML string. */
function contentToHtml(sections: any[]): string {
  if (!Array.isArray(sections)) return ''
  return sections.map((s) => s?.text || '').filter(Boolean).join('\n')
}

async function fetchCategoryMap(base: string): Promise<Record<string, string>> {
  try {
    const res = await $fetch<{ data?: { categories: any[] } }>(`${base}/api/v1/categories`, { timeout: 4000 })
    const map: Record<string, string> = {}
    for (const c of res?.data?.categories || []) map[c.key] = c.label
    return map
  } catch {
    return {}
  }
}

export function mapApiPost(p: any, catMap: Record<string, string> = {}): SitePost {
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

/** Fetch the published post list, mapped to the site shape. */
export async function fetchSitePosts(filters: { status?: string; categoryKey?: string; search?: string } = {}): Promise<SitePost[]> {
  const base = apiBase()
  if (!base) return []
  const query: Record<string, any> = { limit: 100 }
  // Public site only shows published posts.
  query.published = filters.status === 'draft' ? 'false' : 'true'
  if (filters.categoryKey) query.category = filters.categoryKey
  if (filters.search) query.search = filters.search

  const [res, catMap] = await Promise.all([
    $fetch<{ data?: { posts: any[] } }>(`${base}/api/v1/blog`, { query, timeout: 6000 }).catch(() => null),
    fetchCategoryMap(base),
  ])
  return (res?.data?.posts || []).map((p) => mapApiPost(p, catMap))
}

/** Fetch a single post by slug, mapped to the site shape (or null). */
export async function fetchSitePostBySlug(slug: string): Promise<SitePost | null> {
  const base = apiBase()
  if (!base) return null
  const [res, catMap] = await Promise.all([
    $fetch<{ data?: { post: any } }>(`${base}/api/v1/blog/${slug}`, { timeout: 6000 }).catch(() => null),
    fetchCategoryMap(base),
  ])
  if (!res?.data?.post) return null
  return mapApiPost(res.data.post, catMap)
}
