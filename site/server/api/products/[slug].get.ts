import { getProductBySlug } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug parameter' })
  }

  const product = getProductBySlug(slug)

  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  return product
})
