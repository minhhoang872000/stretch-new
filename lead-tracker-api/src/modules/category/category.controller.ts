import { Request, Response, NextFunction } from 'express'
import { categoryService } from './category.service'
import { success, created } from '../../utils/response'

function isDuplicateKeyError(err: any): boolean {
  return err && err.code === '23505'
}

export const categoryController = {

  /**
   * GET /api/v1/categories
   * List all categories ordered by sort order.
   */
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories()
      success(res, { categories, total: categories.length })
    } catch (err) {
      next(err)
    }
  },

  /**
   * GET /api/v1/categories/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const category = await categoryService.getCategoryById(id)

      if (!category) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' },
        })
        return
      }

      success(res, { category })
    } catch (err) {
      next(err)
    }
  },

  /**
   * POST /api/v1/categories
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory((req as any).validatedBody)
      created(res, { message: 'Category created successfully', category })
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_KEY', message: 'A category with this key already exists' },
        })
        return
      }
      next(err)
    }
  },

  /**
   * PATCH /api/v1/categories/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const category = await categoryService.updateCategory(id, (req as any).validatedBody)

      if (!category) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' },
        })
        return
      }

      success(res, { message: 'Category updated', category })
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_KEY', message: 'A category with this key already exists' },
        })
        return
      }
      next(err)
    }
  },

  /**
   * DELETE /api/v1/categories/:id
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const deleted = await categoryService.deleteCategory(id)

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' },
        })
        return
      }

      success(res, { message: 'Category deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
