import { getAvailableProducts } from '~/server/utils/db'

export default defineEventHandler(() => {
  return getAvailableProducts()
})
