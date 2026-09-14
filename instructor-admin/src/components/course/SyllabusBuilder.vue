<script setup lang="ts">
import { ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LessonEditor from './LessonEditor.vue'
import type { MediaAsset } from '~/types'
import type { CourseModule, Lesson, LessonType } from '~/types'

/**
 * The syllabus builder: parts, lessons, order.
 *
 * Drag to reorder is here, but it is NEVER the only way to reorder: every row
 * also has up/down buttons. WCAG 2.2 requires a single-pointer alternative to any
 * dragging movement, and on a touch screen dragging a row inside a scrolling page
 * is miserable anyway.
 */
const props = defineProps<{ modules: CourseModule[]; assets?: MediaAsset[] }>()
const emit = defineEmits<{ 'update:modules': [CourseModule[]] }>()

const openModules = ref<string[]>(props.modules.map((m) => m.id))

/**
 * Which lessons have their content panel open. Editing content inline keeps the
 * syllabus visible while typing — the alternative (a modal per lesson) means
 * closing and reopening for every one of forty lessons.
 */
const openLessons = ref<string[]>([])
const isLessonOpen = (id: string) => openLessons.value.includes(id)
const toggleLesson = (id: string) => {
  openLessons.value = isLessonOpen(id) ? openLessons.value.filter((v) => v !== id) : [...openLessons.value, id]
}

const assetFor = (lesson: Lesson) =>
  lesson.videoKey ? props.assets?.find((a) => a.key === lesson.videoKey) : undefined

/** What the lesson still needs before it can be published. */
function missing(lesson: Lesson): string | null {
  if (lesson.type === 'video' && !lesson.youtube && !lesson.videoKey) return 'Chưa có video'
  if (lesson.type === 'reading' && !(lesson.body ?? '').trim()) return 'Chưa có nội dung'
  if (lesson.type === 'quiz' && !lesson.quiz?.length) return 'Chưa có câu hỏi'
  return null
}
const dragging = ref<{ moduleIndex: number; lessonIndex: number } | null>(null)

const TYPE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'reading', label: 'Bài đọc' },
  { value: 'quiz', label: 'Kiểm tra' },
]

const TYPE_ICON: Record<LessonType, 'video' | 'doc' | 'quiz'> = {
  video: 'video',
  reading: 'doc',
  quiz: 'quiz',
}

const isOpen = (id: string) => openModules.value.includes(id)
const toggle = (id: string) => {
  openModules.value = isOpen(id) ? openModules.value.filter((v) => v !== id) : [...openModules.value, id]
}

/** Every mutation replaces the array — the parent owns the state, this only edits. */
function commit(next: CourseModule[]) {
  emit('update:modules', next)
}

function addModule() {
  const id = `m-${Date.now()}`
  openModules.value = [...openModules.value, id]
  commit([...props.modules, { id, title: 'Phần mới', summary: '', lessons: [] }])
}

function removeModule(index: number) {
  commit(props.modules.filter((_, i) => i !== index))
}

function moveModule(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= props.modules.length) return
  const next = [...props.modules]
  ;[next[index], next[target]] = [next[target], next[index]]
  commit(next)
}

function patchModule(index: number, patch: Partial<CourseModule>) {
  commit(props.modules.map((m, i) => (i === index ? { ...m, ...patch } : m)))
}

function addLesson(moduleIndex: number) {
  const lesson: Lesson = {
    id: `l-${Date.now()}`,
    type: 'video',
    title: 'Bài học mới',
    minutes: 10,
    free: false,
  }
  commit(
    props.modules.map((m, i) => (i === moduleIndex ? { ...m, lessons: [...m.lessons, lesson] } : m)),
  )
}

function patchLesson(moduleIndex: number, lessonIndex: number, patch: Partial<Lesson>) {
  commit(
    props.modules.map((m, i) =>
      i === moduleIndex
        ? { ...m, lessons: m.lessons.map((l, j) => (j === lessonIndex ? { ...l, ...patch } : l)) }
        : m,
    ),
  )
}

function removeLesson(moduleIndex: number, lessonIndex: number) {
  commit(
    props.modules.map((m, i) =>
      i === moduleIndex ? { ...m, lessons: m.lessons.filter((_, j) => j !== lessonIndex) } : m,
    ),
  )
}

/** Moves within a part, and across the boundary into the next/previous part. */
function moveLesson(moduleIndex: number, lessonIndex: number, delta: number) {
  const next = props.modules.map((m) => ({ ...m, lessons: [...m.lessons] }))
  const from = next[moduleIndex]
  const target = lessonIndex + delta

  if (target >= 0 && target < from.lessons.length) {
    ;[from.lessons[lessonIndex], from.lessons[target]] = [from.lessons[target], from.lessons[lessonIndex]]
    commit(next)
    return
  }

  const neighbourIndex = moduleIndex + delta
  const neighbour = next[neighbourIndex]
  if (!neighbour) return
  const [lesson] = from.lessons.splice(lessonIndex, 1)
  if (delta > 0) neighbour.lessons.unshift(lesson)
  else neighbour.lessons.push(lesson)
  commit(next)
}

function onDrop(moduleIndex: number, lessonIndex: number) {
  const source = dragging.value
  dragging.value = null
  if (!source) return
  if (source.moduleIndex === moduleIndex && source.lessonIndex === lessonIndex) return

  const next = props.modules.map((m) => ({ ...m, lessons: [...m.lessons] }))
  const [lesson] = next[source.moduleIndex].lessons.splice(source.lessonIndex, 1)
  next[moduleIndex].lessons.splice(lessonIndex, 0, lesson)
  commit(next)
}

const moduleMinutes = (module: CourseModule) => module.lessons.reduce((sum, l) => sum + l.minutes, 0)
</script>

<template>
  <div>
    <div v-if="props.modules.length" class="flex flex-col gap-2.5">
      <div
        v-for="(module, mi) in props.modules"
        :key="module.id"
        class="overflow-hidden rounded-xl border border-line"
      >
        <!-- ── Part header ── -->
        <div class="flex items-start gap-2 bg-shell px-3 py-2.5">
          <button
            type="button"
            class="t-fast mt-1.5 grid size-6 place-items-center rounded text-ink-muted hover:text-navy"
            :aria-expanded="isOpen(module.id)"
            @click="toggle(module.id)"
          >
            <AppIcon
              name="chevronRight"
              :size="14"
              :stroke-width="2.4"
              :class="isOpen(module.id) ? 'rotate-90' : ''"
              :label="isOpen(module.id) ? 'Thu gọn phần' : 'Mở phần'"
            />
          </button>

          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="figure text-[10px] font-bold tracking-wide text-accent-text uppercase">
                Phần {{ mi + 1 }}
              </span>
              <AppBadge>{{ module.lessons.length }} bài · {{ moduleMinutes(module) }} phút</AppBadge>
            </div>
            <AppInput
              :model-value="module.title"
              placeholder="Tên phần"
              @update:model-value="patchModule(mi, { title: $event })"
            />
            <AppInput
              :model-value="module.summary"
              placeholder="Mô tả ngắn — hiện dưới tên phần trên trang khóa học"
              @update:model-value="patchModule(mi, { summary: $event })"
            />
          </div>

          <div class="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              class="t-fast grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-soft hover:text-navy disabled:opacity-35"
              :disabled="mi === 0"
              @click="moveModule(mi, -1)"
            >
              <AppIcon name="chevronDown" :size="13" class="rotate-180" label="Chuyển phần lên" />
            </button>
            <button
              type="button"
              class="t-fast grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-soft hover:text-navy disabled:opacity-35"
              :disabled="mi === props.modules.length - 1"
              @click="moveModule(mi, 1)"
            >
              <AppIcon name="chevronDown" :size="13" label="Chuyển phần xuống" />
            </button>
            <button
              type="button"
              class="t-fast grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-soft hover:border-bad hover:text-bad"
              @click="removeModule(mi)"
            >
              <AppIcon name="trash" :size="13" label="Xoá phần" />
            </button>
          </div>
        </div>

        <!-- ── Lessons ── -->
        <ul v-show="isOpen(module.id)" class="divide-y divide-line bg-surface">
          <li
            v-for="(lesson, li) in module.lessons"
            :key="lesson.id"
            class="t-fast p-3 hover:bg-shell"
            draggable="true"
            @dragstart="dragging = { moduleIndex: mi, lessonIndex: li }"
            @dragover.prevent
            @drop.prevent="onDrop(mi, li)"
          >
            <!--
              A grid, not a flex-wrap row. Six controls wrapping freely produced a
              different layout at every viewport width; this keeps the title on its
              own line under `lg` and puts everything on one line above it.
            -->
            <div class="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 lg:grid-cols-[auto_auto_minmax(0,1fr)_7rem_5.5rem_auto_auto]">
              <span class="cursor-grab text-ink-muted" title="Kéo để đổi thứ tự">
                <AppIcon name="drag" :size="14" />
              </span>

              <span
                class="grid size-7 shrink-0 place-items-center rounded-md"
                :class="
                  lesson.type === 'video'
                    ? 'bg-info-bg text-navy-light'
                    : lesson.type === 'quiz'
                      ? 'bg-good-bg text-good'
                      : 'bg-warn-bg text-warn'
                "
              >
                <AppIcon :name="TYPE_ICON[lesson.type]" :size="13" />
              </span>

              <AppInput
                :model-value="lesson.title"
                placeholder="Tên bài học"
                @update:model-value="patchLesson(mi, li, { title: $event })"
              />

              <!-- Below lg these three drop onto a second row, still aligned. -->
              <div class="col-span-3 flex items-center gap-2 lg:col-span-1 lg:contents">
                <AppSelect
                  :model-value="lesson.type"
                  class="w-28 lg:w-full"
                  :options="TYPE_OPTIONS"
                  @update:model-value="patchLesson(mi, li, { type: $event as LessonType })"
                />

                <div class="w-20 lg:w-full">
                  <AppInput
                    :model-value="lesson.minutes"
                    type="number"
                    mono
                    @update:model-value="patchLesson(mi, li, { minutes: Number($event) || 0 })"
                  />
                </div>

                <label
                  class="t-fast inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-semibold whitespace-nowrap"
                  :class="lesson.free ? 'border-good bg-good-bg text-good' : 'border-line text-ink-soft hover:border-line-strong'"
                >
                  <input
                    type="checkbox"
                    class="size-3.5 accent-[var(--color-good)]"
                    :checked="lesson.free"
                    @change="patchLesson(mi, li, { free: ($event.target as HTMLInputElement).checked })"
                  />
                  Học thử
                </label>
              </div>

              <div class="col-span-3 flex shrink-0 items-center justify-end gap-1 lg:col-span-1">
              <!-- The way into a lesson's actual content. It carries a "còn thiếu"
                   flag so an unfinished lesson is visible without opening it. -->
              <button
                type="button"
                class="t-fast mr-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2 text-[11.5px] font-semibold whitespace-nowrap"
                :class="
                  isLessonOpen(lesson.id)
                    ? 'border-navy bg-navy text-white'
                    : missing(lesson)
                      ? 'border-warn/40 bg-warn-bg text-warn'
                      : 'border-line text-ink-soft hover:border-line-strong hover:text-navy'
                "
                :aria-expanded="isLessonOpen(lesson.id)"
                @click="toggleLesson(lesson.id)"
              >
                <AppIcon :name="missing(lesson) ? 'warning' : 'pencil'" :size="12" :stroke-width="2.2" />
                {{ missing(lesson) ?? 'Nội dung' }}
              </button>

              <button
                type="button"
                class="t-fast grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-track hover:text-navy"
                @click="moveLesson(mi, li, -1)"
              >
                <AppIcon name="chevronDown" :size="13" class="rotate-180" label="Chuyển bài lên" />
              </button>
              <button
                type="button"
                class="t-fast grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-track hover:text-navy"
                @click="moveLesson(mi, li, 1)"
              >
                <AppIcon name="chevronDown" :size="13" label="Chuyển bài xuống" />
              </button>
              <button
                type="button"
                class="t-fast grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad"
                @click="removeLesson(mi, li)"
              >
                <AppIcon name="trash" :size="13" label="Xoá bài" />
              </button>
              </div>
            </div>

            <!-- ── Content panel: video source, reading text, or quiz questions ── -->
            <div v-if="isLessonOpen(lesson.id)" class="mt-3 rounded-lg border border-line bg-shell p-3.5">
              <LessonEditor
                :lesson="lesson"
                :asset="assetFor(lesson)"
                @update="patchLesson(mi, li, $event)"
              />
            </div>
          </li>

          <li class="px-3 py-2.5">
            <AppButton size="sm" variant="ghost" icon="plus" @click="addLesson(mi)">Thêm bài học</AppButton>
          </li>
        </ul>
      </div>
    </div>

    <EmptyState
      v-else
      icon="book"
      title="Chương trình chưa có phần nào"
      hint="Một phần là một nhóm bài học — ví dụ “Nền tảng giải phẫu vận động”."
    />

    <div class="mt-3">
      <AppButton icon="plus" @click="addModule">Thêm phần</AppButton>
    </div>
  </div>
</template>
