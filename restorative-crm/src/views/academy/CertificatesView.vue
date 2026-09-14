<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Chứng nhận"
      subtitle="Mã chứng nhận tra cứu được công khai. Thu hồi khi hoàn tiền hoặc phát hiện gian lận bài thi."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openIssue">
          <span class="material-symbols-outlined text-lg">workspace_premium</span>
          Cấp chứng nhận
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Còn hiệu lực" :value="stats.valid" icon="verified" tone="ok" />
      <StatTile label="Đã thu hồi" :value="stats.revoked" icon="block" :tone="stats.revoked ? 'danger' : 'neutral'" />
      <StatTile label="Cấp trong 30 ngày" :value="stats.recent" icon="calendar_add_on" tone="accent" />
      <StatTile label="Điểm trung bình" :value="`${stats.avgScore}%`" icon="grade" tone="info" hint="Điểm bài thi cuối khoá" />
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :query="query"
      :sort="sort"
      :page="page"
      :page-count="pageCount"
      :active-filter-count="activeFilterCount"
      search-placeholder="Tìm theo mã, học viên hoặc chương trình…"
      empty-icon="workspace_premium"
      empty-title="Không có chứng nhận nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-40" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="valid">Còn hiệu lực</option>
          <option value="revoked">Đã thu hồi</option>
        </select>
        <select v-model="filters.programId" class="select w-52" aria-label="Lọc theo chương trình">
          <option value="">Mọi chương trình</option>
          <option v-for="p in certifiable" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </template>

      <template #cell-code="{ row }">
        <button
          type="button"
          class="font-mono text-xs font-semibold text-ink hover:text-accent transition-colors"
          title="Sao chép mã"
          @click="copy(row.code)"
        >{{ row.code }}</button>
      </template>

      <template #cell-learnerName="{ row }">
        <RouterLink :to="`/academy/learners/${row.learnerId}`" class="link">{{ row.learnerName }}</RouterLink>
      </template>

      <template #cell-programTitle="{ row }">
        <span class="truncate block max-w-[28ch]">{{ row.programTitle }}</span>
      </template>

      <template #cell-score="{ row }">
        <span class="num font-bold" :class="row.score >= 85 ? 'text-ok' : 'text-ink'">{{ row.score }}%</span>
      </template>

      <template #cell-issuedAt="{ row }">
        <span class="meta">{{ date(row.issuedAt) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <a
            :href="row.verifyUrl"
            target="_blank"
            rel="noopener"
            class="btn-ghost btn-sm btn-icon"
            title="Mở trang tra cứu"
            aria-label="Mở trang tra cứu"
          >
            <span class="material-symbols-outlined text-lg">open_in_new</span>
          </a>
          <button
            v-if="row.status === 'valid'"
            type="button"
            class="btn-ghost btn-sm btn-icon text-danger"
            title="Thu hồi"
            aria-label="Thu hồi chứng nhận"
            @click="askRevoke(row)"
          >
            <span class="material-symbols-outlined text-lg">block</span>
          </button>
          <button
            v-else
            type="button"
            class="btn-ghost btn-sm btn-icon"
            title="Phục hồi"
            aria-label="Phục hồi chứng nhận"
            @click="patch(row.id, { status: 'valid' })"
          >
            <span class="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Issue ------------------------------------------------------------- -->
    <SlideOver v-model:open="issueOpen" eyebrow="Chứng nhận" title="Cấp chứng nhận" size="md">
      <div class="space-y-3.5">
        <div class="panel-quiet p-2.5">
          <p class="text-xs text-ink-2">
            Chỉ những suất đã hoàn thành ở khoá có cấp chứng nhận mới xuất hiện ở đây.
            Mã sinh theo tiền tố <span class="font-mono">{{ db.settings.academy.certificatePrefix }}</span>.
          </p>
        </div>

        <FormRow label="Suất đã hoàn thành" required>
          <template #default="{ id }">
            <select :id="id" v-model="form.enrolmentId" class="select" data-autofocus>
              <option v-for="e in issuable" :key="e.id" :value="e.id">
                {{ e.learnerName }} — {{ e.programTitle }}
              </option>
            </select>
          </template>
        </FormRow>

        <FormRow label="Điểm bài thi" hint="Từ 0 đến 100.">
          <template #default="{ id }">
            <input :id="id" v-model.number="form.score" type="number" min="0" max="100" class="input num" />
          </template>
        </FormRow>

        <FormRow label="Người ký">
          <template #default="{ id }">
            <select :id="id" v-model="form.signedBy" class="select">
              <option v-for="ins in db.list('instructors')" :key="ins.id" :value="ins.id">
                {{ ins.name }} — {{ ins.role }}
              </option>
            </select>
          </template>
        </FormRow>

        <p v-if="!issuable.length" class="field-error">
          <span class="material-symbols-outlined text-sm">error</span>
          Không còn suất nào đủ điều kiện cấp chứng nhận.
        </p>
      </div>

      <template #footer>
        <button type="button" class="btn-ghost" @click="issueOpen = false">Đóng</button>
        <button type="button" class="btn-primary" :disabled="!issuable.length" @click="issue">Cấp chứng nhận</button>
      </template>
    </SlideOver>

    <!-- Revoke confirm ---------------------------------------------------- -->
    <SlideOver v-model:open="revokeOpen" eyebrow="Chứng nhận" title="Thu hồi chứng nhận" size="sm">
      <p class="text-[0.8125rem] text-ink-2">
        Mã <span class="font-mono font-bold text-ink">{{ target?.code }}</span> sẽ hiện là đã thu hồi
        trên trang tra cứu công khai. Học viên vẫn giữ quyền xem lại khoá học.
      </p>
      <FormRow label="Lý do thu hồi" class="mt-3.5">
        <template #default="{ id }">
          <textarea :id="id" v-model="revokeReason" rows="3" class="input" placeholder="Ví dụ: đã hoàn tiền đơn SO-26026." />
        </template>
      </FormRow>

      <template #footer>
        <button type="button" class="btn-ghost" @click="revokeOpen = false">Huỷ</button>
        <button type="button" class="btn-danger" @click="revoke">Thu hồi</button>
      </template>
    </SlideOver>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import { date } from '@/utils/format.js'

const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, patch,
} = useResource('certificates', {
  searchFields: ['code', 'learnerName', 'programTitle'],
  filters: { status: '', programId: '' },
  sort: { key: 'issuedAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'code', label: 'Mã', width: '10rem' },
  { key: 'learnerName', label: 'Học viên', sortable: true },
  { key: 'programTitle', label: 'Chương trình', sortable: true },
  { key: 'score', label: 'Điểm', align: 'right', sortable: true, width: '6rem' },
  { key: 'issuedAt', label: 'Ngày cấp', sortable: true, width: '8rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

const certifiable = computed(() => db.list('programs').filter((p) => p.certificate))

const stats = computed(() => {
  const list = all.value
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const valid = list.filter((c) => c.status === 'valid')
  return {
    valid: valid.length,
    revoked: list.filter((c) => c.status === 'revoked').length,
    recent: list.filter((c) => new Date(c.issuedAt) >= cutoff).length,
    avgScore: list.length ? Math.round(list.reduce((s, c) => s + c.score, 0) / list.length) : 0,
  }
})

async function copy(code) {
  try {
    await navigator.clipboard.writeText(code)
    notify.success(`Đã sao chép ${code}.`)
  } catch {
    notify.warn('Trình duyệt không cho sao chép. Bạn chọn và copy tay nhé.')
  }
}

// ── issue ───────────────────────────────────────────────────────────
const issueOpen = ref(false)
const form = ref({ enrolmentId: '', score: 85, signedBy: 'ins-01' })

const issuable = computed(() => {
  const issued = new Set(all.value.map((c) => c.enrolmentId))
  return db.list('enrolments').filter((e) => {
    if (e.status !== 'completed' || issued.has(e.id)) return false
    const program = db.find('programs', e.programId)
    return !!program?.certificate
  })
})

function openIssue() {
  form.value = { enrolmentId: issuable.value[0]?.id || '', score: 85, signedBy: 'ins-01' }
  issueOpen.value = true
}

function issue() {
  const enrolment = db.find('enrolments', form.value.enrolmentId)
  if (!enrolment) {
    notify.warn('Chọn một suất đã hoàn thành.')
    return
  }
  const prefix = db.settings.academy.certificatePrefix
  const year = new Date().getFullYear()
  const serial = String(1043 + all.value.length * 17).padStart(4, '0')
  const code = `${prefix}-${year}-${serial}`
  save({
    code,
    enrolmentId: enrolment.id,
    learnerId: enrolment.learnerId,
    learnerName: enrolment.learnerName,
    programId: enrolment.programId,
    programTitle: enrolment.programTitle,
    issuedAt: new Date().toISOString().slice(0, 10),
    score: form.value.score,
    status: 'valid',
    signedBy: form.value.signedBy,
    hasCertificate: true,
    verifyUrl: `https://stretch.vn/verify/${code}`,
  })
  issueOpen.value = false
  notify.success(`Đã cấp chứng nhận ${code}.`)
}

// ── revoke ──────────────────────────────────────────────────────────
const revokeOpen = ref(false)
const target = ref(null)
const revokeReason = ref('')

function askRevoke(row) {
  target.value = row
  revokeReason.value = ''
  revokeOpen.value = true
}

function revoke() {
  patch(target.value.id, { status: 'revoked', revokeReason: revokeReason.value })
  revokeOpen.value = false
  notify.success('Đã thu hồi chứng nhận.')
}
</script>
