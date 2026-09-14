<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import AppIcon from '~/components/ui/AppIcon.vue'
import type { CourseSession } from '~/types'

/**
 * Month grid for the training calendar — the same object the public site shows on
 * /learning-hub/schedule, so an instructor sees the schedule laid out the way
 * their learners see it, plus the things only they can do.
 *
 * Visual language is taken from the site's `LearningScheduleCalendar`: Monday-first
 * columns, off-white empty cells, white bordered cells for days that have
 * something on, kind-coloured chips, an accent ring on the selected day, and the
 * legend under the grid. The month maths comes from date-fns rather than
 * hand-rolled arithmetic — `startOfWeek(..., { weekStartsOn: 1 })` is the one line
 * that used to be six.
 *
 * Admin-only additions: hovering an empty day offers a "+" that creates a session
 * on that date, and each chip shows how full the session is.
 */
const props = defineProps<{
  sessions: CourseSession[]
  /** yyyy-mm-dd, or null. */
  selected: string | null
}>()

const emit = defineEmits<{
  'update:selected': [string | null]
  create: [string]
  open: [CourseSession]
}>()

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

/** Opens on the first month that has a session — an empty current month reads as
    "nothing is scheduled" when in fact the next intake is three weeks out. */
const cursor = ref(startOfMonth(props.sessions[0] ? parseISO(props.sessions[0].date) : new Date()))

watch(
  () => props.sessions.map((s) => s.date).join(','),
  () => {
    const first = [...props.sessions].sort((a, b) => a.date.localeCompare(b.date))[0]
    if (first) cursor.value = startOfMonth(parseISO(first.date))
  },
)

const monthLabel = computed(() => `Tháng ${cursor.value.getMonth() + 1}, ${cursor.value.getFullYear()}`)

const byDate = computed(() => {
  const map = new Map<string, CourseSession[]>()
  for (const session of props.sessions) {
    const list = map.get(session.date)
    if (list) list.push(session)
    else map.set(session.date, [session])
  }
  return map
})

const cells = computed(() => {
  const from = startOfWeek(startOfMonth(cursor.value), { weekStartsOn: 1 })
  const to = endOfWeek(endOfMonth(cursor.value), { weekStartsOn: 1 })
  return eachDayOfInterval({ start: from, end: to }).map((day) => {
    const iso = format(day, 'yyyy-MM-dd')
    return {
      iso,
      label: day.getDate(),
      inMonth: isSameMonth(day, cursor.value),
      today: isToday(day),
      sessions: byDate.value.get(iso) ?? [],
    }
  })
})

const monthCount = computed(() =>
  cells.value.reduce((sum, cell) => sum + (cell.inMonth ? cell.sessions.length : 0), 0),
)

const KIND_CHIP: Record<string, string> = {
  workshop: 'bg-good-bg text-good',
  course: 'bg-info-bg text-navy-light',
  mini: 'bg-[#fff1e3] text-accent-text',
}

function pick(iso: string, hasSessions: boolean) {
  if (!hasSessions) {
    emit('create', iso)
    return
  }
  emit('update:selected', props.selected === iso ? null : iso)
}

const full = (session: CourseSession) => session.attendeeIds.length >= session.seatsTotal
</script>

<template>
  <div class="rounded-xl border border-line bg-surface p-3.5 shadow-card sm:p-4">
    <!-- ── Month navigation ── -->
    <div class="flex items-center justify-between gap-3">
      <p class="font-heading text-[15px] font-extrabold text-navy">{{ monthLabel }}</p>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="t-fast grid size-9 place-items-center rounded-lg border border-line text-navy hover:border-accent-dark hover:text-accent-text"
          @click="cursor = addMonths(cursor, -1)"
        >
          <AppIcon name="chevronLeft" :size="14" label="Tháng trước" />
        </button>
        <button
          type="button"
          class="t-fast grid size-9 place-items-center rounded-lg border border-line text-navy hover:border-accent-dark hover:text-accent-text"
          @click="cursor = addMonths(cursor, 1)"
        >
          <AppIcon name="chevronRight" :size="14" label="Tháng sau" />
        </button>
      </div>
    </div>

    <!-- ── Weekday header ── -->
    <div class="mt-3 grid grid-cols-7 gap-0.5">
      <span
        v-for="day in WEEKDAYS"
        :key="day"
        class="pb-1 text-center text-[9.5px] font-extrabold tracking-wider text-ink-muted uppercase"
      >
        {{ day }}
      </span>
    </div>

    <!-- ── Grid ── -->
    <div class="grid grid-cols-7 gap-0.5">
      <button
        v-for="cell in cells"
        :key="cell.iso"
        type="button"
        class="t-fast group flex min-h-[52px] flex-col gap-0.5 rounded-lg border p-1 text-left sm:min-h-[74px] sm:p-1.5"
        :class="[
          cell.sessions.length
            ? 'border-line bg-surface hover:border-accent-dark'
            : 'border-transparent bg-shell hover:border-line-strong',
          !cell.inMonth ? 'opacity-45' : '',
          props.selected === cell.iso ? 'border-accent-dark ring-2 ring-accent/25' : '',
        ]"
        :aria-label="
          cell.sessions.length
            ? `Ngày ${cell.label}, ${cell.sessions.length} buổi học`
            : `Ngày ${cell.label}, tạo buổi học mới`
        "
        @click="pick(cell.iso, cell.sessions.length > 0)"
      >
        <span class="flex items-center justify-between">
          <span
            class="font-heading text-[11px] font-semibold"
            :class="cell.today ? 'text-accent-text' : 'text-navy'"
          >
            {{ cell.label }}
          </span>
          <!-- The affordance that makes this an admin calendar rather than a
               read-only one: an empty day offers to become a session. -->
          <AppIcon
            v-if="!cell.sessions.length"
            name="plus"
            :size="11"
            :stroke-width="2.4"
            class="text-ink-muted opacity-0 group-hover:opacity-100"
          />
        </span>

        <span class="flex min-w-0 flex-col gap-0.5">
          <span
            v-for="session in cell.sessions.slice(0, 2)"
            :key="session.id"
            class="truncate rounded-[3px] px-1 py-px text-[9px] leading-tight font-semibold sm:text-[9.5px]"
            :class="[KIND_CHIP[session.mode === 'online' ? 'course' : 'workshop'], full(session) ? 'line-through' : '']"
          >
            {{ session.startTime }} {{ session.courseTitle }}
          </span>
          <span v-if="cell.sessions.length > 2" class="text-[9px] font-bold text-ink-muted">
            +{{ cell.sessions.length - 2 }} buổi nữa
          </span>
        </span>
      </button>
    </div>

    <p v-if="!monthCount" class="mt-3 text-center text-[11.5px] text-ink-muted">
      Tháng này chưa có buổi nào — bấm vào một ngày để tạo.
    </p>

    <!-- ── Legend ── -->
    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
      <span class="inline-flex items-center gap-1.5 text-[10.5px] text-ink-muted">
        <span class="size-2 rounded-[2px] bg-good" />Trực tiếp
      </span>
      <span class="inline-flex items-center gap-1.5 text-[10.5px] text-ink-muted">
        <span class="size-2 rounded-[2px] bg-navy-light" />Trực tuyến
      </span>
      <span class="ml-auto text-[10.5px] text-ink-muted opacity-85">
        Bấm ngày có buổi để xem · bấm ngày trống để tạo
      </span>
    </div>
  </div>
</template>
