import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchPosts, fetchBlogStats, createPost, updatePost, deletePost } from '@/services/api.js'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Server-side filters
  const searchQuery = ref('')
  const filterCategory = ref('') // category KEY ('' = all)
  const filterStatus = ref('')   // '' | 'published' | 'draft'

  // Server-side pagination
  const page = ref(1)
  const limit = ref(10)
  const total = ref(0)

  // Aggregate stats across ALL posts (not just the current page)
  const stats = ref({ total: 0, published: 0, draft: 0, totalViews: 0 })

  async function loadPosts() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchPosts({
        page: page.value,
        limit: limit.value,
        search: searchQuery.value || undefined,
        categoryKey: filterCategory.value || undefined,
        status: filterStatus.value || undefined,
      })
      posts.value = data.posts
      total.value = data.total
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadStats() {
    try {
      stats.value = await fetchBlogStats()
    } catch {
      /* stats are non-critical; ignore */
    }
  }

  /** Reset to page 1 and reload (call when filters change). */
  function applyFilters() {
    page.value = 1
    loadPosts()
  }

  function setPage(p) {
    page.value = p
    loadPosts()
  }

  async function addPost(data) {
    const post = await createPost(data)
    await Promise.all([loadPosts(), loadStats()])
    return post
  }

  async function editPost(idOrSlug, data) {
    const updated = await updatePost(idOrSlug, data)
    await Promise.all([loadPosts(), loadStats()])
    return updated
  }

  async function removePost(idOrSlug) {
    await deletePost(idOrSlug)
    await Promise.all([loadPosts(), loadStats()])
  }

  async function toggleStatus(slug) {
    const post = posts.value.find(p => p.slug === slug)
    if (!post) return
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await editPost(slug, { status: newStatus })
  }

  return {
    posts,
    loading,
    error,
    searchQuery,
    filterCategory,
    filterStatus,
    page,
    limit,
    total,
    stats,
    loadPosts,
    loadStats,
    applyFilters,
    setPage,
    addPost,
    editPost,
    removePost,
    toggleStatus,
  }
})
