<template>
  <div class="space-y-3.5">
    <!-- Source switch: a lesson plays either a YouTube embed or an R2 file. -->
    <div class="flex items-center gap-1 p-0.5 bg-panel-3 rounded-md w-fit" role="tablist">
      <button
        v-for="opt in SOURCES"
        :key="opt.value"
        type="button"
        role="tab"
        :aria-selected="draft.provider === opt.value"
        class="h-7 px-2.5 rounded text-xs font-bold transition-colors"
        :class="draft.provider === opt.value ? 'bg-panel text-ink shadow-xs' : 'text-ink-3 hover:text-ink'"
        @click="setProvider(opt.value)"
      >
        <span class="material-symbols-outlined text-base align-middle mr-1">{{ opt.icon }}</span>
        {{ opt.label }}
      </button>
    </div>

    <!-- ── R2 ─────────────────────────────────────────────────────── -->
    <template v-if="draft.provider === 'r2'">
      <!-- Already attached: preview + swap -->
      <div v-if="draft.videoId && !uploading" class="panel-quiet p-2.5">
        <div class="flex items-center gap-2 mb-2">
          <span class="chip chip-ok">
            <span class="material-symbols-outlined text-[0.9rem]">cloud_done</span>
            Đã ở trên R2
          </span>
          <span v-if="draft.sizeBytes" class="meta">{{ mb(draft.sizeBytes) }}</span>
          <span v-if="draft.durationSeconds" class="meta">· {{ clock(draft.durationSeconds) }}</span>
          <button type="button" class="btn-ghost btn-sm ml-auto" @click="loadPreview">
            <span class="material-symbols-outlined text-base">{{ previewUrl ? 'refresh' : 'play_circle' }}</span>
            {{ previewUrl ? 'Lấy link mới' : 'Xem thử' }}
          </button>
        </div>

        <video
          v-if="previewUrl"
          :src="previewUrl"
          class="w-full rounded-md bg-ink aspect-video"
          controls
          preload="metadata"
          playsinline
        />
        <p v-else class="text-xs text-ink-3">
          Link phát là link có chữ ký, hết hạn sau ít phút — bấm “Xem thử” để lấy link mới.
        </p>

        <p v-if="previewError" class="field-error">
          <span class="material-symbols-outlined text-sm">error</span>{{ previewError }}
        </p>

        <div class="flex items-center gap-1.5 mt-2 pt-2 border-t border-line">
          <button type="button" class="btn-outline btn-sm" @click="pick">
            <span class="material-symbols-outlined text-base">swap_horiz</span>
            Thay video khác
          </button>
          <button type="button" class="btn-outline btn-sm" @click="galleryOpen = true">
            <span class="material-symbols-outlined text-base">video_library</span>
            Chọn từ thư viện
          </button>
          <button type="button" class="btn-ghost btn-sm text-danger" @click="detach">
            Bỏ gắn video
          </button>
        </div>
      </div>

      <!-- Uploading -->
      <div v-else-if="uploading" class="panel-quiet p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-lg text-accent animate-spin">progress_activity</span>
          <p class="text-[0.8125rem] font-bold text-ink truncate flex-1">{{ pendingName }}</p>
          <button type="button" class="btn-ghost btn-sm" @click="cancel">Huỷ</button>
        </div>
        <ProgressMeter :value="progress.percent" :label="`Phần ${progress.part}/${progress.parts}`" />
        <p class="meta mt-1">
          {{ mb(progress.uploaded) }} / {{ mb(progress.total) }} — tải trực tiếp lên R2, không qua server.
        </p>
      </div>

      <!-- Empty: pick a file, or reuse one already uploaded -->
      <div v-else class="space-y-2.5">
        <button
          type="button"
          class="w-full panel-quiet px-3 py-6 flex flex-col items-center gap-1.5 border-dashed
                 hover:border-accent-line transition-colors"
          :class="dragging ? 'border-accent bg-accent-soft/50' : ''"
          @click="pick"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
        >
          <span class="material-symbols-outlined text-2xl text-ink-3">upload_file</span>
          <span class="text-[0.8125rem] font-bold text-ink">Chọn hoặc kéo file video vào đây</span>
          <span class="meta">MP4 (H.264/AAC) chạy được trên mọi trình duyệt · tối đa {{ maxGb }} GB</span>
        </button>

        <p v-if="uploadError" class="field-error">
          <span class="material-symbols-outlined text-sm">error</span>{{ uploadError }}
        </p>

        <button type="button" class="btn-outline btn-sm w-full" @click="galleryOpen = true">
          <span class="material-symbols-outlined text-base">video_library</span>
          Hoặc chọn từ thư viện video đã tải lên
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="video/*"
        class="hidden"
        @change="onFile"
      />
    </template>

    <!-- ── YouTube ────────────────────────────────────────────────── -->
    <template v-else>
      <label class="block">
        <span class="field-label">YouTube ID hoặc link</span>
        <input
          v-model="youtubeInput"
          type="text"
          class="input font-mono text-xs"
          placeholder="https://youtu.be/… hoặc 11 ký tự id"
          @input="commitYoutube"
        />
        <span class="field-hint">Dán cả link cũng được — hệ thống tự tách id.</span>
      </label>

      <div v-if="parsedId" class="panel-quiet p-2.5">
        <p class="label-xs mb-1.5">Xem trước</p>
        <div class="aspect-video rounded-md overflow-hidden bg-ink">
          <iframe
            :src="`https://www.youtube-nocookie.com/embed/${parsedId}`"
            class="w-full h-full"
            title="Xem trước video bài học"
            allowfullscreen
            loading="lazy"
          />
        </div>
        <p class="meta mt-1.5 font-mono">{{ parsedId }}</p>
      </div>
      <p v-else-if="youtubeInput.trim()" class="field-error">
        <span class="material-symbols-outlined text-sm">error</span>
        Không đọc được id YouTube từ chuỗi này.
      </p>
    </template>

    <VideoGalleryPicker v-model:open="galleryOpen" :selected-id="draft.videoId" @select="attachExisting" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import ProgressMeter from '@/components/ui/ProgressMeter.vue'
import VideoGalleryPicker from '@/components/videos/VideoGalleryPicker.vue'
import { uploadVideo, fetchPlayback, patchVideo } from '@/services/videoUpload.js'

/**
 * Where one lesson's video comes from.
 *
 * Two sources, one at a time: a YouTube embed (what the site plays today) or a
 * file in R2 (uploaded here, played back through a signed URL). The R2 side does
 * real work — it talks to the API and to Cloudflare — so it is the one place in
 * the console that is not mock data, and it says so when the API is unreachable.
 */
const props = defineProps({
  /** { provider, youtubeId, videoId, objectKey, sizeBytes, durationSeconds } */
  modelValue: { type: Object, default: () => ({}) },
  /** Bind the upload straight to this lesson slot so the site can resolve it. */
  programSlug: { type: String, default: '' },
  lessonOrdinal: { type: Number, default: null },
  lessonTitle: { type: String, default: '' },
  maxBytes: { type: Number, default: 3 * 1024 * 1024 * 1024 },
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error'])

const SOURCES = [
  { value: 'r2', label: 'Tải lên R2', icon: 'cloud_upload' },
  { value: 'youtube', label: 'Link YouTube', icon: 'smart_display' },
]

const draft = reactive({
  provider: props.modelValue.provider || (props.modelValue.youtubeId ? 'youtube' : 'r2'),
  youtubeId: props.modelValue.youtubeId || '',
  videoId: props.modelValue.videoId || '',
  objectKey: props.modelValue.objectKey || '',
  sizeBytes: props.modelValue.sizeBytes || 0,
  durationSeconds: props.modelValue.durationSeconds || null,
})

const youtubeInput = ref(draft.youtubeId)
const fileInput = ref(null)
const dragging = ref(false)

const uploading = ref(false)
const pendingName = ref('')
const uploadError = ref('')
const progress = reactive({ percent: 0, uploaded: 0, total: 0, part: 0, parts: 0 })
let handle = null

const previewUrl = ref('')
const previewError = ref('')

const galleryOpen = ref(false)

const maxGb = computed(() => (props.maxBytes / 1024 / 1024 / 1024).toFixed(1).replace('.', ','))

const mb = (bytes) => {
  if (!bytes) return '0 MB'
  const mbytes = bytes / 1024 / 1024
  return mbytes >= 1024
    ? `${(mbytes / 1024).toFixed(2).replace('.', ',')} GB`
    : `${mbytes.toFixed(1).replace('.', ',')} MB`
}

const clock = (seconds) => {
  const s = Math.round(seconds || 0)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function push() {
  emit('update:modelValue', { ...draft })
}

function setProvider(value) {
  draft.provider = value
  push()
}

// ── YouTube ───────────────────────────────────────────────────────
/** Same parser the site uses, kept local so this component has no site import. */
function parseYoutubeId(input) {
  const raw = String(input || '').trim()
  if (!raw) return ''
  if (/^[\w-]{11}$/.test(raw)) return raw
  const match = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return match ? match[1] : ''
}

const parsedId = computed(() => parseYoutubeId(youtubeInput.value))

function commitYoutube() {
  draft.youtubeId = parsedId.value
  push()
}

// ── R2 upload ─────────────────────────────────────────────────────
function pick() {
  uploadError.value = ''
  fileInput.value?.click()
}

function onDrop(event) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) start(file)
}

function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) start(file)
}

/** Read the duration locally so the lesson length is real, not typed by hand. */
function readDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => {
      const value = Number.isFinite(probe.duration) ? Math.round(probe.duration) : null
      URL.revokeObjectURL(url)
      resolve(value)
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    probe.src = url
  })
}

async function start(file) {
  uploadError.value = ''

  if (!/^video\//.test(file.type)) {
    uploadError.value = 'File này không phải video.'
    return
  }
  if (file.size > props.maxBytes) {
    uploadError.value = `File ${mb(file.size)} vượt mức tối đa ${maxGb.value} GB.`
    return
  }

  const duration = await readDuration(file)

  uploading.value = true
  pendingName.value = file.name
  Object.assign(progress, { percent: 0, uploaded: 0, total: file.size, part: 0, parts: 0 })

  handle = uploadVideo({
    file,
    title: props.lessonTitle || file.name,
    programSlug: props.programSlug || null,
    lessonOrdinal: props.lessonOrdinal,
    onProgress: (p) => Object.assign(progress, p),
  })

  try {
    const video = await handle.promise
    // Record the duration we measured locally; the API only knows bytes.
    if (duration) {
      await patchVideo(video.id, { durationSeconds: duration }).catch(() => {})
    }
    draft.provider = 'r2'
    draft.videoId = video.id
    draft.objectKey = video.objectKey
    draft.sizeBytes = video.sizeBytes || file.size
    draft.durationSeconds = duration || video.durationSeconds || null
    draft.youtubeId = ''
    push()
    emit('uploaded', { ...draft })
    previewUrl.value = ''
  } catch (err) {
    if (err.name !== 'AbortError') {
      uploadError.value = err.message || 'Tải lên thất bại.'
      emit('error', err)
    }
  } finally {
    uploading.value = false
    handle = null
  }
}

function cancel() {
  handle?.abort()
}

function detach() {
  draft.videoId = ''
  draft.objectKey = ''
  draft.sizeBytes = 0
  draft.durationSeconds = null
  previewUrl.value = ''
  push()
}

async function loadPreview() {
  previewError.value = ''
  try {
    const ticket = await fetchPlayback(draft.videoId)
    previewUrl.value = ticket.url
  } catch (err) {
    previewError.value = err.message || 'Không lấy được link phát.'
  }
}

async function attachExisting(item) {
  draft.provider = 'r2'
  draft.videoId = item.id
  draft.objectKey = item.objectKey
  draft.sizeBytes = item.sizeBytes
  draft.durationSeconds = item.durationSeconds
  draft.youtubeId = ''
  push()
  // Point the existing file at this lesson slot as well.
  if (props.programSlug && props.lessonOrdinal != null) {
    await patchVideo(item.id, {
      programSlug: props.programSlug,
      lessonOrdinal: props.lessonOrdinal,
    }).catch(() => {})
  }
  emit('uploaded', { ...draft })
}

/** Re-seed when the parent opens the panel on a different lesson. */
watch(() => props.modelValue, (value) => {
  draft.provider = value.provider || (value.youtubeId ? 'youtube' : 'r2')
  draft.youtubeId = value.youtubeId || ''
  draft.videoId = value.videoId || ''
  draft.objectKey = value.objectKey || ''
  draft.sizeBytes = value.sizeBytes || 0
  draft.durationSeconds = value.durationSeconds || null
  youtubeInput.value = draft.youtubeId
  previewUrl.value = ''
  uploadError.value = ''
})
</script>
