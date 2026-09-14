<template>
  <main class="page">
    <PageHeader
      eyebrow="Nội dung"
      title="Câu hỏi thường gặp"
      subtitle="Hiện ở trang dịch vụ, trang chương trình và trang doanh nghiệp. Thứ tự trong nhóm là thứ tự hiển thị."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Thêm câu hỏi
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đang hiện" :value="stats.published" icon="help_center" tone="ok" />
      <StatTile label="Còn nháp" :value="stats.draft" icon="edit_note" :tone="stats.draft ? 'warn' : 'neutral'" />
      <StatTile label="Nhóm câu hỏi" :value="groups.length" icon="folder" tone="accent" />
      <StatTile label="Thiếu bản EN" :value="stats.missingEn" icon="translate" :tone="stats.missingEn ? 'warn' : 'neutral'" />
    </div>

    <div class="panel px-3 py-2.5 mb-3 flex flex-wrap items-center gap-2">
      <button
        v-for="g in ['', ...groups]"
        :key="g || 'all'"
        type="button"
        class="btn-sm"
        :class="filters.group === g ? 'btn-secondary' : 'btn-ghost'"
        @click="filters.group = g"
      >
        {{ g || 'Tất cả' }}
        <span class="num ml-1 text-ink-3">{{ g ? countIn(g) : all.length }}</span>
      </button>
      <label class="relative w-56 ml-auto">
        <span class="sr-only">Tìm câu hỏi</span>
        <span class="material-symbols-outlined text-base text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
        <input v-model="query" type="search" class="input pl-8" placeholder="Tìm trong câu hỏi…" />
      </label>
    </div>

    <ul v-if="filtered.length" class="space-y-2">
      <li v-for="(item, i) in filtered" :key="item.id" class="panel">
        <div class="px-3.5 py-3 flex items-start gap-3">
          <div class="flex flex-col gap-0.5 shrink-0 pt-0.5">
            <button
              type="button"
              class="btn-ghost btn-sm btn-icon !h-6"
              :disabled="i === 0"
              aria-label="Lên trên"
              @click="move(item, -1)"
            >
              <span class="material-symbols-outlined text-base">arrow_upward</span>
            </button>
            <button
              type="button"
              class="btn-ghost btn-sm btn-icon !h-6"
              :disabled="i === filtered.length - 1"
              aria-label="Xuống dưới"
              @click="move(item, 1)"
            >
              <span class="material-symbols-outlined text-base">arrow_downward</span>
            </button>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="chip">{{ item.group }}</span>
              <StatusPill :status="item.status" />
              <span v-if="!item.answerEn" class="chip chip-warn">Thiếu EN</span>
              <span class="meta ml-auto">{{ ago(item.updatedAt) }}</span>
            </div>
            <p class="text-[0.875rem] font-bold text-ink mt-1.5">{{ item.questionVi }}</p>
            <p class="text-[0.8125rem] text-ink-2 mt-1">{{ item.answerVi }}</p>
            <details v-if="item.questionEn" class="mt-2">
              <summary class="text-xs font-bold text-ink-3 cursor-pointer hover:text-accent">
                Bản tiếng Anh
              </summary>
              <p class="text-[0.8125rem] font-semibold text-ink mt-1.5">{{ item.questionEn }}</p>
              <p class="text-[0.8125rem] text-ink-2 mt-0.5">{{ item.answerEn }}</p>
            </details>
          </div>

          <div class="flex flex-col gap-0.5 shrink-0">
            <button type="button" class="btn-ghost btn-sm btn-icon" aria-label="Sửa" @click="edit(item)">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              type="button"
              class="btn-ghost btn-sm btn-icon"
              :aria-label="item.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'"
              @click="toggleStatus(item)"
            >
              <span class="material-symbols-outlined text-lg">
                {{ item.status === 'published' ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="panel">
      <EmptyState icon="help_center" title="Không có câu hỏi nào khớp" hint="Đổi nhóm hoặc bỏ từ khoá tìm kiếm." />
    </div>

    <SlideOver
      v-model:open="panelOpen"
      eyebrow="FAQ"
      :title="form.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'"
      size="lg"
    >
      <div class="space-y-3.5">
        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Nhóm">
            <template #default="{ id }">
              <input :id="id" v-model="form.group" type="text" class="input" list="faq-groups" />
            </template>
          </FormRow>
          <FormRow label="Trạng thái">
            <template #default="{ id }">
              <select :id="id" v-model="form.status" class="select">
                <option value="published">Đang hiện</option>
                <option value="draft">Nháp</option>
              </select>
            </template>
          </FormRow>
        </div>
        <datalist id="faq-groups">
          <option v-for="g in groups" :key="g" :value="g" />
        </datalist>

        <div class="panel-quiet p-3 space-y-3">
          <p class="label-xs">Tiếng Việt</p>
          <FormRow label="Câu hỏi" required>
            <template #default="{ id }">
              <input :id="id" v-model="form.questionVi" type="text" class="input" data-autofocus />
            </template>
          </FormRow>
          <FormRow label="Trả lời" required hint="Trả lời thẳng, một đến ba câu.">
            <template #default="{ id }">
              <textarea :id="id" v-model="form.answerVi" rows="3" class="input" />
            </template>
          </FormRow>
        </div>

        <div class="panel-quiet p-3 space-y-3">
          <p class="label-xs">English</p>
          <FormRow label="Question">
            <template #default="{ id }">
              <input :id="id" v-model="form.questionEn" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Answer" hint="Bỏ trống thì trang /en sẽ không hiện câu này.">
            <template #default="{ id }">
              <textarea :id="id" v-model="form.answerEn" rows="3" class="input" />
            </template>
          </FormRow>
        </div>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">Xoá</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu câu hỏi</button>
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
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { ago } from '@/utils/format.js'

const notify = useNotify()

const {
  all, filtered, loading, query, filters, save, patch, remove,
} = useResource('faqs', {
  searchFields: ['questionVi', 'answerVi', 'questionEn', 'group'],
  filters: { group: '' },
  sort: { key: 'order', dir: 'asc' },
  pageSize: 100,
})

const groups = computed(() => [...new Set(all.value.map((f) => f.group))])
const countIn = (group) => all.value.filter((f) => f.group === group).length

const stats = computed(() => {
  const list = all.value
  return {
    published: list.filter((f) => f.status === 'published').length,
    draft: list.filter((f) => f.status === 'draft').length,
    missingEn: list.filter((f) => !f.answerEn).length,
  }
})

/** Reordering swaps the `order` values of the two neighbours — the same field
    the site sorts by, so what you see here is what the page renders. */
function move(item, step) {
  const list = filtered.value
  const index = list.findIndex((f) => f.id === item.id)
  const neighbour = list[index + step]
  if (!neighbour) return
  const a = item.order
  patch(item.id, { order: neighbour.order })
  patch(neighbour.id, { order: a })
}

function toggleStatus(item) {
  const status = item.status === 'published' ? 'draft' : 'published'
  patch(item.id, { status, updatedAt: new Date().toISOString() })
  notify.success(status === 'published' ? 'Câu hỏi đã hiện trên site.' : 'Đã ẩn câu hỏi.')
}

const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  return {
    id: null, group: groups.value[0] || 'Chung', questionVi: '', answerVi: '',
    questionEn: '', answerEn: '', status: 'draft',
    order: all.value.length + 1,
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function edit(item) {
  form.value = { ...item }
  panelOpen.value = true
}

function submit() {
  if (!form.value.questionVi.trim() || !form.value.answerVi.trim()) {
    notify.warn('Cần cả câu hỏi và câu trả lời tiếng Việt.')
    return
  }
  save({ ...form.value, updatedAt: new Date().toISOString() })
  panelOpen.value = false
  notify.success('Đã lưu câu hỏi.')
}

function destroy() {
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá câu hỏi.')
}
</script>
