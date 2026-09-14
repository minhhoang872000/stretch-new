<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import DataTable from '~/components/ui/DataTable.vue'
import FormField from '~/components/ui/FormField.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import StatTile from '~/components/ui/StatTile.vue'
import type { Column } from '~/components/ui/tableTypes'
import { api } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { date, fold } from '~/utils/format'
import type { Course, Learner } from '~/types'

/**
 * The learner list, and the one action that keeps the business running while
 * there is no checkout: granting a course by hand after a bank transfer.
 */
const { push } = useToast()

type Row = Learner & { courses: number; avgPercent: number }

const learners = ref<Row[]>([])
const courses = ref<Course[]>([])
const loading = ref(true)
const query = ref('')

const granting = ref<Row | null>(null)
const grantCourseId = ref('')
const grantPending = ref(false)

onMounted(async () => {
  const [list, courseList] = await Promise.all([api.listLearners(), api.listCourses()])
  learners.value = list
  courses.value = courseList
  grantCourseId.value = courseList[0]?.id ?? ''
  loading.value = false
})

const rows = computed(() => {
  const term = fold(query.value.trim())
  if (!term) return learners.value
  return learners.value.filter((l) => fold(l.name).includes(term) || fold(l.email).includes(term))
})

const columns: Column[] = [
  { key: 'name', label: 'Học viên', sortable: true },
  { key: 'courses', label: 'Khóa', numeric: true, sortable: true, width: 'w-16' },
  { key: 'avgPercent', label: 'Tiến độ TB', width: 'w-40', hideOnMobile: true },
  { key: 'lastActiveAt', label: 'Học lần cuối', sortable: true, width: 'w-32', hideOnMobile: true },
  { key: 'note', label: 'Ghi chú', hideOnMobile: true },
  { key: 'actions', label: '', width: 'w-32' },
]

const activeCount = computed(() => learners.value.filter((l) => l.avgPercent > 0 && l.avgPercent < 100).length)
const doneCount = computed(() => learners.value.filter((l) => l.avgPercent === 100).length)
const idleCount = computed(() => learners.value.filter((l) => l.avgPercent === 0).length)

async function grant() {
  if (!granting.value || !grantCourseId.value) return
  grantPending.value = true
  await api.grantAccess(granting.value.id, grantCourseId.value)
  learners.value = await api.listLearners()
  grantPending.value = false
  const title = courses.value.find((c) => c.id === grantCourseId.value)?.title ?? ''
  push(`Đã cấp quyền “${title}” cho ${granting.value.name}.`, 'good')
  granting.value = null
}
</script>

<template>
  <div>
    <PageHeader
      title="Học viên"
      hint="Cấp quyền tay là cách xử lý khi khách chuyển khoản — chưa có cổng thanh toán tự động."
    />

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Tổng học viên" :value="learners.length" icon="users" />
      <StatTile label="Đang học" :value="activeCount" icon="clock" hint="Tiến độ giữa 1–99%" />
      <StatTile label="Đã hoàn thành" :value="doneCount" icon="check" />
      <StatTile
        label="Chưa bắt đầu"
        :value="idleCount"
        icon="warning"
        :delta="idleCount ? { text: 'Đáng nhắc học viên vào học', tone: 'bad' } : { text: 'Ai cũng đã bắt đầu', tone: 'good' }"
      />
    </div>

    <div class="mb-3">
      <label class="relative block max-w-xs">
        <AppIcon name="search" :size="15" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-muted" />
        <AppInput v-model="query" placeholder="Tìm theo tên hoặc email…" class="pl-8" />
      </label>
    </div>

    <AppCard :padded="false">
      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :page-size="10"
        empty-title="Không tìm thấy học viên"
        empty-hint="Thử từ khoá khác, hoặc bỏ trống ô tìm kiếm."
      >
        <template #cell-name="{ row }">
          <RouterLink :to="`/learners/${row.id}`" class="t-fast group flex items-center gap-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-track text-[11px] font-bold text-navy-light">
              {{ String(row.name).split(' ').map((p) => p[0]).slice(-2).join('') }}
            </span>
            <span class="min-w-0">
              <span class="block truncate text-[13.5px] font-semibold text-navy group-hover:text-accent-text">
                {{ row.name }}
              </span>
              <span class="figure block truncate text-[11px] text-ink-muted">{{ row.email }}</span>
            </span>
          </RouterLink>
        </template>

        <template #cell-avgPercent="{ row }">
          <ProgressMeter
            v-if="(row.courses as number) > 0"
            :value="row.avgPercent as number"
            size="sm"
            :label="`Tiến độ của ${row.name}`"
          />
          <span v-else class="text-[11.5px] text-ink-muted">Chưa có khóa</span>
        </template>

        <template #cell-lastActiveAt="{ row }">
          <span class="figure text-[12px] text-ink-soft">{{ date(row.lastActiveAt as string) }}</span>
        </template>

        <template #cell-note="{ row }">
          <span v-if="row.note" class="line-clamp-1 text-[11.5px] text-ink-muted">{{ row.note }}</span>
          <AppBadge v-else-if="row.google" tone="neutral">Google</AppBadge>
        </template>

        <template #cell-actions="{ row }">
          <AppButton size="sm" variant="secondary" icon="plus" @click="granting = row as unknown as Row">
            Cấp quyền
          </AppButton>
        </template>
      </DataTable>
    </AppCard>

    <!-- ══ Grant access ══ -->
    <AppModal :open="!!granting" title="Cấp quyền học" @close="granting = null">
      <div v-if="granting">
        <div class="mb-4 rounded-lg bg-shell px-3 py-2">
          <p class="text-[13px] font-semibold text-navy">{{ granting.name }}</p>
          <p class="figure text-[11.5px] text-ink-muted">{{ granting.email }}</p>
        </div>

        <FormField
          label="Chương trình"
          hint="Học viên sẽ vào học được ngay, không cần thanh toán trên hệ thống."
          for="grant-course"
        >
          <AppSelect
            id="grant-course"
            v-model="grantCourseId"
            :options="courses.map((c) => ({ value: c.id, label: c.title }))"
          />
        </FormField>

        <p class="mt-3 flex items-start gap-1.5 rounded-lg bg-info-bg px-2.5 py-2 text-[11.5px] leading-relaxed text-navy-light">
          <AppIcon name="info" :size="13" class="mt-px" />
          Quyền được ghi nhận là “cấp tay”, nên báo cáo doanh thu sau này phân biệt được với đơn qua cổng thanh toán.
        </p>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="granting = null">Huỷ</AppButton>
        <AppButton variant="primary" :loading="grantPending" @click="grant">Cấp quyền</AppButton>
      </template>
    </AppModal>
  </div>
</template>
