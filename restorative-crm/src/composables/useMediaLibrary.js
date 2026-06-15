import { ref } from 'vue'
import { fetchImages, deleteImage, uploadImage, cropImage } from '@/services/api'

/**
 * Shared state + actions for the media library (list / upload / delete).
 * Each caller gets its own independent instance — call it inside setup().
 */
export function useMediaLibrary({ pageSize = 60 } = {}) {
  const images = ref([])
  const cursor = ref(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const uploading = ref(false)
  const error = ref('')

  const hasMore = () => cursor.value !== null

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const { images: list, cursor: next } = await fetchImages({ limit: pageSize })
      images.value = list || []
      cursor.value = next ?? null
    } catch (e) {
      error.value = e.message || 'Không tải được danh sách ảnh.'
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore() || loadingMore.value) return
    loadingMore.value = true
    try {
      const { images: list, cursor: next } = await fetchImages({ cursor: cursor.value, limit: pageSize })
      // de-dupe by key in case a page boundary repeats an item
      const seen = new Set(images.value.map((i) => i.key))
      images.value.push(...(list || []).filter((i) => !seen.has(i.key)))
      cursor.value = next ?? null
    } catch (e) {
      error.value = e.message || 'Không tải thêm được ảnh.'
    } finally {
      loadingMore.value = false
    }
  }

  /**
   * Upload one or more files; newly uploaded images are prepended to the list.
   * Returns the uploaded items (with url) so callers can auto-select, etc.
   */
  async function upload(files) {
    const list = Array.from(files || [])
    if (!list.length) return []
    uploading.value = true
    error.value = ''
    const uploaded = []
    try {
      for (const file of list) {
        const data = await uploadImage(file) // { key, url }
        const item = { key: data.key, url: data.url, size: file.size ?? 0, uploadedAt: new Date().toISOString() }
        images.value.unshift(item)
        uploaded.push(item)
      }
      return uploaded
    } catch (e) {
      error.value = e.message || 'Tải ảnh lên thất bại.'
      throw e
    } finally {
      uploading.value = false
    }
  }

  async function remove(key) {
    await deleteImage(key)
    images.value = images.value.filter((i) => i.key !== key)
  }

  /**
   * Crop an existing image into a NEW one (server-side). The result is prepended
   * to the list. Returns the new item.
   * @param {string} key  @param {{left,top,width,height}} rect (source pixels)
   */
  async function crop(key, rect) {
    const data = await cropImage(key, rect) // { key, url }
    const item = { key: data.key, url: data.url, size: 0, uploadedAt: new Date().toISOString() }
    images.value.unshift(item)
    return item
  }

  return {
    images,
    cursor,
    loading,
    loadingMore,
    uploading,
    error,
    hasMore,
    load,
    loadMore,
    upload,
    remove,
    crop,
  }
}

/** Pretty-print a byte count (e.g. 12.4 KB, 1.2 MB). */
export function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`
  const units = ['KB', 'MB', 'GB']
  let val = bytes / 1024
  let i = 0
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(1)} ${units[i]}`
}
