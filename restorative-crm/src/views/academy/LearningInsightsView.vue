<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Phân tích học tập"
      subtitle="Chỗ học viên bỏ giữa khoá và câu quiz sai nhiều nhất — hai chỗ đáng sửa nội dung trước tiên."
    />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Tỉ lệ hoàn thành" :value="percent(overall.completion, 1)" icon="task_alt" tone="ok" hint="Trên tất cả suất đã ghi danh" />
      <StatTile label="Tiến độ trung bình" :value="percent(overall.progress)" icon="donut_large" tone="accent" hint="Các suất đang học" />
      <StatTile label="Điểm quiz trung bình" :value="percent(overall.quiz)" icon="grade" :tone="overall.quiz >= 70 ? 'ok' : 'warn'" />
      <StatTile label="Suất im lặng 30 ngày" :value="overall.stale" icon="hourglass_bottom" :tone="overall.stale ? 'warn' : 'neutral'" hint="Nên gửi email nhắc" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SectionCard title="Học viên rơi ở bài nào" hint="Phần trăm còn theo học sau mỗi bài">
        <ul class="space-y-4">
          <li v-for="row in dropOff" :key="row.programId">
            <div class="flex items-baseline justify-between gap-2 mb-1">
              <RouterLink :to="`/academy/programs/${row.programId}`" class="text-[0.8125rem] font-bold text-ink hover:text-accent truncate">
                {{ row.programTitle }}
              </RouterLink>
              <span class="num text-xs font-bold shrink-0" :class="row.completion >= 50 ? 'text-ok' : 'text-warn'">
                {{ row.completion }}% về đích
              </span>
            </div>
            <Sparkline
              :values="row.points.map((p) => p.retained)"
              :labels="row.points.map((p) => `Bài ${p.lesson}`)"
              :height="44"
              :min="0"
              :max="100"
              :format="(v) => `${v}% còn theo`"
            />
            <p class="meta mt-1">
              Rơi mạnh nhất ở <span class="font-bold text-ink">bài {{ row.worstLesson }}</span>
              (−{{ row.worstDrop }} điểm phần trăm). {{ advice(row) }}
            </p>
          </li>
        </ul>
      </SectionCard>

      <div class="space-y-4">
        <SectionCard title="Câu quiz sai nhiều nhất" flush>
          <table class="tbl">
            <thead>
              <tr>
                <th>Câu hỏi</th>
                <th class="text-right">Lượt làm</th>
                <th class="text-right">Tỉ lệ sai</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quizMisses" :key="q.questionId">
                <td>
                  <p class="text-ink truncate max-w-[38ch]">{{ q.question }}</p>
                  <p class="meta truncate max-w-[38ch]">{{ q.programTitle }}</p>
                </td>
                <td class="num text-right">{{ q.attempts }}</td>
                <td class="text-right">
                  <span class="num font-bold" :class="q.missRate >= 60 ? 'text-danger' : 'text-warn'">
                    {{ q.missRate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <template #footer>
            <p class="meta">
              Trên 60% sai thường là do câu hỏi chưa rõ, không phải do học viên yếu.
            </p>
          </template>
        </SectionCard>

        <SectionCard title="Hoàn thành theo chương trình">
          <BarList :items="completionByProgram" />
        </SectionCard>
      </div>

      <SectionCard title="Suất học cần nhắc" flush class="xl:col-span-2">
        <template #actions>
          <RouterLink to="/academy/enrolments" class="btn-ghost btn-sm">Mở trang ghi danh</RouterLink>
        </template>
        <table v-if="stale.length" class="tbl tbl-rows">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Chương trình</th>
              <th class="text-right">Tiến độ</th>
              <th>Học lần cuối</th>
              <th>Bài kế tiếp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in stale" :key="e.id">
              <td>
                <RouterLink :to="`/academy/learners/${e.learnerId}`" class="link">{{ e.learnerName }}</RouterLink>
              </td>
              <td class="truncate max-w-[26ch]">{{ e.programTitle }}</td>
              <td class="text-right">
                <div class="w-24 ml-auto">
                  <ProgressMeter :value="e.percent" :show-value="true" />
                </div>
              </td>
              <td class="meta">{{ ago(e.lastLessonAt) }}</td>
              <td class="meta">Bài {{ e.lessonsDone + 1 }}/{{ e.lessons }}</td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-else icon="task_alt" title="Không có suất nào bỏ quên" hint="Mọi học viên đang học đều có hoạt động trong 30 ngày." />
      </SectionCard>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMockDb, insights , loadInsights } from '@/stores/db.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import Sparkline from '@/components/ui/Sparkline.vue'
import BarList from '@/components/ui/BarList.vue'
import ProgressMeter from '@/components/ui/ProgressMeter.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { percent, ago } from '@/utils/format.js'

const db = useMockDb()

// This card plots the cohort curve, not the per-lesson drop table.
const dropOff = insights.retention
const quizMisses = insights.quizMisses

const enrolments = computed(() => db.list('enrolments'))

/**
 * The number alone does not tell anyone what to do, and the same sentence under
 * six charts stops being read. Advice keys off how bad the drop is and how far
 * into the course it happens.
 */
function advice(row) {
  if (row.worstDrop >= 10 && row.worstLesson <= 3) {
    return 'Rơi sớm và mạnh — thường là do bài mở đầu dài hoặc chưa nói rõ học viên sẽ nhận được gì.'
  }
  if (row.worstDrop >= 10) return 'Cân nhắc chia bài này thành hai phần ngắn hơn.'
  if (row.completion < 40) return 'Không có điểm rơi rõ rệt, nhưng cả khoá đang mất người dần — xem lại nhịp bài.'
  return 'Mức rơi ở đây vẫn trong khoảng bình thường.'
}

const overall = computed(() => {
  const list = enrolments.value
  const active = list.filter((e) => e.status === 'active')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return {
    completion: list.length ? (list.filter((e) => e.status === 'completed').length / list.length) * 100 : 0,
    progress: active.length ? active.reduce((s, e) => s + e.percent, 0) / active.length : 0,
    quiz: list.length ? list.reduce((s, e) => s + e.quizAvg, 0) / list.length : 0,
    stale: active.filter((e) => new Date(e.lastLessonAt) < cutoff).length,
  }
})

const completionByProgram = computed(() => {
  const groups = new Map()
  for (const e of enrolments.value) {
    const entry = groups.get(e.programId) || { title: e.programTitle, total: 0, done: 0 }
    entry.total += 1
    if (e.status === 'completed') entry.done += 1
    groups.set(e.programId, entry)
  }
  return [...groups.entries()]
    .map(([id, g]) => ({
      label: g.title,
      value: g.total ? Math.round((g.done / g.total) * 100) : 0,
      display: `${g.total ? Math.round((g.done / g.total) * 100) : 0}%`,
      hint: `${g.done}/${g.total} suất hoàn thành`,
      tone: g.done / g.total >= 0.5 ? 'ok' : 'warn',
      to: `/academy/programs/${id}`,
    }))
    .sort((a, b) => b.value - a.value)
})

const stale = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return enrolments.value
    .filter((e) => e.status === 'active' && new Date(e.lastLessonAt) < cutoff)
    .sort((a, b) => a.lastLessonAt.localeCompare(b.lastLessonAt))
    .slice(0, 10)
})

// The reports are computed server-side; fetched once per session, on demand.
onMounted(loadInsights)
</script>
