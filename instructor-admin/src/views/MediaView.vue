<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import DataTable from '~/components/ui/DataTable.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import StatTile from '~/components/ui/StatTile.vue'
import type { Column } from '~/components/ui/tableTypes'
import { api } from '~/services/api'
import { hasApi } from '~/services/http'
import {
  deleteVideo,
  isAbort,
  listVideos,
  playbackTicket,
  uploadVideo,
  type LessonVideo,
  type UploadPhase,
} from '~/services/videos'
import { useToast } from '~/composables/useToast'
import { bitrateMbps, clock, date, mb } from '~/utils/format'
import type { Course } from '~/types'

/**
 * Video library — the one screen wired to the real backend.
 *
 * Two halves that answer two different questions:
 *
 * **Before the upload**, the browser reads duration, dimensions and a frame off
 * the chosen file. That is the whole point of measuring here: a 2 GB 15-minute
 * export is fine for R2's bill and miserable for a learner on 4G, and this is
 * the last moment anyone can catch it.
 *
 * **The upload itself** goes straight from this tab to Cloudflare R2 over
 * presigned URLs (`services/videos.ts`) — the bytes never touch the API, so file
 * size is bounded by R2, not by a request timeout. The API keeps the row and
 * mints short-lived playback URLs; the bucket stays private.
 *
 * A video is filed by `programSlug` + `lessonOrdinal`, and the ordinal counts
 * ONLY video lessons, in module order, from zero — the exact convention
 * `site/components/learning/LearnStage.vue` uses to ask for it. Change one and
 * the lesson plays the wrong file.
 */
const { push } = useToast()

const BITRATE_CEILING = 4

interface Staged {
  file: File
  durationSeconds: number
  width: number
  height: number
  courseId: string
  lessonId: string
  poster: string | null
  uploading: boolean
  phase: UploadPhase
  sentBytes: number
  controller: AbortController | null
}

const videos = ref<LessonVideo[]>([])
const courses = ref<Course[]>([])
const loading = ref(true)
const loadError = ref('')
const staged = ref<Staged[]>([])
const dragOver = ref(false)

const preview = ref<{ open: boolean; title: string; url: string; loading: boolean }>({
  open: false,
  title: '',
  url: '',
  loading: false,
})

onMounted(async () => {
  courses.value = await api.listCourses()
  await refresh()
})

onBeforeUnmount(() => {
  // Leaving the screen mid-upload cancels it rather than orphaning parts in R2.
  for (const item of staged.value) item.controller?.abort()
})

async function refresh() {
  if (!hasApi.value) {
    loading.value = false
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    videos.value = await listVideos()
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Không tải được thư viện.'
  } finally {
    loading.value = false
  }
}

// ── Course ↔ lesson slot ─────────────────────────────────────────────────────

const courseOptions = computed(() => [
  { value: '', label: '— Chưa gắn khóa —' },
  ...courses.value.map((c) => ({ value: c.id, label: c.title })),
])

/** Only video lessons can hold a file, and their order is the ordinal. */
function videoLessons(courseId: string) {
  const course = courses.value.find((c) => c.id === courseId)
  if (!course) return []
  const out: { id: string; label: string; ordinal: number }[] = []
  let ordinal = 0
  course.modules.forEach((module, mi) => {
    module.lessons.forEach((lesson) => {
      if (lesson.type !== 'video') return
      out.push({ id: lesson.id, label: `P${mi + 1} · ${lesson.title}`, ordinal })
      ordinal += 1
    })
  })
  return out
}

function lessonOptions(courseId: string) {
  if (!courseId) return [{ value: '', label: '— Chọn khóa trước —' }]
  return [
    { value: '', label: '— Chưa gắn bài —' },
    ...videoLessons(courseId).map((l) => ({ value: l.id, label: l.label })),
  ]
}

function bindingFor(item: Staged): { programSlug: string | null; lessonOrdinal: number | null } {
  const course = courses.value.find((c) => c.id === item.courseId)
  if (!course) return { programSlug: null, lessonOrdinal: null }
  const lesson = videoLessons(course.id).find((l) => l.id === item.lessonId)
  return { programSlug: course.slug, lessonOrdinal: lesson ? lesson.ordinal : null }
}

/** The reverse read, for the library table. */
function slotLabel(video: LessonVideo): string {
  if (!video.programSlug) return '— chưa gắn —'
  const course = courses.value.find((c) => c.slug === video.programSlug)
  if (!course) return video.programSlug
  if (video.lessonOrdinal === null) return course.title
  const lesson = videoLessons(course.id).find((l) => l.ordinal === video.lessonOrdinal)
  return `${course.title} · ${lesson ? lesson.label : `bài video #${video.lessonOrdinal + 1}`}`
}

/** Warn before a second file lands on a slot that already plays something. */
function slotTaken(item: Staged): LessonVideo | null {
  const { programSlug, lessonOrdinal } = bindingFor(item)
  if (!programSlug || lessonOrdinal === null) return null
  return (
    videos.value.find(
      (v) => v.programSlug === programSlug && v.lessonOrdinal === lessonOrdinal && v.status === 'ready',
    ) ?? null
  )
}

// ── Staging ──────────────────────────────────────────────────────────────────

/** Reads metadata, and grabs a frame ~10% in as a thumbnail. */
function inspect(file: File): Promise<{ durationSeconds: number; width: number; height: number; poster: string | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = url

    const finish = (poster: string | null) => {
      const result = {
        durationSeconds: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
        poster,
      }
      URL.revokeObjectURL(url)
      resolve(result)
    }

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration * 0.1, 5)
    }
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(video.videoWidth, 640)
        canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight)
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
        finish(canvas.toDataURL('image/jpeg', 0.72))
      } catch {
        // Tainted canvas or codec the browser will not decode — no thumbnail, and
        // the upload still goes ahead.
        finish(null)
      }
    }
    video.onerror = () => finish(null)
  })
}

async function accept(files: FileList | null) {
  if (!files?.length) return
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('video/')) {
      push(`${file.name} không phải file video — bỏ qua.`, 'bad')
      continue
    }
    const meta = await inspect(file)
    staged.value = [
      ...staged.value,
      {
        file,
        ...meta,
        courseId: '',
        lessonId: '',
        uploading: false,
        phase: 'preparing',
        sentBytes: 0,
        controller: null,
      },
    ]
  }
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  accept(event.dataTransfer?.files ?? null)
}

function patchStaged(index: number, patch: Partial<Staged>) {
  const item = staged.value[index]
  if (item) Object.assign(item, patch)
}

const PHASE_LABEL: Record<UploadPhase, string> = {
  preparing: 'Đang xin quyền ghi…',
  uploading: 'Đang tải lên R2',
  finishing: 'Đang hoàn tất…',
}

// ── Upload ───────────────────────────────────────────────────────────────────

async function upload(index: number) {
  const item = staged.value[index]
  if (!item || item.uploading) return

  const controller = new AbortController()
  patchStaged(index, { uploading: true, sentBytes: 0, phase: 'preparing', controller })

  try {
    const created = await uploadVideo(
      item.file,
      {
        ...bindingFor(item),
        title: item.file.name,
        durationSeconds: item.durationSeconds,
      },
      {
        signal: controller.signal,
        onPhase: (phase) => patchStaged(index, { phase }),
        onProgress: (loaded) => patchStaged(index, { sentBytes: loaded }),
      },
    )

    videos.value = [created, ...videos.value]
    staged.value = staged.value.filter((s) => s !== item)
    push(`Đã tải lên ${item.file.name}.`, 'good')
  } catch (err) {
    patchStaged(index, { uploading: false, controller: null, sentBytes: 0 })
    if (isAbort(err)) {
      push(`Đã huỷ tải lên ${item.file.name}.`, 'info')
      return
    }
    push(err instanceof Error ? err.message : 'Tải lên thất bại.', 'bad')
  }
}

function cancelUpload(index: number) {
  staged.value[index]?.controller?.abort()
}

// ── Library actions ──────────────────────────────────────────────────────────

async function openPreview(video: LessonVideo) {
  preview.value = { open: true, title: video.title || video.objectKey, url: '', loading: true }
  try {
    const ticket = await playbackTicket(video.id)
    preview.value = { ...preview.value, url: ticket.url, loading: false }
  } catch (err) {
    preview.value.open = false
    push(err instanceof Error ? err.message : 'Không lấy được link xem thử.', 'bad')
  }
}

function closePreview() {
  // Dropping the src stops the download the moment the modal closes.
  preview.value = { open: false, title: '', url: '', loading: false }
}

async function remove(video: LessonVideo) {
  if (!window.confirm(`Xoá "${video.title || video.objectKey}" khỏi R2? Không khôi phục được.`)) return
  try {
    await deleteVideo(video.id)
    videos.value = videos.value.filter((v) => v.id !== video.id)
    push('Đã xoá video khỏi R2.', 'good')
  } catch (err) {
    push(err instanceof Error ? err.message : 'Xoá thất bại.', 'bad')
  }
}

// ── Derived ──────────────────────────────────────────────────────────────────

const rows = computed(() =>
  videos.value.map((video) => ({
    ...video,
    slot: slotLabel(video),
    bitrate: video.durationSeconds ? bitrateMbps(video.sizeBytes, video.durationSeconds) : 0,
    uploadedAt: video.createdAt.slice(0, 10),
  })),
)

const readyVideos = computed(() => videos.value.filter((v) => v.status === 'ready'))
const heavyCount = computed(() => rows.value.filter((r) => r.bitrate > BITRATE_CEILING).length)
const totalBytes = computed(() => readyVideos.value.reduce((sum, v) => sum + v.sizeBytes, 0))
const totalMinutes = computed(() =>
  Math.round(readyVideos.value.reduce((sum, v) => sum + (v.durationSeconds ?? 0), 0) / 60),
)
const unboundCount = computed(() => readyVideos.value.filter((v) => v.lessonOrdinal === null).length)

const columns: Column[] = [
  { key: 'title', label: 'File' },
  { key: 'slot', label: 'Gắn vào bài', hideOnMobile: true },
  { key: 'durationSeconds', label: 'Thời lượng', numeric: true, sortable: true, width: 'w-24' },
  { key: 'sizeBytes', label: 'Dung lượng', numeric: true, sortable: true, width: 'w-28' },
  { key: 'bitrate', label: 'Bitrate', numeric: true, sortable: true, width: 'w-28' },
  { key: 'uploadedAt', label: 'Tải lên', sortable: true, width: 'w-28', hideOnMobile: true },
  { key: 'actions', label: '', width: 'w-24' },
]
</script>

<template>
  <div>
    <PageHeader
      title="Video"
      hint="Thư viện video bài giảng trên Cloudflare R2. Bitrate là con số quyết định học viên xem trôi hay bị buffer — không phải độ phân giải."
    >
      <template #actions>
        <AppButton v-if="hasApi" size="sm" @click="refresh">Tải lại</AppButton>
      </template>
    </PageHeader>

    <!-- ══ No API token: say why, and what to do about it ══ -->
    <AppCard v-if="!hasApi" title="Chưa kết nối API">
      <p class="text-[13px] leading-relaxed text-ink-soft">
        Màn hình này đọc và ghi trực tiếp lên Cloudflare R2 qua
        <span class="figure">lead-tracker-api</span>, nên nó cần một phiên đăng nhập thật — phiên demo
        không có token.
      </p>
      <ol class="mt-3 list-decimal space-y-1.5 pl-5 text-[12.5px] leading-relaxed text-ink-soft">
        <li>
          Chạy API (<span class="figure">npm run dev</span> trong
          <span class="figure">lead-tracker-api</span>) và điền các biến
          <span class="figure">R2_*</span> trong <span class="figure">.env</span>.
        </li>
        <li>
          Đặt <span class="figure">VITE_API_BASE_URL</span> trong
          <span class="figure">instructor-admin/.env</span> trỏ tới API.
        </li>
        <li>
          Đăng xuất rồi đăng nhập lại bằng <span class="figure">ADMIN_EMAIL</span> /
          <span class="figure">ADMIN_PASSWORD</span> của API.
        </li>
      </ol>
    </AppCard>

    <template v-else>
      <div v-if="loadError" class="mb-4 rounded-xl bg-bad-bg px-3.5 py-3 text-[12.5px] text-bad">
        {{ loadError }}
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Số video" :value="videos.length" icon="video" />
        <StatTile label="Tổng thời lượng" :value="totalMinutes" unit="phút" icon="clock" />
        <StatTile
          label="Dung lượng"
          :value="mb(totalBytes)"
          icon="upload"
          :hint="`~$${((totalBytes / 1e9) * 0.015).toFixed(2)}/tháng lưu trên R2`"
        />
        <StatTile
          label="Bitrate quá cao"
          :value="heavyCount"
          unit="file"
          icon="warning"
          :delta="heavyCount ? { text: `Trên ${BITRATE_CEILING} Mbps — nên encode lại`, tone: 'bad' } : { text: 'Tất cả đều ổn', tone: 'good' }"
        />
      </div>

      <!-- ══ Upload ══ -->
      <AppCard
        title="Tải video lên"
        hint="Kéo thả file, hoặc bấm để chọn. File đi thẳng từ trình duyệt lên R2 — không qua API."
      >
        <div
          class="t-fast rounded-xl border-2 border-dashed p-6 text-center"
          :class="dragOver ? 'border-accent-dark bg-accent/5' : 'border-line-strong bg-shell'"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="onDrop"
        >
          <AppIcon name="upload" :size="22" class="mx-auto text-ink-muted" />
          <p class="mt-2 text-[13px] font-semibold text-navy">Kéo file video vào đây</p>
          <p class="mt-0.5 text-[11.5px] text-ink-muted">
            mp4, mov, webm · file lớn được cắt thành nhiều phần và tải song song
          </p>
          <label class="mt-3 inline-block">
            <input type="file" accept="video/*" multiple class="sr-only" @change="accept(($event.target as HTMLInputElement).files)" />
            <span
              class="t-fast inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-navy hover:border-accent-dark hover:text-accent-text"
            >
              Chọn file
            </span>
          </label>
        </div>

        <!-- ── Staged files, with the measurement that matters ── -->
        <div v-if="staged.length" class="mt-3 flex flex-col gap-2.5">
          <div v-for="(item, index) in staged" :key="item.file.name + index" class="rounded-xl border border-line p-3">
            <div class="flex flex-wrap items-start gap-3">
              <img
                v-if="item.poster"
                :src="item.poster"
                alt=""
                class="h-16 w-28 shrink-0 rounded-lg border border-line object-cover"
              />
              <span v-else class="grid h-16 w-28 shrink-0 place-items-center rounded-lg border border-line bg-shell text-ink-muted">
                <AppIcon name="video" :size="18" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-navy">{{ item.file.name }}</p>
                <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-soft">
                  <span class="figure">{{ mb(item.file.size) }}</span>
                  <span class="figure">{{ clock(item.durationSeconds) }}</span>
                  <span class="figure">{{ item.width }}×{{ item.height }}</span>
                  <span class="figure font-semibold">
                    {{ bitrateMbps(item.file.size, item.durationSeconds) }} Mbps
                  </span>
                </p>

                <p
                  v-if="bitrateMbps(item.file.size, item.durationSeconds) > BITRATE_CEILING"
                  class="mt-2 rounded-lg bg-warn-bg px-2.5 py-2 text-[11.5px] leading-relaxed text-warn"
                >
                  <span class="inline-flex items-center gap-1 font-semibold">
                    <AppIcon name="warning" :size="12" :stroke-width="2.2" />
                    Bitrate {{ bitrateMbps(item.file.size, item.durationSeconds) }} Mbps là quá cao cho web.
                  </span>
                  Học viên dùng 4G sẽ buffer, và mỗi lượt xem tốn {{ mb(item.file.size) }} data của họ. Nên encode lại:
                  <span class="figure block pt-1">
                    ffmpeg -i "{{ item.file.name }}" -vf scale=-2:720 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4
                  </span>
                </p>

                <p
                  v-else-if="slotTaken(item)"
                  class="mt-2 rounded-lg bg-info-bg px-2.5 py-2 text-[11.5px] leading-relaxed text-navy-light"
                >
                  Bài này đang phát
                  <span class="figure">{{ slotTaken(item)?.title }}</span
                  >. File mới sẽ được dùng thay cho nó — file cũ vẫn nằm trong thư viện cho tới khi bạn xoá.
                </p>
              </div>
            </div>

            <!-- ── Uploading: progress replaces the form ── -->
            <div v-if="item.uploading" class="mt-4">
              <div class="mb-1.5 flex items-center justify-between gap-3">
                <span class="text-[11.5px] font-semibold text-ink-soft">{{ PHASE_LABEL[item.phase] }}</span>
                <span class="figure text-[11.5px] text-ink-muted">
                  {{ mb(item.sentBytes) }} / {{ mb(item.file.size) }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <ProgressMeter :value="item.sentBytes" :max="item.file.size || 1" label="Tiến độ tải lên" class="flex-1" />
                <AppButton size="sm" variant="ghost" @click="cancelUpload(index)">Huỷ</AppButton>
              </div>
            </div>

            <div v-else class="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <AppSelect
                :model-value="item.courseId"
                :options="courseOptions"
                @update:model-value="patchStaged(index, { courseId: $event, lessonId: '' })"
              />
              <AppSelect
                :model-value="item.lessonId"
                :options="lessonOptions(item.courseId)"
                :disabled="!item.courseId"
                @update:model-value="patchStaged(index, { lessonId: $event })"
              />
              <div class="flex items-center gap-2">
                <AppButton variant="primary" @click="upload(index)">Tải lên</AppButton>
                <AppButton variant="ghost" @click="staged = staged.filter((_, i) => i !== index)">Bỏ</AppButton>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- ══ Library ══ -->
      <AppCard
        class="mt-4"
        title="Thư viện"
        :hint="unboundCount ? `${unboundCount} video chưa gắn vào bài nào — trang học sẽ không tìm thấy chúng.` : undefined"
        :padded="false"
      >
        <DataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :page-size="10"
          empty-title="Thư viện chưa có video"
          empty-hint="Tải file đầu tiên lên ở khung phía trên."
        >
          <template #cell-title="{ row }">
            <p class="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-navy">
              {{ row.title || row.objectKey }}
              <AppBadge v-if="row.status === 'uploading'" tone="warn">Đang tải</AppBadge>
              <AppBadge v-else-if="row.status === 'failed'" tone="bad">Lỗi</AppBadge>
            </p>
            <p class="figure mt-0.5 truncate text-[11px] text-ink-muted">{{ row.objectKey }}</p>
          </template>

          <template #cell-slot="{ row }">
            <span class="text-[12.5px]" :class="row.lessonOrdinal === null ? 'text-warn' : 'text-ink-soft'">
              {{ row.slot }}
            </span>
          </template>

          <template #cell-durationSeconds="{ row }">
            <span v-if="row.durationSeconds">{{ clock(row.durationSeconds as number) }}</span>
            <span v-else class="text-ink-muted">—</span>
          </template>

          <template #cell-sizeBytes="{ row }">{{ mb(row.sizeBytes as number) }}</template>

          <template #cell-bitrate="{ row }">
            <span v-if="!row.bitrate" class="text-ink-muted">—</span>
            <span v-else :class="(row.bitrate as number) > BITRATE_CEILING ? 'font-semibold text-bad' : 'text-ink-soft'">
              {{ row.bitrate }} Mbps
            </span>
          </template>

          <template #cell-uploadedAt="{ row }">
            <span class="text-[12px] text-ink-soft">{{ date(row.uploadedAt as string) }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center gap-0.5">
              <button
                v-if="row.status === 'ready'"
                type="button"
                class="t-fast grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-track hover:text-navy"
                @click="openPreview(row as unknown as LessonVideo)"
              >
                <AppIcon name="eye" :size="14" label="Xem thử" />
              </button>
              <button
                type="button"
                class="t-fast grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad"
                @click="remove(row as unknown as LessonVideo)"
              >
                <AppIcon name="trash" :size="14" label="Xoá video" />
              </button>
            </div>
          </template>
        </DataTable>
      </AppCard>
    </template>

    <!-- ══ Preview — the same signed URL a learner gets ══ -->
    <AppModal :open="preview.open" :title="preview.title" wide @close="closePreview">
      <p v-if="preview.loading" class="py-10 text-center text-[12.5px] text-ink-muted">Đang lấy link…</p>
      <video v-else-if="preview.url" :src="preview.url" controls autoplay class="w-full rounded-lg bg-navy" />
      <p class="mt-2 text-[11px] leading-relaxed text-ink-muted">
        Link ký ngắn hạn, hết hạn theo <span class="figure">R2_VIDEO_PLAYBACK_TTL</span>. Đây đúng là thứ trang học
        nhận được, nên nếu đoạn này chạy thì bên site cũng chạy.
      </p>
    </AppModal>
  </div>
</template>
