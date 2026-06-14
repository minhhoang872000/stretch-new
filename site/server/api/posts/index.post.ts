import { createPost } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const required = ['slug', 'title', 'excerpt', 'category', 'categoryKey', 'image', 'author', 'readTime', 'date']
  for (const field of required) {
    if (!body[field]) {
      throw createError({ statusCode: 400, message: `Missing required field: ${field}` })
    }
  }

  // categoryKey references a category managed in the lead-tracker-api.
  // Validate the format only (lowercase, digits, underscores) — the set of
  // valid keys is dynamic, so we don't hardcode it here.
  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(body.categoryKey)) {
    throw createError({ statusCode: 400, message: 'Invalid categoryKey format (use lowercase letters, digits and underscores)' })
  }

  return createPost({
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt,
    category: body.category,
    categoryKey: body.categoryKey,
    image: body.image,
    author: body.author,
    readTime: body.readTime,
    date: body.date,
    tags: body.tags ?? [],
    status: body.status === 'published' ? 'published' : 'draft',
    sections: body.sections ?? [],
  })
})
