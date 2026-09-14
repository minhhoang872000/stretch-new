<script setup lang="ts">
/**
 * Month grid for the training calendar.
 *
 * The grid itself comes from `useCalendar` (the same one the booking flow uses)
 * so the padding days, the Monday-first column order and the "past day" flag
 * behave identically in both places; this component only maps sessions onto the
 * cells and renders them.
 *
 * It opens on the first month that actually has a session rather than on today:
 * a visitor landing on an empty current month would read it as "nothing is
 * scheduled" and never page forward.
 */
import type { ScheduleEntry } from '~/composables/useLearningSchedule'

const props = defineProps<{
  entries: ScheduleEntry[]
  selected: string | null
}>()

const emit = defineEmits<{ 'update:selected': [string | null] }>()

const { t } = useI18n()
const { currentDate, currentMonth, currentYear, calendarDays, prevMonth, nextMonth } = useCalendar()
const { weekdayShort, monthLabel } = useLearningSchedule()

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

const byIso = computed(() => {
  const map = new Map<string, ScheduleEntry[]>()
  for (const entry of props.entries) {
    const list = map.get(entry.iso)
    if (list) list.push(entry)
    else map.set(entry.iso, [entry])
  }
  return map
})

const cells = computed(() => calendarDays.value.map((day) => ({
  ...day,
  events: byIso.value.get(day.date) ?? [],
})))

const monthTitle = computed(() => monthLabel(currentMonth.value, currentYear.value))

/** How many sessions this month holds — the empty state says so out loud. */
const monthCount = computed(() => cells.value.reduce(
  (sum, cell) => sum + (cell.isCurrentMonth ? cell.events.length : 0), 0,
))

function pick(iso: string, hasEvents: boolean) {
  if (!hasEvents) return
  emit('update:selected', props.selected === iso ? null : iso)
}

// Open on the first scheduled month instead of the current one. Done during
// setup rather than in onMounted so the server renders the same month the client
// hydrates into — otherwise the grid visibly jumps one month on load.
const firstEntry = props.entries[0]
if (firstEntry && (firstEntry.year !== currentYear.value || firstEntry.month !== currentMonth.value)) {
  currentDate.value = new Date(firstEntry.year, firstEntry.month, 1)
}
</script>

<template>
  <div class="cal">
    <!-- ── Month navigation ── -->
    <div class="cal__head">
      <p class="cal__month">{{ monthTitle }}</p>

      <div class="cal__nav">
        <button type="button" class="cal__btn" :aria-label="t('learning.schedule.prev_month')" @click="prevMonth()">‹</button>
        <button type="button" class="cal__btn" :aria-label="t('learning.schedule.next_month')" @click="nextMonth()">›</button>
      </div>
    </div>

    <!-- ── Grid ── -->
    <div class="cal__dows">
      <span v-for="i in WEEKDAYS" :key="i" class="cal__dow">{{ weekdayShort(i) }}</span>
    </div>

    <div class="cal__grid">
      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        class="cell"
        :class="{
          'cell--out': !cell.isCurrentMonth,
          'cell--today': cell.isToday,
          'cell--has': cell.events.length > 0,
          'cell--on': selected === cell.date,
        }"
        :disabled="!cell.events.length"
        :aria-label="cell.events.length
          ? t('learning.schedule.day_aria', { day: cell.label, count: cell.events.length })
          : String(cell.label)"
        @click="pick(cell.date, cell.events.length > 0)"
      >
        <span class="cell__num">{{ cell.label }}</span>

        <span class="cell__events">
          <span
            v-for="entry in cell.events.slice(0, 2)"
            :key="entry.slug"
            class="pill"
            :class="`pill--${entry.kind}`"
          >{{ entry.title }}</span>

          <span v-if="cell.events.length > 2" class="cell__more">
            +{{ cell.events.length - 2 }}
          </span>
        </span>
      </button>
    </div>

    <p v-if="!monthCount" class="cal__empty">{{ t('learning.schedule.month_empty') }}</p>

    <!-- ── Legend ── -->
    <div class="cal__legend">
      <span class="key"><span class="key__dot key__dot--workshop" />{{ t('learning.catalog.kind_workshop') }}</span>
      <span class="key"><span class="key__dot key__dot--course" />{{ t('learning.catalog.kind_course') }}</span>
      <span class="key key--hint">{{ t('learning.schedule.calendar_hint') }}</span>
    </div>
  </div>
</template>

<style scoped>
.cal {
  padding: 0.9rem 0.85rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}

/* ── Head ── */
.cal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.cal__month {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-navy);
}

.cal__nav {
  display: flex;
  gap: 0.3rem;
}

.cal__btn {
  width: 27px;
  height: 27px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: white;
  font-size: 15px;
  line-height: 1;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.cal__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ── Weekday header ── */
.cal__dows {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
  margin-top: 0.75rem;
}

.cal__dow {
  padding-bottom: 0.3rem;
  text-align: center;
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ── Cells ── */
.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 46px;
  padding: 0.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--color-off-white);
  text-align: left;
  cursor: default;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.cell--out {
  background: transparent;
}
.cell--out .cell__num {
  opacity: 0.32;
}

.cell--today .cell__num {
  color: var(--color-accent);
  font-weight: 800;
}

.cell--has {
  background: white;
  border-color: var(--color-border);
  cursor: pointer;
}
.cell--has:hover {
  border-color: var(--color-accent);
}

.cell--on {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(244, 122, 31, 0.16);
}

.cell__num {
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-navy);
}

.cell__events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pill {
  display: block;
  overflow: hidden;
  padding: 1px 3px;
  border-radius: 3px;
  font-size: 8.5px;
  line-height: 1.35;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pill--workshop {
  background: #dcfce7;
  color: #15803d;
}
.pill--course {
  background: #e3edf9;
  color: var(--color-navy-light);
}
.pill--mini {
  background: #fff1e3;
  color: var(--color-accent-dark);
}

.cell__more {
  font-size: 8.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.cal__empty {
  margin-top: 0.7rem;
  text-align: center;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

/* ── Legend ── */
.cal__legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--color-border);
}

.key {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}
.key--hint {
  margin-left: auto;
  opacity: 0.8;
}

.key__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.key__dot--workshop {
  background: #15803d;
}
.key__dot--course {
  background: var(--color-navy-light);
}

/* ── Desktop ── */
@media (min-width: 640px) {
  .cal {
    padding: 1.1rem 1.15rem 1rem;
  }
  .cell {
    min-height: 68px;
    padding: 0.35rem;
  }
  .cell__num {
    font-size: 11.5px;
  }
  .pill {
    padding: 1px 4px;
    font-size: 9.5px;
  }
}
</style>
