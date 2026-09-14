<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import StatTile from '~/components/ui/StatTile.vue'
import { api } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { date } from '~/utils/format'
import type { Review, ReviewStatus } from '~/types'

/**
 * Review moderation.
 *
 * Two deliberate choices: nothing reaches the public course page until it is
 * approved, and a low rating is NOT treated as something to hide — a 2-star review
 * naming a broken audio track is the most useful message in the queue, so it gets
 * a "cần xử lý" flag rather than a hide button in a red corner.
 */
const { push } = useToast()

const reviews = ref<Review[]>([])
const loading = ref(true)
const filter = ref<ReviewStatus | 'all'>('pending')

onMounted(async () => {
  reviews.value = await api.listReviews()
  loading.value = false
})

const FILTERS: { value: ReviewStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'hidden', label: 'Đã ẩn' },
  { value: 'all', label: 'Tất cả' },
]

const counts = computed(() => ({
  pending: reviews.value.filter((r) => r.status === 'pending').length,
  approved: reviews.value.filter((r) => r.status === 'approved').length,
  hidden: reviews.value.filter((r) => r.status === 'hidden').length,
}))

const avgRating = computed(() => {
  const shown = reviews.value.filter((r) => r.status === 'approved')
  if (!shown.length) return '—'
  return (shown.reduce((sum, r) => sum + r.rating, 0) / shown.length).toFixed(1)
})

const rows = computed(() =>
  filter.value === 'all' ? reviews.value : reviews.value.filter((r) => r.status === filter.value),
)

async function setStatus(review: Review, status: ReviewStatus) {
  await api.setReviewStatus(review.id, status)
  reviews.value = await api.listReviews()
  push(
    status === 'approved' ? 'Đã duyệt — đánh giá hiện trên trang khóa học.' : 'Đã ẩn khỏi trang khóa học.',
    'good',
  )
}
</script>

<template>
  <div>
    <PageHeader
      title="Đánh giá"
      hint="Đánh giá chỉ hiện trên trang khóa học sau khi được duyệt. Điểm thấp thường là góp ý đáng đọc nhất, không phải thứ cần ẩn."
    />

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Chờ duyệt"
        :value="counts.pending"
        icon="clock"
        :delta="counts.pending ? { text: 'Học viên đang chờ được hiện', tone: 'bad' } : { text: 'Không còn tồn', tone: 'good' }"
      />
      <StatTile label="Đã duyệt" :value="counts.approved" icon="check" />
      <StatTile label="Đã ẩn" :value="counts.hidden" icon="eyeOff" />
      <StatTile label="Điểm trung bình" :value="avgRating" unit="/ 5" icon="star" hint="Chỉ tính đánh giá đã duyệt" />
    </div>

    <div class="mb-4 flex flex-wrap gap-1.5">
      <button
        v-for="item in FILTERS"
        :key="item.value"
        type="button"
        class="t-fast min-h-9 rounded-full border px-3 text-[12.5px] font-semibold"
        :class="
          filter === item.value
            ? 'border-navy bg-navy text-white'
            : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-navy'
        "
        :aria-pressed="filter === item.value"
        @click="filter = item.value"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-xl bg-track" />
    </div>

    <div v-else-if="rows.length" class="flex flex-col gap-3">
      <AppCard v-for="review in rows" :key="review.id">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex flex-wrap items-center gap-2">
              <span class="text-[13.5px] font-semibold text-navy">{{ review.learnerName }}</span>
              <span class="inline-flex items-center gap-0.5 text-[#b45309]" aria-hidden="true">
                <AppIcon
                  v-for="i in 5"
                  :key="i"
                  name="star"
                  :size="12"
                  :stroke-width="1.6"
                  :class="i <= review.rating ? 'fill-current' : 'opacity-30'"
                />
              </span>
              <span class="figure text-[11.5px] text-ink-muted">{{ review.rating }}/5 · {{ date(review.createdAt) }}</span>
            </p>
            <p class="mt-0.5 truncate text-[11.5px] text-ink-muted">{{ review.courseTitle }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <AppBadge
              :tone="review.status === 'approved' ? 'good' : review.status === 'pending' ? 'warn' : 'neutral'"
            >
              {{ review.status === 'approved' ? 'Đã duyệt' : review.status === 'pending' ? 'Chờ duyệt' : 'Đã ẩn' }}
            </AppBadge>
            <AppBadge v-if="review.rating <= 3" tone="bad" icon="warning">Cần xử lý nội dung</AppBadge>
          </div>
        </div>

        <p class="mt-2 text-[13px] leading-relaxed text-ink-soft">{{ review.text }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <AppButton
            v-if="review.status !== 'approved'"
            size="sm"
            variant="primary"
            icon="check"
            @click="setStatus(review, 'approved')"
          >
            Duyệt
          </AppButton>
          <AppButton
            v-if="review.status !== 'hidden'"
            size="sm"
            variant="ghost"
            icon="eyeOff"
            @click="setStatus(review, 'hidden')"
          >
            Ẩn
          </AppButton>
          <AppButton :to="`/courses/${review.courseId}`" size="sm" variant="ghost" icon-right="chevronRight">Mở chương trình</AppButton>
        </div>
      </AppCard>
    </div>

    <AppCard v-else :padded="false">
      <EmptyState
        icon="star"
        :title="filter === 'pending' ? 'Không còn đánh giá nào chờ duyệt' : 'Không có đánh giá nào ở nhóm này'"
        hint="Đánh giá mới của học viên sẽ xuất hiện ở đây trước khi hiện lên site."
      />
    </AppCard>
  </div>
</template>
