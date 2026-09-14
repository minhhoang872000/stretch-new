<template>
  <main v-if="!learner" class="page-narrow">
    <div class="panel px-6 py-12 text-center">
      <p class="text-sm font-bold text-ink">Không tìm thấy học viên</p>
      <RouterLink to="/academy/learners" class="btn-primary mt-4">Về danh sách học viên</RouterLink>
    </div>
  </main>

  <main v-else class="page">
    <PageHeader
      eyebrow="Học viện · Học viên"
      :title="learner.name"
      back-to="/academy/learners"
      back-label="Tất cả học viên"
      :subtitle="`${learner.job} · ${learner.city} · tham gia ${date(learner.joinedAt)} qua ${learner.source}`"
    >
      <template #title-badge>
        <StatusPill :status="learner.status" />
      </template>
      <template #actions>
        <a :href="`tel:${learner.phone.replace(/\s/g, '')}`" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">call</span>
          Gọi
        </a>
        <a :href="`mailto:${learner.email}`" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">mail</span>
          Email
        </a>
        <button
          v-if="learner.status !== 'blocked'"
          type="button"
          class="btn-danger btn-sm"
          @click="setStatus('blocked')"
        >Chặn tài khoản</button>
        <button v-else type="button" class="btn-secondary btn-sm" @click="setStatus('active')">
          Bỏ chặn
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatTile label="Suất học" :value="enrolments.length" icon="school" tone="accent" />
          <StatTile label="Đang học" :value="counts.active" icon="autoplay" tone="info" />
          <StatTile label="Hoàn thành" :value="counts.completed" icon="task_alt" tone="ok" />
          <StatTile label="Đã chi" :value="vnd(spend)" icon="payments" tone="accent" />
        </div>

        <SectionCard title="Chương trình đang theo" flush>
          <ul v-if="enrolments.length" class="divide-y divide-line-soft">
            <li v-for="e in enrolments" :key="e.id" class="px-3.5 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <RouterLink :to="`/academy/programs/${e.programId}`" class="font-semibold text-ink hover:text-accent truncate block">
                    {{ e.programTitle }}
                  </RouterLink>
                  <p class="meta mt-0.5">
                    Bắt đầu {{ date(e.startedAt) }} · học lần cuối {{ ago(e.lastLessonAt) }} ·
                    điểm quiz {{ e.quizAvg }}%
                  </p>
                </div>
                <StatusPill :status="e.status" class="shrink-0" />
              </div>
              <div class="mt-2 max-w-sm">
                <ProgressMeter :value="e.percent" :label="`${e.lessonsDone}/${e.lessons} bài`" />
              </div>
              <p v-if="e.note" class="meta mt-1.5">{{ e.note }}</p>
            </li>
          </ul>
          <EmptyState v-else icon="school" title="Chưa ghi danh khoá nào" hint="Ghi danh tay ở trang Ghi danh nếu khách đã thanh toán ngoài hệ thống." />
        </SectionCard>

        <SectionCard title="Đơn hàng" flush>
          <table v-if="orders.length" class="tbl">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Chương trình</th>
                <th class="text-right">Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id">
                <td class="font-mono text-xs">{{ o.code }}</td>
                <td class="truncate max-w-[24ch]">{{ o.programTitle }}</td>
                <td class="num text-right font-bold">{{ vnd(o.total) }}</td>
                <td><StatusPill :status="o.status" /></td>
                <td class="meta">{{ date(o.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-else icon="receipt_long" title="Chưa có đơn hàng" hint="Học viên này chỉ mới học khoá miễn phí." />
        </SectionCard>
      </div>

      <div class="space-y-4">
        <SectionCard title="Liên hệ">
          <dl class="space-y-2.5 text-[0.8125rem]">
            <div>
              <dt class="label-xs">Email</dt>
              <dd class="text-ink truncate">{{ learner.email }}</dd>
            </div>
            <div>
              <dt class="label-xs">Điện thoại</dt>
              <dd class="num text-ink">{{ learner.phone }}</dd>
            </div>
            <div>
              <dt class="label-xs">Hoạt động lần cuối</dt>
              <dd class="text-ink">{{ dateTime(learner.lastActiveAt) }}</dd>
            </div>
            <div>
              <dt class="label-xs">Nguồn</dt>
              <dd class="text-ink">{{ learner.source }}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Chứng nhận" flush>
          <ul v-if="certificates.length" class="divide-y divide-line-soft">
            <li v-for="c in certificates" :key="c.id" class="px-3.5 py-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-xs text-ink">{{ c.code }}</span>
                <StatusPill :status="c.status" />
              </div>
              <p class="meta mt-0.5 truncate">{{ c.programTitle }}</p>
              <p class="meta">Cấp {{ date(c.issuedAt) }} · {{ c.score }} điểm</p>
            </li>
          </ul>
          <EmptyState v-else icon="workspace_premium" title="Chưa có chứng nhận" />
        </SectionCard>

        <SectionCard title="Ghi chú nội bộ">
          <textarea
            v-model="note"
            rows="4"
            class="input"
            placeholder="Ghi lại điều cần nhớ khi làm việc với học viên này."
          />
          <button type="button" class="btn-primary btn-sm mt-2.5" @click="saveNote">Lưu ghi chú</button>
        </SectionCard>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMockDb } from '@/stores/db.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import ProgressMeter from '@/components/ui/ProgressMeter.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { vnd, date, dateTime, ago } from '@/utils/format.js'

const route = useRoute()
const db = useMockDb()
const notify = useNotify()

const learner = computed(() => db.find('learners', route.params.id))
const enrolments = computed(() => db.list('enrolments').filter((e) => e.learnerId === route.params.id))
const orders = computed(() => db.list('orders').filter((o) => o.learnerId === route.params.id))
const certificates = computed(() => db.list('certificates').filter((c) => c.learnerId === route.params.id))

const counts = computed(() => ({
  active: enrolments.value.filter((e) => e.status === 'active').length,
  completed: enrolments.value.filter((e) => e.status === 'completed').length,
}))

const spend = computed(() =>
  orders.value.filter((o) => o.status === 'paid').reduce((s, o) => s + o.total, 0),
)

const note = ref('')
watch(learner, (value) => { note.value = value?.note || '' }, { immediate: true })

function saveNote() {
  db.patch('learners', route.params.id, { note: note.value })
  notify.success('Đã lưu ghi chú.')
}

function setStatus(status) {
  db.patch('learners', route.params.id, { status })
  notify.success(status === 'blocked' ? 'Đã chặn tài khoản học viên.' : 'Đã bỏ chặn tài khoản.')
}
</script>
