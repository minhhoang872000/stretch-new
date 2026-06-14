import { pool } from '../../config/db'
import type { BlogPost, BlogPostFilter } from '../../types'

/**
 * Data access layer for blog posts.
 */
export const blogRepository = {

  async createPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    const id = `bp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()
    const publishedAt = data.publishedAt || now

    const sql = `
      INSERT INTO blog_posts (
        id, slug, title_en, title_vi, excerpt_en, excerpt_vi,
        content_en, content_vi, category, tags, cover_image,
        author, read_time, featured, published, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `
    const result = await pool.query(sql, [
      id, data.slug, data.titleEn, data.titleVi,
      data.excerptEn || null, data.excerptVi || null,
      JSON.stringify(data.contentEn || []), JSON.stringify(data.contentVi || []),
      data.category, JSON.stringify(data.tags || []),
      data.coverImage || null, data.author || 'Stretch Team',
      data.readTime || null, data.featured ?? false, data.published ?? true,
      publishedAt, now, now,
    ])

    return mapBlogRow(result.rows[0])
  },

  async getPosts(
    filter?: BlogPostFilter,
    pagination?: { page?: number; limit?: number }
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Default: only show published posts (unless explicitly filtered or admin includes drafts)
    if (filter?.published !== undefined) {
      conditions.push(`published = $${paramIndex++}`)
      params.push(filter.published)
    } else if (!filter?.includeUnpublished) {
      conditions.push(`published = true`)
    }

    if (filter?.category) {
      conditions.push(`category = $${paramIndex++}`)
      params.push(filter.category)
    }

    if (filter?.featured !== undefined) {
      conditions.push(`featured = $${paramIndex++}`)
      params.push(filter.featured)
    }

    if (filter?.tag) {
      conditions.push(`tags @> $${paramIndex++}::jsonb`)
      params.push(JSON.stringify([filter.tag]))
    }

    if (filter?.search) {
      conditions.push(`(
        title_en ILIKE $${paramIndex} OR title_vi ILIKE $${paramIndex}
        OR excerpt_en ILIKE $${paramIndex} OR excerpt_vi ILIKE $${paramIndex}
      )`)
      params.push(`%${filter.search}%`)
      paramIndex++
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const order = 'ORDER BY featured DESC, published_at DESC'

    // Pagination is opt-in: without page/limit, return the full list (used by the public site).
    const usePaging = !!(pagination && (pagination.page || pagination.limit))
    if (!usePaging) {
      const result = await pool.query(`SELECT * FROM blog_posts ${where} ${order}`, params)
      const posts = result.rows.map(mapBlogRow)
      return { posts, total: posts.length }
    }

    const page = Math.max(1, pagination!.page || 1)
    const limit = Math.min(Math.max(1, pagination!.limit || 20), 100)
    const offset = (page - 1) * limit

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM blog_posts ${where}`, params)
    const total = parseInt(countResult.rows[0].total, 10)

    const dataResult = await pool.query(
      `SELECT * FROM blog_posts ${where} ${order} LIMIT ${limit} OFFSET ${offset}`,
      params
    )
    return { posts: dataResult.rows.map(mapBlogRow), total }
  },

  async getStats(): Promise<{ total: number; published: number; draft: number }> {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE published)::int AS published,
         COUNT(*) FILTER (WHERE NOT published)::int AS draft
       FROM blog_posts`
    )
    const row = result.rows[0] || {}
    return { total: row.total || 0, published: row.published || 0, draft: row.draft || 0 }
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE slug = $1',
      [slug]
    )
    return result.rows.length ? mapBlogRow(result.rows[0]) : null
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    // Accept either the internal id or the unique slug as identifier.
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1 OR slug = $1',
      [id]
    )
    return result.rows.length ? mapBlogRow(result.rows[0]) : null
  },

  async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost | null> {
    // Build dynamic SET clause
    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    const fieldMap: Record<string, string> = {
      slug: 'slug',
      titleEn: 'title_en',
      titleVi: 'title_vi',
      excerptEn: 'excerpt_en',
      excerptVi: 'excerpt_vi',
      contentEn: 'content_en',
      contentVi: 'content_vi',
      category: 'category',
      tags: 'tags',
      coverImage: 'cover_image',
      author: 'author',
      readTime: 'read_time',
      featured: 'featured',
      published: 'published',
      publishedAt: 'published_at',
    }

    for (const [key, column] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        const value = (data as any)[key]
        // JSONB fields need JSON.stringify
        if (['contentEn', 'contentVi', 'tags'].includes(key)) {
          setClauses.push(`${column} = $${paramIndex++}`)
          params.push(JSON.stringify(value))
        } else {
          setClauses.push(`${column} = $${paramIndex++}`)
          params.push(value)
        }
      }
    }

    if (setClauses.length === 0) return this.getPostById(id)

    setClauses.push(`updated_at = $${paramIndex++}`)
    params.push(new Date().toISOString())

    params.push(id)
    const sql = `UPDATE blog_posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} OR slug = $${paramIndex} RETURNING *`

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    return mapBlogRow(result.rows[0])
  },

  /** Deletes by id or slug. Returns the deleted post (for cleanup) or null if not found. */
  async deletePost(id: string): Promise<BlogPost | null> {
    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 OR slug = $1 RETURNING *',
      [id]
    )
    return result.rows.length ? mapBlogRow(result.rows[0]) : null
  },
}

// ─── Row Mapper ──────────────────────────────────────────────────────

function mapBlogRow(row: any): BlogPost {
  const contentEn = typeof row.content_en === 'string' ? JSON.parse(row.content_en) : (row.content_en || [])
  const contentVi = typeof row.content_vi === 'string' ? JSON.parse(row.content_vi) : (row.content_vi || [])
  const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || [])

  return {
    id: row.id,
    slug: row.slug,
    titleEn: row.title_en,
    titleVi: row.title_vi,
    excerptEn: row.excerpt_en || null,
    excerptVi: row.excerpt_vi || null,
    contentEn,
    contentVi,
    category: row.category,
    tags,
    coverImage: row.cover_image || null,
    author: row.author || 'Stretch Team',
    readTime: row.read_time || null,
    featured: !!row.featured,
    published: !!row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
