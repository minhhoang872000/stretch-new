<script setup lang="ts">
import { computed } from 'vue'
import { parseISO } from 'date-fns'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import type { CourseSession } from '~/types'

/**
 * One session, in the same shape the public site uses on /learning-hub/schedule:
 * a date block on the left, what-and-where in the middle, seats on the right.
 *
 * Kept deliberately identical to the site's row so a session looks the same to the
 * instructor who created it and the learner who books it. The actions are the only
 * difference — attendance, edit, CSV.
 */
const props = defineProps<{ session: CourseSession; past?: boolean }>()

const emit = defineEmits<{ attendance: []; edit: []; export: [] }>()

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS_SHORT = ['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8', 'TH9', 'TH10', 'TH11', 'TH12']

const day = computed(() => parseISO(props.session.date))
const weekday = computed(() => WEEKDAYS[day.value.getDay()])
const monthShort = computed(() => MONTHS_SHORT[day.value.getMonth()])

const seatsLeft = computed(() => props.session.seatsTotal - props.session.attendeeIds.length)

const seatTone = computed<'good' | 'warn' | 'bad'>(() => {
  if (seatsLeft.value <= 0) return 'bad'
  if (seatsLeft.value <= 3) return 'warn'
  return 'good'
})
</script>

<template>
  <article
    class="t-fast flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-line-strong hover:shadow-card-hover sm:p-3.5"
    :class="props.past ? 'opacity-80' : ''"
  >
    <!-- ── Date block — the site's exact proportions ── -->
    <span
      class="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-shell"
    >
      <span class="text-[9px] font-bold tracking-wide text-ink-muted uppercase">{{ weekday }}</span>
      <span class="figure font-heading text-lg leading-none font-extrabold text-navy">
        {{ session.date.slice(-2) }}
      </span>
      <span class="text-[9px] font-bold tracking-wide text-accent-text">{{ monthShort }}</span>
    </span>

    <!-- ── What and where ── -->
    <div class="min-w-0 flex-1">
      <p class="font-heading truncate text-[14px] font-bold text-navy" :title="session.courseTitle">
        {{ session.courseTitle }}
      </p>
      <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-muted">
        <span class="inline-flex items-center gap-1">
          <AppIcon name="clock" :size="11" />
          {{ session.startTime }}–{{ session.endTime }}
        </span>
        <span class="inline-flex min-w-0 items-center gap-1">
          <AppIcon name="calendar" :size="11" />
          <span class="truncate">{{ session.location }}</span>
        </span>
        <AppBadge tone="neutral">{{ session.mode === 'online' ? 'Trực tuyến' : 'Trực tiếp' }}</AppBadge>
      </p>
    </div>

    <!-- ── Seats ── -->
    <div class="flex shrink-0 flex-col items-end gap-1">
      <AppBadge :tone="seatTone">
        {{ session.attendeeIds.length }}/{{ session.seatsTotal }} chỗ
      </AppBadge>
      <span v-if="!props.past" class="text-[10.5px] text-ink-muted">
        {{ seatsLeft > 0 ? `còn ${seatsLeft} chỗ` : 'đã kín' }}
      </span>
    </div>

    <!-- ── Actions ── -->
    <div class="flex shrink-0 items-center gap-1.5">
      <AppButton size="sm" variant="secondary" icon="users" @click="emit('attendance')">Điểm danh</AppButton>
      <AppButton v-if="!props.past" size="sm" variant="ghost" icon="pencil" @click="emit('edit')">Sửa</AppButton>
      <AppButton size="sm" variant="ghost" icon="download" @click="emit('export')">CSV</AppButton>
    </div>
  </article>
</template>
