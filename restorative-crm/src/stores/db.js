import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

import {
  COLLECTIONS,
  fetchCollection,
  createRow,
  updateRow,
  deleteRow,
  bulkUpdate,
  fetchSettings,
  saveSettingsSection,
  fetchCounts,
  reports,
} from '@/services/console.js'

/**
 * The console's data store, talking to `lead-tracker-api`.
 *
 * This replaced a localStorage-backed mock of the same shape, and it keeps that
 * shape on purpose: `list()`, `find()`, `save()`, `patch()`, `remove()` mean
 * what they meant before, so the thirty-odd views built against the mock did
 * not have to be rewritten to reach a real database.
 *
 * Two things did have to change, and could not be hidden:
 *
 *  1. **Writes are async.** A network write that pretends to be synchronous can
 *     only do it by lying about the result — reporting success before the
 *     server has agreed. `save`/`patch`/`remove` return promises; the handful
 *     of callers that used the return value now await it.
 *
 *  2. **Collections load lazily.** The mock had everything in memory from the
 *     first tick. Fetching all twenty-six collections on boot would be twenty-six
 *     requests to render one screen, so a collection is fetched the first time
 *     something reads it and cached for the session. `list()` returns an empty
 *     array on that first read and fills in when the response lands, which is
 *     why every view already binds to it reactively.
 */

const empty = () => Object.fromEntries(Object.keys(COLLECTIONS).map((name) => [name, []]))

// ── read-only rollups ────────────────────────────────────────────────
/**
 * Every field here is computed server-side from raw rows, so these are reports
 * rather than stored numbers.
 *
 * Module-level and mutated in place, both deliberately: views import it
 * directly (`import { insights } from '@/stores/db.js'`) and capture the arrays
 * at setup (`const dropOff = insights.dropOff`). Reassigning `insights.dropOff`
 * would leave every one of those bindings pointing at the empty array it was
 * handed on the first tick; splicing keeps them live.
 */
export const insights = reactive({
  dropOff: [],
  retention: [],
  quizMisses: [],
  revenueTrend: [],
  funnel: [],
  ctaBreakdown: [],
})

let insightsLoaded = false

const fill = (target, rows) => target.splice(0, target.length, ...rows)

/** Fetched once per session; the reports are cheap but not free. */
export async function loadInsights({ force = false } = {}) {
  if (insightsLoaded && !force) return insights
  insightsLoaded = true
  const [dropOff, retention, quizMisses, revenueTrend, funnel, cta] = await Promise.all([
    reports.dropOff().catch(() => []),
    reports.retention().catch(() => []),
    reports.quizMisses().catch(() => []),
    reports.revenueTrend(30).catch(() => []),
    reports.funnel(30).catch(() => []),
    reports.ctaBreakdown(30).catch(() => []),
  ])
  fill(insights.dropOff, dropOff)
  fill(insights.retention, retention)
  fill(insights.quizMisses, quizMisses)
  fill(insights.revenueTrend, revenueTrend)
  fill(insights.funnel, funnel)
  fill(insights.ctaBreakdown, cta)
  return insights
}

export const useDb = defineStore('db', () => {
  const data = ref(empty())
  const settings = ref({ general: {}, booking: {}, academy: {}, payments: {}, integrations: [] })
  const counts = ref({})
  const busy = ref({})
  const errors = ref({})
  const lastSavedAt = ref(null)
  /**
   * The most recent failure, for a global toast to watch.
   *
   * Writes report failure here rather than by throwing: most call sites fire
   * and forget (`patch(row.id, { status })` straight from a click handler), and
   * a rejected promise nobody awaits is a silent failure plus a console error.
   * A watched ref reaches the user either way.
   */
  const lastError = ref(null)
  /**
   * The most recent successful write, watched by the same global toast. Set by
   * every write path below, so no view has to remember to announce its own
   * saves — the store is the one place that knows a write actually landed.
   */
  const lastSuccess = ref(null)

  function announce(message) {
    lastSuccess.value = { message, at: Date.now() }
  }

  /**
   * Which collections have been asked for. Deliberately a plain Set and not a
   * ref: `list()` is called from inside computed properties, and marking a
   * collection as requested must not itself be a reactive write, or every
   * render would invalidate the computed that triggered it.
   */
  const requested = new Set()

  function fail(name, err) {
    const message = err?.message || "Thao tác thất bại"
    errors.value = { ...errors.value, [name]: message }
    lastError.value = { name, message, at: Date.now() }
    return null
  }

  const isBusy = (name) => !!busy.value[name]
  const errorFor = (name) => errors.value[name] || null

  async function load(name) {
    if (!COLLECTIONS[name]) return []
    busy.value = { ...busy.value, [name]: true }
    try {
      const rows = await fetchCollection(name)
      data.value[name] = rows
      errors.value = { ...errors.value, [name]: null }
      return rows
    } catch (err) {
      fail(name, err)
      return []
    } finally {
      busy.value = { ...busy.value, [name]: false }
    }
  }

  /** Fetch once per session, on the first read, outside the current render. */
  function ensure(name) {
    if (requested.has(name) || !COLLECTIONS[name]) return
    requested.add(name)
    queueMicrotask(() => load(name))
  }

  // ── reads ──────────────────────────────────────────────────────
  function list(name) {
    ensure(name)
    return data.value[name] || []
  }

  function find(name, id) {
    return list(name).find((row) => row.id === id) || null
  }

  /** Resolve a foreign key to a display name without every view re-deriving it. */
  function nameOf(name, id, field = 'name') {
    const row = find(name, id)
    return row ? row[field] : '—'
  }

  // ── writes ─────────────────────────────────────────────────────
  function replaceLocal(name, row) {
    const rows = data.value[name] || []
    const index = rows.findIndex((r) => r.id === row.id)
    if (index === -1) data.value[name] = [row, ...rows]
    else data.value[name] = rows.map((r, i) => (i === index ? row : r))
    lastSavedAt.value = new Date().toISOString()
  }

  /** Insert or update by id. Resolves to the stored row, or null on failure. */
  async function save(name, row) {
    try {
      const { id, ...body } = row
      const saved = id ? await updateRow(name, id, body) : await createRow(name, body)
      replaceLocal(name, saved)
      refreshCounts()
      announce(id ? 'Đã lưu thay đổi.' : 'Đã tạo mới thành công.')
      return saved
    } catch (err) {
      fail(name, err)
      return null
    }
  }

  /** Patch a subset of fields on one row — the common case for status changes. */
  async function patch(name, id, changes) {
    try {
      const saved = await updateRow(name, id, changes)
      replaceLocal(name, saved)
      refreshCounts()
      announce('Đã cập nhật.')
      return saved
    } catch (err) {
      fail(name, err)
      return null
    }
  }

  /**
   * The same patch across a selection. One request, not one per row: a bulk
   * action that fires fifty requests is a bulk action that trips the rate limit
   * halfway through and leaves the table half-updated.
   */
  async function patchMany(name, ids, changes) {
    if (!ids.length) return 0
    try {
      const result = await bulkUpdate(name, ids, changes)
      await load(name)
      refreshCounts()
      lastSavedAt.value = new Date().toISOString()
      const changed = result?.changed ?? ids.length
      announce(`Đã cập nhật ${changed} mục.`)
      return changed
    } catch (err) {
      fail(name, err)
      return 0
    }
  }

  async function remove(name, id) {
    try {
      await deleteRow(name, id)
      data.value[name] = (data.value[name] || []).filter((row) => row.id !== id)
      lastSavedAt.value = new Date().toISOString()
      refreshCounts()
      announce('Đã xoá.')
      return true
    } catch (err) {
      fail(name, err)
      return false
    }
  }

  /** Copy a row into a new one. The id and timestamps are the server's to set. */
  async function duplicate(name, id, overrides = {}) {
    const source = find(name, id)
    if (!source) return null
    const { id: _id, createdAt, updatedAt, ...rest } = source
    return save(name, { ...rest, ...overrides })
  }

  // ── settings ───────────────────────────────────────────────────
  async function loadSettings() {
    try {
      const loaded = await fetchSettings()
      settings.value = { ...settings.value, ...loaded }
    } catch (err) {
      errors.value = { ...errors.value, settings: err.message }
    }
    return settings.value
  }

  async function saveSettings(section, changes) {
    try {
      const value = await saveSettingsSection(section, changes)
      settings.value = { ...settings.value, [section]: value }
      lastSavedAt.value = new Date().toISOString()
      announce('Đã lưu cài đặt.')
      return value
    } catch (err) {
      return fail('settings', err)
    }
  }

  // ── sidebar badges ─────────────────────────────────────────────
  async function refreshCounts() {
    try {
      counts.value = (await fetchCounts()) || {}
    } catch {
      // A failed badge refresh must not break the write that triggered it.
    }
  }

  /**
   * What the console calls when a screen mounts. Named `simulate` in the mock,
   * where it faked latency; here it is a real refetch, and the name is kept so
   * every `onMounted(() => db.simulate(name))` still means "load this".
   */
  const simulate = (name) => load(name)

  /** Re-read everything already in memory — the "reload" button, not a reseed. */
  async function resetAll() {
    const names = [...requested]
    await Promise.all([
      ...names.map((name) => load(name)),
      loadSettings(),
      refreshCounts(),
      loadInsights({ force: true }),
    ])
  }

  /** Called once after sign-in: the two things every screen's chrome needs. */
  async function bootstrap() {
    await Promise.all([loadSettings(), refreshCounts()])
  }

  return {
    data, settings, counts, insights, lastSavedAt, lastError, lastSuccess,
    list, find, nameOf, errorFor,
    save, patch, patchMany, remove, duplicate,
    load, ensure, simulate, isBusy,
    loadSettings, saveSettings, loadInsights, refreshCounts, bootstrap, resetAll,
    collections: computed(() => Object.keys(COLLECTIONS)),
  }
})

export { useDb as useMockDb }
