import type { CatalogProgram } from '~/composables/useLearningCatalog'

/**
 * "Xem gần đây" — programme pages this browser opened, newest first.
 *
 * localStorage only, deliberately: it is a convenience for the person at this
 * keyboard, not account data, and it works signed out — which is when a
 * visitor is still shopping and most needs it. Capped at 12 slugs; the list
 * resolves against the live catalogue, so an unpublished course drops out.
 */
const KEY = 'stretch:recently-viewed'
const MAX = 12

export function useRecentlyViewed() {
  const slugs = useState<string[]>('recently-viewed', () => [])
  const { programs } = useLearningCatalog()

  function read() {
    try {
      const raw = localStorage.getItem(KEY)
      const list = raw ? JSON.parse(raw) : []
      slugs.value = Array.isArray(list) ? list.filter((s) => typeof s === 'string').slice(0, MAX) : []
    } catch {
      slugs.value = []
    }
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(slugs.value))
    } catch {
      // storage blocked — the list just does not persist
    }
  }

  onMounted(read)

  /** Move `slug` to the front. Call from a programme page once mounted. */
  function track(slug: string) {
    if (!import.meta.client || !slug) return
    read()
    slugs.value = [slug, ...slugs.value.filter((s) => s !== slug)].slice(0, MAX)
    write()
  }

  function clear() {
    slugs.value = []
    write()
  }

  /** Resolved programmes, newest first, optionally leaving some slugs out
      (the page you are on, the courses you already own…). */
  function items(exclude: string[] = [], limit = 8) {
    return computed<CatalogProgram[]>(() => {
      const bySlug = new Map(programs.value.map((p) => [p.slug, p]))
      return slugs.value
        .filter((s) => !exclude.includes(s))
        .map((s) => bySlug.get(s))
        .filter((p): p is CatalogProgram => !!p)
        .slice(0, limit)
    })
  }

  return { slugs, track, clear, items }
}
