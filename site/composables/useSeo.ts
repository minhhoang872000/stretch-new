interface SeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
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

  const canonicalUrl = `${config.public.siteUrl}${route.path}`
  const ogImage = opts.image || '/og-default.jpg'
  const isArticle = opts.type === 'article'

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
    link: [{ rel: 'canonical', href: canonicalUrl }],
    meta: [
      { name: 'geo.position', content: '10.7725;106.6784' },
      { name: 'geo.region', content: 'VN-SG' },
      { name: 'geo.placename', content: 'Ho Chi Minh City' },
      { name: 'ICBM', content: '10.7725, 106.6784' },
    ]
  })
}
