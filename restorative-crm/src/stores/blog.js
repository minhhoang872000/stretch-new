import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { blogStats, blogPosts } from '@/data/mockData.js'

export const useBlogStore = defineStore('blog', () => {
  const stats = ref(blogStats)
  const posts = ref(blogPosts)

  // Filters state
  const searchQuery = ref('')
  const filterCategory = ref('')
  const filterStatus = ref('')

  // Reactive computed list based on current filters
  const filteredPosts = computed(() => {
    return posts.value.filter(post => {
      // Search by title or author
      const matchesSearch = !searchQuery.value ||
        post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.value.toLowerCase())

      // Filter by Category
      const matchesCategory = !filterCategory.value ||
        filterCategory.value === 'All Categories' ||
        post.category.toLowerCase() === filterCategory.value.toLowerCase()

      // Filter by Status
      const matchesStatus = !filterStatus.value ||
        filterStatus.value === 'Status: All' ||
        post.status.toLowerCase() === filterStatus.value.toLowerCase()

      return matchesSearch && matchesCategory && matchesStatus
    })
  })

  return { 
    stats, 
    posts, 
    searchQuery, 
    filterCategory, 
    filterStatus, 
    filteredPosts 
  }
})
