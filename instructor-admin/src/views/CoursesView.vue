<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import DataTable from '~/components/ui/DataTable.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import type { Column } from '~/components/ui/tableTypes'
import { api } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { fold, vnd, date } from '~/utils/format'
import type { Course, CourseStatus } from '~/types'

const router = useRouter()
const { push } = useToast()

const courses = ref<Course[]>([])
const loading = ref(true)
const query = ref('')
const status = ref<CourseStatus | 'all'>('all')
const creating = ref(false)

onMounted(async () => {
  courses.value = await api.listCourses()
  loading.value = false
})

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
}

const KIND_LABEL: Record<string, string> = {
  course: 'Khóa học',
  mini: 'Khóa ngắn',
  workshop: 'Workshop',
}

const rows = computed(() => {
  const term = fold(query.value.trim())
  return courses.value
    .filter((c) => (status.value === 'all' ? true : c.status === status.value))
    .filter((c) => (term ? fold(c.title).includes(term) || fold(c.slug).includes(term) : true))
    .map((c) => ({
      ...c,
      lessonCount: c.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    }))
})

const columns: Column[] = [
  { key: 'title', label: 'Chương trình', sortable: true },
  { key: 'status', label: 'Trạng thái', width: 'w-32' },
  { key: 'lessonCount', label: 'Bài', numeric: true, sortable: true, width: 'w-16', hideOnMobile: true },
  { key: 'price', label: 'Giá', numeric: true, sortable: true, width: 'w-32', hideOnMobile: true },
  { key: 'learnerCount', label: 'Học viên', numeric: true, sortable: true, width: 'w-24' },
  { key: 'avgProgress', label: 'Tiến độ TB', width: 'w-40', hideOnMobile: true },
  { key: 'updatedAt', label: 'Cập nhật', sortable: true, width: 'w-28', hideOnMobile: true },
]

async function createCourse() {
  creating.value = true
  const draft = await api.createCourse()
  creating.value = false
  push('Đã tạo bản nháp. Điền thông tin rồi xuất bản.', 'good')
  router.push(`/courses/${draft.id}`)
}
</script>

<template>
  <div>
    <PageHeader
      title="Chương trình"
      hint="Sửa nội dung khóa học ở đây thay vì sửa file code. Bản nháp không hiện trên trang công khai."
    >
      <template #actions>
        <AppButton variant="primary" icon="plus" :loading="creating" @click="createCourse">
          Tạo chương trình
        </AppButton>
      </template>
    </PageHeader>

    <!-- Filters in one row above the table — never buried in a menu. -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <label class="relative min-w-0 flex-1 sm:max-w-xs">
        <AppIcon name="search" :size="15" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-muted" />
        <AppInput v-model="query" placeholder="Tìm theo tên hoặc slug…" class="pl-8" />
      </label>

      <AppSelect
        v-model="status"
        class="w-40"
        :options="[
          { value: 'all', label: 'Mọi trạng thái' },
          { value: 'published', label: 'Đã xuất bản' },
          { value: 'draft', label: 'Nháp' },
          { value: 'archived', label: 'Lưu trữ' },
        ]"
      />
    </div>

    <AppCard :padded="false">
      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :page-size="10"
        empty-title="Không có chương trình nào khớp"
        empty-hint="Thử bỏ bộ lọc, hoặc tạo một chương trình mới."
      >
        <template #cell-title="{ row }">
          <RouterLink :to="`/courses/${row.id}`" class="t-fast group block min-w-0">
            <p class="truncate text-[13.5px] font-semibold text-navy group-hover:text-accent-text">
              {{ row.title }}
            </p>
            <p class="figure mt-0.5 truncate text-[11px] text-ink-muted">
              {{ KIND_LABEL[row.kind as string] }} · {{ row.slug }}
            </p>
          </RouterLink>
        </template>

        <template #cell-status="{ row }">
          <AppBadge
            :tone="row.status === 'published' ? 'good' : row.status === 'draft' ? 'warn' : 'neutral'"
            :icon="row.status === 'published' ? 'check' : row.status === 'draft' ? 'pencil' : undefined"
          >
            {{ STATUS_LABEL[row.status as CourseStatus] }}
          </AppBadge>
        </template>

        <template #cell-price="{ row }">{{ vnd(row.price as number) }}</template>

        <template #cell-avgProgress="{ row }">
          <ProgressMeter
            v-if="(row.learnerCount as number) > 0"
            :value="row.avgProgress as number"
            size="sm"
            :label="`Tiến độ trung bình ${row.title}`"
          />
          <span v-else class="text-[11.5px] text-ink-muted">—</span>
        </template>

        <template #cell-updatedAt="{ row }">
          <span class="text-[12px] text-ink-soft">{{ date(row.updatedAt as string) }}</span>
        </template>

        <template #empty>
          <AppButton icon="plus" size="sm" @click="createCourse">Tạo chương trình</AppButton>
        </template>
      </DataTable>
    </AppCard>
  </div>
</template>
