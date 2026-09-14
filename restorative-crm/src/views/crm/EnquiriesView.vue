<template>
  <main class="page">
    <PageHeader
      eyebrow="Khách hàng"
      title="Yêu cầu doanh nghiệp"
      subtitle="Form từ trang /business và các trang con. Mỗi yêu cầu cần một người nhận và một ngày hẹn theo lại."
    >
      <template #actions>
        <button
          type="button"
          class="btn-outline btn-sm"
          :class="view === 'board' ? 'border-accent text-accent' : ''"
          @click="view = view === 'board' ? 'table' : 'board'"
        >
          <span class="material-symbols-outlined text-lg">{{ view === 'board' ? 'table_rows' : 'view_kanban' }}</span>
          {{ view === 'board' ? 'Xem dạng bảng' : 'Xem dạng cột' }}
        </button>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Thêm yêu cầu
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Chưa ai nhận" :value="stats.new" icon="markunread" :tone="stats.new ? 'warn' : 'neutral'" />
      <StatTile label="Đang theo" :value="stats.open" icon="pending_actions" tone="info" />
      <StatTile label="Chốt trong tháng" :value="stats.won" icon="handshake" tone="ok" />
      <StatTile label="Giá trị đang mở" :value="vnd(stats.pipeline)" icon="payments" tone="accent" hint="Tổng ngân sách khách nêu" />
    </div>

    <!-- Board view: the pipeline reads better as columns ------------------ -->
    <div v-if="view === 'board'" class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <section v-for="stage in ENQUIRY_STATUSES" :key="stage.value" class="panel flex flex-col">
        <header class="px-3 py-2.5 border-b border-line flex items-center gap-2">
          <h2 class="text-xs font-bold text-ink">{{ stage.label }}</h2>
          <span class="num chip ml-auto">{{ inStage(stage.value).length }}</span>
        </header>
        <ul class="p-2 space-y-2 flex-1 min-h-[6rem]">
          <li v-for="row in inStage(stage.value)" :key="row.id">
            <button
              type="button"
              class="w-full text-left panel-quiet p-2.5 hover:border-accent-line transition-colors"
              @click="edit(row)"
            >
              <p class="text-xs font-bold text-ink truncate">{{ row.company }}</p>
              <p class="meta truncate">{{ row.interest }} · {{ row.headcount }} người</p>
              <div class="flex items-center gap-1.5 mt-1.5">
                <span v-if="row.budget" class="num chip chip-accent">{{ vnd(row.budget) }}</span>
                <span class="meta ml-auto">{{ row.owner || 'chưa ai nhận' }}</span>
              </div>
              <p
                v-if="row.nextFollowUp"
                class="meta mt-1 flex items-center gap-1"
                :class="isOverdue(row) ? 'text-danger font-bold' : ''"
              >
                <span class="material-symbols-outlined text-sm">event</span>
                theo lại {{ date(row.nextFollowUp) }}
              </p>
            </button>
          </li>
          <li v-if="!inStage(stage.value).length" class="px-2 py-4 text-center">
            <p class="text-2xs text-ink-4">trống</p>
          </li>
        </ul>
      </section>
    </div>

    <!-- Table view -------------------------------------------------------- -->
    <DataTable
      v-else
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
      search-placeholder="Tìm theo công ty, người liên hệ…"
      empty-icon="contact_mail"
      empty-title="Không có yêu cầu nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="edit"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option v-for="s in ENQUIRY_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="filters.owner" class="select w-36" aria-label="Lọc theo người phụ trách">
          <option value="">Mọi người phụ trách</option>
          <option v-for="o in owners" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="filters.interest" class="select w-40" aria-label="Lọc theo nhu cầu">
          <option value="">Mọi nhu cầu</option>
          <option v-for="i in interests" :key="i" :value="i">{{ i }}</option>
        </select>
      </template>

      <template #cell-company="{ row }">
        <p class="font-bold text-ink truncate max-w-[26ch]">{{ row.company }}</p>
        <p class="meta truncate max-w-[30ch]">{{ row.industry }} · {{ row.companySize }}</p>
      </template>

      <template #cell-contact="{ row }">
        <p class="text-ink-2 truncate max-w-[24ch]">{{ row.contact }}</p>
        <p class="num meta">{{ row.phone }}</p>
      </template>

      <template #cell-budget="{ row }">
        <span class="num font-bold text-ink">{{ row.budget ? vnd(row.budget) : '—' }}</span>
      </template>

      <template #cell-nextFollowUp="{ row }">
        <span v-if="row.nextFollowUp" class="meta" :class="isOverdue(row) ? 'text-danger font-bold' : ''">
          {{ date(row.nextFollowUp) }}
        </span>
        <span v-else class="meta">—</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>
    </DataTable>

    <!-- Editor ------------------------------------------------------------ -->
    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Yêu cầu doanh nghiệp"
      :title="form.company || 'Yêu cầu mới'"
      :subtitle="form.contact"
      size="lg"
    >
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="s in ENQUIRY_STATUSES"
            :key="s.value"
            type="button"
            class="btn-sm"
            :class="form.status === s.value ? 'btn-secondary' : 'btn-ghost'"
            @click="form.status = s.value"
          >{{ s.label }}</button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Công ty" required>
            <template #default="{ id }">
              <input :id="id" v-model="form.company" type="text" class="input" data-autofocus />
            </template>
          </FormRow>
          <FormRow label="Ngành">
            <template #default="{ id }">
              <input :id="id" v-model="form.industry" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Người liên hệ">
            <template #default="{ id }">
              <input :id="id" v-model="form.contact" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Điện thoại">
            <template #default="{ id }">
              <input :id="id" v-model="form.phone" type="tel" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Email">
            <template #default="{ id }">
              <input :id="id" v-model="form.email" type="email" class="input" />
            </template>
          </FormRow>
          <FormRow label="Quy mô tham gia">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.headcount" type="number" min="1" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Nhu cầu">
            <template #default="{ id }">
              <select :id="id" v-model="form.interest" class="select">
                <option>Buổi on-site</option>
                <option>Chuỗi 8 tuần</option>
                <option>Sự kiện phục hồi</option>
                <option>Đào tạo nội bộ</option>
              </select>
            </template>
          </FormRow>
          <FormRow label="Ngân sách khách nêu">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.budget" type="number" min="0" step="1000000" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Người phụ trách">
            <template #default="{ id }">
              <select :id="id" v-model="form.owner" class="select">
                <option value="">Chưa ai nhận</option>
                <option v-for="u in db.list('users')" :key="u.id" :value="u.name">{{ u.name }}</option>
              </select>
            </template>
          </FormRow>
          <FormRow label="Ngày theo lại">
            <template #default="{ id }">
              <input :id="id" v-model="form.nextFollowUp" type="date" class="input" />
            </template>
          </FormRow>
        </div>

        <FormRow label="Khách cần gì">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.need" rows="3" class="input" />
          </template>
        </FormRow>

        <FormRow label="Ghi chú lần liên hệ gần nhất">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.lastNote" rows="2" class="input" />
          </template>
        </FormRow>

        <div v-if="form.id" class="panel-quiet p-2.5">
          <p class="meta">
            Nhận lúc {{ dateTime(form.createdAt) }} · nguồn {{ form.source }}
          </p>
        </div>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">Xoá</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu yêu cầu</button>
      </template>
    </SlideOver>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import { vnd, date, dateTime } from '@/utils/format.js'
import { ENQUIRY_STATUSES } from '@/data/mock/crm.js'

const route = useRoute()
const notify = useNotify()
const view = ref('board')

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, remove,
} = useResource('enquiries', {
  searchFields: ['company', 'contact', 'email', 'phone', 'industry'],
  filters: { status: route.query.status || '', owner: '', interest: '' },
  sort: { key: 'createdAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'company', label: 'Công ty', sortable: true },
  { key: 'contact', label: 'Liên hệ' },
  { key: 'interest', label: 'Nhu cầu', width: '11rem' },
  { key: 'budget', label: 'Ngân sách', align: 'right', sortable: true, width: '9rem' },
  { key: 'owner', label: 'Phụ trách', width: '9rem' },
  { key: 'nextFollowUp', label: 'Theo lại', sortable: true, width: '8rem' },
  { key: 'status', label: 'Trạng thái', width: '8rem' },
]

const owners = computed(() => [...new Set(all.value.map((e) => e.owner).filter(Boolean))])
const interests = computed(() => [...new Set(all.value.map((e) => e.interest))])

const inStage = (status) => all.value.filter((e) => e.status === status)

const todayIso = new Date().toISOString().slice(0, 10)
const isOverdue = (row) => !!row.nextFollowUp && row.nextFollowUp < todayIso

const stats = computed(() => {
  const list = all.value
  const open = list.filter((e) => ['contacted', 'quoted'].includes(e.status))
  return {
    new: list.filter((e) => e.status === 'new').length,
    open: open.length,
    won: list.filter((e) => e.status === 'won').length,
    pipeline: [...list.filter((e) => e.status === 'new'), ...open].reduce((s, e) => s + (e.budget || 0), 0),
  }
})

const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  return {
    id: null, company: '', companySize: '', industry: '', contact: '', email: '', phone: '',
    interest: 'Buổi on-site', need: '', headcount: 20, budget: null,
    source: 'Nhập tay', status: 'new', owner: '', createdAt: new Date().toISOString(),
    nextFollowUp: '', lastNote: '',
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function edit(row) {
  form.value = { ...row, nextFollowUp: row.nextFollowUp || '' }
  panelOpen.value = true
}

function submit() {
  if (!form.value.company.trim()) {
    notify.warn('Cần tên công ty.')
    return
  }
  if (form.value.status !== 'new' && !form.value.owner) {
    notify.warn('Yêu cầu đã bắt đầu theo thì phải có người phụ trách.')
    return
  }
  save({ ...form.value, nextFollowUp: form.value.nextFollowUp || null })
  panelOpen.value = false
  notify.success('Đã lưu yêu cầu.')
}

function destroy() {
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá yêu cầu.')
}
</script>
