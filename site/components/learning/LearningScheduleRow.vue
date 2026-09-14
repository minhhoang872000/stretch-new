<script setup lang="ts">
/**
 * One session in the training calendar: date block, what it is, and how to take
 * it. Shared by both views on the schedule page so the list and the calendar
 * cannot drift apart.
 */
import type { ScheduleEntry } from '~/composables/useLearningSchedule'

const props = defineProps<{ entry: ScheduleEntry }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { formatPrice } = useLearningCatalog()
const { weekdayShort, monthShort, googleCalendarUrl } = useLearningSchedule()

const to = computed(() => localePath(`/learning-hub/programs/${props.entry.slug}`))
</script>

<template>
  <article class="row">
    <span class="date">
      <span class="date__dow">{{ weekdayShort(entry.weekdayIndex) }}</span>
      <span class="date__day">{{ entry.day }}</span>
      <span class="date__mon">{{ monthShort(entry.month) }}</span>
    </span>

    <div class="row__body">
      <div class="row__top">
        <span class="kind" :class="`kind--${entry.kind}`">{{ t(`learning.catalog.kind_${entry.kind}`) }}</span>
        <span class="mode">{{ t(`learning.catalog.badge_${entry.mode}`) }}</span>
        <span class="seats" :class="`seats--${entry.status}`">
          {{ entry.status === 'full'
            ? t('learning.schedule.status_full')
            : t('learning.schedule.seats_left', { count: entry.seatsLeft }) }}
        </span>
      </div>

      <NuxtLink :to="to" class="row__title">{{ entry.title }}</NuxtLink>

      <p class="row__meta">
        <span class="row__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
          {{ entry.time }}
        </span>
        <span class="row__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ entry.location }}
        </span>
        <span v-if="entry.instructor" class="row__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
          </svg>
          {{ entry.instructor }}
        </span>
      </p>

      <p v-if="entry.mode === 'online'" class="row__note">{{ t('learning.schedule.online_note') }}</p>
    </div>

    <div class="row__act">
      <span class="row__price">{{ formatPrice(entry.price) }}</span>
      <NuxtLink :to="to" class="row__cta">{{ t('learning.schedule.book') }}</NuxtLink>
      <a :href="googleCalendarUrl(entry)" target="_blank" rel="noopener" class="row__ics">
        {{ t('learning.schedule.add_calendar') }}
      </a>
    </div>
  </article>
</template>

<style scoped>
.row {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.row:hover {
  border-color: #cfdae6;
  box-shadow: 0 10px 24px -18px rgba(11, 42, 74, 0.45);
}

/* ── Date block ── */
.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
  padding: 0.35rem 0;
  border-radius: 9px;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
}

.date__dow {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.date__day {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-navy);
}

.date__mon {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-accent-dark);
}

/* ── Body ── */
.row__body {
  flex: 1;
  min-width: 0;
}

.row__top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.kind,
.mode,
.seats {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.kind--workshop {
  background: var(--color-success-container);
  color: #15803d;
}
.kind--course {
  background: #e3edf9;
  color: var(--color-navy-light);
}
.kind--mini {
  background: #fff1e3;
  color: var(--color-accent-dark);
}

.mode {
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.seats--open {
  color: #15803d;
}
.seats--few {
  background: #fff4e8;
  color: var(--color-accent-dark);
}
.seats--full {
  background: var(--color-error-container);
  color: #b91c1c;
}

.row__title {
  display: block;
  margin-top: 0.3rem;
  font-family: var(--font-heading);
  font-size: 13.5px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--color-navy);
  transition: color 0.2s ease;
}
.row__title:hover {
  color: var(--color-accent);
}

.row__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.15rem 0.65rem;
  margin-top: 0.32rem;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.row__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
}

.row__note {
  margin-top: 0.32rem;
  font-size: 10.5px;
  color: var(--color-navy-light);
  opacity: 0.9;
}

/* ── Actions ── */
.row__act {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
}

.row__price {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 800;
  color: var(--color-accent);
}

.row__cta {
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  background: var(--color-navy);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  transition: background 0.2s ease;
}
.row__cta:hover {
  background: var(--color-navy-light);
}

.row__ics {
  font-size: 10px;
  text-align: right;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.row__ics:hover {
  color: var(--color-accent);
}

@media (min-width: 640px) {
  .row {
    padding: 0.85rem 0.95rem;
  }
  .row__title {
    font-size: 15px;
  }
}
</style>
