<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Đánh giá"
      subtitle="Đánh giá chỉ hiện trên trang chương trình sau khi được duyệt. Đánh giá 3 sao trở xuống nên trả lời trước khi duyệt."
    />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Chờ duyệt" :value="stats.pending" icon="pending_actions" :tone="stats.pending ? 'warn' : 'neutral'" />
      <StatTile label="Đã duyệt" :value="stats.approved" icon="check_circle" tone="ok" />
      <StatTile label="Điểm trung bình" :value="stats.avg" icon="grade" tone="accent" hint="Trên các đánh giá đã duyệt" />
      <StatTile label="Từ 3 sao trở xuống" :value="stats.low" icon="thumb_down" :tone="stats.low ? 'danger' : 'neutral'" />
    </div>

    <div class="panel px-3 py-2.5 mb-3 flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-1.5">
        <button
          v-for="tabItem in tabs"
          :key="tabItem.value"
          type="button"
          class="btn-sm"
          :class="filters.status === tabItem.value ? 'btn-secondary' : 'btn-ghost'"
          @click="filters.status = tabItem.value"
        >
          {{ tabItem.label }}
          <span v-if="tabItem.count" class="num ml-1 text-ink-3">{{ tabItem.count }}</span>
        </button>
      </div>
      <select v-model="filters.rating" class="select w-32 ml-auto" aria-label="Lọc theo số sao">
        <option value="">Mọi mức sao</option>
        <option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="String(n)">{{ n }} sao</option>
      </select>
      <label class="relative w-56">
        <span class="sr-only">Tìm trong đánh giá</span>
        <span class="material-symbols-outlined text-base text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
        <input v-model="query" type="search" class="input pl-8" placeholder="Tìm nội dung, học viên…" />
      </label>
    </div>

    <div v-if="loading" class="space-y-2.5">
      <div v-for="n in 4" :key="n" class="panel p-3.5">
        <div class="skeleton h-3.5 w-40 mb-2" />
        <div class="skeleton h-3 w-full mb-1.5" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </div>

    <ul v-else-if="rows.length" class="space-y-2.5 stagger">
      <li
        v-for="(review, i) in rows"
        :key="review.id"
        class="panel p-3.5"
        :style="{ '--i': i }"
      >
        <div class="flex flex-wrap items-start gap-3">
          <span
            class="w-8 h-8 rounded-full bg-panel-3 text-2xs font-bold text-ink-2 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >{{ initials(review.learnerName) }}</span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <RouterLink :to="`/academy/learners/${review.learnerId}`" class="text-[0.8125rem] font-bold text-ink hover:text-accent">
                {{ review.learnerName }}
              </RouterLink>
              <span class="flex items-center gap-0.5" :aria-label="`${review.rating} trên 5 sao`">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="material-symbols-outlined text-sm"
                  :class="n <= review.rating ? 'ms-fill text-warn' : 'text-ink-4'"
                  aria-hidden="true"
                >star</span>
                <span class="num text-2xs font-bold text-ink-2 ml-0.5">{{ review.rating }}/5</span>
              </span>
              <StatusPill :status="review.status" :label="review.status === 'pending' ? 'Chờ duyệt' : ''" />
              <span class="meta ml-auto">{{ ago(review.createdAt) }}</span>
            </div>

            <RouterLink
              :to="`/academy/programs/${review.programId}`"
              class="meta hover:text-accent block mt-0.5 truncate"
            >{{ review.programTitle }}</RouterLink>

            <p class="text-[0.8125rem] text-ink mt-1.5">{{ review.text }}</p>

            <!-- Reply thread: the answer sits with the review, not in a modal -->
            <div v-if="review.reply" class="mt-2 pl-3 border-l-2 border-accent-line">
              <p class="label-xs">Stretch trả lời</p>
              <p class="text-[0.8125rem] text-ink-2 mt-0.5">{{ review.reply }}</p>
            </div>

            <div v-if="replyingTo === review.id" class="mt-2.5">
              <textarea
                v-model="replyText"
                rows="2"
                class="input"
                placeholder="Trả lời ngắn, cụ thể, không hứa điều không làm được."
              />
              <div class="flex items-center gap-2 mt-2">
                <button type="button" class="btn-primary btn-sm" @click="saveReply(review)">Gửi trả lời</button>
                <button type="button" class="btn-ghost btn-sm" @click="replyingTo = null">Huỷ</button>
              </div>
            </div>

            <div v-else class="flex flex-wrap items-center gap-1.5 mt-2.5">
              <button
                v-if="review.status !== 'approved'"
                type="button"
                class="btn-secondary btn-sm"
                @click="setStatus(review, 'approved')"
              >
                <span class="material-symbols-outlined text-base">check</span>
                Duyệt
              </button>
              <button
                v-if="review.status !== 'hidden'"
                type="button"
                class="btn-ghost btn-sm"
                @click="setStatus(review, 'hidden')"
              >
                <span class="material-symbols-outlined text-base">visibility_off</span>
                Ẩn
              </button>
              <button type="button" class="btn-ghost btn-sm" @click="startReply(review)">
                <span class="material-symbols-outlined text-base">reply</span>
                {{ review.reply ? 'Sửa trả lời' : 'Trả lời' }}
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="panel">
      <EmptyState
        icon="reviews"
        title="Không có đánh giá nào khớp"
        hint="Đổi bộ lọc phía trên, hoặc chờ học viên gửi đánh giá mới."
      />
    </div>

    <div v-if="pageCount > 1" class="flex items-center justify-center gap-2 mt-3">
      <button type="button" class="btn-outline btn-sm" :disabled="page <= 1" @click="page -= 1">Trước</button>
      <span class="meta">Trang {{ page }}/{{ pageCount }}</span>
      <button type="button" class="btn-outline btn-sm" :disabled="page >= pageCount" @click="page += 1">Sau</button>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { ago, initials } from '@/utils/format.js'

/**
 * Reviews are read as prose, not as table rows — so this screen is a card
 * list. The moderation actions stay inline with each review, which is the
 * difference between clearing a queue and hunting for buttons.
 */
const route = useRoute()
const notify = useNotify()

const {
  all, rows, loading, query, filters, page, pageCount, patch,
} = useResource('reviews', {
  searchFields: ['learnerName', 'programTitle', 'text'],
  filters: { status: route.query.status || 'pending', rating: '' },
  sort: { key: 'createdAt', dir: 'desc' },
  pageSize: 10,
})

const stats = computed(() => {
  const list = all.value
  const approved = list.filter((r) => r.status === 'approved')
  return {
    pending: list.filter((r) => r.status === 'pending').length,
    approved: approved.length,
    avg: approved.length
      ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1).replace('.', ',')
      : '—',
    low: list.filter((r) => r.rating <= 3).length,
  }
})

const tabs = computed(() => [
  { value: '', label: 'Tất cả', count: all.value.length },
  { value: 'pending', label: 'Chờ duyệt', count: stats.value.pending },
  { value: 'approved', label: 'Đã duyệt', count: stats.value.approved },
  { value: 'hidden', label: 'Đang ẩn', count: all.value.filter((r) => r.status === 'hidden').length },
])

function setStatus(review, status) {
  patch(review.id, { status })
  notify.success(status === 'approved' ? 'Đã duyệt, đánh giá sẽ hiện trên site.' : 'Đã ẩn đánh giá.')
}

const replyingTo = ref(null)
const replyText = ref('')

function startReply(review) {
  replyingTo.value = review.id
  replyText.value = review.reply || ''
}

function saveReply(review) {
  patch(review.id, { reply: replyText.value.trim() })
  replyingTo.value = null
  notify.success('Đã lưu câu trả lời.')
}
</script>
