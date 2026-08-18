<script setup lang="ts">
/**
 * Learning Hub catalogue — every course, mini-course and workshop in one
 * filterable list.
 *
 * Filter state round-trips through the URL query so a filtered view can be
 * shared or bookmarked and survives a reload. `view` stays out of the query:
 * grid-vs-list is a personal display preference, not part of what you'd send
 * someone.
 */
import type { ProgramKind, ProgramMode, ProgramTopic, ProgramSort } from '~/composables/useLearningCatalog'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const { programs, counts, PROGRAMS_PER_PAGE } = useLearningCatalog()

const KINDS: ProgramKind[] = ['course', 'mini', 'workshop']
const MODES: ProgramMode[] = ['online', 'offline']
const TOPICS: ProgramTopic[] = ['anatomy', 'assessment', 'sports', 'functional']
const SORTS: ProgramSort[] = ['newest', 'price_asc', 'price_desc']

/** Vietnamese search has to ignore diacritics — nobody types "Phục hồi" with
    tone marks into a search box when they are in a hurry. */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function readList<T extends string>(raw: unknown, allowed: T[]): T[] {
  return String(raw ?? '')
    .split(',')
    .filter((v): v is T => (allowed as string[]).includes(v))
}

const query = ref((route.query.q as string) ?? '')
const kind = ref<ProgramKind | 'all'>(
  KINDS.includes(route.query.kind as ProgramKind) ? (route.query.kind as ProgramKind) : 'all',
)
const modes = ref<ProgramMode[]>(readList(route.query.mode, MODES))
const topics = ref<ProgramTopic[]>(readList(route.query.topic, TOPICS))
const sort = ref<ProgramSort>(
  SORTS.includes(route.query.sort as ProgramSort) ? (route.query.sort as ProgramSort) : 'newest',
)
const page = ref(Math.max(1, Number(route.query.page) || 1))
const view = ref<'grid' | 'list'>('grid')

const hasFilters = computed(
  () => kind.value !== 'all' || modes.value.length > 0 || topics.value.length > 0 || query.value.trim() !== '',
)

const filtered = computed(() => {
  let list = programs.value

  if (kind.value !== 'all') list = list.filter((p) => p.kind === kind.value)
  if (modes.value.length) list = list.filter((p) => modes.value.includes(p.mode))
  if (topics.value.length) list = list.filter((p) => topics.value.includes(p.topic))

  const term = fold(query.value.trim())
  if (term) list = list.filter((p) => fold(p.title).includes(term))

  if (sort.value === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
  else if (sort.value === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PROGRAMS_PER_PAGE)))
const start = computed(() => (page.value - 1) * PROGRAMS_PER_PAGE)
const paged = computed(() => filtered.value.slice(start.value, start.value + PROGRAMS_PER_PAGE))

/** 1 … 4 5 6 … 12 — never more than seven slots wide. */
const pageNumbers = computed<(number | '…')[]>(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const out: (number | '…')[] = [1]
  const from = Math.max(2, current - 1)
  const to = Math.min(total - 1, current + 1)
  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < total - 1) out.push('…')
  out.push(total)
  return out
})

/** Chips for what is actually narrowing the list — an "All types" chip with a
    remove button would be a control that does nothing. */
const chips = computed(() => {
  const out: { key: string; label: string; clear: () => void }[] = []
  if (query.value.trim()) {
    out.push({ key: 'q', label: `“${query.value.trim()}”`, clear: () => (query.value = '') })
  }
  if (kind.value !== 'all') {
    out.push({
      key: `kind-${kind.value}`,
      label: t(`learning.catalog.kind_${kind.value}`),
      clear: () => (kind.value = 'all'),
    })
  }
  for (const m of modes.value) {
    out.push({
      key: `mode-${m}`,
      label: t(`learning.catalog.mode_${m}`),
      clear: () => (modes.value = modes.value.filter((v) => v !== m)),
    })
  }
  for (const tp of topics.value) {
    out.push({
      key: `topic-${tp}`,
      label: t(`learning.catalog.topic_${tp}`),
      clear: () => (topics.value = topics.value.filter((v) => v !== tp)),
    })
  }
  return out
})

function clearAll() {
  query.value = ''
  kind.value = 'all'
  modes.value = []
  topics.value = []
}

// Narrowing the list can leave you past the last page — walk back to it.
watch([kind, modes, topics, query, sort], () => {
  page.value = 1
})
watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})

watch([query, kind, modes, topics, sort, page], () => {
  router.replace({
    query: {
      ...(query.value.trim() ? { q: query.value.trim() } : {}),
      ...(kind.value !== 'all' ? { kind: kind.value } : {}),
      ...(modes.value.length ? { mode: modes.value.join(',') } : {}),
      ...(topics.value.length ? { topic: topics.value.join(',') } : {}),
      ...(sort.value !== 'newest' ? { sort: sort.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  })
})

useSeo({
  title: t('learning.catalog.title'),
  description: t('learning.catalog.subtitle'),
  image: '/education-workshop.png',
  type: 'website',
})

onMounted(() => {
  trackPageView()
})
</script>

<template>
  <div class="bg-off-white min-h-screen flex flex-col">
    <LearningHeader />

    <main class="flex-1">
      <div class="section-container py-5 lg:py-7">
        <!-- ── Breadcrumb ── -->
        <nav class="crumbs">
          <NuxtLink :to="localePath('/learning-hub')">{{ t('learning.catalog.breadcrumb_home') }}</NuxtLink>
          <span>›</span>
          <span class="crumbs__current">{{ t('learning.catalog.breadcrumb') }}</span>
        </nav>

        <!-- ── Title + search ── -->
        <div class="head">
          <div class="min-w-0">
            <h1 class="head__title">{{ t('learning.catalog.title') }}</h1>
            <p class="head__sub">{{ t('learning.catalog.subtitle') }}</p>
          </div>

          <label class="search">
            <svg class="search__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              v-model="query"
              type="search"
              class="search__input"
              :placeholder="t('learning.catalog.search_ph')"
            />
          </label>
        </div>

        <!-- ── Toolbar ── -->
        <div class="toolbar">
          <div class="toolbar__chips">
            <template v-if="chips.length">
              <span class="toolbar__label">{{ t('learning.catalog.active_filters') }}</span>
              <button v-for="chip in chips" :key="chip.key" type="button" class="chip" @click="chip.clear()">
                {{ chip.label }}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button type="button" class="toolbar__clear" @click="clearAll">
                {{ t('learning.catalog.clear_all') }}
              </button>
            </template>
          </div>

          <div class="toolbar__right">
            <span class="toolbar__label">{{ t('learning.catalog.sort_label') }}</span>
            <select v-model="sort" class="sortbox">
              <option v-for="option in SORTS" :key="option" :value="option">
                {{ t(`learning.catalog.sort_${option}`) }}
              </option>
            </select>

            <div class="viewtoggle">
              <button
                type="button"
                :class="{ 'viewtoggle--on': view === 'grid' }"
                :aria-label="t('learning.catalog.view_grid')"
                :aria-pressed="view === 'grid'"
                @click="view = 'grid'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                :class="{ 'viewtoggle--on': view === 'list' }"
                :aria-label="t('learning.catalog.view_list')"
                :aria-pressed="view === 'list'"
                @click="view = 'list'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Sidebar + results ── -->
        <div class="layout">
          <LearningCatalogFilters
            v-model:kind="kind"
            v-model:modes="modes"
            v-model:topics="topics"
            :counts="counts"
            :has-filters="hasFilters"
            @clear="clearAll"
          />

          <div class="min-w-0">
            <div v-if="paged.length" :class="view === 'grid' ? 'results-grid' : 'results-list'">
              <LearningCatalogCard
                v-for="program in paged"
                :key="program.slug"
                :program="program"
                :list="view === 'list'"
              />
            </div>

            <div v-else class="empty">
              <p class="empty__title">{{ t('learning.catalog.empty_title') }}</p>
              <p class="empty__sub">{{ t('learning.catalog.empty_sub') }}</p>
              <button type="button" class="empty__btn" @click="clearAll">
                {{ t('learning.catalog.clear_filters') }}
              </button>
            </div>

            <!-- ── Pagination ── -->
            <div v-if="filtered.length" class="pager">
              <div class="pager__nums">
                <button
                  type="button"
                  class="pager__btn"
                  :aria-label="t('learning.catalog.prev')"
                  :disabled="page === 1"
                  @click="page--"
                >
                  ‹
                </button>

                <template v-for="(item, i) in pageNumbers" :key="`${item}-${i}`">
                  <span v-if="item === '…'" class="pager__gap">…</span>
                  <button
                    v-else
                    type="button"
                    class="pager__btn"
                    :class="{ 'pager__btn--on': item === page }"
                    @click="page = item as number"
                  >
                    {{ item }}
                  </button>
                </template>

                <button
                  type="button"
                  class="pager__btn"
                  :aria-label="t('learning.catalog.next')"
                  :disabled="page === totalPages"
                  @click="page++"
                >
                  ›
                </button>
              </div>

              <p class="pager__count">
                {{ t('learning.catalog.results', {
                  from: start + 1,
                  to: Math.min(start + PROGRAMS_PER_PAGE, filtered.length),
                  total: filtered.length,
                }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LearningFooter />
  </div>
</template>

<style scoped>
/* ── Breadcrumb ── */
.crumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.crumbs a:hover {
  color: var(--color-accent);
}
.crumbs__current {
  color: var(--color-navy);
  font-weight: 600;
}

/* ── Head ── */
.head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.7rem;
}

.head__title {
  font-family: var(--font-heading);
  font-size: 25px;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}

.head__sub {
  margin-top: 0.3rem;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.search {
  position: relative;
  display: block;
  width: 100%;
}
.search__icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  opacity: 0.7;
  pointer-events: none;
}
.search__input {
  width: 100%;
  height: 40px;
  padding: 0 0.9rem 0 2.2rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: white;
  font-size: 12.5px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search__input::placeholder {
  color: #9aa8b6;
}
.search__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.13);
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 1.1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  min-height: 26px;
}

.toolbar__label {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  font-size: 11px;
  color: var(--color-navy);
  transition: border-color 0.2s ease, color 0.2s ease;
}
.chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.toolbar__clear {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.toolbar__clear:hover {
  color: var(--color-accent);
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sortbox {
  height: 30px;
  padding: 0 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: white;
  font-size: 11.5px;
  color: var(--color-navy);
  cursor: pointer;
}
.sortbox:focus {
  outline: none;
  border-color: var(--color-accent);
}

.viewtoggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
}
.viewtoggle button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  border-radius: 6px;
  color: var(--color-text-secondary);
  transition: background 0.2s ease, color 0.2s ease;
}
.viewtoggle button:hover {
  color: var(--color-navy);
}
.viewtoggle--on {
  background: var(--color-navy);
  color: white !important;
}

/* ── Layout ── */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

/* ── Empty ── */
.empty {
  padding: 3rem 1.5rem;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}
.empty__title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
}
.empty__sub {
  margin-top: 0.35rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.empty__btn {
  margin-top: 1rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.empty__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ── Pagination ── */
.pager {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.4rem;
}

.pager__nums {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pager__btn {
  min-width: 28px;
  height: 28px;
  padding: 0 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: white;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.pager__btn:hover:not(:disabled):not(.pager__btn--on) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.pager__btn--on {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: white;
}
.pager__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager__gap {
  padding: 0 0.15rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.pager__count {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ── Desktop ── */
@media (min-width: 640px) {
  .head {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .search {
    width: 300px;
    flex-shrink: 0;
  }
  .head__title {
    font-size: 28px;
  }
  .results-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 208px minmax(0, 1fr);
    gap: 1.25rem;
  }
  .results-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .pager {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
