import { getApiInstance } from '~/services/api'

/**
 * Products composable — adaptive API calls.
 *
 * Uses external API when configured, otherwise falls back to
 * Nuxt's internal /api/products routes.
 */
export function useProducts() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.trackingApiUrl as string
  const { locale } = useI18n()

  const rawProducts = ref<any[]>([])
  const pending = ref(true)
  const error = ref<any>(null)

  async function fetchProducts() {
    pending.value = true
    error.value = null
    try {
      if (apiUrl) {
        const api = getApiInstance(apiUrl)
        const res = await api.get('/api/v1/bookings/products')
        rawProducts.value = res.data?.data || res.data || []
      } else {
        const data = await $fetch<any[]>('/api/products')
        rawProducts.value = data || []
      }
    } catch (e: any) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  // Fetch on init
  fetchProducts()

  const products = computed(() => {
    return rawProducts.value.map((p: any) => ({
      ...p,
      name: locale.value === 'vi' ? p.nameVi : p.nameEn,
      shortDescription: locale.value === 'vi' ? p.shortDescriptionVi : p.shortDescriptionEn,
    }))
  })

  return { products, pending, error, refetch: fetchProducts }
}
