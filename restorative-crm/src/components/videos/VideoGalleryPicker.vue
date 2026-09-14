<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="panel w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <!-- Header -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-line shrink-0">
          <span class="material-symbols-outlined text-xl text-accent">video_library</span>
          <h2 class="text-[0.9375rem] font-bold text-ink">Thư viện video</h2>
          <span v-if="!loading" class="num text-xs text-ink-4">{{ filtered.length }}</span>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon ml-auto"
            aria-label="Tải lại danh sách"
            :disabled="loading"
            @click="load"
          >
            <span class="material-symbols-outlined text-lg" :class="{ 'animate-spin': loading }">refresh</span>
          </button>
          <button type="button" class="btn-ghost btn-sm btn-icon" aria-label="Đóng" @click="close">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-2.5 border-b border-line-soft shrink-0">
          <label class="relative block">
            <span class="material-symbols-outlined text-lg text-ink-4 absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
            <input
              v-model="query"
              type="search"
              class="input pl-9"
              placeholder="Tìm theo tên video…"
              aria-label="Tìm video"
            />
          </label>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="loading" class="flex items-center justify-center py-16 text-ink-3">
            <span class="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
          </div>

          <p v-else-if="error" class="field-error">
            <span class="material-symbols-outlined text-sm">error</span>{{ error }}
          </p>

          <div v-else-if="!filtered.length" class="flex flex-col items-center justify-center py-16 text-ink-3">
            <span class="material-symbols-outlined text-4xl mb-1.5 opacity-50">movie</span>
            <p class="text-xs">
              {{ query ? 'Không có video nào khớp từ khoá.' : 'Chưa có video nào trên R2 — tải video lên trước đã.' }}
            </p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="item in filtered"
              :key="item.id"
              class="panel-quiet overflow-hidden flex flex-col transition-shadow"
              :class="item.id === selectedId ? 'ring-2 ring-accent border-accent' : ''"
            >
              <!-- Thumbnail / inline preview -->
              <video
                v-if="previews[item.id]"
                :src="previews[item.id]"
                class="w-full aspect-video bg-ink"
                controls
                autoplay
                preload="metadata"
                playsinline
              />
              <button
                v-else
                type="button"
                class="group relative w-full aspect-video bg-ink flex items-center justify-center"
                :aria-label="`Xem thử ${item.title}`"
                @click="preview(item)"
              >
                <span
                  class="material-symbols-outlined text-4xl text-white/70 group-hover:text-white
                         group-hover:scale-110 transition-transform"
                >{{ previewLoading === item.id ? 'progress_activity' : 'play_circle' }}</span>
              </button>

              <div class="p-2.5 flex flex-col gap-1.5 flex-1">
                <p class="text-xs font-semibold text-ink truncate" :title="item.title">{{ item.title }}</p>
                <p class="meta">
                  {{ mb(item.sizeBytes) }}
                  <template v-if="item.durationSeconds"> · {{ clock(item.durationSeconds) }}</template>
                </p>
                <button
                  type="button"
                  class="btn-sm w-full mt-auto"
                  :class="item.id === selectedId ? 'btn-outline' : 'btn-primary'"
                  @click="choose(item)"
                >
                  <span class="material-symbols-outlined text-base">
                    {{ item.id === selectedId ? 'check_circle' : 'add_circle' }}
                  </span>
                  {{ item.id === selectedId ? 'Đang dùng video này' : 'Dùng video này' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { listVideos, fetchPlayback } from '@/services/videoUpload.js'

/**
 * Gallery picker over the videos already sitting in R2.
 *
 * Selecting here replaces pasting object keys or bucket links by hand: the
 * caller gets the full API row and decides what "attach" means for its lesson.
 * Playback URLs are signed and short-lived, so previews are fetched per card on
 * demand instead of eagerly for the whole grid.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  /** id of the video the caller already uses — highlighted in the grid. */
  selectedId: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'select'])

const videos = ref([])
const loading = ref(false)
const error = ref('')
const query = ref('')
const previews = reactive({})
const previewLoading = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return videos.value
  return videos.value.filter(
    (v) => (v.title || '').toLowerCase().includes(q) || (v.objectKey || '').toLowerCase().includes(q),
  )
})

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

async function load() {
  loading.value = true
  error.value = ''
  try {
    videos.value = await listVideos({ status: 'ready', limit: 100 })
  } catch (err) {
    error.value = err.message || 'Không tải được danh sách video.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open && !videos.value.length) load()
  },
)

async function preview(item) {
  if (previewLoading.value) return
  previewLoading.value = item.id
  try {
    const ticket = await fetchPlayback(item.id)
    previews[item.id] = ticket.url
  } catch (err) {
    error.value = err.message || 'Không lấy được link phát.'
  } finally {
    previewLoading.value = ''
  }
}

function choose(item) {
  emit('select', item)
  close()
}

function close() {
  emit('update:open', false)
}
</script>
