import { products } from '~/server/utils/db'

export default defineEventHandler(() => {
  return [
    { loc: '/', priority: 1.0 },
    { loc: '/products', priority: 0.9 },
    { loc: '/booking', priority: 0.8 },
    { loc: '/about', priority: 0.5 },
    ...products.map(p => ({
      loc: `/products/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.7,
    })),
  ]
})
