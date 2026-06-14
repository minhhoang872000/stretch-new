import { categoryRepository } from './category.repository'
import type { CreateCategoryInput, UpdateCategoryInput } from './category.schema'
import type { Category } from '../../types'

/**
 * Business logic for blog categories.
 */
export const categoryService = {

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return categoryRepository.createCategory({
      key: data.key,
      label: data.label,
      description: data.description || null,
      icon: data.icon || 'category',
      iconBg: data.iconBg || 'bg-teal-50',
      iconColor: data.iconColor || 'text-teal-600',
      sortOrder: data.sortOrder ?? 0,
    } as any)
  },

  async getCategories(): Promise<Category[]> {
    return categoryRepository.getCategories()
  },

  async getCategoryById(id: string): Promise<Category | null> {
    return categoryRepository.getCategoryById(id)
  },

  async getCategoryByKey(key: string): Promise<Category | null> {
    return categoryRepository.getCategoryByKey(key)
  },

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    return categoryRepository.updateCategory(id, data as Partial<Category>)
  },

  async deleteCategory(id: string): Promise<boolean> {
    return categoryRepository.deleteCategory(id)
  },
}
