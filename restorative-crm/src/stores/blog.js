import { defineStore } from 'pinia'
import { ref } from 'vue'
import { blogStats, blogPosts } from '@/data/mockData.js'

export const useBlogStore = defineStore('blog', () => {
  const stats = ref(blogStats)
  const posts = ref(blogPosts)

  return { stats, posts }
})
