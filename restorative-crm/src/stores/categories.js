import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/api.js'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadCategories() {
    loading.value = true
    error.value = null
    try {
      categories.value = await fetchCategories()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addCategory(payload) {
    const cat = await createCategory(payload)
    categories.value.push(cat)
    categories.value.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    return cat
  }

  async function editCategory(id, payload) {
    const updated = await updateCategory(id, payload)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = updated
    return updated
  }

  async function removeCategory(id) {
    await deleteCategory(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    editCategory,
    removeCategory,
  }
})
