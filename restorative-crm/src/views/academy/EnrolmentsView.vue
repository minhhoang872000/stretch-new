<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Ghi danh"
      subtitle="Ai đang học khoá nào, tới đâu rồi. Ghi danh tay dùng cho khách chuyển khoản ngoài hệ thống hoặc học viên được tặng suất."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">person_add</span>
          Ghi danh tay
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đang học" :value="stats.active" icon="autoplay" tone="accent" />
      <StatTile label="Đã hoàn thành" :value="stats.completed" icon="task_alt" tone="ok" :hint="`${percent(stats.rate, 1)} hoàn thành`" />
      <StatTile label="Đã thu hồi" :value="stats.revoked" icon="block" :tone="stats.revoked ? 'danger' : 'neutral'" />
      <StatTile label="Tiến độ trung bình" :value="percent(stats.avg)" icon="donut_large" tone="info" hint="Trên các suất đang học" />
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
      :selected="selected"
      :all-selected="allOnPageSelected"
      selectable
      search-placeholder="Tìm theo học viên hoặc chương trình…"
      empty-icon="how_to_reg"
      empty-title="Không có suất ghi danh nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @toggle-row="toggleRow"
      @toggle-page="togglePage"
      @clear-selection="clearSelection"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang học</option>
          <option value="completed">Hoàn thành</option>
          <option value="revoked">Đã thu hồi</option>
        </select>
        <select v-model="filters.programId" class="select w-52" aria-label="Lọc theo chương trình">
          <option value="">Mọi chương trình</option>
          <option v-for="p in db.list('programs')" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <select v-model="filters.source" class="select w-36" aria-label="Lọc theo nguồn">
          <option value="">Mọi nguồn</option>
          <option value="order">Từ đơn hàng</option>
          <option value="manual">Ghi danh tay</option>
          <option value="free">Khoá miễn phí</option>
        </select>
      </template>

      <template #bulk>
        <button type="button" class="btn-secondary btn-sm" @click="bulk('active')">Mở lại quyền học</button>
        <button type="button" class="btn-ghost btn-sm" @click="bulk('revoked')">Thu hồi quyền học</button>
      </template>

      <template #cell-learnerName="{ row }">
        <RouterLink :to="`/academy/learners/${row.learnerId}`" class="flex items-center gap-2 group">
          <span
            class="w-7 h-7 rounded-full bg-panel-3 text-2xs font-bold text-ink-2 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >{{ initials(row.learnerName) }}</span>
          <span class="min-w-0">
            <span class="block font-semibold text-ink truncate group-hover:text-accent transition-colors">
              {{ row.learnerName }}
            </span>
            <span class="block meta">{{ sourceLabel(row.source) }}</span>
          </span>
        </RouterLink>
      </template>

      <template #cell-programTitle="{ row }">
        <RouterLink :to="`/academy/programs/${row.programId}`" class="link truncate block max-w-[26ch]">
          {{ row.programTitle }}
        </RouterLink>
        <p class="meta">{{ row.mode === 'offline' ? 'Tại studio' : 'Trực tuyến' }}</p>
      </template>

      <template #cell-percent="{ row }">
        <div class="w-32 ml-auto">
          <ProgressMeter :value="row.percent" :label="`${row.lessonsDone}/${row.lessons} bài`" />
        </div>
      </template>

      <template #cell-quizAvg="{ row }">
        <span
          class="num font-bold"
          :class="row.quizAvg >= db.settings.academy.passScore ? 'text-ok' : 'text-warn'"
        >{{ row.quizAvg }}%</span>
      </template>

      <template #cell-lastLessonAt="{ row }">
        <span class="meta">{{ ago(row.lastLessonAt) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <button
          v-if="row.status !== 'revoked'"
          type="button"
          class="btn-ghost btn-sm btn-icon"
          title="Thu hồi quyền học"
          aria-label="Thu hồi quyền học"
          @click="setStatus(row, 'revoked')"
        >
          <span class="material-symbols-outlined text-lg">block</span>
        </button>
        <button
          v-else
          type="button"
          class="btn-ghost btn-sm btn-icon"
          title="Mở lại quyền học"
          aria-label="Mở lại quyền học"
          @click="setStatus(row, 'active')"
        >
          <span class="material-symbols-outlined text-lg">restart_alt</span>
        </button>
      </template>
    </DataTable>

    <SlideOver v-model:open="panelOpen" eyebrow="Ghi danh" title="Ghi danh tay" size="md">
      <div class="space-y-3.5">
        <div class="panel-quiet p-2.5">
          <p class="text-xs text-ink-2">
            Ghi danh tay bỏ qua bước thanh toán. Dùng khi khách đã chuyển khoản ngoài hệ thống,
            hoặc khi tặng suất học — nhớ ghi lý do vào ghi chú để đối chiếu sau.
          </p>
        </div>

        <FormRow label="Học viên" required>
          <template #default="{ id }">
            <select :id="id" v-model="form.learnerId" class="select" data-autofocus>
              <option v-for="l in db.list('learners')" :key="l.id" :value="l.id">
                {{ l.name }} — {{ l.email }}
              </option>
            </select>
          </template>
        </FormRow>

        <FormRow label="Chương trình" required>
          <template #default="{ id }">
            <select :id="id" v-model="form.programId" class="select">
              <option v-for="p in db.list('programs')" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </template>
        </FormRow>

        <FormRow label="Lý do / ghi chú">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.note" rows="2" class="input" placeholder="Ví dụ: đã chuyển khoản ngày 14/08, không qua website." />
          </template>
        </FormRow>
      </div>

      <template #footer>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Ghi danh</button>
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
import ProgressMeter from '@/components/ui/ProgressMeter.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import { ago, percent, initials } from '@/utils/format.js'

const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  selected, allOnPageSelected, toggleSort, reset, toggleRow, togglePage, clearSelection,
  save, patch, bulkPatch,
} = useResource('enrolments', {
  searchFields: ['learnerName', 'programTitle'],
  filters: { status: '', programId: '', source: '' },
  sort: { key: 'lastLessonAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'learnerName', label: 'Học viên', sortable: true },
  { key: 'programTitle', label: 'Chương trình', sortable: true },
  { key: 'percent', label: 'Tiến độ', align: 'right', sortable: true, width: '10rem' },
  { key: 'quizAvg', label: 'Điểm quiz', align: 'right', sortable: true, width: '7rem' },
  { key: 'lastLessonAt', label: 'Học lần cuối', sortable: true, width: '9rem' },
  { key: 'status', label: 'Trạng thái', width: '8rem' },
]

const SOURCE_LABELS = { order: 'Từ đơn hàng', manual: 'Ghi danh tay', free: 'Khoá miễn phí' }
const sourceLabel = (value) => SOURCE_LABELS[value] || value

const stats = computed(() => {
  const list = all.value
  const active = list.filter((e) => e.status === 'active')
  const completed = list.filter((e) => e.status === 'completed')
  return {
    active: active.length,
    completed: completed.length,
    revoked: list.filter((e) => e.status === 'revoked').length,
    rate: list.length ? (completed.length / list.length) * 100 : 0,
    avg: active.length ? active.reduce((s, e) => s + e.percent, 0) / active.length : 0,
  }
})

function setStatus(row, status) {
  patch(row.id, { status, note: status === 'revoked' ? 'Thu hồi từ bảng điều khiển.' : '' })
  notify.success(status === 'revoked' ? 'Đã thu hồi quyền học.' : 'Đã mở lại quyền học.')
}

async function bulk(status) {
  const n = await bulkPatch({ status })
  notify.success(`Đã cập nhật ${n} suất ghi danh.`)
}

// ── manual enrolment ────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref({ learnerId: '', programId: '', note: '' })

function openNew() {
  form.value = {
    learnerId: db.list('learners')[0]?.id || '',
    programId: db.list('programs')[0]?.id || '',
    note: '',
  }
  panelOpen.value = true
}

function submit() {
  const learner = db.find('learners', form.value.learnerId)
  const program = db.find('programs', form.value.programId)
  if (!learner || !program) {
    notify.warn('Chọn cả học viên và chương trình.')
    return
  }
  const already = all.value.find(
    (e) => e.learnerId === learner.id && e.programId === program.id && e.status !== 'revoked',
  )
  if (already) {
    notify.warn('Học viên này đã có suất đang hoạt động ở khoá đó.')
    return
  }
  save({
    learnerId: learner.id,
    learnerName: learner.name,
    programId: program.id,
    programTitle: program.title,
    mode: program.mode,
    status: 'active',
    percent: 0,
    lessonsDone: 0,
    lessons: program.lessons,
    source: 'manual',
    startedAt: new Date().toISOString().slice(0, 10),
    lastLessonAt: new Date().toISOString(),
    completedAt: null,
    quizAvg: 0,
    note: form.value.note,
  })
  panelOpen.value = false
  notify.success(`Đã ghi danh ${learner.name} vào ${program.title}.`)
}
</script>
