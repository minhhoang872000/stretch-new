import { fetchSitePosts } from '~/server/utils/blogApi'
import { fetchPrograms } from '~~/server/utils/academyApi'

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

export default defineEventHandler(async (event) => {
  // Blog posts come from the lead-tracker-api (live CMS data), not the mock DB.
  // Programmes come from the same API; their detail pages are rendered on
  // demand and no page links every slug (the catalogue paginates at 8), so the
  // sitemap is the one reliable way for Google to find them all.
  const [publishedPosts, programs] = await Promise.all([
    fetchSitePosts({ status: 'published' }),
    fetchPrograms(event),
  ])

  return [
    { loc: '/', priority: 1.0 },
    { loc: '/individual', priority: 0.9 },
    { loc: '/business', priority: 0.9 },
    { loc: '/business/corporate-wellness', priority: 0.8 },
    { loc: '/business/education-training', priority: 0.8 },
    { loc: '/business/recovery-event', priority: 0.8 },
    { loc: '/booking', priority: 0.8 },
    { loc: '/vi/learning-hub', priority: 0.8 },
    // Sharing Hub (blog) index + published posts (en + vi, from the API)
    { loc: '/sharing-hub', priority: 0.8 },
    // A post without a real English translation exists only in Vietnamese: its
    // English URL canonicalises to /vi (see pages/sharing-hub/[slug].vue), so it
    // is listed once, with no hreflang pair.
    ...publishedPosts.flatMap(p => p.hasEn
      ? bilingual(`/sharing-hub/${p.slug}`, { lastmod: p.updatedAt || undefined, priority: 0.7 })
      : [{ loc: `/vi/sharing-hub/${p.slug}`, lastmod: p.updatedAt || undefined, priority: 0.7 }]),
    // The Learning Hub is Vietnamese-only for now (useSeo `viOnly`), so only
    // the /vi URLs are listed.
    ...programs
      .filter(p => p.slug && (!p.status || p.status === 'published'))
      .map(p => ({ loc: `/vi/learning-hub/programs/${p.slug}`, priority: 0.7 })),
  ]
})
