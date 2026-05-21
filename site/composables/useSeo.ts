interface SeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
}

export function useSeo(opts: SeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const canonicalUrl = `${config.public.siteUrl}${route.path}`

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogImage: opts.image || '/og-default.jpg',
    ogUrl: canonicalUrl,
    ogType: opts.type || 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    twitterImage: opts.image || '/og-default.jpg',
    robots: opts.noIndex ? 'noindex, nofollow' : 'index, follow',
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
