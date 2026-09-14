<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import BarRanking from '~/components/charts/BarRanking.vue'
import type { BarRow } from '~/components/charts/types'
import EmptyState from '~/components/ui/EmptyState.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import Sparkline from '~/components/charts/Sparkline.vue'
import StatTile from '~/components/ui/StatTile.vue'
import { api } from '~/services/api'
import { clock, date, weekday } from '~/utils/format'
import type { DashboardSummary } from '~/types'

const data = ref<DashboardSummary | null>(null)
const loading = ref(true)

onMounted(async () => {
  data.value = await api.getDashboard()
  loading.value = false
})

/**
 * Drop-off as a ranking: which lesson loses the most people, and where in the
 * video they leave. The bar carries the rate; the second line carries the stop
 * time, because "62%" alone does not tell an instructor what to re-record.
 */
const dropRows = computed<BarRow[]>(() =>
  (data.value?.dropOff ?? []).map((row) => ({
    label: row.lessonTitle,
    sub: `${row.courseTitle} · ${row.moduleTitle}`,
    value: row.dropRate,
    valueText: `dừng ở ${clock(row.medianStopSecond)} / ${clock(row.durationSeconds)}`,
  })),
)

const progressRows = computed(() => data.value?.avgProgressByCourse ?? [])
</script>

<template>
  <div>
    <PageHeader
      title="Tổng quan"
      hint="Số liệu tính trên toàn bộ học viên đang hoạt động. Tuần này = 7 ngày gần nhất."
    />

    <!-- ══ Headline figures — one number each, no chart needed ══ -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Đang học"
        :value="loading ? '—' : (data?.activeLearners ?? 0)"
        unit="học viên"
        icon="users"
        hint="Có ít nhất một khóa chưa hoàn thành"
      />
      <StatTile
        label="Đăng ký mới"
        :value="loading ? '—' : (data?.newEnrolmentsThisWeek ?? 0)"
        unit="tuần này"
        icon="plus"
        :delta="
          data && data.newEnrolmentsThisWeek > 0
            ? { text: `+${data.newEnrolmentsThisWeek} trong 7 ngày`, tone: 'good' }
            : undefined
        "
      />
      <StatTile
        label="Chờ duyệt"
        :value="loading ? '—' : (data?.pendingReviews ?? 0)"
        unit="đánh giá"
        icon="star"
        hint="Chưa hiện trên trang khóa học"
      />
      <StatTile
        label="Chứng nhận"
        :value="loading ? '—' : (data?.certificatesThisMonth ?? 0)"
        unit="tháng này"
        icon="award"
      />
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <!-- ══ Drop-off — the row an instructor actually acts on ══ -->
      <AppCard
        title="Bài học bị bỏ giữa nhiều nhất"
        hint="Tỉ lệ học viên mở bài rồi tắt trước mốc 90% và không quay lại"
      >
        <template #actions>
          <AppButton to="/analytics" size="sm" variant="ghost" icon-right="chevronRight">Xem đầy đủ</AppButton>
        </template>

        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-8 animate-pulse rounded bg-track" />
        </div>
        <BarRanking
          v-else-if="dropRows.length"
          :rows="dropRows"
          :max="100"
          :alert-above="60"
          alert-label="Nên xem lại đoạn mở đầu hoặc cắt ngắn bài này"
        />
        <EmptyState
          v-else
          icon="check"
          title="Chưa có bài nào bị bỏ giữa"
          hint="Khi học viên bắt đầu xem, chỗ họ dừng lại sẽ hiện ở đây."
        />
      </AppCard>

      <div class="flex flex-col gap-4">
        <!-- ══ Enrolments over time ══ -->
        <AppCard title="Đăng ký theo tuần" hint="8 tuần gần nhất">
          <div v-if="loading" class="h-16 animate-pulse rounded bg-track" />
          <Sparkline
            v-else
            :points="(data?.enrolmentsByWeek ?? []).map((w) => ({ label: w.week, value: w.count }))"
          />
        </AppCard>

        <!-- ══ Average progress per course ══ -->
        <AppCard title="Tiến độ trung bình" hint="Theo từng khóa đã xuất bản">
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="h-6 animate-pulse rounded bg-track" />
          </div>
          <!-- Title and figure on one line, bar full width under it. The meter's
               own value column is switched off here — printing the percentage
               twice on one row is what made this block look broken. -->
          <ul v-else-if="progressRows.length" class="flex flex-col gap-3">
            <li v-for="row in progressRows" :key="row.courseId" class="min-w-0">
              <div class="mb-1.5 flex items-baseline justify-between gap-2">
                <p class="min-w-0 flex-1 truncate text-[12.5px] text-ink" :title="row.title">{{ row.title }}</p>
                <span class="figure shrink-0 text-[11.5px] font-semibold text-navy">{{ row.percent }}%</span>
              </div>
              <ProgressMeter
                :value="row.percent"
                size="sm"
                :show-value="false"
                :label="`Tiến độ trung bình khóa ${row.title}`"
              />
            </li>
          </ul>
          <EmptyState v-else title="Chưa có khóa nào có học viên" />
        </AppCard>
      </div>
    </div>

    <!-- ══ Upcoming sessions ══ -->
    <AppCard class="mt-4" title="Buổi học sắp tới" hint="Workshop và lớp trực tuyến có ngày cụ thể" :padded="false">
      <template #actions>
        <AppButton to="/sessions" size="sm" variant="ghost" icon-right="chevronRight">Quản lý lịch</AppButton>
      </template>

      <div v-if="loading" class="space-y-2 p-4">
        <div v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-lg bg-track" />
      </div>

      <ul v-else-if="data?.upcomingSessions.length" class="divide-y divide-line">
        <li
          v-for="item in data.upcomingSessions"
          :key="item.id"
          class="flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <span
            class="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-shell"
          >
            <span class="text-[9.5px] font-bold text-ink-muted uppercase">{{ weekday(item.date) }}</span>
            <span class="figure text-base leading-none font-semibold text-navy">{{ item.date.slice(-2) }}</span>
          </span>

          <div class="min-w-0 flex-1">
            <p class="truncate text-[13.5px] font-semibold text-navy">{{ item.courseTitle }}</p>
            <p class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-ink-muted">
              <span class="inline-flex items-center gap-1">
                <AppIcon name="clock" :size="11" />
                {{ item.startTime }}–{{ item.endTime }}
              </span>
              <span>{{ item.location }}</span>
              <span class="figure">{{ date(item.date) }}</span>
            </p>
          </div>

          <AppBadge
            :tone="item.attendeeIds.length >= item.seatsTotal ? 'bad' : item.seatsTotal - item.attendeeIds.length <= 3 ? 'warn' : 'good'"
          >
            {{ item.attendeeIds.length }}/{{ item.seatsTotal }} chỗ
          </AppBadge>
        </li>
      </ul>

      <EmptyState
        v-else
        icon="calendar"
        title="Không có buổi nào sắp tới"
        hint="Tạo buổi workshop hoặc lớp trực tuyến để học viên đặt chỗ."
      >
        <template #action>
          <AppButton to="/sessions" size="sm" icon="plus">Tạo buổi học</AppButton>
        </template>
      </EmptyState>
    </AppCard>
  </div>
</template>
