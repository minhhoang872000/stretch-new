<template>
  <main class="page">
    <PageHeader
      eyebrow="Khách hàng"
      title="Phễu chuyển đổi"
      subtitle="Gộp từ tracking của site: xem trang → bấm CTA → mở form → gửi form → thành khách. Số liệu 30 ngày."
    >
      <template #actions>
        <RouterLink to="/google-analytics" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">analytics</span>
          Mở GA
        </RouterLink>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <SectionCard title="Các bước trong phễu" class="xl:col-span-2" hint="Tỉ lệ tính trên bước ngay trước">
        <ul class="space-y-3">
          <li v-for="(step, i) in funnel" :key="step.step">
            <div class="flex items-baseline justify-between gap-3 mb-1">
              <div class="min-w-0">
                <p class="text-[0.8125rem] font-bold text-ink">{{ i + 1 }}. {{ step.step }}</p>
                <p class="meta">{{ step.note }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="num text-sm font-bold text-ink">{{ num(step.count) }}</p>
                <p v-if="i > 0" class="num meta" :class="rate(i) < 20 ? 'text-warn' : ''">
                  {{ percent(rate(i), 1) }} từ bước trước
                </p>
              </div>
            </div>
            <div class="h-6 rounded-md bg-panel-3 overflow-hidden">
              <div
                class="h-full rounded-md flex items-center px-2 transition-[width] duration-500"
                :class="i === funnel.length - 1 ? 'bg-ok' : 'bg-accent'"
                :style="{ width: `${funnelShare(step.count)}%` }"
              >
                <span class="num text-2xs font-bold text-white">
                  {{ percent(funnelShare(step.count), 1) }}
                </span>
              </div>
            </div>
            <p v-if="i > 0 && rate(i) < 20" class="meta mt-1 text-warn">
              Rơi {{ num(funnel[i - 1].count - step.count) }} người ở bước này — chỗ đáng xem lại đầu tiên.
            </p>
          </li>
        </ul>
      </SectionCard>

      <div class="space-y-4">
        <SectionCard title="CTA nào hiệu quả" hint="Tỉ lệ gửi form trên mỗi lượt bấm">
          <BarList :items="ctaItems" />
        </SectionCard>

        <SectionCard title="Nguồn khách" hint="Theo yêu cầu doanh nghiệp và lịch hẹn">
          <BarList :items="sourceItems" />
        </SectionCard>
      </div>

      <SectionCard title="Chi tiết từng CTA" flush class="xl:col-span-3">
        <table class="tbl tbl-rows">
          <thead>
            <tr>
              <th>CTA</th>
              <th>Đặt ở đâu</th>
              <th class="text-right">Lượt bấm</th>
              <th class="text-right">Gửi form</th>
              <th class="text-right">Tỉ lệ</th>
              <th>Nhận xét</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ctaRows" :key="row.name">
              <td class="font-semibold text-ink">{{ row.name }}</td>
              <td class="font-mono text-xs text-ink-2">{{ row.source }}</td>
              <td class="num text-right">{{ num(row.clicks) }}</td>
              <td class="num text-right">{{ num(row.submits) }}</td>
              <td class="text-right">
                <span class="num font-bold" :class="row.rate >= 20 ? 'text-ok' : row.rate >= 10 ? 'text-ink' : 'text-warn'">
                  {{ percent(row.rate, 1) }}
                </span>
              </td>
              <td class="meta">{{ row.verdict }}</td>
            </tr>
          </tbody>
        </table>
        <template #footer>
          <p class="meta">
            Số liệu là rollup từ tracking API, không phải từ database đơn hàng — lệch vài phần trăm là bình thường.
          </p>
        </template>
      </SectionCard>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMockDb, insights , loadInsights } from '@/stores/db.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import BarList from '@/components/ui/BarList.vue'
import { num, percent } from '@/utils/format.js'

const db = useMockDb()
const funnel = insights.funnel
const cta = insights.ctaBreakdown

const rate = (i) => (funnel[i - 1]?.count ? (funnel[i].count / funnel[i - 1].count) * 100 : 0)

/**
 * Share of the top of the funnel.
 *
 * Guarded because a fresh database has no `lead_events` at all: every step is
 * zero, and an unguarded division paints every bar `NaN%` wide.
 */
const funnelShare = (count) => (funnel[0]?.count ? (count / funnel[0].count) * 100 : 0)

const ctaRows = computed(() =>
  cta
    .map((c) => {
      const r = c.clicks ? (c.submits / c.clicks) * 100 : 0
      return {
        ...c,
        rate: r,
        verdict: r >= 25
          ? 'Tốt, giữ nguyên'
          : r >= 12
            ? 'Ổn, thử đổi chữ trên nút'
            : 'Thấp — có thể form quá dài hoặc CTA hứa sai kỳ vọng',
      }
    })
    .sort((a, b) => b.clicks - a.clicks),
)

const ctaItems = computed(() =>
  ctaRows.value.map((c) => ({
    label: c.name,
    value: Math.round(c.rate * 10) / 10,
    display: percent(c.rate, 1),
    hint: `${num(c.submits)}/${num(c.clicks)} lượt bấm`,
    tone: c.rate >= 25 ? 'ok' : c.rate >= 12 ? 'accent' : 'warn',
  })),
)

const sourceItems = computed(() => {
  const groups = new Map()
  for (const e of db.list('enquiries')) groups.set(e.source, (groups.get(e.source) || 0) + 1)
  for (const b of db.list('bookings')) groups.set(b.source, (groups.get(b.source) || 0) + 1)
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value, display: String(value) }))
    .sort((a, b) => b.value - a.value)
})

// The reports are computed server-side; fetched once per session, on demand.
onMounted(loadInsights)
</script>
