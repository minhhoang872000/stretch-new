<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Chương trình"
      subtitle="Khoá đầy đủ, mini course và workshop — đây là những gì trang /learning-hub/programs hiển thị."
    >
      <template #actions>
        <a href="https://stretch.vn/learning-hub/programs" target="_blank" rel="noopener" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">open_in_new</span>
          Xem trên site
        </a>
        <button type="button" class="btn-primary btn-sm" @click="createProgram">
          <span class="material-symbols-outlined text-lg">add</span>
          Chương trình mới
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đang bán" :value="stats.published" icon="storefront" tone="ok" />
      <StatTile label="Còn nháp" :value="stats.draft" icon="edit_note" :tone="stats.draft ? 'warn' : 'neutral'" />
      <StatTile label="Học viên đã ghi danh" :value="stats.enrolled" icon="groups" tone="accent" />
      <StatTile label="Doanh thu luỹ kế" :value="vnd(stats.revenue)" icon="payments" tone="accent" />
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
      clickable
      search-placeholder="Tìm theo tên chương trình…"
      empty-icon="school"
      empty-title="Chưa có chương trình nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="(row) => $router.push(`/academy/programs/${row.id}`)"
      @toggle-row="toggleRow"
      @toggle-page="togglePage"
      @clear-selection="clearSelection"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option v-for="o in PROGRAM_STATUSES" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-model="filters.kind" class="select w-36" aria-label="Lọc theo loại">
          <option value="">Mọi loại</option>
          <option v-for="o in PROGRAM_KINDS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-model="filters.topic" class="select w-40" aria-label="Lọc theo chủ đề">
          <option value="">Mọi chủ đề</option>
          <option v-for="o in PROGRAM_TOPICS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-model="filters.mode" class="select w-40" aria-label="Lọc theo hình thức">
          <option value="">Online + studio</option>
          <option v-for="o in PROGRAM_MODES" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </template>

      <template #bulk>
        <button type="button" class="btn-secondary btn-sm" @click="bulk('published')">Mở bán</button>
        <button type="button" class="btn-ghost btn-sm" @click="bulk('draft')">Chuyển nháp</button>
        <button type="button" class="btn-ghost btn-sm" @click="bulk('archived')">Lưu trữ</button>
      </template>

      <template #cell-title="{ row }">
        <div class="flex items-center gap-2.5 min-w-0">
          <img
            :src="row.image"
            :alt="`Ảnh bìa chương trình ${row.title}`"
            class="w-10 h-10 rounded-md object-cover border border-line shrink-0"
            loading="lazy"
          />
          <div class="min-w-0">
            <p class="font-bold text-ink truncate max-w-[30ch]">{{ row.title }}</p>
            <p class="meta truncate max-w-[34ch]">
              {{ labelOf(PROGRAM_KINDS, row.kind) }} · {{ labelOf(PROGRAM_TOPICS, row.topic) }} ·
              {{ row.lessons }} bài · {{ duration(row.minutes) }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-mode="{ row }">
        <span class="chip" :class="row.mode === 'offline' ? 'chip-info' : ''">
          <span class="material-symbols-outlined text-[0.9rem]">
            {{ row.mode === 'offline' ? 'store' : 'play_circle' }}
          </span>
          {{ labelOf(PROGRAM_MODES, row.mode) }}
        </span>
      </template>

      <template #cell-price="{ row }">
        <p class="num font-bold text-ink">{{ row.price === 0 ? 'Miễn phí' : vnd(row.price) }}</p>
        <p v-if="row.compareAtPrice" class="num meta line-through">{{ vnd(row.compareAtPrice) }}</p>
      </template>

      <template #cell-enrolled="{ row }">
        <p class="num font-semibold text-ink">{{ row.enrolled }}</p>
        <p class="meta">{{ row.rating ? `${row.rating.toFixed(1)}★ · ${row.reviewCount}` : 'chưa có đánh giá' }}</p>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #cell-updatedAt="{ row }">
        <span class="meta">{{ ago(row.updatedAt) }}</span>
      </template>

      <template #row-actions="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <RouterLink
            :to="`/academy/programs/${row.id}`"
            class="btn-ghost btn-sm btn-icon"
            title="Sửa chương trình"
            aria-label="Sửa chương trình"
          >
            <span class="material-symbols-outlined text-lg">edit</span>
          </RouterLink>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon"
            title="Nhân bản"
            aria-label="Nhân bản chương trình"
            @click="clone(row)"
          >
            <span class="material-symbols-outlined text-lg">content_copy</span>
          </button>
        </div>
      </template>
    </DataTable>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { vnd, ago, duration, labelOf } from '@/utils/format.js'
import {
  PROGRAM_KINDS, PROGRAM_TOPICS, PROGRAM_MODES, PROGRAM_STATUSES,
} from '@/data/mock/learning.js'

const router = useRouter()
const notify = useNotify()

const {
  all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  selected, allOnPageSelected, toggleSort, reset, toggleRow, togglePage, clearSelection,
  save, duplicate, bulkPatch,
} = useResource('programs', {
  searchFields: ['title', 'subtitle', 'slug'],
  filters: { status: '', kind: '', topic: '', mode: '' },
  sort: { key: 'updatedAt', dir: 'desc' },
  pageSize: 12,
})

const columns = [
  { key: 'title', label: 'Chương trình', sortable: true },
  { key: 'mode', label: 'Hình thức', width: '9rem' },
  { key: 'price', label: 'Giá', align: 'right', sortable: true, width: '9rem' },
  { key: 'enrolled', label: 'Học viên', align: 'right', sortable: true, width: '8rem' },
  { key: 'status', label: 'Trạng thái', width: '8rem' },
  { key: 'updatedAt', label: 'Cập nhật', sortable: true, width: '9rem' },
]

const stats = computed(() => {
  const rows = all.value
  return {
    published: rows.filter((p) => p.status === 'published').length,
    draft: rows.filter((p) => p.status === 'draft').length,
    enrolled: rows.reduce((s, p) => s + p.enrolled, 0),
    revenue: rows.reduce((s, p) => s + p.revenue, 0),
  }
})

async function createProgram() {
  const row = await save({
    title: 'Chương trình chưa đặt tên',
    subtitle: '',
    slug: `chuong-trinh-moi-${Date.now().toString().slice(-4)}`,
    kind: 'mini', mode: 'online', topic: 'functional',
    level: 'Cơ bản', language: 'Tiếng Việt',
    price: 0, compareAtPrice: null, status: 'draft', badge: null, certificate: false,
    instructorId: 'ins-01',
    image: 'https://picsum.photos/seed/chuong-trinh-moi/640/400',
    outcomes: [], skills: [], modules: [], lessons: 0, minutes: 0,
    enrolled: 0, rating: 0, reviewCount: 0, revenue: 0,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    seo: { title: '', description: '', ogImage: '' },
    faq: [],
  })
  if (!row) return
  notify.success('Đã tạo bản nháp. Điền nội dung rồi mở bán.')
  router.push(`/academy/programs/${row.id}`)
}

async function clone(row) {
  const copy = await duplicate(row.id, {
    title: `${row.title} (bản sao)`,
    slug: `${row.slug}-ban-sao`,
    status: 'draft',
    enrolled: 0, revenue: 0, rating: 0, reviewCount: 0,
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  })
  if (!copy) return
  notify.success('Đã nhân bản sang một bản nháp mới.')
  if (copy) router.push(`/academy/programs/${copy.id}`)
}

async function bulk(status) {
  const n = await bulkPatch({ status, updatedAt: new Date().toISOString() })
  notify.success(`Đã cập nhật ${n} chương trình.`)
}
</script>
