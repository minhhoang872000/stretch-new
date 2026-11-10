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

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogImage,
    ogUrl: canonicalUrl,
    ogType: opts.type || 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
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
