<template>
  <main class="page">
    <PageHeader
      eyebrow="Nội dung"
      title="Trang tĩnh"
      subtitle="Các trang không phải bài viết: trang chủ, trang cá nhân, doanh nghiệp, học viện, giới thiệu. Trên site chúng đang nằm trong file markdown."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Thêm trang
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đang xuất bản" :value="stats.published" icon="public" tone="ok" />
      <StatTile label="Còn nháp" :value="stats.draft" icon="edit_note" :tone="stats.draft ? 'warn' : 'neutral'" />
      <StatTile label="Thiếu bản EN" :value="stats.missingEn" icon="translate" :tone="stats.missingEn ? 'warn' : 'neutral'" />
      <StatTile label="Thiếu mô tả SEO" :value="stats.noSeo" icon="search_off" :tone="stats.noSeo ? 'warn' : 'neutral'" />
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
      search-placeholder="Tìm theo đường dẫn hoặc tiêu đề…"
      empty-icon="description"
      empty-title="Không có trang nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="edit"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="published">Đang xuất bản</option>
          <option value="draft">Nháp</option>
        </select>
        <select v-model="filters.section" class="select w-40" aria-label="Lọc theo nhóm">
          <option value="">Mọi nhóm</option>
          <option v-for="s in sections" :key="s" :value="s">{{ s }}</option>
        </select>
      </template>

      <template #cell-path="{ row }">
        <p class="font-mono text-xs font-semibold text-ink">{{ row.path }}</p>
        <p class="meta truncate max-w-[28ch]">{{ row.titleVi }}</p>
      </template>

      <template #cell-locales="{ row }">
        <div class="flex items-center gap-1">
          <span
            v-for="loc in ['vi', 'en']"
            :key="loc"
            class="chip"
            :class="row.locales.includes(loc) ? 'chip-ok' : 'chip-warn'"
          >{{ loc.toUpperCase() }}</span>
        </div>
      </template>

      <template #cell-blocks="{ row }">
        <span class="num">{{ row.blocks }}</span>
        <span class="meta"> khối · {{ row.words }} từ</span>
      </template>

      <template #cell-updatedAt="{ row }">
        <p class="meta">{{ ago(row.updatedAt) }}</p>
        <p class="meta">bởi {{ row.updatedBy }}</p>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <a
            :href="`https://stretch.vn${row.path}`"
            target="_blank"
            rel="noopener"
            class="btn-ghost btn-sm btn-icon"
            title="Mở trang trên site"
            aria-label="Mở trang trên site"
            @click.stop
          >
            <span class="material-symbols-outlined text-lg">open_in_new</span>
          </a>
          <button type="button" class="btn-ghost btn-sm btn-icon" aria-label="Sửa trang" @click.stop="edit(row)">
            <span class="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </template>
    </DataTable>

    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Trang tĩnh"
      :title="form.titleVi || 'Trang mới'"
      :subtitle="form.path"
      size="lg"
    >
      <div class="space-y-3.5">
        <FormRow label="Đường dẫn" required hint="Bắt đầu bằng dấu / — bản tiếng Anh tự thêm tiền tố /vi hoặc mặc định.">
          <template #default="{ id }">
            <input :id="id" v-model="form.path" type="text" class="input font-mono text-xs" data-autofocus />
          </template>
        </FormRow>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Tiêu đề (VI)" required>
            <template #default="{ id }">
              <input :id="id" v-model="form.titleVi" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Tiêu đề (EN)" :hint="!form.titleEn ? 'Để trống là trang chưa có bản EN.' : ''">
            <template #default="{ id }">
              <input :id="id" v-model="form.titleEn" type="text" class="input" />
            </template>
          </FormRow>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Nhóm">
            <template #default="{ id }">
              <input :id="id" v-model="form.section" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Trạng thái">
            <template #default="{ id }">
              <select :id="id" v-model="form.status" class="select">
                <option value="published">Đang xuất bản</option>
                <option value="draft">Nháp</option>
              </select>
            </template>
          </FormRow>
        </div>

        <div class="divider" />

        <FormRow label="Tiêu đề SEO" :hint="`${(form.seoTitle || '').length}/60 ký tự`">
          <template #default="{ id }">
            <input :id="id" v-model="form.seoTitle" type="text" class="input" />
          </template>
        </FormRow>
        <FormRow label="Mô tả SEO" :hint="`${(form.seoDescription || '').length}/160 ký tự`">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.seoDescription" rows="3" class="input" />
          </template>
        </FormRow>

        <div class="panel-quiet p-3">
          <p class="label-xs mb-1.5">Xem như kết quả tìm kiếm</p>
          <p class="text-xs text-ok truncate">stretch.vn{{ form.path }}</p>
          <p class="text-info text-base font-semibold mt-0.5 truncate">{{ form.seoTitle || form.titleVi }}</p>
          <p class="text-xs text-ink-2 mt-0.5 line-clamp-2">
            {{ form.seoDescription || 'Chưa có mô tả — Google sẽ tự lấy đoạn đầu trang.' }}
          </p>
        </div>

        <FormRow label="Ghi chú nội bộ">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.note" rows="2" class="input" />
          </template>
        </FormRow>

        <div class="panel-quiet p-2.5">
          <p class="text-xs text-ink-2">
            Nội dung chi tiết của trang vẫn nằm trong repo site (markdown và component Vue).
            Ở đây quản lý phần metadata, trạng thái và SEO.
          </p>
        </div>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">Xoá trang</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu trang</button>
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
import { ago } from '@/utils/format.js'

const notify = useNotify()

const {
  all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, remove,
} = useResource('pages', {
  searchFields: ['path', 'titleVi', 'titleEn', 'section'],
  filters: { status: '', section: '' },
  sort: { key: 'updatedAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'path', label: 'Trang', sortable: true },
  { key: 'section', label: 'Nhóm', width: '10rem' },
  { key: 'locales', label: 'Ngôn ngữ', width: '9rem' },
  { key: 'blocks', label: 'Nội dung', align: 'right', width: '10rem' },
  { key: 'updatedAt', label: 'Cập nhật', sortable: true, width: '10rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

const sections = computed(() => [...new Set(all.value.map((p) => p.section))])

const stats = computed(() => {
  const list = all.value
  return {
    published: list.filter((p) => p.status === 'published').length,
    draft: list.filter((p) => p.status === 'draft').length,
    missingEn: list.filter((p) => !p.locales.includes('en')).length,
    noSeo: list.filter((p) => !p.seoDescription).length,
  }
})

const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  return {
    id: null, path: '/', titleVi: '', titleEn: '', section: 'Marketing', status: 'draft',
    locales: ['vi'], blocks: 0, words: 0, seoTitle: '', seoDescription: '', note: '',
    updatedBy: 'Minh Hoàng',
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function edit(row) {
  form.value = { ...row, locales: [...row.locales] }
  panelOpen.value = true
}

function submit() {
  if (!form.value.path.startsWith('/')) {
    notify.error('Đường dẫn phải bắt đầu bằng dấu /.')
    return
  }
  if (!form.value.titleVi.trim()) {
    notify.warn('Cần tiêu đề tiếng Việt.')
    return
  }
  const locales = form.value.titleEn?.trim() ? ['vi', 'en'] : ['vi']
  save({ ...form.value, locales, updatedAt: new Date().toISOString() })
  panelOpen.value = false
  notify.success('Đã lưu trang.')
}

function destroy() {
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá trang khỏi danh sách quản lý.')
}
</script>
