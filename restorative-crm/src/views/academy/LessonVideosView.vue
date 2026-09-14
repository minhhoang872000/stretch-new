<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Video bài học"
      subtitle="Site gọi video theo thứ tự (ordinal) của bài video trong khoá — chèn thêm một video giữa khoá là đánh số lại toàn bộ phía sau."
    >
      <template #actions>
        <button type="button" class="btn-outline btn-sm" @click="filters.status = 'missing'">
          <span class="material-symbols-outlined text-lg">error</span>
          Xem bài thiếu link
        </button>
      </template>
    </PageHeader>

    <div class="panel px-3.5 py-3 mb-4 flex flex-wrap items-start gap-3">
      <span class="material-symbols-outlined text-xl text-warn shrink-0">shield</span>
      <div class="min-w-0">
        <p class="text-[0.8125rem] font-bold text-ink">Hai nguồn video, hai mức bảo vệ khác nhau</p>
        <p class="meta mt-0.5">
          <span class="font-bold text-ink-2">YouTube unlisted:</span> học viên đã đăng nhập vẫn copy được
          id từ tab network và gửi cho người khác — không chặn được.
          <span class="font-bold text-ink-2">R2:</span> bucket để riêng tư, mỗi lần phát site cấp một link
          có chữ ký hết hạn sau ít phút, nên link chia sẻ ra ngoài sẽ chết nhanh.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Bài video" :value="stats.total" icon="movie" tone="accent" />
      <StatTile label="Đã gắn link" :value="stats.ready" icon="check_circle" tone="ok" />
      <StatTile label="Thiếu link" :value="stats.missing" icon="error" :tone="stats.missing ? 'danger' : 'neutral'" hint="Học viên sẽ thấy bài trống" />
      <StatTile label="Cho học thử" :value="stats.free" icon="lock_open" tone="info" hint="Xem được khi chưa ghi danh" />
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
      search-placeholder="Tìm theo bài học, chương trình…"
      empty-icon="movie"
      empty-title="Không có bài video nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="edit"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-36" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="ready">Đã gắn link</option>
          <option value="missing">Thiếu link</option>
        </select>
        <select v-model="filters.programId" class="select w-52" aria-label="Lọc theo chương trình">
          <option value="">Mọi chương trình</option>
          <option v-for="p in db.list('programs')" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </template>

      <template #cell-lessonTitle="{ row }">
        <p class="font-semibold text-ink truncate max-w-[30ch]">{{ row.lessonTitle }}</p>
        <p class="meta truncate max-w-[34ch]">
          {{ row.programTitle }} · {{ row.moduleTitle }}
        </p>
      </template>

      <template #cell-ordinal="{ row }">
        <span class="chip font-mono">#{{ row.ordinal }}</span>
      </template>

      <template #cell-youtubeId="{ row }">
        <!-- Two possible sources, so the column says which one this lesson uses. -->
        <div v-if="row.provider === 'r2' && row.videoId" class="min-w-0">
          <span class="chip chip-accent">
            <span class="material-symbols-outlined text-[0.9rem]">cloud_done</span>
            R2
          </span>
          <p class="meta font-mono truncate max-w-[14ch]">{{ row.videoId.slice(0, 8) }}</p>
        </div>
        <a
          v-else-if="row.youtubeId"
          :href="`https://youtu.be/${row.youtubeId}`"
          target="_blank"
          rel="noopener"
          class="font-mono text-xs link"
          @click.stop
        >{{ row.youtubeId }}</a>
        <span v-else class="text-xs font-bold text-danger">chưa có</span>
      </template>

      <template #cell-minutes="{ row }">
        <span class="num">{{ row.minutes }}′</span>
      </template>

      <template #cell-free="{ row }">
        <span v-if="row.free" class="chip chip-info">Học thử</span>
        <span v-else class="meta">Cần ghi danh</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <button type="button" class="btn-ghost btn-sm btn-icon" aria-label="Gắn link video" @click="edit(row)">
          <span class="material-symbols-outlined text-lg">link</span>
        </button>
      </template>
    </DataTable>

    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Video bài học"
      :title="form.lessonTitle"
      :subtitle="`${form.programTitle} · video #${form.ordinal}`"
      size="md"
    >
      <div class="space-y-3.5">
        <VideoSourcePanel
          v-model="source"
          :program-slug="form.programSlug"
          :lesson-ordinal="form.ordinal"
          :lesson-title="form.lessonTitle"
          @uploaded="onUploaded"
        />

        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Thời lượng (phút)">
            <template #default="{ id }">
              <input :id="id" v-model.number="form.minutes" type="number" min="1" class="input num" />
            </template>
          </FormRow>
          <FormRow v-if="source.provider === 'youtube'" label="Chế độ trên YouTube">
            <template #default="{ id }">
              <select :id="id" v-model="form.visibility" class="select">
                <option value="unlisted">Không công khai</option>
                <option value="private">Riêng tư</option>
                <option value="public">Công khai</option>
              </select>
            </template>
          </FormRow>
          <!-- The site resolves a lesson video by (slug, ordinal). While the
               programme list here is still mock data its slugs may not match the
               live site's, so this stays editable instead of read-only. -->
          <FormRow
            v-else
            label="Slug khoá trên site"
            hint="Site tìm video theo slug + ordinal. Dán đúng slug đang chạy trên stretch.vn."
          >
            <template #default="{ id }">
              <input :id="id" v-model="form.programSlug" type="text" class="input font-mono text-xs" />
            </template>
          </FormRow>
        </div>

        <ToggleSwitch v-model="form.free" label="Cho xem thử khi chưa ghi danh" state-text />

        <FormRow label="Ghi chú">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.note" rows="2" class="input" />
          </template>
        </FormRow>
      </div>

      <template #footer>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu</button>
      </template>
    </SlideOver>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import VideoSourcePanel from '@/components/videos/VideoSourcePanel.vue'

const route = useRoute()
const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save,
} = useResource('videos', {
  searchFields: ['lessonTitle', 'programTitle', 'moduleTitle', 'youtubeId'],
  filters: { status: route.query.status || '', programId: '' },
  sort: { key: 'programTitle', dir: 'asc' },
  pageSize: 15,
})

const columns = [
  { key: 'lessonTitle', label: 'Bài học', sortable: true },
  { key: 'ordinal', label: 'Ordinal', align: 'center', sortable: true, width: '7rem' },
  { key: 'youtubeId', label: 'Video', width: '11rem' },
  { key: 'minutes', label: 'Phút', align: 'right', sortable: true, width: '5.5rem' },
  { key: 'free', label: 'Quyền xem', width: '9rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

const stats = computed(() => {
  const list = all.value
  return {
    total: list.length,
    ready: list.filter((v) => v.status === 'ready').length,
    missing: list.filter((v) => v.status === 'missing').length,
    free: list.filter((v) => v.free).length,
  }
})

// ── editor ──────────────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref({})

/**
 * The lesson's video source, edited by VideoSourcePanel: either a YouTube id or
 * a file uploaded to R2. Kept separate from `form` so switching source does not
 * quietly drop the other one's fields until save.
 */
const source = ref({ provider: 'r2', youtubeId: '', videoId: '', objectKey: '' })

function edit(row) {
  form.value = { ...row, programSlug: row.programSlug || slugOf(row.programId) }
  source.value = {
    provider: row.provider === 'r2' || row.videoId ? 'r2' : row.youtubeId ? 'youtube' : 'r2',
    youtubeId: row.youtubeId || '',
    videoId: row.videoId || '',
    objectKey: row.objectKey || '',
    sizeBytes: row.sizeBytes || 0,
    durationSeconds: row.durationSeconds || null,
  }
  panelOpen.value = true
}

/** The site addresses lessons by programme slug, the mock rows carry the id. */
function slugOf(programId) {
  return db.find('programs', programId)?.slug || ''
}

/** An upload that finished already knows its length — fill the minutes field. */
function onUploaded(next) {
  if (next.durationSeconds) {
    form.value.minutes = Math.max(1, Math.round(next.durationSeconds / 60))
  }
  notify.success('Video đã nằm trên R2 và gắn vào bài học này.')
}

function submit() {
  const s = source.value
  const attached = s.provider === 'r2' ? !!s.videoId : !!s.youtubeId

  save({
    ...form.value,
    provider: s.provider,
    youtubeId: s.provider === 'youtube' ? s.youtubeId : '',
    videoId: s.provider === 'r2' ? s.videoId : '',
    objectKey: s.provider === 'r2' ? s.objectKey : '',
    sizeBytes: s.sizeBytes || 0,
    durationSeconds: s.durationSeconds || null,
    status: attached ? 'ready' : 'missing',
    note: attached ? form.value.note : 'Chưa gắn video — học viên sẽ thấy bài trống.',
    updatedAt: new Date().toISOString(),
  })
  panelOpen.value = false
  notify.success(attached ? 'Đã lưu nguồn video cho bài học.' : 'Đã lưu, bài này vẫn chưa có video.')
}
</script>
