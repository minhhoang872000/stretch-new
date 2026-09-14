<template>
  <main class="page">
    <PageHeader
      eyebrow="Bán hàng"
      title="Mã giảm giá"
      subtitle="Mã áp cho toàn bộ, cho một chương trình, hoặc cho một loại chương trình. Hết suất hoặc hết hạn thì tự chuyển trạng thái."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Tạo mã
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đang chạy" :value="stats.active" icon="sell" tone="ok" />
      <StatTile label="Lượt đã dùng" :value="stats.used" icon="local_activity" tone="accent" :hint="`trên ${stats.quota} suất`" />
      <StatTile label="Đã hết hiệu lực" :value="stats.dead" icon="event_busy" tone="neutral" />
      <StatTile label="Giá trị đã giảm" :value="vnd(stats.discounted)" icon="trending_down" tone="warn" hint="Theo các đơn đã dùng mã" />
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
      search-placeholder="Tìm theo mã…"
      empty-icon="sell"
      empty-title="Chưa có mã nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="edit"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-40" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang chạy</option>
          <option value="exhausted">Hết suất</option>
          <option value="expired">Hết hạn</option>
        </select>
        <select v-model="filters.scope" class="select w-40" aria-label="Lọc theo phạm vi">
          <option value="">Mọi phạm vi</option>
          <option value="all">Toàn bộ</option>
          <option value="program">Một chương trình</option>
          <option value="kind">Theo loại</option>
        </select>
      </template>

      <template #cell-code="{ row }">
        <p class="font-mono text-xs font-bold text-ink">{{ row.code }}</p>
        <p class="meta truncate max-w-[30ch]">{{ row.note }}</p>
      </template>

      <template #cell-value="{ row }">
        <span class="num font-bold text-ink">
          {{ row.type === 'percent' ? `${row.value}%` : vnd(row.value) }}
        </span>
        <p v-if="row.minSpend" class="meta">đơn từ {{ vnd(row.minSpend) }}</p>
      </template>

      <template #cell-scope="{ row }">
        <span class="chip">{{ scopeLabel(row) }}</span>
      </template>

      <template #cell-used="{ row }">
        <div class="w-28 ml-auto">
          <ProgressMeter
            :value="(row.used / row.quota) * 100"
            :label="`${row.used}/${row.quota}`"
            :show-value="false"
            :tone="row.used >= row.quota ? 'danger' : 'accent'"
          />
        </div>
      </template>

      <template #cell-endsAt="{ row }">
        <span class="meta">{{ date(row.startsAt) }} → {{ date(row.endsAt) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon"
            title="Sao chép mã"
            aria-label="Sao chép mã"
            @click.stop="copy(row.code)"
          >
            <span class="material-symbols-outlined text-lg">content_copy</span>
          </button>
          <button type="button" class="btn-ghost btn-sm btn-icon" aria-label="Sửa mã" @click.stop="edit(row)">
            <span class="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </template>
    </DataTable>

    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Mã giảm giá"
      :title="form.id ? `Sửa ${form.code}` : 'Tạo mã mới'"
      size="md"
    >
      <div class="space-y-3.5">
        <FormRow label="Mã" required hint="Chữ in hoa, không dấu, không khoảng trắng.">
          <template #default="{ id }">
            <input
              :id="id"
              v-model="form.code"
              type="text"
              class="input font-mono uppercase"
              data-autofocus
              @input="form.code = form.code.toUpperCase().replace(/\s/g, '')"
            />
          </template>
        </FormRow>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Kiểu giảm">
            <template #default="{ id }">
              <select :id="id" v-model="form.type" class="select">
                <option value="percent">Theo phần trăm</option>
                <option value="amount">Số tiền cố định</option>
              </select>
            </template>
          </FormRow>
          <FormRow :label="form.type === 'percent' ? 'Phần trăm giảm' : 'Số tiền giảm'">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.value" type="number" min="0" class="input num" />
            </template>
          </FormRow>
        </div>

        <FormRow label="Phạm vi áp dụng">
          <template #default="{ id }">
            <select :id="id" v-model="form.scope" class="select">
              <option value="all">Toàn bộ chương trình</option>
              <option value="program">Một chương trình cụ thể</option>
              <option value="kind">Một loại chương trình</option>
            </select>
          </template>
        </FormRow>

        <FormRow v-if="form.scope === 'program'" label="Chương trình">
          <template #default="{ id }">
            <select :id="id" v-model="form.programId" class="select">
              <option v-for="p in db.list('programs')" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </template>
        </FormRow>

        <FormRow v-if="form.scope === 'kind'" label="Loại chương trình">
          <template #default="{ id }">
            <select :id="id" v-model="form.kind" class="select">
              <option v-for="k in PROGRAM_KINDS" :key="k.value" :value="k.value">{{ k.label }}</option>
            </select>
          </template>
        </FormRow>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Đơn tối thiểu">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.minSpend" type="number" min="0" step="10000" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Số suất">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.quota" type="number" min="1" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Bắt đầu">
            <template #default="{ id }">
              <input :id="id" v-model="form.startsAt" type="date" class="input" />
            </template>
          </FormRow>
          <FormRow label="Kết thúc">
            <template #default="{ id }">
              <input :id="id" v-model="form.endsAt" type="date" class="input" />
            </template>
          </FormRow>
        </div>

        <FormRow label="Ghi chú nội bộ">
          <template #default="{ id }">
            <input :id="id" v-model="form.note" type="text" class="input" />
          </template>
        </FormRow>

        <div class="panel-quiet p-2.5">
          <p class="label-xs mb-1">Thử trên một đơn</p>
          <p class="text-xs text-ink-2">
            Đơn {{ vnd(sampleOrder) }} → giảm
            <span class="num font-bold text-ink">{{ vnd(preview) }}</span>,
            khách trả <span class="num font-bold text-ink">{{ vnd(sampleOrder - preview) }}</span>.
          </p>
        </div>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">Xoá mã</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu mã</button>
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
import { vnd, date, labelOf } from '@/utils/format.js'
import { PROGRAM_KINDS } from '@/data/mock/learning.js'

const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, remove,
} = useResource('coupons', {
  searchFields: ['code', 'note'],
  filters: { status: '', scope: '' },
  sort: { key: 'endsAt', dir: 'desc' },
  pageSize: 12,
})

const columns = [
  { key: 'code', label: 'Mã', sortable: true },
  { key: 'value', label: 'Giảm', align: 'right', width: '9rem' },
  { key: 'scope', label: 'Phạm vi', width: '13rem' },
  { key: 'used', label: 'Đã dùng', align: 'right', sortable: true, width: '9rem' },
  { key: 'endsAt', label: 'Hiệu lực', sortable: true, width: '13rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

function scopeLabel(row) {
  if (row.scope === 'program') return db.nameOf('programs', row.programId, 'title')
  if (row.scope === 'kind') return labelOf(PROGRAM_KINDS, row.kind, row.kind)
  return 'Toàn bộ chương trình'
}

const stats = computed(() => {
  const list = all.value
  const orders = db.list('orders').filter((o) => o.couponCode)
  return {
    active: list.filter((c) => c.status === 'active').length,
    used: list.reduce((s, c) => s + c.used, 0),
    quota: list.reduce((s, c) => s + c.quota, 0),
    dead: list.filter((c) => c.status !== 'active').length,
    discounted: orders.reduce((s, o) => s + o.discount, 0),
  }
})

async function copy(code) {
  try {
    await navigator.clipboard.writeText(code)
    notify.success(`Đã sao chép ${code}.`)
  } catch {
    notify.warn('Trình duyệt không cho sao chép tự động.')
  }
}

// ── editor ──────────────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  const today = new Date().toISOString().slice(0, 10)
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)
  return {
    id: null, code: '', type: 'percent', value: 10, scope: 'all',
    programId: '', kind: 'mini', minSpend: 0, quota: 100, used: 0,
    startsAt: today, endsAt: in30.toISOString().slice(0, 10), status: 'active', note: '',
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

const sampleOrder = 2490000
const preview = computed(() => {
  if (form.value.minSpend && sampleOrder < form.value.minSpend) return 0
  return form.value.type === 'percent'
    ? Math.round((sampleOrder * form.value.value) / 100)
    : Math.min(form.value.value, sampleOrder)
})

function submit() {
  if (!form.value.code.trim()) {
    notify.warn('Cần nhập mã.')
    return
  }
  const clash = all.value.find((c) => c.code === form.value.code && c.id !== form.value.id)
  if (clash) {
    notify.error('Mã này đã tồn tại. Đặt mã khác nhé.')
    return
  }
  const today = new Date().toISOString().slice(0, 10)
  const status = form.value.used >= form.value.quota
    ? 'exhausted'
    : form.value.endsAt < today ? 'expired' : 'active'
  save({ ...form.value, status })
  panelOpen.value = false
  notify.success('Đã lưu mã giảm giá.')
}

function destroy() {
  if (form.value.used > 0) {
    notify.warn('Mã đã có đơn dùng — nên để hết hạn thay vì xoá, để còn đối chiếu doanh thu.')
    return
  }
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá mã.')
}
</script>
