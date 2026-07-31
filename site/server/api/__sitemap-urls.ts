import { fetchSitePosts } from '~/server/utils/blogApi'

const SITE = 'https://stretch.vn'

// The site serves every Vietnamese page under the default English path with a
// `/vi` prefix (i18n `customRoutes` stays at its default 'page', so the
// translated `goc-chia-se` / `kinh-doanh` paths are NOT active — see nuxt.config).
// Static pages get their `/vi` variant automatically from the i18n app source,
// but custom-source URLs (blog posts) do not — so we emit BOTH locales
// here, each with hreflang alternates linking the two language versions.
function bilingual(path: string, extra: { lastmod?: string; priority?: number } = {}) {
  const en = `${SITE}${path}`
  const vi = `${SITE}/vi${path}`
  const alternatives = [
    { hreflang: 'en-US', href: en },
    { hreflang: 'vi-VN', href: vi },
    { hreflang: 'x-default', href: en },
  ]
  return [
    { loc: path, ...extra, alternatives },
    { loc: `/vi${path}`, ...extra, alternatives },
  ]
}

export default defineEventHandler(async () => {
  // Blog posts come from the lead-tracker-api (live CMS data), not the mock DB.
  const publishedPosts = await fetchSitePosts({ status: 'published' })

  return [
    { loc: '/', priority: 1.0 },
    { loc: '/individual', priority: 0.9 },
    { loc: '/business', priority: 0.9 },
    { loc: '/business/corporate-wellness', priority: 0.8 },
    { loc: '/business/education-training', priority: 0.8 },
    { loc: '/business/recovery-event', priority: 0.8 },
    { loc: '/booking', priority: 0.8 },
    // Sharing Hub (blog) index + published posts (en + vi, from the API)
    { loc: '/sharing-hub', priority: 0.8 },
    ...publishedPosts.flatMap(p => bilingual(`/sharing-hub/${p.slug}`, {
      lastmod: p.updatedAt || undefined,
      priority: 0.7,
    })),
  ]
})
