import { Request, Response, NextFunction } from 'express'
import { blogService } from './blog.service'
import { imagesService, collectPostImageUrls } from '../images/images.service'
import { success, created } from '../../utils/response'
import type { BlogPostFilter } from '../../types'

export const blogController = {

  /**
   * GET /api/v1/blog
   * List blog posts with optional filters: category, tag, featured, search, published
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: BlogPostFilter = {}
      const { category, tag, featured, search, published, includeUnpublished } = req.query

      if (typeof category === 'string') filter.category = category
      if (typeof tag === 'string') filter.tag = tag
      if (typeof search === 'string') filter.search = search
      if (typeof featured === 'string') filter.featured = featured === 'true'
      if (typeof published === 'string') filter.published = published === 'true'
      // Admin listing (CRM) passes includeUnpublished=true to also get drafts.
      if (includeUnpublished === 'true') filter.includeUnpublished = true

      // Pagination is opt-in (CRM admin); the public site omits page/limit to get all.
      const pageRaw = parseInt(req.query.page as string, 10)
      const limitRaw = parseInt(req.query.limit as string, 10)
      const pagination =
        Number.isFinite(pageRaw) || Number.isFinite(limitRaw)
          ? { page: Number.isFinite(pageRaw) ? pageRaw : 1, limit: Number.isFinite(limitRaw) ? limitRaw : 20 }
          : undefined

      const { posts, total } = await blogService.getPosts(
        Object.keys(filter).length ? filter : undefined,
        pagination
      )

      success(res, {
        posts,
        total,
        ...(pagination ? { page: pagination.page, limit: pagination.limit } : {}),
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/blog/stats
   * Aggregate counts across all posts (admin dashboard). totalViews is not tracked yet.
   */
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await blogService.getStats()
      success(res, { ...stats, totalViews: 0 })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/blog/:slug
   * Get a single blog post by slug
   */
  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string
      const post = await blogService.getPostBySlug(slug)

      if (!post) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Blog post not found' },
        })
        return
      }

      success(res, { post })
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/blog
   * Create a new blog post
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await blogService.createPost((req as any).validatedBody)
      // Return the full post so create/update/getBySlug all share one response shape.
      created(res, {
        message: 'Blog post created successfully',
        post,
      })
    } catch (err) {
      next(err)
    }
  },

  /**
   * PATCH /api/v1/blog/:id
   * Update an existing blog post
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const before = await blogService.getPostById(id)
      const post = await blogService.updatePost(id, (req as any).validatedBody)

      if (!post) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Blog post not found' },
        })
        return
      }

      // Best-effort: drop R2 images that were referenced before but no longer are.
      if (before) {
        const next = new Set(collectPostImageUrls(post))
        const removed = collectPostImageUrls(before).filter((u) => !next.has(u))
        if (removed.length) void imagesService.deleteManyByUrls(removed)
      }

      success(res, { message: 'Blog post updated', post })
    } catch (err) {
      next(err)
    }
  },

  /**
   * DELETE /api/v1/blog/:id
   * Delete a blog post
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const deleted = await blogService.deletePost(id)

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Blog post not found' },
        })
        return
      }

      // Best-effort: remove the post's images from R2 so they don't orphan.
      void imagesService.deleteManyByUrls(collectPostImageUrls(deleted))

      success(res, { message: 'Blog post deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
