<script setup lang="ts">
/**
 * Course content — an accordion of modules for self-paced programmes, or an
 * hour-by-hour agenda for the scheduled ones.
 *
 * The first module opens by default: a collapsed accordion tells a first-time
 * visitor nothing about the depth of the material.
 */
import type { ProgramDetail } from '~/composables/useProgramDetail'

const props = defineProps<{ detail: ProgramDetail }>()

const { t } = useI18n()
const localePath = useLocalePath()

const open = ref<number[]>([0])

/** Preview lessons open in the player, at that exact lesson. */
const previewPath = (moduleIndex: number, itemIndex: number) =>
  localePath(`/learning-hub/learn/${props.detail.program.slug}?lesson=${moduleIndex}-${itemIndex}`)

const isOpen = (i: number) => open.value.includes(i)

function toggle(i: number) {
  open.value = isOpen(i) ? open.value.filter((v) => v !== i) : [...open.value, i]
}

const allOpen = computed(() => open.value.length === props.detail.modules.length)

function toggleAll() {
  open.value = allOpen.value ? [] : props.detail.modules.map((_, i) => i)
}

const totals = computed(() => ({
  modules: props.detail.modules.length,
  lessons: props.detail.program.lessons ?? 0,
  hours: Math.round((props.detail.totalMinutes / 60) * 10) / 10,
}))
</script>

<template>
  <section id="content" class="card">
    <div class="card__head">
      <div class="min-w-0">
        <h2 class="card__title">
          {{ detail.scheduled ? t('learning.course.agenda_title') : t('learning.course.content_title') }}
        </h2>
        <p class="card__sub">
          {{ detail.scheduled
            ? t('learning.course.agenda_sub', { date: detail.program.date, place: detail.program.location })
            : t('learning.course.content_sub', totals) }}
        </p>
      </div>

      <button v-if="!detail.scheduled" type="button" class="card__action" @click="toggleAll">
        {{ allOpen ? t('learning.course.collapse_all') : t('learning.course.expand_all') }}
      </button>
    </div>

    <!-- ══ Self-paced: modules ══ -->
    <div v-if="!detail.scheduled" class="mods">
      <div v-for="(mod, mi) in detail.modules" :key="mod.title" class="mod" :class="{ 'mod--open': isOpen(mi) }">
        <button type="button" class="mod__head" :aria-expanded="isOpen(mi)" @click="toggle(mi)">
          <span class="mod__caret" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </span>

          <span class="mod__text">
            <span class="mod__index">{{ t('learning.course.module_n', { n: mi + 1 }) }}</span>
            <span class="mod__title">{{ mod.title }}</span>
            <span class="mod__summary">{{ mod.summary }}</span>
          </span>

          <span class="mod__count">
            {{ t('learning.course.module_meta', { count: mod.items.length, minutes: mod.minutes }) }}
          </span>
        </button>

        <ul v-show="isOpen(mi)" class="lessons">
          <li v-for="(item, ii) in mod.items" :key="`${mi}-${ii}`" class="lesson">
            <span class="lesson__icon" :class="`lesson__icon--${item.type}`">
              <svg v-if="item.type === 'video'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" stroke="none" />
              </svg>
              <svg v-else-if="item.type === 'reading'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h9l4 4v14H6z" />
                <line x1="9" y1="11" x2="16" y2="11" />
                <line x1="9" y1="15" x2="14" y2="15" />
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l2.5 2.5L16 8" />
                <rect x="4" y="4" width="16" height="16" rx="3" />
              </svg>
            </span>

            <span class="lesson__title">{{ item.title }}</span>

            <NuxtLink v-if="item.free" :to="previewPath(mi, ii)" class="lesson__free">
              {{ t('learning.course.preview') }}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="8 5 19 12 8 19" />
              </svg>
            </NuxtLink>
            <span class="lesson__min">{{ t('learning.course.minutes', { n: item.minutes }) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- ══ Scheduled: agenda ══ -->
    <ol v-else class="agenda">
      <li v-for="slot in detail.agenda" :key="slot.time + slot.title" class="slot">
        <span class="slot__time">{{ slot.time }}</span>
        <span class="slot__body">
          <span class="slot__title">{{ slot.title }}</span>
          <span v-if="slot.note" class="slot__note">{{ slot.note }}</span>
        </span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.card {
  padding: 1rem 0.95rem 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}

.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}

.card__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.01em;
}

.card__sub {
  margin-top: 0.25rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.card__action {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.card__action:hover {
  color: var(--color-accent);
}

/* ── Modules ── */
.mods {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.mod {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.mod--open {
  border-color: #cfdae6;
  box-shadow: 0 8px 22px -16px rgba(11, 42, 74, 0.4);
}

.mod__head {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 0.8rem;
  text-align: left;
  background: var(--color-off-white);
  transition: background 0.2s ease;
}
.mod__head:hover {
  background: #eef3f8;
}

.mod__caret {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--color-navy-light);
  transition: transform 0.22s ease;
}
.mod--open .mod__caret {
  transform: rotate(90deg);
}

.mod__text {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
  flex: 1;
}

.mod__index {
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent-dark);
}

.mod__title {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-navy);
}

.mod__summary {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.mod__count {
  flex-shrink: 0;
  padding-top: 0.1rem;
  font-size: 10.5px;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

/* ── Lessons ── */
.lessons {
  border-top: 1px solid var(--color-border);
  background: white;
}

.lesson {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.52rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
}
.lesson:last-child {
  border-bottom: none;
}
.lesson:hover {
  background: #fbfdff;
}

.lesson__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-navy-light);
}
.lesson__icon--quiz {
  color: #15803d;
}
.lesson__icon--reading {
  color: var(--color-accent-dark);
}

.lesson__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
}

.lesson__free {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
  padding: 0.1rem 0.35rem;
  transition: background 0.2s ease, color 0.2s ease;
  border-radius: 4px;
  background: var(--color-success-container);
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #15803d;
}
.lesson__free:hover {
  background: #15803d;
  color: white;
}

.lesson__min {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

/* ── Agenda ── */
.agenda {
  margin-top: 0.9rem;
  border-left: 2px solid var(--color-border);
}

.slot {
  position: relative;
  display: flex;
  gap: 0.7rem;
  padding: 0 0 0.9rem 0.9rem;
}
.slot:last-child {
  padding-bottom: 0;
}
.slot::before {
  content: '';
  position: absolute;
  top: 5px;
  left: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
}

.slot__time {
  flex-shrink: 0;
  width: 44px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-navy);
}

.slot__body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.slot__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
}

.slot__note {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

@media (min-width: 640px) {
  .card {
    padding: 1.15rem 1.2rem 1.1rem;
  }
  .card__title {
    font-size: 18px;
  }
}
</style>
