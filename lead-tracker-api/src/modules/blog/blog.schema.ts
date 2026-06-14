import { z } from 'zod'

// ─── Section Schema ──────────────────────────────────────────────────

const blogSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional().default(''),
  type: z.string().min(1),
  text: z.string().optional(),
  quote: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  image: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    desc: z.string(),
    icon: z.string().optional(),
  })).optional(),
})

// ─── Create Blog Post ────────────────────────────────────────────────

export const createBlogPostSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)'),
  titleEn: z.string().min(1).max(500),
  titleVi: z.string().min(1).max(500),
  excerptEn: z.string().max(2000).optional().nullable(),
  excerptVi: z.string().max(2000).optional().nullable(),
  contentEn: z.array(blogSectionSchema).optional().default([]),
  contentVi: z.array(blogSectionSchema).optional().default([]),
  // Dynamic categories (keys live in the categories table), so accept any key string.
  category: z.string().min(1).max(60),
  tags: z.array(z.string()).optional().default([]),
  coverImage: z.string().max(500).optional().nullable(),
  author: z.string().max(200).optional().default('Stretch Team'),
  readTime: z.string().max(20).optional().nullable(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  publishedAt: z.string().optional().nullable(),
})

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>

// ─── Update Blog Post ────────────────────────────────────────────────

export const updateBlogPostSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  titleEn: z.string().min(1).max(500).optional(),
  titleVi: z.string().min(1).max(500).optional(),
  excerptEn: z.string().max(2000).optional().nullable(),
  excerptVi: z.string().max(2000).optional().nullable(),
  contentEn: z.array(blogSectionSchema).optional(),
  contentVi: z.array(blogSectionSchema).optional(),
  category: z.string().min(1).max(60).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().max(500).optional().nullable(),
  author: z.string().max(200).optional(),
  readTime: z.string().max(20).optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
})

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
