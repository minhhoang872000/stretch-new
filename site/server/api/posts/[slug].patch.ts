import { updatePost } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' })

  const body = await readBody(event)
  const post = updatePost(slug, body)

  if (!post) throw createError({ statusCode: 404, message: 'Post not found' })

  return post
})
