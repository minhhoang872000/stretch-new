<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import FormField from '~/components/ui/FormField.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ScheduleCalendar from '~/components/schedule/ScheduleCalendar.vue'
import SessionRow from '~/components/schedule/SessionRow.vue'
import StatTile from '~/components/ui/StatTile.vue'
import { api, TODAY } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { date } from '~/utils/format'
import type { Course, CourseSession, Learner } from '~/types'

/**
 * The training calendar, laid out the way the public site lays it out: a month
 * grid and a month-grouped list of the same sessions, switched by a toggle. The
 * row and the grid are visual copies of the site's `LearningScheduleRow` and
 * `LearningScheduleCalendar`, so a session looks the same to the instructor who
 * created it and the learner who books it.
 *
 * Attendance is a checklist inside the session rather than its own screen: on the
 * morning of a workshop the instructor has a phone in one hand, so ticking names
 * has to be two taps from the list.
 */
const { push } = useToast()

const sessions = ref<CourseSession[]>([])
const courses = ref<Course[]>([])
const learners = ref<Learner[]>([])
const loading = ref(true)

/** Grid-vs-list is a personal habit, so it is remembered per browser. */
const view = useLocalStorage<'list' | 'calendar'>('stretch-sessions-view', 'list')

const kind = ref<'all' | 'online' | 'offline'>('all')
const place = ref('all')
const selectedDay = ref<string | null>(null)

const editing = ref<CourseSession | null>(null)
const attendanceFor = ref<CourseSession | null>(null)

async function load() {
  const [s, c, l] = await Promise.all([api.listSessions(), api.listCourses(), api.listLearners()])
  sessions.value = s
  courses.value = c
  learners.value = l
  loading.value = false
}

onMounted(load)

const places = computed(() => [...new Set(sessions.value.map((s) => s.location).filter(Boolean))])

const matching = computed(() =>
  sessions.value.filter(
    (s) => (kind.value === 'all' || s.mode === kind.value) && (place.value === 'all' || s.location === place.value),
  ),
)

const upcoming = computed(() => matching.value.filter((s) => s.date >= TODAY))
const past = computed(() => [...matching.value.filter((s) => s.date < TODAY)].reverse())

/** Month groups for the list view, in date order. */
const months = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: CourseSession[] }>()
  for (const session of upcoming.value) {
    const key = session.date.slice(0, 7)
    if (!groups.has(key)) {
      const [y, m] = key.split('-')
      groups.set(key, { key, label: `Tháng ${Number(m)}, ${y}`, items: [] })
    }
    groups.get(key)!.items.push(session)
  }
  return [...groups.values()]
})

/** In calendar view, the rows under the grid: the picked day, else everything. */
const calendarRows = computed(() =>
  selectedDay.value ? upcoming.value.filter((s) => s.date === selectedDay.value) : upcoming.value,
)

const seatsOpen = computed(() =>
  upcoming.value.reduce((sum, s) => sum + Math.max(0, s.seatsTotal - s.attendeeIds.length), 0),
)
const bookedCount = computed(() => upcoming.value.reduce((sum, s) => sum + s.attendeeIds.length, 0))
const nextSession = computed(() => upcoming.value[0] ?? null)

function blank(dateIso = TODAY): CourseSession {
  const course = courses.value[0]
  return {
    id: `s-${Date.now()}`,
    courseId: course?.id ?? '',
    courseTitle: course?.title ?? '',
    date: dateIso,
    startTime: '08:30',
    endTime: '16:30',
    location: '',
    mode: 'offline',
    seatsTotal: 12,
    attendeeIds: [],
  }
}

async function saveSession() {
  if (!editing.value) return
  if (!editing.value.courseId || !editing.value.location.trim()) {
    push('Chọn chương trình và nhập địa điểm.', 'bad')
    return
  }
  const course = courses.value.find((c) => c.id === editing.value!.courseId)
  await api.saveSession({ ...editing.value, courseTitle: course?.title ?? '' })
  await load()
  editing.value = null
  push('Đã lưu buổi học.', 'good')
}

async function toggleAttendee(learnerId: string) {
  if (!attendanceFor.value) return
  await api.toggleAttendance(attendanceFor.value.id, learnerId)
  await load()
  attendanceFor.value = sessions.value.find((s) => s.id === attendanceFor.value!.id) ?? null
}

/** CSV, because that is what opens in Excel without anyone installing anything. */
async function exportCsv(session: CourseSession) {
  // The register is fetched, not held in the row — await it, or the file gets
  // the string "[object Promise]" and nobody notices until someone opens it.
  const csv = await api.attendeesCsv(session)
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `diem-danh-${session.date}-${session.id}.csv`
  link.click()
  URL.revokeObjectURL(url)
  push('Đã xuất danh sách điểm danh.', 'good')
}

const learnerName = (id: string) => learners.value.find((l) => l.id === id)?.name ?? id
const seatsLeft = (session: CourseSession) => session.seatsTotal - session.attendeeIds.length
</script>

<template>
  <div>
    <PageHeader
      title="Lịch đào tạo"
      hint="Workshop và lớp trực tuyến có ngày cụ thể. Đây cũng chính là lịch học viên thấy trên trang Lịch đào tạo của site."
    >
      <template #actions>
        <!-- View toggle — the same pair the site's schedule page offers -->
        <div class="flex gap-0.5 rounded-lg border border-line bg-surface p-0.5">
          <button
            type="button"
            class="t-fast inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold"
            :class="view === 'list' ? 'bg-navy text-white' : 'text-ink-muted hover:text-navy'"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
          >
            <AppIcon name="menu" :size="13" />
            Danh sách
          </button>
          <button
            type="button"
            class="t-fast inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold"
            :class="view === 'calendar' ? 'bg-navy text-white' : 'text-ink-muted hover:text-navy'"
            :aria-pressed="view === 'calendar'"
            @click="view = 'calendar'"
          >
            <AppIcon name="calendar" :size="13" />
            Lịch tháng
          </button>
        </div>

        <AppButton variant="primary" icon="plus" @click="editing = blank()">Tạo buổi học</AppButton>
      </template>
    </PageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Sắp diễn ra" :value="loading ? '—' : upcoming.length" unit="buổi" icon="calendar" />
      <StatTile label="Đã đặt chỗ" :value="loading ? '—' : bookedCount" unit="lượt" icon="users" />
      <StatTile
        label="Chỗ còn trống"
        :value="loading ? '—' : seatsOpen"
        icon="plus"
        :delta="seatsOpen === 0 && upcoming.length ? { text: 'Tất cả buổi đã kín chỗ', tone: 'good' } : undefined"
      />
      <StatTile
        label="Buổi gần nhất"
        :value="loading || !nextSession ? '—' : date(nextSession.date)"
        icon="clock"
        :hint="nextSession?.courseTitle"
      />
    </div>

    <!-- ── Filters, one row above the content ── -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-[10px] font-extrabold tracking-widest text-ink-muted uppercase">Hình thức</span>
      <button
        v-for="option in (['all', 'offline', 'online'] as const)"
        :key="option"
        type="button"
        class="t-fast min-h-9 rounded-full border px-3 text-[12px] font-semibold"
        :class="
          kind === option
            ? 'border-navy bg-navy text-white'
            : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-navy'
        "
        :aria-pressed="kind === option"
        @click="kind = option"
      >
        {{ option === 'all' ? 'Tất cả' : option === 'offline' ? 'Trực tiếp' : 'Trực tuyến' }}
      </button>

      <span class="ml-2 text-[10px] font-extrabold tracking-widest text-ink-muted uppercase">Địa điểm</span>
      <AppSelect
        v-model="place"
        class="w-52"
        :options="[{ value: 'all', label: 'Mọi địa điểm' }, ...places.map((p) => ({ value: p, label: p }))]"
      />
    </div>

    <div v-if="loading" class="space-y-2.5">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-track" />
    </div>

    <template v-else>
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0">
          <!-- ══ Calendar view ══ -->
          <template v-if="view === 'calendar'">
            <ScheduleCalendar
              :sessions="matching"
              :selected="selectedDay"
              @update:selected="selectedDay = $event"
              @create="editing = blank($event)"
            />

            <p class="mt-4 mb-2 text-[11px] font-extrabold tracking-widest text-ink-muted uppercase">
              {{ selectedDay ? `Buổi học ngày ${date(selectedDay)}` : 'Tất cả buổi sắp diễn ra' }}
            </p>

            <div class="flex flex-col gap-2.5">
              <SessionRow
                v-for="item in calendarRows"
                :key="item.id"
                :session="item"
                @attendance="attendanceFor = item"
                @edit="editing = { ...item }"
                @export="exportCsv(item)"
              />
            </div>
          </template>

          <!-- ══ List view — grouped by month, like the site ══ -->
          <template v-else>
            <section v-for="month in months" :key="month.key" class="mb-5 last:mb-0">
              <h2 class="mb-2 flex items-baseline gap-2 text-[12px] font-extrabold tracking-wider text-navy uppercase">
                {{ month.label }}
                <span class="text-[10.5px] font-semibold tracking-normal text-ink-muted normal-case">
                  {{ month.items.length }} buổi
                </span>
              </h2>

              <div class="flex flex-col gap-2.5">
                <SessionRow
                  v-for="item in month.items"
                  :key="item.id"
                  :session="item"
                  @attendance="attendanceFor = item"
                  @edit="editing = { ...item }"
                  @export="exportCsv(item)"
                />
              </div>
            </section>

            <AppCard v-if="!months.length" :padded="false">
              <EmptyState
                icon="calendar"
                title="Chưa có buổi nào sắp tới"
                hint="Tạo buổi để học viên thấy trên trang Lịch đào tạo của site."
              >
                <template #action>
                  <AppButton size="sm" icon="plus" @click="editing = blank()">Tạo buổi học</AppButton>
                </template>
              </EmptyState>
            </AppCard>
          </template>

          <!-- ══ Past ══ -->
          <section v-if="past.length" class="mt-6">
            <h2 class="mb-2 text-[12px] font-extrabold tracking-wider text-ink-muted uppercase">
              Đã diễn ra ({{ past.length }})
            </h2>
            <div class="flex flex-col gap-2.5">
              <SessionRow
                v-for="item in past"
                :key="item.id"
                :session="item"
                past
                @attendance="attendanceFor = item"
                @edit="editing = { ...item }"
                @export="exportCsv(item)"
              />
            </div>
          </section>
        </div>

        <!-- ══ Side ══ -->
        <aside class="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
          <AppCard title="Buổi sắp tới nhất" :hint="nextSession ? date(nextSession.date) : undefined">
            <template v-if="nextSession">
              <p class="font-heading text-[13.5px] font-bold text-navy">{{ nextSession.courseTitle }}</p>
              <p class="mt-1 text-[11.5px] text-ink-muted">
                {{ nextSession.startTime }}–{{ nextSession.endTime }} · {{ nextSession.location }}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <AppButton size="sm" variant="primary" icon="users" @click="attendanceFor = nextSession">
                  Mở điểm danh
                </AppButton>
                <AppButton size="sm" variant="ghost" icon="download" @click="exportCsv(nextSession)">CSV</AppButton>
              </div>
            </template>
            <p v-else class="text-[12px] text-ink-muted">Chưa có buổi nào phía trước.</p>
          </AppCard>

          <AppCard title="Quy tắc đang áp dụng">
            <ul class="flex flex-col gap-2 text-[11.5px] leading-relaxed text-ink-soft">
              <li class="flex gap-2">
                <AppIcon name="check" :size="13" class="mt-0.5 shrink-0 text-good" />
                Nhóm nhỏ 12 chỗ cho buổi trực tiếp — đủ để giảng viên sửa từng người.
              </li>
              <li class="flex gap-2">
                <AppIcon name="check" :size="13" class="mt-0.5 shrink-0 text-good" />
                Còn ≤ 3 chỗ thì trang lịch của site tự hiện “sắp hết chỗ”.
              </li>
              <li class="flex gap-2">
                <AppIcon name="check" :size="13" class="mt-0.5 shrink-0 text-good" />
                Bỏ tick điểm danh cũng là huỷ chỗ của học viên đó.
              </li>
            </ul>
          </AppCard>
        </aside>
      </div>
    </template>

    <!-- ══ Create / edit ══ -->
    <AppModal
      :open="!!editing"
      :title="editing?.attendeeIds.length ? 'Sửa buổi học' : 'Buổi học mới'"
      @close="editing = null"
    >
      <div v-if="editing" class="grid gap-4">
        <FormField label="Chương trình" required for="s-course">
          <AppSelect
            id="s-course"
            :model-value="editing.courseId"
            :options="courses.map((c) => ({ value: c.id, label: c.title }))"
            @update:model-value="editing.courseId = $event"
          />
        </FormField>

        <div class="grid gap-4 sm:grid-cols-3">
          <FormField label="Ngày" required for="s-date">
            <AppInput id="s-date" :model-value="editing.date" type="date" mono @update:model-value="editing.date = $event" />
          </FormField>
          <FormField label="Bắt đầu" for="s-start">
            <AppInput id="s-start" :model-value="editing.startTime" type="time" mono @update:model-value="editing.startTime = $event" />
          </FormField>
          <FormField label="Kết thúc" for="s-end">
            <AppInput id="s-end" :model-value="editing.endTime" type="time" mono @update:model-value="editing.endTime = $event" />
          </FormField>
        </div>

        <FormField label="Địa điểm" required hint="Ví dụ: TP.HCM — Studio Q1, hoặc Trực tuyến — Google Meet" for="s-loc">
          <AppInput id="s-loc" :model-value="editing.location" @update:model-value="editing.location = $event" />
        </FormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField label="Hình thức" for="s-mode">
            <AppSelect
              id="s-mode"
              :model-value="editing.mode"
              :options="[
                { value: 'offline', label: 'Trực tiếp' },
                { value: 'online', label: 'Trực tuyến' },
              ]"
              @update:model-value="editing.mode = $event as CourseSession['mode']"
            />
          </FormField>
          <FormField label="Số chỗ" hint="12 là mức Stretch đang dùng cho buổi trực tiếp" for="s-seats">
            <AppInput
              id="s-seats"
              :model-value="editing.seatsTotal"
              type="number"
              mono
              @update:model-value="editing.seatsTotal = Number($event) || 0"
            />
          </FormField>
        </div>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="editing = null">Huỷ</AppButton>
        <AppButton variant="primary" @click="saveSession">Lưu buổi học</AppButton>
      </template>
    </AppModal>

    <!-- ══ Attendance ══ -->
    <AppModal
      :open="!!attendanceFor"
      :title="`Điểm danh · ${attendanceFor ? date(attendanceFor.date) : ''}`"
      wide
      @close="attendanceFor = null"
    >
      <div v-if="attendanceFor">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-shell px-3 py-2.5">
          <p class="font-heading text-[13px] font-bold text-navy">{{ attendanceFor.courseTitle }}</p>
          <p class="figure text-[12px] text-ink-soft">
            {{ attendanceFor.attendeeIds.length }}/{{ attendanceFor.seatsTotal }} chỗ · còn
            {{ seatsLeft(attendanceFor) }}
          </p>
        </div>

        <p class="mb-2 text-[11.5px] text-ink-muted">
          Bấm vào tên để đánh dấu có mặt. Danh sách này cũng là danh sách đặt chỗ — bỏ tick nghĩa là huỷ chỗ.
        </p>

        <ul class="grid gap-1.5 sm:grid-cols-2">
          <li v-for="learner in learners" :key="learner.id">
            <button
              type="button"
              class="t-fast flex min-h-11 w-full items-center gap-2 rounded-lg border px-2.5 text-left text-[12.5px]"
              :class="
                attendanceFor.attendeeIds.includes(learner.id)
                  ? 'border-good bg-good-bg text-good'
                  : 'border-line text-ink-soft hover:border-line-strong hover:text-navy'
              "
              @click="toggleAttendee(learner.id)"
            >
              <AppIcon
                :name="attendanceFor.attendeeIds.includes(learner.id) ? 'check' : 'plus'"
                :size="14"
                :stroke-width="2.4"
              />
              <span class="min-w-0 flex-1 truncate">{{ learner.name }}</span>
            </button>
          </li>
        </ul>

        <div v-if="attendanceFor.attendeeIds.length" class="mt-3 rounded-lg border border-line p-3">
          <p class="mb-1 text-[11px] font-extrabold tracking-wider text-ink-muted uppercase">Đã có mặt</p>
          <p class="text-[12px] leading-relaxed text-ink-soft">
            {{ attendanceFor.attendeeIds.map(learnerName).join(' · ') }}
          </p>
        </div>
      </div>

      <template #footer>
        <AppButton v-if="attendanceFor" variant="secondary" icon="download" @click="exportCsv(attendanceFor)">
          Xuất CSV
        </AppButton>
        <AppButton variant="primary" @click="attendanceFor = null">Xong</AppButton>
      </template>
    </AppModal>
  </div>
</template>
