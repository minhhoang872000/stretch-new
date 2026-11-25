interface SeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  /**
   * The page exists only in Vietnamese (its English URL renders Vietnamese
   * text). The English URL then canonicalises to /vi and no hreflang pair is
   * claimed, so Google sees one page instead of two identical ones. The
   * Learning Hub uses this until en.json `learning.*` and the course data are
   * translated — drop the flag then. Keep sitemap.exclude in nuxt.config in step.
   */
  viOnly?: boolean
  /** Extra Open Graph "article:*" metadata (only emitted when type === 'article'). */
  article?: {
    author?: string
    publishedTime?: string
    modifiedTime?: string
    tags?: string[]
  }
}

/** Trim to the ~160 characters a search result shows, on a word boundary. */
export function clipDescription(text: string | undefined, max = 158): string {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).replace(/[\s,;:.–—-]+$/, '')}…`
}

/**
 * BreadcrumbList for any page below a section root (/business/corporate-wellness,
 * /sharing-hub/<slug>, /learning-hub/programs/<slug>): Google shows the trail in
 * place of the raw URL. Built from the route, so a new nested page gets one
 * without asking. The leaf is the page's own title minus the brand suffix.
 */
export function useBreadcrumbSchema(leafTitle: string | (() => string)) {
  const route = useRoute()
  const { t } = useI18n()
  const localePath = useLocalePath()
  const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
  const LABEL: Record<string, () => string> = {
    business: () => t('nav.business'),
    'sharing-hub': () => t('sharing_hub.nav'),
    'learning-hub': () => t('learning.brand'),
    programs: () => t('learning.catalog.title'),
    booking: () => t('nav.bookSession'),
  }
  const segments = route.path.replace(/^\/vi(?=\/|$)/, '').split('/').filter(Boolean)
  if (segments.length < 2) return
  const leaf = () => (typeof leafTitle === 'function' ? leafTitle() : leafTitle).split(/\s[—–|]\s/)[0]
  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: `${siteUrl}${localePath('/')}` },
        ...segments.slice(0, -1).map((seg, i) => ({
          name: LABEL[seg]?.() || seg,
          item: `${siteUrl}${localePath(`/${segments.slice(0, i + 1).join('/')}`)}`,
        })),
        { name: leaf() },
      ],
    }),
  ])
}

export function useSeo(opts: SeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()
  const { locales } = useI18n()

  const siteUrl = config.public.siteUrl as string
  const canonicalUrl = opts.viOnly
    ? `${siteUrl}${switchLocalePath('vi') || route.path}`
    : `${siteUrl}${route.path}`
  const ogImage = opts.image || '/og-default.jpg'
  const isArticle = opts.type === 'article'

  // hreflang alternates for each locale + x-default (points to default locale).
  // None for a Vietnamese-only page or a noindex one (alternates of a page that
  // asks not to be indexed only confuse the set).
  const alternateLinks = (opts.viOnly || opts.noIndex ? [] : (locales.value as any[]))
    .map((l: any) => {
      const path = switchLocalePath(l.code)
      return path ? { rel: 'alternate', hreflang: l.language || l.code, href: `${siteUrl}${path}` } : null
    })
    .filter(Boolean) as { rel: string; hreflang: string; href: string }[]

  const defaultPath = switchLocalePath('en')
  if (defaultPath && alternateLinks.length) {
    alternateLinks.push({ rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${defaultPath}` })
  }

  // Descriptions built from CMS text (a programme's subtitle) can run long;
  // Google cuts them near 160 characters, mid-word.
  const description = clipDescription(opts.description)

  if (!opts.noIndex) useBreadcrumbSchema(opts.title)

  useSeoMeta({
    title: opts.title,
    description,
    ogTitle: opts.title,
    ogDescription: description,
    ogImage,
    ogUrl: canonicalUrl,
    ogType: opts.type || 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: description,
    twitterImage: ogImage,
    robots: opts.noIndex ? 'noindex, nofollow' : 'index, follow',
    // Article-specific Open Graph tags (improves link previews + Google rich results).
    articleAuthor: isArticle ? opts.article?.author : undefined,
    articlePublishedTime: isArticle ? opts.article?.publishedTime : undefined,
    articleModifiedTime: isArticle ? opts.article?.modifiedTime : undefined,
    articleTag: isArticle ? opts.article?.tags : undefined,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }, ...alternateLinks],
    meta: [
      { name: 'geo.position', content: '10.7725;106.6784' },
      { name: 'geo.region', content: 'VN-SG' },
      { name: 'geo.placename', content: 'Ho Chi Minh City' },
      { name: 'ICBM', content: '10.7725, 106.6784' },
    ]
  })
}
