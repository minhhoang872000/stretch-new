import { z } from 'zod'

// ─── Create Category ─────────────────────────────────────────────────

export const createCategorySchema = z.object({
  key: z.string().min(1).max(60).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, 'Key must be lowercase letters, digits and underscores only'),
  label: z.string().min(1).max(120),
  description: z.string().max(300).optional().nullable(),
  icon: z.string().min(1).max(60).optional().default('category'),
  iconBg: z.string().min(1).max(60).optional().default('bg-teal-50'),
  iconColor: z.string().min(1).max(60).optional().default('text-teal-600'),
  sortOrder: z.number().int().optional().default(0),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// ─── Update Category ─────────────────────────────────────────────────

export const updateCategorySchema = z.object({
  key: z.string().min(1).max(60).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/).optional(),
  label: z.string().min(1).max(120).optional(),
  description: z.string().max(300).optional().nullable(),
  icon: z.string().min(1).max(60).optional(),
  iconBg: z.string().min(1).max(60).optional(),
  iconColor: z.string().min(1).max(60).optional(),
  sortOrder: z.number().int().optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
