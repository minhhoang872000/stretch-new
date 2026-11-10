import { fetchSitePosts } from '~/server/utils/blogApi'
import { fetchPrograms } from '~~/server/utils/academyApi'

const SITE = 'https://stretch.vn'

const lastGood: {
  posts: Awaited<ReturnType<typeof fetchSitePosts>>
  programs: Awaited<ReturnType<typeof fetchPrograms>>
} = { posts: [], programs: [] }

// The site serves every Vietnamese page under the default English path with a
// `/vi` prefix (i18n `customRoutes` stays at its default 'page', so the
// translated `goc-chia-se` / `kinh-doanh` paths are NOT active — see nuxt.config).
// The module does not add the `/vi` twin of a source URL (and since the sitemap
// stopped being prerendered, it no longer learns the static pages' twins from
// the prerender either), so every bilingual page is emitted here in BOTH
// locales, each with hreflang alternates linking the two versions.
function bilingual(path: string, extra: { lastmod?: string; priority?: number } = {}) {
  const viPath = path === '/' ? '/vi' : `/vi${path}`
  const en = `${SITE}${path}`
  const vi = `${SITE}${viPath}`
  const alternatives = [
    { hreflang: 'en-US', href: en },
    { hreflang: 'vi-VN', href: vi },
    { hreflang: 'x-default', href: en },
  ]
  return [
    { loc: path, ...extra, alternatives },
    { loc: viPath, ...extra, alternatives },
  ]
}

export default defineEventHandler(async (event) => {
  // Blog posts come from the lead-tracker-api (live CMS data), not the mock DB.
  // Programmes come from the same API; their detail pages are rendered on
  // demand and no page links every slug (the catalogue paginates at 8), so the
  // sitemap is the one reliable way for Google to find them all.
  //
  // The sitemap is rendered at request time now, and both fetches turn an API
  // failure (the free Render instance asleep) into an empty list. Fall back to
  // the last good list on this isolate rather than publish a sitemap with every
  // post missing for the module's 10-minute cache window.
  const [freshPosts, freshPrograms] = await Promise.all([
    fetchSitePosts({ status: 'published' }),
    fetchPrograms(event),
  ])
  if (freshPosts.length) lastGood.posts = freshPosts
  if (freshPrograms.length) lastGood.programs = freshPrograms
  const publishedPosts = freshPosts.length ? freshPosts : lastGood.posts
  const programs = freshPrograms.length ? freshPrograms : lastGood.programs

  return [
    ...bilingual('/', { priority: 1.0 }),
    ...bilingual('/individual', { priority: 0.9 }),
    ...bilingual('/business', { priority: 0.9 }),
    ...bilingual('/business/corporate-wellness', { priority: 0.8 }),
    ...bilingual('/business/education-training', { priority: 0.8 }),
    ...bilingual('/business/recovery-event', { priority: 0.8 }),
    ...bilingual('/booking', { priority: 0.8 }),
    // Learning Hub: Vietnamese-only for now (useSeo `viOnly`).
    { loc: '/vi/learning-hub', priority: 0.8 },
    { loc: '/vi/learning-hub/programs', priority: 0.8 },
    { loc: '/vi/learning-hub/schedule', priority: 0.7 },
    // Sharing Hub (blog) index + published posts (from the API)
    ...bilingual('/sharing-hub', { priority: 0.8 }),
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
