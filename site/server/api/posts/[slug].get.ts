import { fetchSitePostBySlug } from '~/server/utils/blogApi'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' })

  const post = await fetchSitePostBySlug(slug)
  if (!post) throw createError({ statusCode: 404, message: 'Post not found' })

  return post
})
