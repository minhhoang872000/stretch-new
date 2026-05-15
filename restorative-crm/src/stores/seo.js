import { defineStore } from 'pinia'
import { ref } from 'vue'
import { seoPages } from '@/data/mockData.js'

export const useSeoStore = defineStore('seo', () => {
  const pages = ref(seoPages)

  return { pages }
})
