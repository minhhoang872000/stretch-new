import { deletePost } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' })

  const ok = deletePost(slug)
  if (!ok) throw createError({ statusCode: 404, message: 'Post not found' })

  return { success: true }
})
