<script setup lang="ts">
/**
 * Training calendar — every dated workshop and live course in one place.
 *
 * Two views over the same list: a month grid for "what is on in October", and a
 * month-grouped list for reading straight down. The list is the default because
 * a grid cell cannot hold the hours, the place and the seats, which is what
 * someone deciding whether to attend actually needs.
 *
 * Booking itself lives on the course page — this page links there rather than
 * growing a second enrolment flow.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const { all, upcoming, past, groupByMonth } = useLearningSchedule()

type KindFilter = 'all' | 'workshop' | 'course'

const view = ref<'list' | 'calendar'>('list')
const kind = ref<KindFilter>('all')
const place = ref<string>('all')
const selectedDay = ref<string | null>(null)
const showPast = ref(false)

/** Places come from the data — hard-coding “TP.HCM / Hà Nội / Trực tuyến” here
    would silently drop a city the moment one is added to the catalogue. */
const places = computed(() => [...new Set(all.value.map((e) => e.location).filter(Boolean))])

function matches(entry: (typeof all.value)[number]) {
  // 'course' covers the live-online courses too: the split people care about is
  // one-day workshop vs. a course, not the record type behind it.
  const kindOk = kind.value === 'all'
    || (kind.value === 'workshop' ? entry.kind === 'workshop' : entry.kind !== 'workshop')
  const placeOk = place.value === 'all' || entry.location === place.value
  return kindOk && placeOk
}

const filtered = computed(() => upcoming.value.filter(matches))
const months = computed(() => groupByMonth(filtered.value))
const filteredPast = computed(() => past.value.filter(matches))

/** In calendar view, the rows under the grid: the picked day, else everything. */
const calendarRows = computed(() =>
  selectedDay.value ? filtered.value.filter((e) => e.iso === selectedDay.value) : filtered.value,
)

const hasFilters = computed(() => kind.value !== 'all' || place.value !== 'all')

function clearFilters() {
  kind.value = 'all'
  place.value = 'all'
}

// A day that just got filtered out must not stay selected — the rows below the
// grid would then read as empty for no visible reason.
watch(filtered, (rows) => {
  if (selectedDay.value && !rows.some((e) => e.iso === selectedDay.value)) selectedDay.value = null
})

const programLink = (slug: string) => localePath(`/learning-hub/programs/${slug}`)

useSeo({
  title: `${t('learning.schedule.page_title')} — ${t('learning.brand')}`,
  description: t('learning.schedule.page_sub'),
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
          <span class="crumbs__current">{{ t('learning.schedule.breadcrumb') }}</span>
        </nav>

        <!-- ── Head ── -->
        <div class="head">
          <div class="min-w-0">
            <h1 class="head__title">{{ t('learning.schedule.page_title') }}</h1>
            <p class="head__sub">{{ t('learning.schedule.page_sub') }}</p>
          </div>

          <div class="viewtoggle">
            <button
              type="button"
              :class="{ 'viewtoggle--on': view === 'list' }"
              :aria-pressed="view === 'list'"
              @click="view = 'list'"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              {{ t('learning.schedule.view_list') }}
            </button>
            <button
              type="button"
              :class="{ 'viewtoggle--on': view === 'calendar' }"
              :aria-pressed="view === 'calendar'"
              @click="view = 'calendar'"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              {{ t('learning.schedule.view_calendar') }}
            </button>
          </div>
        </div>

        <!-- ── Filters ── -->
        <div class="filters">
          <div class="filters__row">
            <span class="filters__label">{{ t('learning.schedule.filter_kind') }}</span>
            <button
              v-for="option in (['all', 'workshop', 'course'] as KindFilter[])"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--on': kind === option }"
              @click="kind = option"
            >
              {{ option === 'all' ? t('learning.catalog.all') : t(`learning.catalog.kind_${option}`) }}
            </button>
          </div>

          <div class="filters__row">
            <span class="filters__label">{{ t('learning.schedule.filter_place') }}</span>
            <button type="button" class="chip" :class="{ 'chip--on': place === 'all' }" @click="place = 'all'">
              {{ t('learning.catalog.all') }}
            </button>
            <button
              v-for="option in places"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--on': place === option }"
              @click="place = option"
            >
              {{ option }}
            </button>
          </div>

          <p class="filters__count">
            {{ t('learning.schedule.upcoming_count', { count: filtered.length }) }}
            <button v-if="hasFilters" type="button" class="filters__clear" @click="clearFilters">
              {{ t('learning.catalog.clear_all') }}
            </button>
          </p>
        </div>

        <div class="layout">
          <div class="min-w-0">
            <!-- ══ Calendar view ══ -->
            <template v-if="view === 'calendar'">
              <LearningScheduleCalendar
                :entries="filtered"
                :selected="selectedDay"
                @update:selected="selectedDay = $event"
              />

              <p class="rows__cap">
                {{ selectedDay
                  ? t('learning.schedule.selected_day', { count: calendarRows.length })
                  : t('learning.schedule.all_upcoming') }}
              </p>
            </template>

            <!-- ══ Rows ══ -->
            <div v-if="filtered.length" class="rows">
              <!-- Calendar view: flat, already narrowed by the picked day -->
              <template v-if="view === 'calendar'">
                <LearningScheduleRow v-for="entry in calendarRows" :key="entry.slug" :entry="entry" class="rows__item" />
              </template>

              <!-- List view: the same rows, grouped by month -->
              <template v-else>
                <section v-for="month in months" :key="month.key" class="month">
                  <h2 class="month__title">
                    {{ month.label }}
                    <span class="month__count">{{ t('learning.schedule.month_count', { count: month.entries.length }) }}</span>
                  </h2>

                  <LearningScheduleRow v-for="entry in month.entries" :key="entry.slug" :entry="entry" class="rows__item" />
                </section>
              </template>
            </div>

            <div v-else class="empty">
              <p class="empty__title">{{ t('learning.schedule.empty_title') }}</p>
              <p class="empty__sub">{{ t('learning.schedule.empty_sub') }}</p>
              <button v-if="hasFilters" type="button" class="empty__btn" @click="clearFilters">
                {{ t('learning.catalog.clear_filters') }}
              </button>
            </div>

            <!-- ── Past sessions ── -->
            <section v-if="filteredPast.length" class="pastbox">
              <button type="button" class="pastbox__head" :aria-expanded="showPast" @click="showPast = !showPast">
                <span>{{ t('learning.schedule.past_title', { count: filteredPast.length }) }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showPast ? 'rotate(180deg)' : '' }">
                  <polyline points="6 9.5 12 15.5 18 9.5" />
                </svg>
              </button>

              <ul v-show="showPast" class="pastlist">
                <li v-for="entry in filteredPast" :key="entry.slug" class="pastrow">
                  <span class="pastrow__date">{{ entry.date }}</span>
                  <NuxtLink :to="programLink(entry.slug)" class="pastrow__title">{{ entry.title }}</NuxtLink>
                  <span class="pastrow__place">{{ entry.location }}</span>
                </li>
              </ul>
            </section>
          </div>

          <!-- ══ Side ══ -->
          <aside class="side">
            <div class="card">
              <p class="card__title">{{ t('learning.schedule.how_title') }}</p>
              <ol class="steps">
                <li><span class="steps__n">1</span>{{ t('learning.schedule.how_1') }}</li>
                <li><span class="steps__n">2</span>{{ t('learning.schedule.how_2') }}</li>
                <li><span class="steps__n">3</span>{{ t('learning.schedule.how_3') }}</li>
              </ol>
            </div>

            <div class="card card--dark">
              <p class="card__title card__title--light">{{ t('learning.schedule.support_title') }}</p>
              <p class="card__sub">{{ t('learning.schedule.support_sub') }}</p>
              <NuxtLink :to="localePath('/learning-hub/programs')" class="card__cta">
                {{ t('learning.schedule.support_cta') }} →
              </NuxtLink>
            </div>
          </aside>
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
  gap: 0.9rem;
  margin-top: 0.7rem;
}

.head__title {
  font-family: var(--font-heading);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-navy);
}

.head__sub {
  margin-top: 0.3rem;
  max-width: 40rem;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.viewtoggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  align-self: flex-start;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: white;
}
.viewtoggle button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  border-radius: 7px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
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

/* ── Filters ── */
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1.1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.filters__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filters__label {
  width: 74px;
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.chip {
  padding: 0.25rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  background: white;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.chip--on {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: white;
}

.filters__count {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.filters__clear {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-navy-light);
}
.filters__clear:hover {
  color: var(--color-accent);
}

/* ── Layout ── */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.1rem;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

/* ── Month groups ── */
.month + .month {
  margin-top: 1.1rem;
}

.month__title {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-navy);
}

.month__count {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-text-secondary);
}

/* ── Rows ── */
.rows__cap {
  margin: 0.9rem 0 0.5rem;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* Row styling lives in LearningScheduleRow; only the gap between rows is the
   list's business. */
.rows__item + .rows__item {
  margin-top: 0.5rem;
}


/* ── Empty ── */
.empty {
  padding: 2.6rem 1.5rem;
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
  margin-top: 0.3rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.empty__btn {
  margin-top: 0.9rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
}
.empty__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ── Past ── */
.pastbox {
  margin-top: 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  overflow: hidden;
}

.pastbox__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 0.85rem;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-navy);
}
.pastbox__head svg {
  color: var(--color-navy-light);
  transition: transform 0.2s ease;
}

.pastlist {
  border-top: 1px solid var(--color-border);
}

.pastrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.pastrow:last-child {
  border-bottom: none;
}

.pastrow__date {
  width: 76px;
  flex-shrink: 0;
}

.pastrow__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-navy);
  font-weight: 600;
}
.pastrow__title:hover {
  color: var(--color-accent);
}

.pastrow__place {
  flex-shrink: 0;
  font-size: 10.5px;
}

/* ── Side cards ── */
.card {
  padding: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}

.card__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--color-navy);
}
.card__title--light {
  color: white;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.steps__n {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 800;
  color: var(--color-navy);
}

.card--dark {
  border-color: transparent;
  background: linear-gradient(150deg, var(--color-navy) 0%, #143a60 100%);
}

.card__sub {
  margin-top: 0.35rem;
  font-size: 11.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.78);
}

.card__cta {
  display: inline-block;
  margin-top: 0.6rem;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-accent-light);
}
.card__cta:hover {
  color: white;
}

/* ── Desktop ── */
@media (min-width: 640px) {
  .head {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .head__title {
    font-size: 28px;
  }
  .row {
    padding: 0.85rem 0.95rem;
  }
  .row__title {
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 268px;
    gap: 1.25rem;
  }
  .side {
    position: sticky;
    top: 1rem;
    align-self: start;
  }
}
</style>
