import { describe, it, expect } from 'vitest'
import { createBlogPostSchema } from '../src/modules/blog/blog.schema'

const base = {
  slug: 'my-post',
  titleEn: 'Title',
  titleVi: 'Title',
  category: 'articles',
}

describe('createBlogPostSchema', () => {
  it('accepts a CRM-style payload', () => {
    const r = createBlogPostSchema.safeParse(base)
    expect(r.success).toBe(true)
  })

  it('accepts a section with an empty title (single content blob)', () => {
    const r = createBlogPostSchema.safeParse({
      ...base,
      contentEn: [{ id: 'content', type: 'text', title: '', text: '<p>hi</p>' }],
    })
    expect(r.success).toBe(true)
  })

  it('accepts a dynamic (non-enum) category key', () => {
    const r = createBlogPostSchema.safeParse({ ...base, category: 'some_custom_key' })
    expect(r.success).toBe(true)
  })

  it('rejects an invalid slug', () => {
    const r = createBlogPostSchema.safeParse({ ...base, slug: 'Not Valid Slug!' })
    expect(r.success).toBe(false)
  })

  it('rejects a missing required title', () => {
    const { titleEn, ...rest } = base
    const r = createBlogPostSchema.safeParse(rest)
    expect(r.success).toBe(false)
  })
})
