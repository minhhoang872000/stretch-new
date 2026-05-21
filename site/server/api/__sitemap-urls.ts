import { products } from '~/server/utils/db'

export default defineEventHandler(() => {
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
  ]
})
