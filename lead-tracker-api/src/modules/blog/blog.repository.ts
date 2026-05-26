import { pool } from '../../config/db'
import type { BlogPost, BlogPostFilter } from '../../types'

/**
 * Data access layer for blog posts.
 */
export const blogRepository = {

  async createPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<BlogPost> {
    const id = `bp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()

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
      now, now, now,
    ])

    return mapBlogRow(result.rows[0])
  },

  async getPosts(filter?: BlogPostFilter): Promise<BlogPost[]> {
    let sql = 'SELECT * FROM blog_posts WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    // Default: only show published posts (unless explicitly filtered)
    if (filter?.published !== undefined) {
      sql += ` AND published = $${paramIndex++}`
      params.push(filter.published)
    } else {
      sql += ` AND published = true`
    }

    if (filter?.category) {
      sql += ` AND category = $${paramIndex++}`
      params.push(filter.category)
    }

    if (filter?.featured !== undefined) {
      sql += ` AND featured = $${paramIndex++}`
      params.push(filter.featured)
    }

    if (filter?.tag) {
      sql += ` AND tags @> $${paramIndex++}::jsonb`
      params.push(JSON.stringify([filter.tag]))
    }

    if (filter?.search) {
      sql += ` AND (
        title_en ILIKE $${paramIndex} OR title_vi ILIKE $${paramIndex}
        OR excerpt_en ILIKE $${paramIndex} OR excerpt_vi ILIKE $${paramIndex}
      )`
      params.push(`%${filter.search}%`)
      paramIndex++
    }

    sql += ' ORDER BY featured DESC, published_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapBlogRow)
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE slug = $1',
      [slug]
    )
    return result.rows.length ? mapBlogRow(result.rows[0]) : null
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1',
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
    const sql = `UPDATE blog_posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    return mapBlogRow(result.rows[0])
  },

  async deletePost(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
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
