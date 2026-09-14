<script setup>
import { computed } from 'vue'
import { useResource } from '@/composables/useResource.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import BarList from '@/components/ui/BarList.vue'
import { dateTime, ago } from '@/utils/format.js'

/**
 * Who did what, and when.
 *
 * Read-only by design: there is no edit and no delete on this screen, because a
 * log an operator can rewrite is not a log. The only affordances are filtering
 * and reading — everything else would undermine the point of keeping it.
 *
 * The area column comes from the action name (`order.refund` → `order`), so a new
 * action shows up grouped correctly without anyone maintaining a second list.
 */
const {
  all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset,
} = useResource('auditLog', {
  searchFields: ['user', 'action', 'detail', 'ip'],
  filters: { area: '', userId: '' },
  sort: { key: 'at', dir: 'desc' },
  pageSize: 20,
})

const columns = [
  { key: 'at', label: 'Thời điểm', sortable: true, width: '12rem' },
  { key: 'user', label: 'Người thao tác', width: '11rem' },
  { key: 'action', label: 'Thao tác', width: '12rem' },
  { key: 'detail', label: 'Chi tiết' },
  { key: 'ip', label: 'IP', width: '9rem' },
]

/**
 * Actions worth a second look: they move money, remove access, or change how the
 * system behaves. Flagged rather than hidden — the point of a log is that these
 * are findable later.
 */
const SENSITIVE = ['refund', 'revoke', 'suspend', 'delete', 'update']
const SENSITIVE_AREAS = ['settings', 'user', 'order', 'certificate']

const isSensitive = (row) => {
  const [area, verb] = row.action.split('.')
  return SENSITIVE_AREAS.includes(area) && SENSITIVE.includes(verb)
}

const areas = computed(() => [...new Set(all.value.map((r) => r.area))].sort())
const actors = computed(() => {
  const seen = new Map()
  for (const row of all.value) if (!seen.has(row.userId)) seen.set(row.userId, row.user)
  return [...seen].map(([id, name]) => ({ id, name }))
})

const todayIso = new Date().toISOString().slice(0, 10)
const weekAgoIso = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10)

const stats = computed(() => {
  const list = all.value
  const today = list.filter((r) => String(r.at).slice(0, 10) === todayIso)
  const week = list.filter((r) => String(r.at).slice(0, 10) >= weekAgoIso)
  const counts = new Map()
  for (const row of week) counts.set(row.user, (counts.get(row.user) || 0) + 1)
  const busiest = [...counts].sort((a, b) => b[1] - a[1])[0]
  return {
    today: today.length,
    week: week.length,
    busiest: busiest ? busiest[0] : '—',
    busiestCount: busiest ? busiest[1] : 0,
    sensitive: week.filter(isSensitive).length,
  }
})

/** Which parts of the console are actually being used this week. */
const byArea = computed(() => {
  const counts = new Map()
  for (const row of all.value.filter((r) => String(r.at).slice(0, 10) >= weekAgoIso)) {
    counts.set(row.area, (counts.get(row.area) || 0) + 1)
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }))
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Hệ thống"
      title="Nhật ký thao tác"
      subtitle="Chỉ đọc. Không có nút sửa hay xoá ở đây — một nhật ký sửa được thì không còn là nhật ký."
    />

    <div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Hôm nay" :value="stats.today" unit="thao tác" icon="today" :loading="loading" />
      <StatTile label="7 ngày" :value="stats.week" icon="date_range" :loading="loading" />
      <StatTile
        label="Nhiều thao tác nhất"
        :value="stats.busiest"
        icon="person"
        :hint="`${stats.busiestCount} thao tác trong 7 ngày`"
        :loading="loading"
      />
      <StatTile
        label="Thao tác nhạy cảm"
        :value="stats.sensitive"
        icon="gpp_maybe"
        :tone="stats.sensitive ? 'warn' : 'ok'"
        hint="Hoàn tiền · thu hồi · tạm ngưng · đổi cài đặt"
        :loading="loading"
      />
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
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
        search-placeholder="Tìm theo người, thao tác, nội dung, IP…"
        empty-icon="history_toggle_off"
        empty-title="Không có thao tác nào khớp"
        empty-hint="Thử bỏ một bộ lọc, hoặc mở rộng từ khoá."
        @update:query="query = $event"
        @update:page="page = $event"
        @sort="toggleSort"
        @reset="reset"
      >
        <template #filters>
          <select v-model="filters.area" class="input">
            <option value="">Mọi khu vực</option>
            <option v-for="area in areas" :key="area" :value="area">{{ area }}</option>
          </select>

          <select v-model="filters.userId" class="input">
            <option value="">Mọi người dùng</option>
            <option v-for="actor in actors" :key="actor.id" :value="actor.id">{{ actor.name }}</option>
          </select>
        </template>

        <template #cell-at="{ row }">
          <span class="num">{{ dateTime(row.at) }}</span>
          <span class="block text-xs text-ink-3">{{ ago(row.at) }}</span>
        </template>

        <template #cell-user="{ row }">
          <span class="font-medium text-ink">{{ row.user }}</span>
        </template>

        <template #cell-action="{ row }">
          <span
            class="rounded border px-1.5 py-0.5 font-mono text-[11px]"
            :class="
              isSensitive(row)
                ? 'border-warn-line bg-warn-soft text-warn'
                : 'border-line bg-panel-2 text-ink-2'
            "
          >
            {{ row.action }}
          </span>
        </template>

        <template #cell-detail="{ row }">
          <span class="text-ink-2">{{ row.detail }}</span>
        </template>

        <template #cell-ip="{ row }">
          <span class="num text-xs text-ink-3">{{ row.ip }}</span>
        </template>
      </DataTable>

      <div class="flex flex-col gap-5">
        <SectionCard title="Khu vực hoạt động" hint="Số thao tác trong 7 ngày gần nhất">
          <BarList v-if="byArea.length" :items="byArea" />
          <p v-else class="text-xs text-ink-3">Chưa có thao tác nào trong tuần.</p>
        </SectionCard>

        <SectionCard title="Nhật ký này ghi gì">
          <ul class="grid gap-2 text-xs leading-relaxed text-ink-2">
            <li class="flex gap-2">
              <span class="material-symbols-outlined text-[15px] text-ok">check</span>
              Mọi thao tác ghi/sửa/xoá dữ liệu, kèm người thực hiện và IP.
            </li>
            <li class="flex gap-2">
              <span class="material-symbols-outlined text-[15px] text-ok">check</span>
              Thao tác chạm vào tiền hoặc quyền được đánh dấu vàng để tra lại nhanh.
            </li>
            <li class="flex gap-2">
              <span class="material-symbols-outlined text-[15px] text-ink-4">remove</span>
              Không ghi lượt xem trang — nếu ghi thì nhật ký sẽ toàn tiếng ồn.
            </li>
          </ul>
          <p class="mt-3 rounded-lg bg-panel-2 px-3 py-2 text-xs leading-relaxed text-ink-3">
            Khi nối API thật, phần ghi nhật ký nên nằm ở tầng server (middleware), không phải ở console —
            client ghi nhật ký thì client cũng bỏ được.
          </p>
        </SectionCard>
      </div>
    </div>
  </div>
</template>
