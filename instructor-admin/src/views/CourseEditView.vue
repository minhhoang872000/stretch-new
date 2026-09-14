<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import FormField from '~/components/ui/FormField.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import LessonEditor from '~/components/course/LessonEditor.vue'
import SyllabusBuilder from '~/components/course/SyllabusBuilder.vue'
import type { IconName } from '~/components/ui/icons'
import { api } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { vnd } from '~/utils/format'
import type { Course, CourseModule, Instructor, Lesson, MediaAsset } from '~/types'

const route = useRoute()
const router = useRouter()
const { push } = useToast()

type Tab = 'info' | 'content' | 'video' | 'reading' | 'quiz' | 'faq'
type ListTab = 'video' | 'reading' | 'quiz'

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'info', label: 'Thông tin', icon: 'doc' },
  { key: 'content', label: 'Nội dung', icon: 'book' },
  { key: 'video', label: 'Video', icon: 'video' },
  { key: 'reading', label: 'Bài đọc', icon: 'doc' },
  { key: 'quiz', label: 'Kiểm tra', icon: 'quiz' },
  { key: 'faq', label: 'FAQ', icon: 'info' },
]

/**
 * The three content tabs are the same screen with a different filter — one list of
 * lessons, each mounting LessonEditor. Keeping them as separate hand-written tabs
 * is how a field ends up existing for video lessons and missing for readings.
 */
const LIST_TABS: Record<ListTab, { title: string; hint: string; icon: IconName; empty: string }> = {
  video: {
    title: 'Bài video',
    hint: 'Mỗi bài cần một nguồn: link YouTube, hoặc file đã upload lên bucket.',
    icon: 'video',
    empty: 'Chương trình chưa có bài dạng video',
  },
  reading: {
    title: 'Bài đọc',
    hint: 'Nội dung học viên sẽ đọc. Để một dòng trống giữa hai đoạn để tách đoạn.',
    icon: 'doc',
    empty: 'Chương trình chưa có bài đọc',
  },
  quiz: {
    title: 'Bài kiểm tra',
    hint: 'Nhập câu hỏi và đánh dấu đáp án đúng. Bài chưa có câu hỏi sẽ bị bỏ qua ở trang học.',
    icon: 'quiz',
    empty: 'Chương trình chưa có bài kiểm tra',
  },
}

const course = ref<Course | null>(null)
const instructors = ref<Instructor[]>([])
const media = ref<MediaAsset[]>([])
const tab = ref<Tab>('info')
const loading = ref(true)
const saving = ref(false)
const dirty = ref(false)

onMounted(async () => {
  const [found, list, assets] = await Promise.all([
    api.getCourse(String(route.params.id)),
    api.listInstructors(),
    api.listMedia(),
  ])
  course.value = found
  instructors.value = list
  media.value = assets
  loading.value = false
})

// Any edit arms the save button. Cheap and honest: the header always says whether
// there is unsaved work, rather than autosaving behind the instructor's back.
watch(course, () => {
  if (!loading.value) dirty.value = true
}, { deep: true })

const errors = computed(() => {
  const out: Record<string, string> = {}
  if (!course.value) return out
  if (!course.value.title.trim()) out.title = 'Tên chương trình không được để trống.'
  if (!/^[a-z0-9-]+$/.test(course.value.slug)) out.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'
  if (course.value.price < 0) out.price = 'Giá không thể âm.'
  return out
})

const lessons = computed(() =>
  (course.value?.modules ?? []).flatMap((module, mi) =>
    module.lessons.map((lesson, li) => ({ module, mi, lesson, li })),
  ),
)

const instructorRole = computed(
  () => instructors.value.find((i) => i.id === course.value?.instructorId)?.role,
)

const lessonsOfTab = computed(() =>
  lessons.value.filter((row) => row.lesson.type === (tab.value as ListTab)),
)

const assetFor = (lesson: Lesson) =>
  lesson.videoKey ? media.value.find((m) => m.key === lesson.videoKey) : undefined

function patch(patchValue: Partial<Course>) {
  if (course.value) course.value = { ...course.value, ...patchValue }
}

function patchLesson(mi: number, li: number, next: Partial<Lesson>) {
  if (!course.value) return
  course.value = {
    ...course.value,
    modules: course.value.modules.map((m, i) =>
      i === mi ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...next } : l)) } : m,
    ),
  }
}

function setModules(next: CourseModule[]) {
  patch({ modules: next })
}

// ── List editors (skills, outcomes, faq) ────────────────────────────────────
function setListItem(key: 'skills' | 'outcomes', index: number, value: string) {
  if (!course.value) return
  const next = [...course.value[key]]
  next[index] = value
  patch({ [key]: next } as Partial<Course>)
}

function addListItem(key: 'skills' | 'outcomes') {
  if (!course.value) return
  patch({ [key]: [...course.value[key], ''] } as Partial<Course>)
}

function removeListItem(key: 'skills' | 'outcomes', index: number) {
  if (!course.value) return
  patch({ [key]: course.value[key].filter((_, i) => i !== index) } as Partial<Course>)
}

function addFaq() {
  if (!course.value) return
  patch({ faq: [...course.value.faq, { id: `f-${Date.now()}`, q: '', a: '' }] })
}

// ── Save / publish ──────────────────────────────────────────────────────────
async function save(nextStatus?: Course['status']) {
  if (!course.value) return
  if (Object.keys(errors.value).length) {
    tab.value = 'info'
    push('Còn lỗi ở tab Thông tin — sửa trước khi lưu.', 'bad')
    return
  }
  saving.value = true
  const saved = await api.saveCourse({ ...course.value, status: nextStatus ?? course.value.status })
  course.value = saved
  saving.value = false
  dirty.value = false
  push(nextStatus === 'published' ? 'Đã xuất bản chương trình.' : 'Đã lưu thay đổi.', 'good')
}
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <div class="h-8 w-64 animate-pulse rounded bg-track" />
      <div class="h-40 animate-pulse rounded-xl bg-track" />
    </div>

    <EmptyState
      v-else-if="!course"
      icon="warning"
      title="Không tìm thấy chương trình"
      hint="Có thể nó đã bị xoá, hoặc đường dẫn sai."
    >
      <template #action>
        <AppButton @click="router.push('/courses')">Về danh sách</AppButton>
      </template>
    </EmptyState>

    <template v-else>
      <PageHeader :title="course.title || 'Chương trình chưa có tên'" :hint="`Slug: ${course.slug}`">
        <template #actions>
          <AppBadge :tone="course.status === 'published' ? 'good' : 'warn'">
            {{ course.status === 'published' ? 'Đã xuất bản' : course.status === 'draft' ? 'Nháp' : 'Lưu trữ' }}
          </AppBadge>
          <AppBadge v-if="dirty" tone="info" icon="pencil">Có thay đổi chưa lưu</AppBadge>
          <AppButton variant="secondary" :loading="saving" @click="save()">Lưu</AppButton>
          <AppButton
            v-if="course.status !== 'published'"
            variant="primary"
            icon="check"
            :loading="saving"
            @click="save('published')"
          >
            Xuất bản
          </AppButton>
        </template>
      </PageHeader>

      <!-- ══ Tabs ══ -->
      <div class="mb-4 flex gap-1 overflow-x-auto border-b border-line">
        <button
          v-for="item in TABS"
          :key="item.key"
          type="button"
          class="t-fast inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold whitespace-nowrap"
          :class="
            tab === item.key
              ? 'border-accent-dark text-navy'
              : 'border-transparent text-ink-muted hover:text-navy'
          "
          :aria-current="tab === item.key ? 'true' : undefined"
          @click="tab = item.key"
        >
          <AppIcon :name="item.icon" :size="14" />
          {{ item.label }}
        </button>
      </div>

      <!-- ══ Tab: info ══ -->
      <div v-if="tab === 'info'" class="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <AppCard title="Thông tin cơ bản">
          <div class="grid gap-4">
            <FormField label="Tên chương trình" :error="errors.title" required for="c-title">
              <AppInput id="c-title" :model-value="course.title" @update:model-value="patch({ title: $event })" />
            </FormField>

            <FormField label="Slug" :error="errors.slug" hint="Đường dẫn trên site: /learning-hub/programs/<slug>" for="c-slug">
              <AppInput id="c-slug" :model-value="course.slug" mono @update:model-value="patch({ slug: $event })" />
            </FormField>

            <FormField label="Mô tả ngắn" hint="Một câu, hiện dưới tiêu đề ở trang khóa học" for="c-sub">
              <AppInput id="c-sub" :model-value="course.subtitle" @update:model-value="patch({ subtitle: $event })" />
            </FormField>

            <FormField label="Mô tả đầy đủ" for="c-desc">
              <textarea
                id="c-desc"
                :value="course.description"
                rows="5"
                class="t-fast w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13.5px] leading-relaxed hover:border-line-strong focus:border-accent-dark focus:outline-none"
                @input="patch({ description: ($event.target as HTMLTextAreaElement).value })"
              />
            </FormField>

            <FormField label="Ảnh bìa" hint="Đường dẫn ảnh trong public/ của site" for="c-image">
              <AppInput id="c-image" :model-value="course.image" mono @update:model-value="patch({ image: $event })" />
            </FormField>
          </div>
        </AppCard>

        <div class="flex flex-col gap-4">
          <AppCard title="Phân loại & giá">
            <div class="grid gap-4 xl:grid-cols-2">
              <FormField label="Hình thức" for="c-kind">
                <AppSelect
                  id="c-kind"
                  :model-value="course.kind"
                  :options="[
                    { value: 'course', label: 'Khóa học' },
                    { value: 'mini', label: 'Khóa ngắn' },
                    { value: 'workshop', label: 'Workshop' },
                  ]"
                  @update:model-value="patch({ kind: $event as Course['kind'] })"
                />
              </FormField>

              <FormField label="Online / Offline" for="c-mode">
                <AppSelect
                  id="c-mode"
                  :model-value="course.mode"
                  :options="[
                    { value: 'online', label: 'Trực tuyến' },
                    { value: 'offline', label: 'Trực tiếp' },
                  ]"
                  @update:model-value="patch({ mode: $event as Course['mode'] })"
                />
              </FormField>

              <FormField label="Chủ đề" for="c-topic">
                <AppSelect
                  id="c-topic"
                  :model-value="course.topic"
                  :options="[
                    { value: 'anatomy', label: 'Giải phẫu' },
                    { value: 'assessment', label: 'Đánh giá' },
                    { value: 'sports', label: 'Thể thao' },
                    { value: 'functional', label: 'Chức năng' },
                  ]"
                  @update:model-value="patch({ topic: $event as Course['topic'] })"
                />
              </FormField>

              <FormField label="Giá (VNĐ)" :error="errors.price" :hint="vnd(course.price)" for="c-price">
                <AppInput
                  id="c-price"
                  :model-value="course.price"
                  type="number"
                  mono
                  @update:model-value="patch({ price: Number($event) || 0 })"
                />
              </FormField>

              <div class="xl:col-span-2">
                <FormField label="Cấp độ" for="c-level">
                  <AppInput id="c-level" :model-value="course.level" @update:model-value="patch({ level: $event })" />
                </FormField>
              </div>

              <div class="xl:col-span-2">
                <FormField label="Giảng viên" :hint="instructorRole" for="c-ins">
                  <AppSelect
                    id="c-ins"
                    :model-value="course.instructorId"
                    :options="instructors.map((i) => ({ value: i.id, label: i.name }))"
                    @update:model-value="patch({ instructorId: $event })"
                  />
                </FormField>
              </div>
            </div>
          </AppCard>

          <AppCard title="Kỹ năng nhận được" hint="Hiện dạng chip trên trang khóa học">
            <div class="flex flex-col gap-2">
              <div v-for="(skill, i) in course.skills" :key="`skill-${i}`" class="flex items-center gap-2">
                <AppInput :model-value="skill" @update:model-value="setListItem('skills', i, $event)" />
                <button
                  type="button"
                  class="t-fast grid size-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad sm:size-10"
                  @click="removeListItem('skills', i)"
                >
                  <AppIcon name="trash" :size="13" label="Xoá kỹ năng" />
                </button>
              </div>
              <AppButton size="sm" variant="ghost" icon="plus" @click="addListItem('skills')">Thêm kỹ năng</AppButton>
            </div>
          </AppCard>

          <AppCard title="Sau khóa học bạn sẽ">
            <div class="flex flex-col gap-2">
              <div v-for="(outcome, i) in course.outcomes" :key="`out-${i}`" class="flex items-center gap-2">
                <AppInput :model-value="outcome" @update:model-value="setListItem('outcomes', i, $event)" />
                <button
                  type="button"
                  class="t-fast grid size-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad sm:size-10"
                  @click="removeListItem('outcomes', i)"
                >
                  <AppIcon name="trash" :size="13" label="Xoá mục" />
                </button>
              </div>
              <AppButton size="sm" variant="ghost" icon="plus" @click="addListItem('outcomes')">Thêm mục</AppButton>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- ══ Tab: content ══ -->
      <AppCard
        v-else-if="tab === 'content'"
        title="Nội dung khóa học"
        :hint="`${course.modules.length} phần · ${lessons.length} bài · ${lessons.reduce((s, r) => s + r.lesson.minutes, 0)} phút`"
      >
        <SyllabusBuilder :modules="course.modules" :assets="media" @update:modules="setModules" />
      </AppCard>

      <!-- ══ Tabs: video / bài đọc / kiểm tra — cùng một editor, khác bộ lọc ══ -->
      <AppCard
        v-else-if="tab === 'video' || tab === 'reading' || tab === 'quiz'"
        :title="LIST_TABS[tab as ListTab].title"
        :hint="LIST_TABS[tab as ListTab].hint"
        :padded="false"
      >
        <div v-if="lessonsOfTab.length" class="divide-y divide-line">
          <div v-for="row in lessonsOfTab" :key="row.lesson.id" class="p-4">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <p class="min-w-0 flex-1 truncate text-[13px] font-semibold text-navy">
                <span class="figure mr-1 text-ink-muted">P{{ row.mi + 1 }}.{{ row.li + 1 }}</span>
                {{ row.lesson.title }}
              </p>
              <AppBadge v-if="row.lesson.free" tone="good">Học thử</AppBadge>
              <AppBadge v-if="row.lesson.youtube" tone="info" icon="link">YouTube</AppBadge>
              <AppBadge v-else-if="row.lesson.videoKey" tone="info" icon="upload">Bucket</AppBadge>
              <AppBadge v-if="row.lesson.type === 'quiz'" tone="neutral">
                {{ row.lesson.quiz?.length ?? 0 }} câu
              </AppBadge>
              <AppBadge v-if="row.lesson.type === 'reading'" tone="neutral">
                {{ (row.lesson.body ?? '').trim().length }} ký tự
              </AppBadge>
            </div>

            <LessonEditor
              :lesson="row.lesson"
              :asset="assetFor(row.lesson)"
              @update="patchLesson(row.mi, row.li, $event)"
            />
          </div>
        </div>

        <EmptyState
          v-else
          :icon="LIST_TABS[tab as ListTab].icon"
          :title="LIST_TABS[tab as ListTab].empty"
          hint="Ở tab Nội dung, thêm bài rồi đặt đúng loại — bài sẽ xuất hiện ở đây."
        />
      </AppCard>

      <!-- ══ Tab: faq ══ -->
      <AppCard v-else title="Câu hỏi thường gặp" hint="Hiện ở cuối trang khóa học, dạng accordion">
        <div class="flex flex-col gap-3">
          <div v-for="(item, i) in course.faq" :key="item.id" class="rounded-lg border border-line p-3">
            <div class="flex items-start gap-2">
              <div class="min-w-0 flex-1 space-y-2">
                <AppInput
                  :model-value="item.q"
                  placeholder="Câu hỏi"
                  @update:model-value="patch({ faq: course!.faq.map((f, j) => (j === i ? { ...f, q: $event } : f)) })"
                />
                <textarea
                  :value="item.a"
                  rows="2"
                  placeholder="Câu trả lời"
                  class="t-fast w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed hover:border-line-strong focus:border-accent-dark focus:outline-none"
                  @input="
                    patch({
                      faq: course!.faq.map((f, j) =>
                        j === i ? { ...f, a: ($event.target as HTMLTextAreaElement).value } : f,
                      ),
                    })
                  "
                />
              </div>
              <button
                type="button"
                class="t-fast grid size-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad sm:size-10"
                @click="patch({ faq: course!.faq.filter((_, j) => j !== i) })"
              >
                <AppIcon name="trash" :size="13" label="Xoá câu hỏi" />
              </button>
            </div>
          </div>

          <EmptyState v-if="!course.faq.length" icon="info" title="Chưa có câu hỏi nào" />
          <div><AppButton icon="plus" @click="addFaq">Thêm câu hỏi</AppButton></div>
        </div>
      </AppCard>
    </template>
  </div>
</template>
