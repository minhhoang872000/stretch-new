<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import BarRanking from '~/components/charts/BarRanking.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import StatTile from '~/components/ui/StatTile.vue'
import type { BarRow } from '~/components/charts/types'
import { api, WATCHED_THRESHOLD } from '~/services/api'
import { clock } from '~/utils/format'
import type { Course, DropOffRow, QuizMissRow } from '~/types'

/**
 * Learning analytics — the screen that turns watch records into a to-do list.
 *
 * Three questions, three forms:
 * 1. Which lesson loses the most people, and at what second → horizontal ranking
 *    (order IS the insight; the stop time rides along as the row's second line)
 * 2. Which quiz question is missed most → the same ranking form, different data
 * 3. How much of each lesson gets watched on average → a meter per lesson, with
 *    the 90% threshold marked so "finished" is visible without arithmetic
 *
 * Everything is single-series, so nothing here needs a legend or a second hue.
 */
const dropOff = ref<DropOffRow[]>([])
const quizMisses = ref<QuizMissRow[]>([])
const courses = ref<Course[]>([])
const loading = ref(true)
const courseFilter = ref('all')

onMounted(async () => {
  const [drops, misses, courseList] = await Promise.all([
    api.getDropOff(),
    api.getQuizMisses(),
    api.listCourses(),
  ])
  dropOff.value = drops
  quizMisses.value = misses
  courses.value = courseList
  loading.value = false
})

const courseOptions = computed(() => [
  { value: 'all', label: 'Tất cả chương trình' },
  ...courses.value
    .filter((c) => c.modules.length)
    .map((c) => ({ value: c.id, label: c.title })),
])

const filteredDrops = computed(() =>
  courseFilter.value === 'all' ? dropOff.value : dropOff.value.filter((r) => r.courseId === courseFilter.value),
)

/** Top 12 — a ranking longer than that stops being readable and becomes a table. */
const dropRows = computed<BarRow[]>(() =>
  filteredDrops.value.slice(0, 12).map((row) => ({
    label: row.lessonTitle,
    sub: `${row.courseTitle} · ${row.moduleTitle} · ${row.starts} lượt mở`,
    value: row.dropRate,
    valueText: `dừng ở ${clock(row.medianStopSecond)} / ${clock(row.durationSeconds)}`,
  })),
)

const quizRows = computed<BarRow[]>(() =>
  quizMisses.value.slice(0, 12).map((row) => ({
    label: row.question,
    sub: `${row.courseTitle} · ${row.lessonTitle} · ${row.attempts} lượt làm`,
    value: row.missRate,
  })),
)

/** Average share of each lesson actually watched, worst first. */
const watchRows = computed(() =>
  [...filteredDrops.value]
    .map((row) => ({
      ...row,
      watchedPercent: Math.round((row.medianStopSecond / row.durationSeconds) * 100),
    }))
    .sort((a, b) => a.watchedPercent - b.watchedPercent)
    .slice(0, 8),
)

const worstDrop = computed(() => filteredDrops.value[0] ?? null)
const worstQuiz = computed(() => quizMisses.value[0] ?? null)
const totalStarts = computed(() => filteredDrops.value.reduce((sum, r) => sum + r.starts, 0))
const avgDropRate = computed(() =>
  filteredDrops.value.length
    ? Math.round(filteredDrops.value.reduce((s, r) => s + r.dropRate, 0) / filteredDrops.value.length)
    : 0,
)
</script>

<template>
  <div>
    <PageHeader
      title="Phân tích học tập"
      hint="Tính từ bản ghi xem của học viên. Một bài bị bỏ ở phút thứ 1 là vấn đề mở đầu; bỏ ở phút cuối thì chỉ là bỏ qua đoạn kết."
    >
      <template #actions>
        <AppSelect v-model="courseFilter" class="w-56" :options="courseOptions" />
      </template>
    </PageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Lượt mở bài" :value="loading ? '—' : totalStarts" icon="video" />
      <StatTile
        label="Tỉ lệ bỏ giữa TB"
        :value="loading ? '—' : avgDropRate"
        unit="%"
        icon="warning"
        :hint="`Tính theo mốc hoàn thành ${WATCHED_THRESHOLD}%`"
      />
      <!-- A tile holds ONE figure. The lesson name goes in the hint, where a long
           Vietnamese title can wrap instead of blowing out a 24px numeral. -->
      <StatTile
        label="Bài mất người nhiều nhất"
        :value="loading ? '—' : `${worstDrop?.dropRate ?? 0}`"
        unit="% bỏ giữa"
        icon="chart"
        :hint="worstDrop?.lessonTitle"
      />
      <StatTile
        label="Câu hỏi sai nhiều nhất"
        :value="loading ? '—' : `${worstQuiz?.missRate ?? 0}%`"
        icon="quiz"
        :hint="worstQuiz?.lessonTitle"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- ══ Drop-off ══ -->
      <AppCard
        title="Bỏ giữa theo bài học"
        hint="Xếp theo số học viên bị mất, không chỉ theo tỉ lệ — 100% của 2 người không phải bài cần sửa trước"
      >
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-8 animate-pulse rounded bg-track" />
        </div>
        <BarRanking
          v-else-if="dropRows.length"
          :rows="dropRows"
          :max="100"
          :alert-above="60"
          alert-label="Quá nửa học viên không đi hết bài này"
        />
        <EmptyState v-else icon="check" title="Chưa có bài nào bị bỏ giữa" />
      </AppCard>

      <!-- ══ Quiz misses ══ -->
      <AppCard
        title="Câu hỏi bị làm sai nhiều nhất"
        hint="Sai nhiều thường không phải học viên kém — mà là bài giảng chỗ đó chưa rõ"
      >
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-8 animate-pulse rounded bg-track" />
        </div>
        <BarRanking
          v-else-if="quizRows.length"
          :rows="quizRows"
          :max="100"
          :alert-above="50"
          alert-label="Nên giảng lại đoạn liên quan hoặc viết lại câu hỏi"
        />
        <EmptyState v-else icon="quiz" title="Chưa có dữ liệu bài kiểm tra" />
      </AppCard>
    </div>

    <!-- ══ Average watched per lesson ══ -->
    <AppCard
      class="mt-4"
      title="Xem được bao nhiêu phần của mỗi bài"
      :hint="`Vạch dọc là mốc ${WATCHED_THRESHOLD}% — mốc tính là đã hoàn thành`"
      :padded="false"
    >
      <div v-if="loading" class="space-y-2 p-4">
        <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded bg-track" />
      </div>

      <ul v-else-if="watchRows.length" class="divide-y divide-line">
        <li v-for="row in watchRows" :key="row.lessonId" class="flex flex-wrap items-center gap-3 px-4 py-3">
          <div class="min-w-[12rem] flex-1">
            <p class="truncate text-[12.5px] text-ink">{{ row.lessonTitle }}</p>
            <p class="truncate text-[11px] text-ink-muted">{{ row.courseTitle }} · {{ row.moduleTitle }}</p>
          </div>

          <span class="figure w-24 shrink-0 text-right text-[11.5px] text-ink-soft">
            {{ clock(row.medianStopSecond) }} / {{ clock(row.durationSeconds) }}
          </span>

          <div class="w-40 shrink-0">
            <ProgressMeter
              :value="row.watchedPercent"
              :mark="WATCHED_THRESHOLD"
              :label="`Trung vị đã xem của bài ${row.lessonTitle}`"
            />
          </div>

          <AppBadge :tone="row.watchedPercent >= WATCHED_THRESHOLD ? 'good' : row.watchedPercent >= 50 ? 'warn' : 'bad'">
            {{ row.watchedPercent >= WATCHED_THRESHOLD ? 'Xem hết' : row.watchedPercent >= 50 ? 'Xem hơn nửa' : 'Bỏ sớm' }}
          </AppBadge>
        </li>
      </ul>

      <EmptyState v-else icon="chart" title="Chưa đủ dữ liệu để dựng báo cáo" />
    </AppCard>

    <!-- How the numbers are computed — stated, not hidden in a tooltip. -->
    <div class="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      <AppIcon name="info" :size="15" class="mt-0.5 text-ink-muted" />
      <div class="min-w-0 text-[11.5px] leading-relaxed text-ink-muted">
        <p class="font-semibold text-ink-soft">Cách tính</p>
        <p class="mt-0.5">
          <span class="font-semibold">Bỏ giữa:</span> học viên đã mở bài, xem dưới {{ WATCHED_THRESHOLD }}% và
          không quay lại. <span class="font-semibold">Dừng ở:</span> trung vị giây cuối mà nhóm bỏ giữa xem tới —
          dùng trung vị chứ không dùng trung bình để một người tắt ngay giây đầu không kéo lệch cả bài.
          <span class="font-semibold">Câu hỏi sai:</span> tỉ lệ chọn sai ở lần làm đầu tiên.
        </p>
      </div>
    </div>
  </div>
</template>
