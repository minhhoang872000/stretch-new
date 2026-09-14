<template>
  <main class="page">
    <PageHeader
      eyebrow="Bán hàng"
      title="Thanh toán"
      subtitle="Tiền đã về, đối chiếu với sao kê. Chuyển khoản thiếu nội dung là chỗ hay lệch nhất — đánh dấu đã đối chiếu khi khớp sao kê."
    >
      <template #actions>
        <button type="button" class="btn-outline btn-sm" @click="exportCsv">
          <span class="material-symbols-outlined text-lg">download</span>
          Xuất sao kê
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Tổng thu" :value="vnd(stats.net)" icon="account_balance" tone="ok" hint="Đã trừ hoàn tiền" />
      <StatTile label="Chưa đối chiếu" :value="stats.unreconciled" icon="rule" :tone="stats.unreconciled ? 'warn' : 'neutral'" :hint="vnd(stats.unreconciledValue)" />
      <StatTile label="Hoàn tiền" :value="vnd(Math.abs(stats.refunded))" icon="undo" :tone="stats.refunded ? 'danger' : 'neutral'" />
      <StatTile label="Giao dịch 30 ngày" :value="stats.recent" icon="receipt" tone="accent" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
      <SectionCard title="Theo hình thức" class="xl:col-span-1">
        <BarList :items="byMethod" />
      </SectionCard>

      <SectionCard title="Dòng tiền 30 ngày" class="xl:col-span-2" hint="Tổng thu theo ngày">
        <Sparkline
          :values="trend.map((d) => d.revenue)"
          :labels="trend.map((d) => d.date)"
          :height="80"
          caption="Dòng tiền theo ngày"
          :format="vnd"
        />
      </SectionCard>
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
      search-placeholder="Tìm theo mã đơn, khách, mã giao dịch…"
      empty-icon="account_balance"
      empty-title="Không có giao dịch nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @toggle-row="toggleRow"
      @toggle-page="togglePage"
      @clear-selection="clearSelection"
    >
      <template #filters>
        <select v-model="filters.method" class="select w-36" aria-label="Lọc theo hình thức">
          <option value="">Mọi hình thức</option>
          <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="settled">Đã về</option>
          <option value="refunded">Đã hoàn</option>
        </select>
        <select v-model="reconciledFilter" class="select w-40" aria-label="Lọc theo đối chiếu">
          <option value="">Đối chiếu: tất cả</option>
          <option value="yes">Đã đối chiếu</option>
          <option value="no">Chưa đối chiếu</option>
        </select>
      </template>

      <template #bulk>
        <button type="button" class="btn-secondary btn-sm" @click="bulkReconcile(true)">Đánh dấu đã đối chiếu</button>
        <button type="button" class="btn-ghost btn-sm" @click="bulkReconcile(false)">Bỏ đối chiếu</button>
      </template>

      <template #cell-orderCode="{ row }">
        <RouterLink to="/sales/orders" class="font-mono text-xs link">{{ row.orderCode }}</RouterLink>
        <p class="meta">{{ row.customer }}</p>
      </template>

      <template #cell-amount="{ row }">
        <span class="num font-bold" :class="row.amount < 0 ? 'text-danger' : 'text-ink'">
          {{ vnd(row.amount) }}
        </span>
      </template>

      <template #cell-method="{ row }">
        <span class="chip">{{ labelOf(PAYMENT_METHODS, row.method) }}</span>
      </template>

      <template #cell-reference="{ row }">
        <span class="font-mono text-xs text-ink-2">{{ row.reference }}</span>
        <p v-if="row.note" class="meta truncate max-w-[28ch]">{{ row.note }}</p>
      </template>

      <template #cell-receivedAt="{ row }">
        <span class="meta">{{ dateTime(row.receivedAt) }}</span>
      </template>

      <template #cell-reconciled="{ row }">
        <button
          type="button"
          class="chip transition-colors"
          :class="row.reconciled ? 'chip-ok' : 'chip-warn'"
          @click.stop="toggleReconciled(row)"
        >
          <span class="material-symbols-outlined text-[0.9rem]">
            {{ row.reconciled ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          {{ row.reconciled ? 'Đã khớp' : 'Chưa khớp' }}
        </button>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>
    </DataTable>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import { insights , loadInsights } from '@/stores/db.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import BarList from '@/components/ui/BarList.vue'
import Sparkline from '@/components/ui/Sparkline.vue'
import { vnd, dateTime, labelOf } from '@/utils/format.js'
import { PAYMENT_METHODS } from '@/data/mock/commerce.js'

const notify = useNotify()
const reconciledFilter = ref('')
const trend = insights.revenueTrend

const {
  all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  selected, allOnPageSelected, toggleSort, reset, toggleRow, togglePage, clearSelection,
  patch, bulkPatch,
} = useResource('payments', {
  searchFields: ['orderCode', 'customer', 'reference'],
  filters: { method: '', status: '' },
  sort: { key: 'receivedAt', dir: 'desc' },
  pageSize: 15,
  // The reconciled flag is a boolean, so it needs a predicate rather than the
  // plain equality check the generic filter map does.
  where: (row) => {
    if (reconciledFilter.value === 'yes') return row.reconciled
    if (reconciledFilter.value === 'no') return !row.reconciled
    return true
  },
})

const columns = [
  { key: 'orderCode', label: 'Đơn', sortable: true, width: '11rem' },
  { key: 'amount', label: 'Số tiền', align: 'right', sortable: true, width: '9rem' },
  { key: 'method', label: 'Hình thức', width: '8rem' },
  { key: 'reference', label: 'Mã giao dịch' },
  { key: 'receivedAt', label: 'Nhận lúc', sortable: true, width: '11rem' },
  { key: 'reconciled', label: 'Đối chiếu', width: '9rem' },
  { key: 'status', label: 'Trạng thái', width: '8rem' },
]

const stats = computed(() => {
  const list = all.value
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const unreconciled = list.filter((p) => !p.reconciled)
  return {
    net: list.reduce((s, p) => s + p.amount, 0),
    unreconciled: unreconciled.length,
    unreconciledValue: unreconciled.reduce((s, p) => s + p.amount, 0),
    refunded: list.filter((p) => p.status === 'refunded').reduce((s, p) => s + p.amount, 0),
    recent: list.filter((p) => new Date(p.receivedAt) >= cutoff).length,
  }
})

const byMethod = computed(() => {
  const groups = new Map()
  for (const p of all.value) {
    if (p.amount <= 0) continue
    groups.set(p.method, (groups.get(p.method) || 0) + p.amount)
  }
  return [...groups.entries()]
    .map(([method, value]) => ({
      label: labelOf(PAYMENT_METHODS, method, method),
      value,
      display: vnd(value),
      hint: `${all.value.filter((p) => p.method === method).length} giao dịch`,
    }))
    .sort((a, b) => b.value - a.value)
})

function toggleReconciled(row) {
  patch(row.id, { reconciled: !row.reconciled })
}

async function bulkReconcile(value) {
  const n = await bulkPatch({ reconciled: value })
  notify.success(`Đã cập nhật ${n} giao dịch.`)
}

function exportCsv() {
  const header = ['Ma don', 'Khach', 'So tien', 'Hinh thuc', 'Ma giao dich', 'Nhan luc', 'Doi chieu', 'Trang thai']
  const lines = all.value.map((p) =>
    [p.orderCode, p.customer, p.amount, p.method, p.reference, p.receivedAt, p.reconciled ? 'da' : 'chua', p.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sao-ke-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notify.success(`Đã xuất ${all.value.length} giao dịch.`)
}

// The reports are computed server-side; fetched once per session, on demand.
onMounted(loadInsights)
</script>
