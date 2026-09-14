<template>
  <main class="page">
    <PageHeader
      eyebrow="Tổng quan"
      title="Hôm nay ở Stretch"
      :subtitle="`Số liệu tính đến ${dateLabel}. Các module học viện, bán hàng và nội dung đang chạy trên dữ liệu mẫu.`"
    >
      <template #actions>
        <RouterLink to="/google-analytics" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">analytics</span>
          Báo cáo GA
        </RouterLink>
        <button type="button" class="btn-ghost btn-sm" @click="refresh">
          <span class="material-symbols-outlined text-lg" :class="{ 'animate-spin': refreshing }">refresh</span>
          Làm mới
        </button>
      </template>
    </PageHeader>

    <!-- KPI row ---------------------------------------------------------- -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
      <StatTile
        label="Doanh thu 30 ngày"
        :value="vnd(revenue30)"
        :delta="revenueDelta"
        icon="payments"
        tone="accent"
        hint="So với 15 ngày trước đó"
        to="/sales/payments"
      />
      <StatTile
        label="Đơn chờ thu"
        :value="db.counts.ordersPending"
        icon="receipt_long"
        :tone="db.counts.ordersPending ? 'warn' : 'neutral'"
        :hint="pendingValue"
        to="/sales/orders"
      />
      <StatTile
        label="Lịch hẹn hôm nay"
        :value="bookingsToday.length"
        icon="event_available"
        tone="info"
        :hint="`${db.counts.bookingsPending} chờ xác nhận`"
        to="/bookings"
      />
      <StatTile
        label="Đang học"
        :value="activeEnrolments"
        icon="how_to_reg"
        tone="ok"
        :hint="`${completedEnrolments} đã hoàn thành`"
        to="/academy/enrolments"
      />
      <StatTile
        label="Học viên mới 30 ngày"
        :value="newLearners"
        icon="person_add"
        tone="accent"
        :hint="`${db.list('learners').length} học viên tổng`"
        to="/academy/learners"
      />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Việc cần xử lý: the reason to open this page at all ------------ -->
      <SectionCard title="Việc cần xử lý" :hint="todo.length ? `${totalTodo} việc đang chờ` : 'Không còn việc nào'" flush>
        <template #actions>
          <span v-if="totalTodo" class="num chip chip-warn">{{ totalTodo }}</span>
        </template>

        <ul v-if="todo.length" class="divide-y divide-line-soft">
          <li v-for="item in todo" :key="item.to">
            <RouterLink
              :to="item.to"
              class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-accent-soft/40 transition-colors group"
            >
              <span
                class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                :class="item.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[0.8125rem] font-bold text-ink truncate">{{ item.label }}</span>
                <span class="block meta truncate">{{ item.hint }}</span>
              </span>
              <span class="num text-sm font-bold text-ink shrink-0">{{ item.count }}</span>
              <span
                class="material-symbols-outlined text-base text-ink-4 group-hover:text-accent transition-colors"
                aria-hidden="true"
              >chevron_right</span>
            </RouterLink>
          </li>
        </ul>

        <EmptyState
          v-else
          icon="task_alt"
          title="Sạch hàng chờ"
          hint="Không có lịch hẹn, đơn hàng hay đánh giá nào đang đợi xử lý."
        />
      </SectionCard>

      <!-- Doanh thu -------------------------------------------------------- -->
      <SectionCard title="Doanh thu 30 ngày" :hint="`${paidOrders} đơn đã thu · trung bình ${vnd(avgOrder)}/đơn`">
        <template #actions>
          <RouterLink to="/sales/orders" class="btn-ghost btn-sm">Xem đơn</RouterLink>
        </template>
        <Sparkline
          :values="trend.map((d) => d.revenue)"
          :labels="trend.map((d) => d.date)"
          :height="72"
          caption="Doanh thu theo ngày"
          :format="vnd"
        />
        <div class="mt-3 grid grid-cols-3 gap-2 text-center">
          <div class="panel-quiet py-2">
            <p class="label-xs">Cao nhất</p>
            <p class="num text-sm font-bold text-ink mt-0.5">{{ vnd(peak.revenue) }}</p>
            <p class="meta">{{ shortDate(peak.date) }}</p>
          </div>
          <div class="panel-quiet py-2">
            <p class="label-xs">Ngày có đơn</p>
            <p class="num text-sm font-bold text-ink mt-0.5">{{ daysWithOrders }}/30</p>
            <p class="meta">có phát sinh</p>
          </div>
          <div class="panel-quiet py-2">
            <p class="label-xs">Chờ thu</p>
            <p class="num text-sm font-bold text-warn mt-0.5">{{ vnd(pendingTotal) }}</p>
            <p class="meta">{{ db.counts.ordersPending }} đơn</p>
          </div>
        </div>
      </SectionCard>

      <!-- Chương trình bán tốt ------------------------------------------- -->
      <SectionCard title="Chương trình theo doanh thu" hint="Luỹ kế từ khi mở bán">
        <template #actions>
          <RouterLink to="/academy/programs" class="btn-ghost btn-sm">Quản lý</RouterLink>
        </template>
        <BarList :items="topPrograms" />
      </SectionCard>

      <!-- Lịch hôm nay ---------------------------------------------------- -->
      <SectionCard title="Lịch hôm nay và sắp tới" flush class="xl:col-span-2">
        <template #actions>
          <RouterLink to="/calendar" class="btn-ghost btn-sm">Lịch tuần</RouterLink>
          <RouterLink to="/academy/sessions" class="btn-ghost btn-sm">Khai giảng</RouterLink>
        </template>

        <div class="overflow-x-auto">
          <table class="tbl tbl-rows">
            <thead>
              <tr>
                <th>Khi nào</th>
                <th>Nội dung</th>
                <th>Ai phụ trách</th>
                <th class="text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in agenda" :key="row.key">
                <td class="whitespace-nowrap">
                  <p class="num font-bold text-ink">{{ shortDate(row.date) }}</p>
                  <p class="meta">{{ row.time }}</p>
                </td>
                <td>
                  <p class="font-semibold text-ink truncate max-w-[26ch]">{{ row.title }}</p>
                  <p class="meta truncate max-w-[30ch]">{{ row.place }}</p>
                </td>
                <td class="text-ink-2">{{ row.who }}</td>
                <td class="text-right"><StatusPill :status="row.status" /></td>
              </tr>
              <tr v-if="!agenda.length">
                <td colspan="4" class="!p-0">
                  <EmptyState icon="event_busy" title="Không có gì trong hai ngày tới" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <!-- Phễu ------------------------------------------------------------ -->
      <SectionCard title="Phễu chuyển đổi" hint="Rollup từ tracking của site">
        <template #actions>
          <RouterLink to="/funnel" class="btn-ghost btn-sm">Chi tiết</RouterLink>
        </template>
        <ul class="space-y-2.5">
          <li v-for="(step, i) in funnel" :key="step.step">
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-xs font-semibold text-ink-2">{{ step.step }}</span>
              <span class="num text-xs font-bold text-ink">{{ compact(step.count) }}</span>
            </div>
            <ProgressMeter
              :value="funnelShare(step.count)"
              :show-value="false"
              :tone="i === funnel.length - 1 ? 'ok' : 'accent'"
            />
            <p v-if="i > 0" class="meta mt-0.5">
              Chuyển đổi từ bước trước: {{ percent((step.count / funnel[i - 1].count) * 100, 1) }}
            </p>
          </li>
        </ul>
      </SectionCard>

      <!-- Học tập --------------------------------------------------------- -->
      <SectionCard title="Chỗ học viên rơi nhiều nhất" hint="Ba chương trình cần xem lại bài học">
        <template #actions>
          <RouterLink to="/academy/insights" class="btn-ghost btn-sm">Phân tích</RouterLink>
        </template>
        <ul class="space-y-3">
          <li v-for="row in dropOff" :key="row.programId">
            <div class="flex items-baseline justify-between gap-2 mb-1">
              <RouterLink :to="`/academy/programs/${row.programId}`" class="text-xs font-semibold text-ink truncate hover:text-accent">
                {{ row.programTitle }}
              </RouterLink>
              <span class="num text-xs font-bold text-danger shrink-0">−{{ row.worstDrop }}%</span>
            </div>
            <Sparkline
              :values="row.points.map((p) => p.retained)"
              :labels="row.points.map((p) => `Bài ${p.lesson}`)"
              :height="28"
              stroke="#a32a21"
              fill="rgba(163, 42, 33, 0.07)"
              :format="(v) => `${v}% còn theo`"
            />
            <p class="meta mt-0.5">Rơi mạnh nhất ở bài {{ row.worstLesson }} · hoàn thành {{ row.completion }}%</p>
          </li>
        </ul>
      </SectionCard>

      <!-- Nhật ký --------------------------------------------------------- -->
      <SectionCard title="Ai vừa làm gì" flush class="xl:col-span-2">
        <template #actions>
          <RouterLink to="/audit" class="btn-ghost btn-sm">Toàn bộ nhật ký</RouterLink>
        </template>
        <ul class="divide-y divide-line-soft">
          <li v-for="row in recentLog" :key="row.id" class="px-3.5 py-2 flex items-center gap-3">
            <span
              class="w-6 h-6 rounded-full bg-panel-3 text-2xs font-bold text-ink-2 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >{{ initials(row.user) }}</span>
            <span class="min-w-0 flex-1">
              <span class="text-[0.8125rem] text-ink-2 truncate block">
                <span class="font-bold text-ink">{{ row.user }}</span> — {{ row.detail }}
              </span>
            </span>
            <span class="meta shrink-0">{{ ago(row.at) }}</span>
          </li>
        </ul>
      </SectionCard>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useMockDb, insights , loadInsights } from '@/stores/db.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Sparkline from '@/components/ui/Sparkline.vue'
import BarList from '@/components/ui/BarList.vue'
import ProgressMeter from '@/components/ui/ProgressMeter.vue'
import { vnd, compact, percent, ago, initials, date as fmtDate } from '@/utils/format.js'

/**
 * Operations home.
 *
 * Deliberately not a chart wall: the first thing on the page is the queue of
 * things waiting for a human, because that is what the console is opened for.
 * Everything here reads from the mock DB, so it never shows an API error state.
 */
const db = useMockDb()
const refreshing = ref(false)

const trend = insights.revenueTrend
const funnel = insights.funnel
const dropOff = insights.dropOff.slice(0, 3)

const dateLabel = computed(() => fmtDate(new Date()))
/** Dates in the agenda drop the year — the table only spans a few days. */
const shortDate = (value) => fmtDate(value).slice(5)

async function refresh() {
  refreshing.value = true
  await db.simulate('dashboard', 400)
  refreshing.value = false
}

// ── revenue ─────────────────────────────────────────────────────────
const revenue30 = computed(() => trend.reduce((s, d) => s + d.revenue, 0))
/** Second half of the window against the first — a comparison the data
    actually supports, rather than an invented baseline. */
const revenueDelta = computed(() => {
  const half = Math.floor(trend.length / 2)
  const older = trend.slice(0, half).reduce((s, d) => s + d.revenue, 0)
  const newer = trend.slice(half).reduce((s, d) => s + d.revenue, 0)
  if (!older) return null
  return Math.round(((newer - older) / older) * 100)
})
/**
 * The best day in the window.
 *
 * Guarded for an empty series because the reports arrive after this component
 * first renders: `[].reduce(fn, trend[0])` seeds with `undefined` and returns
 * it, and the template then reads `.revenue` off nothing.
 */
const peak = computed(() => {
  if (!trend.length) return { revenue: 0, date: '' }
  return trend.reduce((a, b) => (b.revenue > a.revenue ? b : a))
})

/** Share of the top of the funnel. No visitors yet means 0%, not NaN%. */
const funnelShare = (count) => (funnel[0]?.count ? (count / funnel[0].count) * 100 : 0)
const daysWithOrders = computed(() => trend.filter((d) => d.orders > 0).length)

const paidOrders = computed(() => db.list('orders').filter((o) => o.status === 'paid').length)
const avgOrder = computed(() => {
  const paid = db.list('orders').filter((o) => o.status === 'paid')
  if (!paid.length) return 0
  return Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length)
})
const pendingTotal = computed(() =>
  db.list('orders').filter((o) => o.status === 'pending').reduce((s, o) => s + o.total, 0),
)
const pendingValue = computed(() => `${vnd(pendingTotal.value)} đang treo`)

// ── learning ────────────────────────────────────────────────────────
const activeEnrolments = computed(() => db.list('enrolments').filter((e) => e.status === 'active').length)
const completedEnrolments = computed(() => db.list('enrolments').filter((e) => e.status === 'completed').length)
const newLearners = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return db.list('learners').filter((l) => new Date(l.joinedAt) >= cutoff).length
})

const topPrograms = computed(() =>
  [...db.list('programs')]
    .filter((p) => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      label: p.title,
      value: p.revenue,
      display: vnd(p.revenue),
      hint: `${p.enrolled} học viên · ${p.rating ? p.rating.toFixed(1) : '—'}★`,
      to: `/academy/programs/${p.id}`,
    })),
)

// ── today ───────────────────────────────────────────────────────────
const todayIso = new Date().toISOString().slice(0, 10)

const bookingsToday = computed(() => db.list('bookings').filter((b) => b.date === todayIso))

const agenda = computed(() => {
  const rows = []
  for (const b of db.list('bookings')) {
    if (b.date < todayIso || b.status === 'cancelled') continue
    rows.push({
      key: `b-${b.id}`, date: b.date, time: b.time, title: `${b.serviceName || b.service} — ${b.name}`,
      place: `${b.studio} · ${b.code}`, who: b.practitioner, status: b.status,
    })
  }
  for (const s of db.list('sessions')) {
    if (s.date < todayIso) continue
    rows.push({
      key: `s-${s.id}`, date: s.date, time: s.time, title: s.programTitle,
      place: s.location, who: db.nameOf('instructors', s.instructorId), status: s.seatStatus,
    })
  }
  return rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 8)
})

// ── queue ───────────────────────────────────────────────────────────
const todo = computed(() =>
  [
    {
      label: 'Lịch hẹn chờ xác nhận', hint: 'Khách đang đợi phản hồi', icon: 'event_available',
      count: db.counts.bookingsPending, to: '/bookings?status=pending', tone: 'warn',
    },
    {
      label: 'Đơn chờ thanh toán', hint: pendingValue.value, icon: 'receipt_long',
      count: db.counts.ordersPending, to: '/sales/orders?status=pending', tone: 'warn',
    },
    {
      label: 'Đánh giá chờ duyệt', hint: 'Chưa hiện trên trang chương trình', icon: 'reviews',
      count: db.counts.reviewsPending, to: '/academy/reviews?status=pending', tone: 'warn',
    },
    {
      label: 'Yêu cầu doanh nghiệp mới', hint: 'Chưa ai nhận theo dõi', icon: 'contact_mail',
      count: db.counts.enquiriesNew, to: '/enquiries?status=new', tone: 'warn',
    },
    {
      label: 'Bài học thiếu video', hint: 'Học viên sẽ thấy bài trống', icon: 'movie',
      count: db.counts.videosMissing, to: '/academy/videos?status=missing', tone: 'danger',
    },
    {
      label: 'Chương trình còn nháp', hint: 'Chưa mở bán trên site', icon: 'school',
      count: db.counts.programsDraft, to: '/academy/programs?status=draft', tone: 'warn',
    },
  ].filter((row) => row.count > 0),
)

const totalTodo = computed(() => todo.value.reduce((s, r) => s + r.count, 0))

const recentLog = computed(() => db.list('auditLog').slice(0, 6))

// The reports are computed server-side; fetched once per session, on demand.
onMounted(loadInsights)
</script>
