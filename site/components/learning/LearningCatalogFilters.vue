<script setup lang="ts">
import type { ProgramKind, ProgramMode, ProgramTopic } from '~/composables/useLearningCatalog'

defineProps<{
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
</script>

<template>
  <aside class="filters">
    <!-- ══ Programme type — single choice ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.kind_title') }}</h3>
      <ul class="filters__list">
        <li v-for="option in KINDS" :key="option">
          <button
            type="button"
            class="krow"
            :class="{ 'krow--on': kind === option }"
            :aria-pressed="kind === option"
            @click="kind = option"
          >
            <span>{{ option === 'all' ? t('learning.catalog.all') : t(`learning.catalog.kind_${option}`) }}</span>
            <span class="krow__count">{{ option === 'all' ? counts.total : counts.kind[option] }}</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- ══ Format — multi choice ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.mode_title') }}</h3>
      <ul class="filters__list">
        <li>
          <label class="crow">
            <input type="checkbox" :checked="modes.length === 0" @change="modes = []" />
            <span>{{ t('learning.catalog.all') }}</span>
            <span class="crow__count">{{ counts.total }}</span>
          </label>
        </li>
        <li v-for="option in MODES" :key="option">
          <label class="crow">
            <input type="checkbox" :checked="modes.includes(option)" @change="toggleMode(option)" />
            <span>{{ t(`learning.catalog.mode_${option}`) }}</span>
            <span class="crow__count">{{ counts.mode[option] }}</span>
          </label>
        </li>
      </ul>
    </section>

    <!-- ══ Topic — multi choice ══ -->
    <section class="filters__group">
      <h3 class="filters__title">{{ t('learning.catalog.topic_title') }}</h3>
      <ul class="filters__list">
        <li v-for="option in TOPICS" :key="option">
          <label class="crow">
            <input type="checkbox" :checked="topics.includes(option)" @change="toggleTopic(option)" />
            <span>{{ t(`learning.catalog.topic_${option}`) }}</span>
            <span class="crow__count">{{ counts.topic[option] }}</span>
          </label>
        </li>
      </ul>
    </section>

    <button type="button" class="filters__clear" :disabled="!hasFilters" @click="emit('clear')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <polyline points="21 3 21 8 16 8" />
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <polyline points="3 21 3 16 8 16" />
      </svg>
      {{ t('learning.catalog.clear_filters') }}
    </button>
  </aside>
</template>

<style scoped>
.filters {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  padding: 0.9rem 0.85rem;
}

.filters__group + .filters__group {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--color-border);
}

.filters__title {
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--color-navy);
  margin-bottom: 0.55rem;
}

.filters__list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

/* ── Single-choice row ── */
.krow {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.36rem 0.5rem;
  border-radius: 7px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;
}
.krow:hover {
  background: var(--color-off-white);
  color: var(--color-navy);
}
.krow--on {
  background: rgba(244, 122, 31, 0.08);
  color: var(--color-accent-dark);
  font-weight: 600;
}
.krow--on::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2.5px;
  border-radius: 2px;
  background: var(--color-accent);
}

.krow__count {
  font-size: 10.5px;
  opacity: 0.75;
}

/* ── Multi-choice row ── */
.crow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.36rem 0.5rem;
  border-radius: 7px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.2s ease;
}
.crow:hover {
  background: var(--color-off-white);
}
.crow input {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}
.crow span:nth-of-type(1) {
  flex: 1;
  min-width: 0;
}
.crow__count {
  font-size: 10.5px;
  opacity: 0.75;
}

/* ── Reset ── */
.filters__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  margin-top: 1.1rem;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}
.filters__clear:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.filters__clear:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
