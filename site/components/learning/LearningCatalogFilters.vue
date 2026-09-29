<script setup lang="ts">
import type { ProgramKind, ProgramMode, ProgramTopic } from '~/composables/useLearningCatalog'

const props = defineProps<{
  counts: {
    total: number
    kind: Record<ProgramKind, number>
    mode: Record<ProgramMode, number>
    topic: Record<ProgramTopic, number>
  }
  hasFilters: boolean
}>()

const emit = defineEmits<{ clear: [] }>()

const kind = defineModel<ProgramKind | 'all'>('kind', { required: true })
const modes = defineModel<ProgramMode[]>('modes', { required: true })
const topics = defineModel<ProgramTopic[]>('topics', { required: true })

const { t } = useI18n()

const KINDS: (ProgramKind | 'all')[] = ['all', 'course', 'mini', 'workshop']
const MODES: ProgramMode[] = ['online', 'offline']
const TOPICS: ProgramTopic[] = ['anatomy', 'assessment', 'sports', 'functional']

const kindCount = (option: ProgramKind | 'all') =>
  option === 'all' ? props.counts.total : props.counts.kind[option]

/** "Trực tuyến (Online)" → "Trực tuyến": the tile already says what it is. */
const modeLabel = (option: ProgramMode) =>
  t(`learning.catalog.mode_${option}`).replace(/\s*\(.*\)\s*$/, '')

function toggleMode(value: ProgramMode) {
  modes.value = modes.value.includes(value)
    ? modes.value.filter((m) => m !== value)
    : [...modes.value, value]
}

function toggleTopic(value: ProgramTopic) {
  topics.value = topics.value.includes(value)
    ? topics.value.filter((tp) => tp !== value)
    : [...topics.value, value]
}

/** An option with nothing behind it cannot be picked — unless it already is. */
const emptyKind = (o: ProgramKind | 'all') => o !== 'all' && kindCount(o) === 0 && kind.value !== o
const emptyMode = (o: ProgramMode) => props.counts.mode[o] === 0 && !modes.value.includes(o)
const emptyTopic = (o: ProgramTopic) => props.counts.topic[o] === 0 && !topics.value.includes(o)

/** Phones: collapsed by default (the panel is taller than the screen), with
    the number of active filters on the toggle. Always open from lg up. */
const open = ref(false)
const activeCount = computed(() => (kind.value !== 'all' ? 1 : 0) + modes.value.length + topics.value.length)
</script>

<template>
  <aside class="filters" :class="{ 'filters--open': open }" :aria-label="t('learning.catalog.filters')">
    <!-- ══ Head: title + reset (only when something is filtered) ══ -->
    <div class="filters__head">
      <button type="button" class="filters__heading" :aria-expanded="open" aria-controls="catalog-filters-body" @click="open = !open">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
        {{ t('learning.catalog.filters') }}
        <span v-if="activeCount" class="filters__badge">{{ activeCount }}</span>
        <svg class="filters__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      <Transition name="fade-clear">
        <button v-if="hasFilters" type="button" class="filters__reset" @click="emit('clear')">
          {{ t('learning.catalog.clear_filters') }}
        </button>
      </Transition>
    </div>

    <div id="catalog-filters-body" class="filters__body">
    <!-- ══ Programme type — single choice, chips ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.kind_title') }}</h3>
      <div class="chips" role="radiogroup" :aria-label="t('learning.catalog.kind_title')">
        <button
          v-for="option in KINDS"
          :key="option"
          type="button"
          role="radio"
          class="chip"
          :class="{ 'chip--on': kind === option }"
          :aria-checked="kind === option"
          :disabled="emptyKind(option)"
          @click="kind = option"
        >
          {{ option === 'all' ? t('learning.catalog.all') : t(`learning.catalog.kind_${option}`) }}
          <span class="chip__count">{{ kindCount(option) }}</span>
        </button>
      </div>
    </section>

    <!-- ══ Format — multi choice, two tiles; none picked = all ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.mode_title') }}</h3>
      <div class="tiles">
        <button
          v-for="option in MODES"
          :key="option"
          type="button"
          class="tile"
          :class="{ 'tile--on': modes.includes(option) }"
          :aria-pressed="modes.includes(option)"
          :disabled="emptyMode(option)"
          @click="toggleMode(option)"
        >
          <svg v-if="option === 'online'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="13" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span class="tile__label">{{ modeLabel(option) }}</span>
          <span class="tile__count">{{ counts.mode[option] }}</span>
        </button>
      </div>
    </section>

    <!-- ══ Topic — multi choice, custom checkboxes ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.topic_title') }}</h3>
      <ul class="checks">
        <li v-for="option in TOPICS" :key="option">
          <label class="check" :class="{ 'check--on': topics.includes(option), 'check--empty': emptyTopic(option) }">
            <input
              type="checkbox"
              class="sr-only"
              :checked="topics.includes(option)"
              :disabled="emptyTopic(option)"
              @change="toggleTopic(option)"
            />
            <span class="check__box" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span class="check__label">{{ t(`learning.catalog.topic_${option}`) }}</span>
            <span class="check__count">{{ counts.topic[option] }}</span>
          </label>
        </li>
      </ul>
    </section>
    </div>
  </aside>
</template>

<style scoped>
.filters {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: white;
  padding: 1.1rem 1rem 1.15rem;
  box-shadow: 0 8px 24px -18px rgba(11, 42, 74, 0.35);
}

/* ── Head ── */
.filters__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 26px;
}
.filters__heading {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-navy);
}
.filters__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}
.filters__chevron {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}
.filters--open .filters__chevron {
  transform: rotate(180deg);
}
/* Phones: collapsed unless opened. */
.filters:not(.filters--open) .filters__body {
  display: none;
}
@media (min-width: 1024px) {
  .filters__heading {
    cursor: default;
    pointer-events: none;
  }
  .filters__chevron {
    display: none;
  }
  .filters:not(.filters--open) .filters__body {
    display: block;
  }
}
.filters__reset {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(244, 122, 31, 0.1);
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-accent-dark);
  transition: background 0.2s ease;
}
.filters__reset:hover {
  background: rgba(244, 122, 31, 0.18);
}
.fade-clear-enter-active,
.fade-clear-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-clear-enter-from,
.fade-clear-leave-to {
  opacity: 0;
  transform: translateX(4px);
}

/* ── Groups ── */
.filters__group {
  margin-top: 1.05rem;
  padding-top: 1.05rem;
  border-top: 1px dashed var(--color-border);
}
.filters__title {
  margin-bottom: 0.65rem;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

/* ── Kind chips ── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.4rem 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: white;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-navy);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.chip:hover:not(:disabled):not(.chip--on) {
  border-color: var(--color-navy-light);
  background: var(--color-off-white);
}
.chip--on {
  border-color: var(--color-navy);
  background: var(--color-navy);
  color: white;
  box-shadow: 0 6px 14px -8px rgba(11, 42, 74, 0.7);
}
.chip__count {
  min-width: 20px;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--color-off-white);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-align: center;
}
.chip--on .chip__count {
  background: rgba(255, 255, 255, 0.18);
  color: white;
}
.chip:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

/* ── Mode tiles ── */
.tiles {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
}
.tile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  color: var(--color-navy);
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.tile:hover:not(:disabled):not(.tile--on) {
  border-color: var(--color-navy-light);
  background: var(--color-off-white);
}
.tile--on {
  border-color: var(--color-accent);
  background: rgba(244, 122, 31, 0.07);
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.12);
  color: var(--color-accent-dark);
}
.tile__label {
  flex: 1;
  min-width: 0;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
}
.tile__count {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.tile--on .tile__count {
  color: var(--color-accent-dark);
}
.tile:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

/* ── Topic checkboxes ── */
.checks {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.5rem;
  margin: 0 -0.5rem;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.check:hover:not(.check--empty) {
  background: var(--color-off-white);
}
.check__box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #c8d2dd;
  border-radius: 5px;
  background: white;
  color: white;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.check__box svg {
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.check--on .check__box {
  border-color: var(--color-accent);
  background: var(--color-accent);
}
.check--on .check__box svg {
  opacity: 1;
  transform: scale(1);
}
.check input:focus-visible + .check__box {
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.25);
}
.check__label {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--color-navy);
}
.check--on .check__label {
  font-weight: 600;
}
.check__count {
  min-width: 22px;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--color-off-white);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-align: center;
}
.check--empty {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
