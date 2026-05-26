import { blogRepository } from './blog.repository'
import type { CreateBlogPostInput, UpdateBlogPostInput } from './blog.schema'
import type { BlogPost, BlogPostFilter } from '../../types'

/**
 * Business logic for blog posts.
 */
export const blogService = {

  async createPost(data: CreateBlogPostInput): Promise<BlogPost> {
    return blogRepository.createPost({
      slug: data.slug,
      titleEn: data.titleEn,
      titleVi: data.titleVi,
      excerptEn: data.excerptEn || null,
      excerptVi: data.excerptVi || null,
      contentEn: data.contentEn || [],
      contentVi: data.contentVi || [],
      category: data.category,
      tags: data.tags || [],
      coverImage: data.coverImage || null,
      author: data.author || 'Stretch Team',
      readTime: data.readTime || null,
      featured: data.featured ?? false,
      published: data.published ?? true,
    } as any)
  },

  async getPosts(filter?: BlogPostFilter): Promise<BlogPost[]> {
    return blogRepository.getPosts(filter)
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return blogRepository.getPostBySlug(slug)
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    return blogRepository.getPostById(id)
  },

  async updatePost(id: string, data: UpdateBlogPostInput): Promise<BlogPost | null> {
    return blogRepository.updatePost(id, data as Partial<BlogPost>)
  },

  async deletePost(id: string): Promise<boolean> {
    return blogRepository.deletePost(id)
  },
}
