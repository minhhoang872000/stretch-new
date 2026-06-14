import { pool } from '../../config/db'
import type { Category } from '../../types'

/**
 * Data access layer for blog categories.
 */
export const categoryRepository = {

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()

    const sql = `
      INSERT INTO categories (
        id, key, label, description, icon, icon_bg, icon_color, sort_order, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    const result = await pool.query(sql, [
      id, data.key, data.label, data.description || null,
      data.icon || 'category', data.iconBg || 'bg-teal-50', data.iconColor || 'text-teal-600',
      data.sortOrder ?? 0, now, now,
    ])

    return mapCategoryRow(result.rows[0])
  },

  async getCategories(): Promise<Category[]> {
    const result = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, label ASC')
    return result.rows.map(mapCategoryRow)
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    return result.rows.length ? mapCategoryRow(result.rows[0]) : null
  },

  async getCategoryByKey(key: string): Promise<Category | null> {
    const result = await pool.query('SELECT * FROM categories WHERE key = $1', [key])
    return result.rows.length ? mapCategoryRow(result.rows[0]) : null
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    const fieldMap: Record<string, string> = {
      key: 'key',
      label: 'label',
      description: 'description',
      icon: 'icon',
      iconBg: 'icon_bg',
      iconColor: 'icon_color',
      sortOrder: 'sort_order',
    }

    for (const [field, column] of Object.entries(fieldMap)) {
      if ((data as any)[field] !== undefined) {
        setClauses.push(`${column} = $${paramIndex++}`)
        params.push((data as any)[field])
      }
    }

    if (setClauses.length === 0) return this.getCategoryById(id)

    setClauses.push(`updated_at = $${paramIndex++}`)
    params.push(new Date().toISOString())

    params.push(id)
    const sql = `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    return mapCategoryRow(result.rows[0])
  },

  async deleteCategory(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

// ─── Row Mapper ──────────────────────────────────────────────────────

function mapCategoryRow(row: any): Category {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description || null,
    icon: row.icon,
    iconBg: row.icon_bg,
    iconColor: row.icon_color,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
