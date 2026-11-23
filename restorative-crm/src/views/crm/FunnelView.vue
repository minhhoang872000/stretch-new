<template>
  <main class="page">
    <PageHeader
      eyebrow="Khách hàng"
      title="Phễu chuyển đổi"
      subtitle="Số liệu từ Google Analytics: truy cập → vào trang đặt lịch → đặt lịch thành công. Tính theo phiên truy cập."
    >
      <template #actions>
        <select v-model="period" class="select w-36" @change="load">
          <option value="7d">7 ngày</option>
          <option value="30d">30 ngày</option>
          <option value="90d">90 ngày</option>
        </select>
        <RouterLink to="/google-analytics" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">analytics</span>
          Mở GA
        </RouterLink>
      </template>
    </PageHeader>

    <div v-if="loading" class="p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <p v-else-if="error" class="panel-quiet px-3 py-2.5 text-sm text-ink-2 flex items-start gap-2">
      <span class="material-symbols-outlined text-base text-warn shrink-0">error</span>
      {{ error }}
    </p>

    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <SectionCard title="Các bước trong phễu" class="xl:col-span-2" hint="Tỉ lệ tính trên bước ngay trước">
        <ul class="space-y-3">
          <li v-for="(step, i) in steps" :key="step.step">
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
                :class="i === steps.length - 1 ? 'bg-ok' : 'bg-accent'"
                :style="{ width: `${share(step.count)}%` }"
              >
                <span class="num text-2xs font-bold text-white">{{ percent(share(step.count), 1) }}</span>
              </div>
            </div>
          </li>
        </ul>
        <template #footer>
          <p class="meta">
            Ngoài phễu: {{ num(data.contactSessions) }} phiên bấm liên hệ trực tiếp (gọi, Zalo, Messenger…).
          </p>
        </template>
      </SectionCard>

      <div class="space-y-4">
        <SectionCard title="Nguồn đặt lịch" hint="Kênh của các phiên đặt lịch thành công">
          <BarList v-if="channelItems.length" :items="channelItems" />
          <p v-else class="meta">Chưa có lượt đặt lịch nào được ghi nhận trong khoảng này.</p>
        </SectionCard>

        <SectionCard title="Liên hệ trực tiếp" hint="Phiên bấm từng kênh liên hệ">
          <BarList v-if="contactItems?.length" :items="contactItems" />
          <p v-else-if="contactItems" class="meta">Chưa có lượt bấm liên hệ nào trong khoảng này.</p>
          <p v-else class="meta">{{ needsDimension('contact_method') }}</p>
        </SectionCard>
      </div>

      <SectionCard title="Lượt bấm từng CTA" flush class="xl:col-span-3">
        <table v-if="data.ctas?.length" class="tbl tbl-rows">
          <thead>
            <tr>
              <th>CTA</th>
              <th class="text-right">Lượt bấm</th>
              <th class="text-right">Số phiên</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.ctas" :key="row.name">
              <td class="font-mono text-xs text-ink">{{ row.name }}</td>
              <td class="num text-right">{{ num(row.clicks) }}</td>
              <td class="num text-right">{{ num(row.sessions) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="data.ctas" class="meta p-4">Chưa có lượt bấm CTA nào trong khoảng này.</p>
        <p v-else class="meta p-4">{{ needsDimension('cta_name') }}</p>
        <template #footer>
          <p class="meta">
            GA cập nhật chậm vài giờ và không ghi nhận khách dùng trình chặn theo dõi, nên số liệu lệch
            vài phần trăm so với lịch hẹn trong CRM là bình thường.
          </p>
        </template>
      </SectionCard>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import BarList from '@/components/ui/BarList.vue'
import { fetchGaFunnel } from '@/services/api.js'
import { num, percent } from '@/utils/format.js'

const CONTACT_LABELS = { phone: 'Gọi điện', zalo: 'Zalo', messenger: 'Messenger', whatsapp: 'WhatsApp', email: 'Email' }

const period = ref('30d')
const loading = ref(true)
const error = ref('')
const data = ref({ steps: [], contactSessions: 0, bookingChannels: [], contactMethods: null, ctas: null })

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await fetchGaFunnel(period.value)
  } catch (e) {
    error.value = `Không lấy được số liệu từ Google Analytics: ${e?.message || e}`
  } finally {
    loading.value = false
  }
}

const steps = computed(() => data.value.steps || [])
const rate = (i) => (steps.value[i - 1]?.count ? (steps.value[i].count / steps.value[i - 1].count) * 100 : 0)
/** Share of the top of the funnel; no visits yet means 0%, not NaN%. */
const share = (count) => (steps.value[0]?.count ? (count / steps.value[0].count) * 100 : 0)

const toItems = (rows, label = (x) => x) =>
  rows.map((r) => ({ label: label(r.label), value: r.count, display: num(r.count) }))

const channelItems = computed(() => toItems(data.value.bookingChannels || []))
const contactItems = computed(() =>
  data.value.contactMethods ? toItems(data.value.contactMethods, (m) => CONTACT_LABELS[m] || m) : null,
)

const needsDimension = (name) =>
  `Cần tạo custom dimension "${name}" (phạm vi Event) trong GA → Admin → Custom definitions. GA chỉ ghi từ lúc tạo trở đi.`

onMounted(load)
</script>
