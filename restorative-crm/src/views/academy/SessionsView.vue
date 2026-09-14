<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Lịch khai giảng"
      subtitle="Các buổi có ngày giờ cụ thể — workshop tại studio và lớp online theo lịch. Đây là nguồn của trang /learning-hub/schedule."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Mở buổi mới
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Sắp diễn ra" :value="stats.upcoming" icon="event_upcoming" tone="info" />
      <StatTile label="Kín chỗ" :value="stats.full" icon="event_busy" :tone="stats.full ? 'danger' : 'neutral'" hint="Nên mở thêm buổi" />
      <StatTile label="Chỗ còn trống" :value="stats.seats" icon="chair" tone="accent" />
      <StatTile label="Tỉ lệ lấp chỗ" :value="percent(stats.fill)" icon="donut_large" tone="ok" hint="Trên các buổi sắp tới" />
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
      clickable
      search-placeholder="Tìm theo chương trình hoặc địa điểm…"
      empty-icon="event_upcoming"
      empty-title="Không có buổi nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="edit"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo thời gian">
          <option value="">Mọi thời điểm</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="today">Hôm nay</option>
          <option value="done">Đã xong</option>
        </select>
        <select v-model="filters.seatStatus" class="select w-36" aria-label="Lọc theo chỗ">
          <option value="">Mọi tình trạng chỗ</option>
          <option value="open">Còn chỗ</option>
          <option value="few">Còn ít chỗ</option>
          <option value="full">Kín chỗ</option>
        </select>
        <select v-model="filters.mode" class="select w-36" aria-label="Lọc theo hình thức">
          <option value="">Online + studio</option>
          <option value="online">Trực tuyến</option>
          <option value="offline">Tại studio</option>
        </select>
      </template>

      <template #cell-date="{ row }">
        <p class="num font-bold text-ink">{{ date(row.date) }}</p>
        <p class="meta">{{ row.time }}</p>
      </template>

      <template #cell-programTitle="{ row }">
        <p class="font-semibold text-ink truncate max-w-[28ch]">{{ row.programTitle }}</p>
        <p class="meta truncate max-w-[30ch]">{{ row.location }}</p>
      </template>

      <template #cell-instructorId="{ row }">
        {{ db.nameOf('instructors', row.instructorId) }}
      </template>

      <template #cell-booked="{ row }">
        <div class="w-28 ml-auto">
          <ProgressMeter
            :value="(row.booked / row.capacity) * 100"
            :label="`${row.booked}/${row.capacity}`"
            :tone="row.seatStatus === 'full' ? 'danger' : row.seatStatus === 'few' ? 'warn' : 'ok'"
            :show-value="false"
          />
        </div>
      </template>

      <template #cell-seatStatus="{ row }">
        <StatusPill :status="row.seatStatus" />
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <button
          type="button"
          class="btn-ghost btn-sm btn-icon"
          aria-label="Sửa buổi học"
          @click="edit(row)"
        >
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
      </template>
    </DataTable>

    <!-- Editor ------------------------------------------------------------ -->
    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Buổi khai giảng"
      :title="form.id ? 'Sửa buổi học' : 'Mở buổi mới'"
      :subtitle="form.programTitle"
      size="md"
    >
      <div class="space-y-3.5">
        <FormRow label="Chương trình" required>
          <template #default="{ id }">
            <select :id="id" v-model="form.programId" class="select" data-autofocus @change="syncProgram">
              <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </template>
        </FormRow>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Ngày" required>
            <template #default="{ id }">
              <input :id="id" v-model="form.date" type="date" class="input" />
            </template>
          </FormRow>
          <FormRow label="Giờ" hint="Ví dụ 09:00 – 12:00">
            <template #default="{ id }">
              <input :id="id" v-model="form.time" type="text" class="input" />
            </template>
          </FormRow>
        </div>

        <FormRow label="Địa điểm" :hint="form.mode === 'online' ? 'Link phòng học gửi trước 24 giờ.' : 'Ghi rõ studio và địa chỉ.'">
          <template #default="{ id }">
            <input :id="id" v-model="form.location" type="text" class="input" />
          </template>
        </FormRow>

        <FormRow label="Giảng viên">
          <template #default="{ id }">
            <select :id="id" v-model="form.instructorId" class="select">
              <option v-for="ins in db.list('instructors')" :key="ins.id" :value="ins.id">
                {{ ins.name }} — {{ ins.role }}
              </option>
            </select>
          </template>
        </FormRow>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Sức chứa" hint="Workshop tại studio thường 12–16 người.">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.capacity" type="number" min="1" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Đã đăng ký">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.booked" type="number" min="0" class="input num" />
            </template>
          </FormRow>
        </div>

        <div class="panel-quiet p-2.5 flex items-center gap-2">
          <StatusPill :status="computedSeatStatus" />
          <p class="meta">
            Còn {{ Math.max(0, (form.capacity || 0) - (form.booked || 0)) }} chỗ. Tình trạng chỗ được tính lại khi lưu.
          </p>
        </div>

        <FormRow label="Ghi chú nội bộ">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.note" rows="2" class="input" />
          </template>
        </FormRow>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">
          <span class="material-symbols-outlined text-lg">delete</span>
          Xoá buổi
        </button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu buổi học</button>
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
import { date, percent } from '@/utils/format.js'

const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, remove,
} = useResource('sessions', {
  searchFields: ['programTitle', 'location'],
  filters: { status: '', seatStatus: '', mode: '' },
  sort: { key: 'date', dir: 'asc' },
  pageSize: 15,
})

const columns = [
  { key: 'date', label: 'Khi nào', sortable: true, width: '9rem' },
  { key: 'programTitle', label: 'Chương trình', sortable: true },
  { key: 'instructorId', label: 'Giảng viên', width: '11rem' },
  { key: 'booked', label: 'Chỗ đã bán', align: 'right', sortable: true, width: '9rem' },
  { key: 'seatStatus', label: 'Tình trạng', width: '8rem' },
  { key: 'status', label: 'Thời điểm', width: '8rem' },
]

const programs = computed(() => db.list('programs').filter((p) => p.status !== 'archived'))

const stats = computed(() => {
  const list = all.value
  const upcoming = list.filter((s) => s.status !== 'done')
  const capacity = upcoming.reduce((s, x) => s + x.capacity, 0)
  const booked = upcoming.reduce((s, x) => s + x.booked, 0)
  return {
    upcoming: upcoming.length,
    full: upcoming.filter((s) => s.seatStatus === 'full').length,
    seats: Math.max(0, capacity - booked),
    fill: capacity ? (booked / capacity) * 100 : 0,
  }
})

// ── editor ──────────────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  const first = programs.value[0]
  return {
    id: null,
    programId: first?.id || '',
    programTitle: first?.title || '',
    kind: first?.kind || 'workshop',
    mode: first?.mode || 'offline',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00 – 12:00',
    location: 'Studio Quận 1 — 24 Lê Thánh Tôn',
    instructorId: first?.instructorId || 'ins-01',
    capacity: 12,
    booked: 0,
    note: '',
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function edit(row) {
  form.value = { ...row }
  panelOpen.value = true
}

function syncProgram() {
  const program = db.find('programs', form.value.programId)
  if (!program) return
  form.value.programTitle = program.title
  form.value.kind = program.kind
  form.value.mode = program.mode
  form.value.instructorId = program.instructorId
  if (program.mode === 'online') form.value.location = 'Zoom (link gửi trước 24h)'
}

const computedSeatStatus = computed(() => {
  const left = Math.max(0, (form.value.capacity || 0) - (form.value.booked || 0))
  return left === 0 ? 'full' : left <= 3 ? 'few' : 'open'
})

function submit() {
  if (!form.value.programId || !form.value.date) {
    notify.warn('Cần chọn chương trình và ngày trước khi lưu.')
    return
  }
  const today = new Date().toISOString().slice(0, 10)
  const seatsLeft = Math.max(0, (form.value.capacity || 0) - (form.value.booked || 0))
  save({
    ...form.value,
    seatsLeft,
    seatStatus: computedSeatStatus.value,
    status: form.value.date < today ? 'done' : form.value.date === today ? 'today' : 'upcoming',
  })
  panelOpen.value = false
  notify.success('Đã lưu buổi khai giảng.')
}

function destroy() {
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá buổi khai giảng.')
}
</script>
