import { products, getPosts } from '~/server/utils/db'

export default defineEventHandler(() => {
  const publishedPosts = getPosts({ status: 'published' })

  return [
    { loc: '/', priority: 1.0 },
    { loc: '/individual', priority: 0.9 },
    { loc: '/business', priority: 0.9 },
    { loc: '/business/corporate-wellness', priority: 0.8 },
    { loc: '/business/education-training', priority: 0.8 },
    { loc: '/business/recovery-event', priority: 0.8 },
    { loc: '/products', priority: 0.9 },
    { loc: '/booking', priority: 0.8 },
    ...products.map(p => ({
      loc: `/products/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.7,
    })),
    // Sharing Hub (blog) index + published posts
    { loc: '/sharing-hub', priority: 0.8 },
    ...publishedPosts.map(p => ({
      loc: `/sharing-hub/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.7,
    })),
  ]
})
