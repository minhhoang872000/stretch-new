import { defineStore } from 'pinia'
import { ref } from 'vue'
import { serviceCategories, servicesList, promoService, serviceStats } from '@/data/mockData.js'

export const useServicesStore = defineStore('services', () => {
  const categories = ref(serviceCategories)
  const services = ref(servicesList)
  const promo = ref(promoService)
  const stats = ref(serviceStats)

  return { categories, services, promo, stats }
})
