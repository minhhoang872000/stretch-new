<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">photo_library</span>
            <h2 class="text-base font-bold text-on-surface">Thư viện ảnh</h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
              :disabled="media.uploading.value"
              @click="fileInput?.click()"
            >
              <span class="material-symbols-outlined text-sm">{{ media.uploading.value ? 'progress_activity' : 'upload' }}</span>
              {{ media.uploading.value ? 'Đang tải…' : 'Tải ảnh lên' }}
            </button>
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onUpload" />
            <button type="button" class="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant" @click="close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="media.error.value" class="mb-4 text-error text-sm">{{ media.error.value }}</div>

          <div v-if="media.loading.value" class="flex items-center justify-center py-20 text-on-surface-variant">
            <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
          </div>

          <div v-else-if="!media.images.value.length" class="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-2 opacity-40">image</span>
            <p class="text-sm">Chưa có ảnh nào. Bấm “Tải ảnh lên” để bắt đầu.</p>
          </div>

          <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <button
              v-for="img in media.images.value"
              :key="img.key"
              type="button"
              class="group relative aspect-square rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all"
              :class="{ 'ring-2 ring-primary border-primary': img.url === modelValue }"
              @click="choose(img)"
            >
              <img :src="img.url" loading="lazy" class="w-full h-full object-cover" />
              <span class="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                <span class="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 drop-shadow">check_circle</span>
              </span>
            </button>
          </div>

          <div v-if="media.hasMore()" class="flex justify-center mt-6">
            <button
              type="button"
              class="btn-outline !py-2 !px-5 text-xs"
              :disabled="media.loadingMore.value"
              @click="media.loadMore()"
            >
              {{ media.loadingMore.value ? 'Đang tải…' : 'Tải thêm' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMediaLibrary } from '@/composables/useMediaLibrary'
import { useNotify } from '@/composables/useNotify'

const props = defineProps({
  /** Two-way visibility */
  isOpen: { type: Boolean, default: false },
  /** Currently selected URL (highlights the matching tile) */
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:isOpen', 'update:modelValue', 'select'])

const notify = useNotify()
const media = useMediaLibrary()
const fileInput = ref(null)

// Load (once) the first time the picker is opened.
watch(
  () => props.isOpen,
  (open) => {
    if (open && !media.images.value.length) media.load()
  },
)

function close() {
  emit('update:isOpen', false)
}

function choose(img) {
  emit('update:modelValue', img.url)
  emit('select', img.url)
  close()
}

async function onUpload(e) {
  const files = e.target.files
  try {
    const uploaded = await media.upload(files)
    if (uploaded.length) {
      notify.success('toast.imageUploaded')
      // auto-select the first newly uploaded image
      choose(uploaded[0])
    }
  } catch (err) {
    notify.error(err.message || 'toast.imageUploadError')
  } finally {
    e.target.value = ''
  }
}
</script>
