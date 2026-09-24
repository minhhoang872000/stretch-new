<script setup lang="ts">
/**
 * Learning Hub search with a live suggestion dropdown.
 *
 * Suggestions come from the catalogue the page already has (useLearningCatalog,
 * one shared request), matched diacritic-insensitively (utils/fold). The match
 * runs on a DEBOUNCED copy of the term — 250 ms after the last keystroke — so
 * the list settles as you type instead of flickering on every letter. Enter on
 * a highlighted suggestion opens that course; Enter otherwise, or "Xem tất cả",
 * hands the term to the catalogue's ?q= filter.
 *
 * Keyboard: ↑/↓ move, Enter opens, Esc closes. WAI-ARIA combobox pattern.
 */
import type { CatalogProgram } from '~/composables/useLearningCatalog'

const props = withDefaults(defineProps<{ variant?: 'bar' | 'drawer' }>(), { variant: 'bar' })
const emit = defineEmits<{ navigate: [] }>()

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { programs, formatPrice } = useLearningCatalog()

const MAX_SUGGESTIONS = 6
const DEBOUNCE_MS = 250

const uid = `hub-search-${props.variant}`
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

const term = ref(typeof route.query.q === 'string' ? route.query.q : '')
const debounced = refDebounced(term, DEBOUNCE_MS)
const open = ref(false)
const active = ref(-1)

// On the catalogue the box mirrors ?q=, so the two never disagree.
watch(
  () => route.query.q,
  (q) => { term.value = typeof q === 'string' ? q : '' },
)

const folded = computed(() => fold(debounced.value.trim()))
/** True while the user is still typing — the list is about to change. */
const settling = computed(() => term.value.trim() !== debounced.value.trim())

const matches = computed<CatalogProgram[]>(() => {
  const q = folded.value
  if (!q) return []
  const words = q.split(/\s+/).filter(Boolean)
  return programs.value
    .filter((p) => {
      const hay = fold(`${p.title} ${p.kind === 'workshop' ? 'workshop' : 'khoa hoc course mini'}`)
      return words.every((w) => hay.includes(w))
    })
    // Titles that START with the query first — that is usually what was meant.
    .sort((a, b) => Number(fold(b.title).startsWith(q)) - Number(fold(a.title).startsWith(q)))
    .slice(0, MAX_SUGGESTIONS)
})

const showPanel = computed(() => open.value && !!debounced.value.trim())
// A fresh list resets the highlight so Enter never opens a stale row.
watch(matches, () => { active.value = -1 })

function kindLabel(kind: string) {
  if (kind === 'mini') return t('learning.catalog.kind_mini')
  if (kind === 'workshop') return t('learning.catalog.kind_workshop')
  return t('learning.catalog.kind_course')
}
function metaOf(p: CatalogProgram) {
  return p.date
    ? [p.date, p.location].filter(Boolean).join(' · ')
    : [p.lessons ? `${p.lessons} bài học` : '', p.duration || ''].filter(Boolean).join(' · ')
}

function close() {
  open.value = false
  active.value = -1
}
function done() {
  close()
  input.value?.blur()
  emit('navigate')
}

function openCourse(p: CatalogProgram) {
  done()
  navigateTo(localePath(`/learning-hub/programs/${p.slug}`))
}
function searchAll() {
  const q = term.value.trim()
  done()
  navigateTo({ path: localePath('/learning-hub/programs'), query: q ? { q } : {} })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    // A native search input clears itself on Esc and fires `input`, which
    // would reopen the panel straight away. Esc here means "close", not "clear".
    e.preventDefault()
    close()
    return
  }
  if (!showPanel.value) return
  // Rows: the suggestions, then the "see all" row.
  const rows = matches.value.length + 1
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = (active.value + 1) % rows
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = active.value <= 0 ? rows - 1 : active.value - 1
  }
}
function onSubmit() {
  const pick = matches.value[active.value]
  if (pick) openCourse(pick)
  else searchAll()
}

onClickOutside(root, close)
</script>

<template>
  <div ref="root" class="hsb" :class="`hsb--${variant}`">
    <form class="hsb__form" role="search" @submit.prevent="onSubmit">
      <svg class="hsb__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref="input"
        v-model="term"
        type="search"
        class="hsb__input"
        autocomplete="off"
        enterkeyhint="search"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showPanel"
        :aria-controls="`${uid}-list`"
        :aria-activedescendant="active >= 0 ? `${uid}-opt-${active}` : undefined"
        :placeholder="t('learning.catalog.search_ph')"
        :aria-label="t('learning.catalog.search_ph')"
        @focus="open = true"
        @input="open = true"
        @keydown="onKeydown"
      />
      <span v-if="settling" class="hsb__spinner" aria-hidden="true" />
    </form>

    <Transition name="hsb-pop">
      <div v-if="showPanel" :id="`${uid}-list`" class="hsb__panel" role="listbox" :aria-label="t('learning.catalog.search_results')">
        <p v-if="!matches.length" class="hsb__empty">{{ t('learning.catalog.search_empty') }}</p>

        <TransitionGroup name="hsb-row" tag="div">
          <button
            v-for="(p, i) in matches"
            :id="`${uid}-opt-${i}`"
            :key="p.slug"
            type="button"
            role="option"
            class="hsb__row"
            :class="{ 'hsb__row--on': active === i }"
            :aria-selected="active === i"
            :style="{ transitionDelay: `${i * 30}ms` }"
            @mouseenter="active = i"
            @click="openCourse(p)"
          >
            <span class="hsb__kind" :class="`hsb__kind--${p.kind}`">{{ kindLabel(p.kind) }}</span>
            <span class="hsb__text">
              <span class="hsb__title">{{ p.title }}</span>
              <span v-if="metaOf(p)" class="hsb__meta">{{ metaOf(p) }}</span>
            </span>
            <span class="hsb__price">{{ formatPrice(p.price) }}</span>
          </button>
        </TransitionGroup>

        <button
          :id="`${uid}-opt-${matches.length}`"
          type="button"
          role="option"
          class="hsb__all"
          :class="{ 'hsb__row--on': active === matches.length }"
          :aria-selected="active === matches.length"
          @mouseenter="active = matches.length"
          @click="searchAll"
        >
          {{ t('learning.catalog.search_all', { q: term.trim() }) }} →
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hsb {
  position: relative;
}
.hsb--bar {
  flex: 1;
  max-width: 340px;
  margin: 0 1.5rem;
}
.hsb--drawer {
  margin-bottom: 0.5rem;
}

.hsb__form {
  position: relative;
  display: flex;
  align-items: center;
}
.hsb__icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
  pointer-events: none;
}
.hsb__input {
  width: 100%;
  height: 38px;
  padding: 0 2.2rem 0 2.3rem;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-off-white);
  font-size: 13px;
  color: var(--color-navy);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.hsb--drawer .hsb__input {
  height: 44px;
  font-size: 15px;
}
.hsb__input::placeholder {
  color: #9aa8b6;
}
.hsb__input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: white;
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.14);
}
.hsb__input::-webkit-search-cancel-button {
  cursor: pointer;
}
.hsb__spinner {
  position: absolute;
  right: 0.9rem;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  animation: hsb-spin 0.7s linear infinite;
}
@keyframes hsb-spin {
  to { transform: rotate(360deg); }
}

/* ── Panel ── */
.hsb__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 60;
  min-width: 360px;
  padding: 0.4rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 18px 40px -16px rgba(11, 42, 74, 0.28);
}
/* In the drawer the list flows in place — no floating layer over the menu. */
.hsb--drawer .hsb__panel {
  position: static;
  min-width: 0;
  margin-top: 0.5rem;
  box-shadow: none;
}

.hsb__row,
.hsb__all {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.6rem;
  border-radius: 10px;
  text-align: left;
  transition: background 0.15s ease;
}
.hsb__row--on {
  background: var(--color-off-white);
}
.hsb__kind {
  flex-shrink: 0;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  background: #eef3f8;
  color: var(--color-navy);
}
.hsb__kind--workshop {
  background: #fdf0e6;
  color: #b4540f;
}
.hsb__kind--mini {
  background: #e8f5ef;
  color: #1c7a4f;
}
.hsb__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.hsb__title {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hsb__meta {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* The drawer is ~250px wide: let titles wrap instead of cutting to "Offic…". */
.hsb--drawer .hsb__row {
  align-items: flex-start;
  flex-wrap: wrap;
}
.hsb--drawer .hsb__text {
  flex-basis: 100%;
  order: 3;
}
.hsb--drawer .hsb__title,
.hsb--drawer .hsb__meta {
  white-space: normal;
}
.hsb--drawer .hsb__price {
  margin-left: auto;
}
.hsb__price {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
  color: var(--color-accent);
}
.hsb__all {
  justify-content: center;
  margin-top: 0.2rem;
  border-top: 1px solid var(--color-border);
  border-radius: 0 0 10px 10px;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy-light);
}
.hsb__empty {
  padding: 0.8rem 0.6rem 0.5rem;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

/* The panel drops in; rows fade up one after another as they arrive. */
.hsb-pop-enter-active,
.hsb-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.hsb-pop-enter-from,
.hsb-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.hsb-row-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.hsb-row-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.hsb-row-leave-active {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .hsb-pop-enter-active,
  .hsb-pop-leave-active,
  .hsb-row-enter-active {
    transition: none;
  }
  .hsb__spinner {
    animation: none;
  }
}
</style>
