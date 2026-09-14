import { computed, ref, watch, onMounted } from 'vue'
import { useMockDb } from '@/stores/db.js'

/**
 * One collection, wired for a table screen: search, filters, sort, paging,
 * row selection and writes.
 *
 * Every list view in the console needs the same six things, so they live here
 * once instead of being re-implemented per screen with slightly different bugs.
 *
 *   const r = useResource('bookings', {
 *     searchFields: ['name', 'phone', 'code'],
 *     filters: { status: '', studio: '' },
 *     sort: { key: 'date', dir: 'desc' },
 *   })
 */
export function useResource(name, options = {}) {
  const {
    searchFields = ['name'],
    filters: initialFilters = {},
    sort: initialSort = null,
    pageSize: initialPageSize = 15,
    /** Extra predicate for filters that are not a plain equality check. */
    where = null,
  } = options

  const db = useMockDb()

  const query = ref('')
  const filters = ref({ ...initialFilters })
  const sort = ref(initialSort ? { ...initialSort } : null)
  const page = ref(1)
  const pageSize = ref(initialPageSize)
  const selected = ref([])

  const all = computed(() => db.list(name))
  const loading = computed(() => db.isBusy(name))

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    let rows = all.value

    if (q) {
      rows = rows.filter((row) =>
        searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(q)),
      )
    }

    for (const [key, value] of Object.entries(filters.value)) {
      if (value === '' || value == null || value === 'all') continue
      rows = rows.filter((row) => String(row[key]) === String(value))
    }

    if (where) rows = rows.filter((row) => where(row, filters.value))

    if (sort.value) {
      const { key, dir } = sort.value
      const factor = dir === 'asc' ? 1 : -1
      rows = [...rows].sort((a, b) => {
        const av = a[key]
        const bv = b[key]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
        return String(av).localeCompare(String(bv), 'vi') * factor
      })
    }

    return rows
  })

  const total = computed(() => filtered.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const rows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filtered.value.slice(start, start + pageSize.value)
  })

  /** Any filter change puts the user back on page 1 — otherwise a narrower
      result set silently lands them on an empty page. */
  watch([query, filters, pageSize], () => { page.value = 1 }, { deep: true })
  watch(pageCount, (count) => { if (page.value > count) page.value = count })

  const activeFilterCount = computed(
    () => Object.values(filters.value).filter((v) => v !== '' && v != null && v !== 'all').length
      + (query.value.trim() ? 1 : 0),
  )

  function toggleSort(key) {
    if (!sort.value || sort.value.key !== key) sort.value = { key, dir: 'asc' }
    else if (sort.value.dir === 'asc') sort.value = { key, dir: 'desc' }
    else sort.value = null
  }

  function reset() {
    query.value = ''
    filters.value = { ...initialFilters }
    page.value = 1
  }

  // ── selection ────────────────────────────────────────────────
  const allOnPageSelected = computed(
    () => rows.value.length > 0 && rows.value.every((r) => selected.value.includes(r.id)),
  )

  function toggleRow(id) {
    const i = selected.value.indexOf(id)
    if (i === -1) selected.value.push(id)
    else selected.value.splice(i, 1)
  }

  function togglePage() {
    if (allOnPageSelected.value) {
      const ids = rows.value.map((r) => r.id)
      selected.value = selected.value.filter((id) => !ids.includes(id))
    } else {
      const ids = new Set([...selected.value, ...rows.value.map((r) => r.id)])
      selected.value = [...ids]
    }
  }

  function clearSelection() {
    selected.value = []
  }

  // ── writes ───────────────────────────────────────────────────
  const save = (row) => db.save(name, row)
  const patch = (id, changes) => db.patch(name, id, changes)
  const remove = (id) => {
    clearSelection()
    return db.remove(name, id)
  }
  const duplicate = (id, overrides) => db.duplicate(name, id, overrides)
  /**
   * Snapshot the selection before clearing it: the write is a round trip now,
   * and clearing after the await would leave the checkboxes ticked for as long
   * as the request takes.
   */
  const bulkPatch = async (changes) => {
    const ids = [...selected.value]
    clearSelection()
    return db.patchMany(name, ids, changes)
  }
  const find = (id) => db.find(name, id)
  const refresh = () => db.load(name)

  onMounted(() => db.ensure(name))

  return {
    db, all, rows, filtered, total, loading,
    query, filters, sort, page, pageSize, pageCount, activeFilterCount,
    toggleSort, reset,
    selected, toggleRow, togglePage, allOnPageSelected, clearSelection,
    save, patch, remove, duplicate, bulkPatch, find, refresh,
  }
}
