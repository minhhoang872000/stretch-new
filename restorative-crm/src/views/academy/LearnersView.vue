<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Học viên"
      subtitle="Tài khoản học trên site — khác với tài khoản nhân sự dùng bảng điều khiển này."
    >
      <template #actions>
        <button type="button" class="btn-outline btn-sm" @click="exportCsv">
          <span class="material-symbols-outlined text-lg">download</span>
          Xuất CSV
        </button>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">person_add</span>
          Thêm học viên
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Tổng học viên" :value="stats.total" icon="groups" tone="accent" />
      <StatTile label="Mới 30 ngày" :value="stats.recent" icon="person_add" tone="ok" />
      <StatTile label="Ít hoạt động" :value="stats.idle" icon="hourglass_bottom" :tone="stats.idle ? 'warn' : 'neutral'" hint="Chưa vào học 30 ngày" />
      <StatTile label="Suất học bình quân" :value="stats.perLearner" icon="school" tone="info" hint="Số khoá mỗi học viên" />
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
      search-placeholder="Tìm theo tên, email hoặc số điện thoại…"
      empty-icon="groups"
      empty-title="Không có học viên nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="(row) => $router.push(`/academy/learners/${row.id}`)"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="idle">Ít hoạt động</option>
          <option value="blocked">Đã chặn</option>
        </select>
        <select v-model="filters.city" class="select w-32" aria-label="Lọc theo tỉnh thành">
          <option value="">Mọi nơi</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filters.source" class="select w-40" aria-label="Lọc theo nguồn">
          <option value="">Mọi nguồn</option>
          <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
        </select>
      </template>

      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <span
            class="w-8 h-8 rounded-full bg-accent-soft text-accent-ink text-2xs font-bold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >{{ row.initials }}</span>
          <div class="min-w-0">
            <p class="font-bold text-ink truncate">{{ row.name }}</p>
            <p class="meta truncate">{{ row.job }} · {{ row.city }}</p>
          </div>
        </div>
      </template>

      <template #cell-email="{ row }">
        <p class="text-ink-2 truncate max-w-[22ch]">{{ row.email }}</p>
        <p class="num meta">{{ row.phone }}</p>
      </template>

      <template #cell-enrolments="{ row }">
        <span class="num font-semibold text-ink">{{ countFor(row.id).total }}</span>
        <span class="meta"> · {{ countFor(row.id).completed }} xong</span>
      </template>

      <template #cell-joinedAt="{ row }">
        <span class="meta">{{ date(row.joinedAt) }}</span>
      </template>

      <template #cell-lastActiveAt="{ row }">
        <span class="meta">{{ ago(row.lastActiveAt) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>
    </DataTable>

    <SlideOver v-model:open="panelOpen" eyebrow="Học viên" title="Thêm học viên" size="md">
      <div class="space-y-3.5">
        <FormRow label="Họ và tên" required>
          <template #default="{ id }">
            <input :id="id" v-model="form.name" type="text" class="input" data-autofocus />
          </template>
        </FormRow>
        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Email" required>
            <template #default="{ id }">
              <input :id="id" v-model="form.email" type="email" class="input" />
            </template>
          </FormRow>
          <FormRow label="Số điện thoại">
            <template #default="{ id }">
              <input :id="id" v-model="form.phone" type="tel" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Tỉnh / thành">
            <template #default="{ id }">
              <input :id="id" v-model="form.city" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Nghề nghiệp">
            <template #default="{ id }">
              <input :id="id" v-model="form.job" type="text" class="input" />
            </template>
          </FormRow>
        </div>
        <FormRow label="Nguồn">
          <template #default="{ id }">
            <select :id="id" v-model="form.source" class="select">
              <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
            </select>
          </template>
        </FormRow>
        <FormRow label="Ghi chú">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.note" rows="2" class="input" />
          </template>
        </FormRow>
      </div>

      <template #footer>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu học viên</button>
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
import { date, ago, initials } from '@/utils/format.js'

const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save,
} = useResource('learners', {
  searchFields: ['name', 'email', 'phone', 'job'],
  filters: { status: '', city: '', source: '' },
  sort: { key: 'lastActiveAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'name', label: 'Học viên', sortable: true },
  { key: 'email', label: 'Liên hệ' },
  { key: 'enrolments', label: 'Suất học', align: 'right', width: '8rem' },
  { key: 'source', label: 'Nguồn', width: '10rem' },
  { key: 'joinedAt', label: 'Tham gia', sortable: true, width: '8rem' },
  { key: 'lastActiveAt', label: 'Hoạt động', sortable: true, width: '9rem' },
  { key: 'status', label: 'Trạng thái', width: '8rem' },
]

const cities = computed(() => [...new Set(all.value.map((l) => l.city))].sort())
const sources = computed(() => [...new Set(all.value.map((l) => l.source))].sort())

function countFor(learnerId) {
  const list = db.list('enrolments').filter((e) => e.learnerId === learnerId)
  return { total: list.length, completed: list.filter((e) => e.status === 'completed').length }
}

const stats = computed(() => {
  const list = all.value
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const enrolments = db.list('enrolments').length
  return {
    total: list.length,
    recent: list.filter((l) => new Date(l.joinedAt) >= cutoff).length,
    idle: list.filter((l) => new Date(l.lastActiveAt) < cutoff).length,
    perLearner: list.length ? (enrolments / list.length).toFixed(1).replace('.', ',') : '0',
  }
})

/** CSV export runs client-side — nothing here needs a server. */
function exportCsv() {
  const header = ['Ho ten', 'Email', 'Dien thoai', 'Tinh thanh', 'Nghe', 'Nguon', 'Tham gia', 'Trang thai']
  const lines = all.value.map((l) =>
    [l.name, l.email, l.phone, l.city, l.job, l.source, l.joinedAt, l.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notify.success(`Đã xuất ${all.value.length} học viên ra CSV.`)
}

// ── create ──────────────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  return { name: '', email: '', phone: '', city: 'TP.HCM', job: '', source: 'Giới thiệu', note: '' }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function submit() {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    notify.warn('Cần ít nhất họ tên và email.')
    return
  }
  save({
    ...form.value,
    initials: initials(form.value.name),
    joinedAt: new Date().toISOString().slice(0, 10),
    lastActiveAt: new Date().toISOString(),
    status: 'active',
  })
  panelOpen.value = false
  notify.success('Đã thêm học viên.')
}
</script>
