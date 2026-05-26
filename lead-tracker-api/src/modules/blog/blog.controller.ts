import { Request, Response, NextFunction } from 'express'
import { blogService } from './blog.service'
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
      const { category, tag, featured, search, published } = req.query

      if (typeof category === 'string') filter.category = category
      if (typeof tag === 'string') filter.tag = tag
      if (typeof search === 'string') filter.search = search
      if (typeof featured === 'string') filter.featured = featured === 'true'
      if (typeof published === 'string') filter.published = published === 'true'

      const posts = await blogService.getPosts(
        Object.keys(filter).length ? filter : undefined
      )

      success(res, { posts, total: posts.length })
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
      created(res, {
        message: 'Blog post created successfully',
        post: { id: post.id, slug: post.slug },
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
      const post = await blogService.updatePost(id, (req as any).validatedBody)

      if (!post) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Blog post not found' },
        })
        return
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

      success(res, { message: 'Blog post deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
