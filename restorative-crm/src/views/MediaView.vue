<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <p class="label-xs mb-1">Thư viện</p>
        <h1 class="text-2xl font-bold text-on-surface font-headline">Thư viện ảnh</h1>
        <p class="text-sm text-on-surface-variant mt-1">
          Quản lý ảnh đã tải lên — sao chép đường dẫn để dùng lại, hoặc xoá ảnh không cần.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn-outline !py-2.5 !px-4 text-sm flex items-center gap-1.5" :disabled="media.loading.value" @click="media.load()">
          <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': media.loading.value }">refresh</span>
          Làm mới
        </button>
        <button type="button" class="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-1.5" :disabled="media.uploading.value" @click="fileInput?.click()">
          <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': media.uploading.value }">{{ media.uploading.value ? 'progress_activity' : 'upload' }}</span>
          {{ media.uploading.value ? 'Đang tải…' : 'Tải ảnh lên' }}
        </button>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onUpload" />
      </div>
    </div>

    <div v-if="media.error.value" class="mb-4 p-3 rounded-xl bg-error/5 text-error text-sm">{{ media.error.value }}</div>

    <!-- Loading -->
    <div v-if="media.loading.value" class="flex items-center justify-center py-24 text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!media.images.value.length" class="flex flex-col items-center justify-center py-24 text-on-surface-variant">
      <span class="material-symbols-outlined text-6xl mb-3 opacity-40">image</span>
      <p class="text-sm">Chưa có ảnh nào. Bấm “Tải ảnh lên” để bắt đầu.</p>
    </div>

    <!-- Grid -->
    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="img in media.images.value"
          :key="img.key"
          class="group relative rounded-xl overflow-hidden border border-outline-variant/15 bg-surface-container-low card"
        >
          <div class="aspect-square overflow-hidden bg-surface-container">
            <img :src="img.url" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>

          <!-- Hover overlay actions -->
          <div class="absolute inset-x-0 top-0 p-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" title="Sao chép đường dẫn" class="w-8 h-8 rounded-lg bg-white/90 hover:bg-white shadow flex items-center justify-center text-on-surface" @click="copyUrl(img)">
              <span class="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
            <button type="button" title="Cắt / chỉnh ảnh" class="w-8 h-8 rounded-lg bg-white/90 hover:bg-white shadow flex items-center justify-center text-on-surface" @click="askCrop(img)">
              <span class="material-symbols-outlined text-[18px]">crop</span>
            </button>
            <button type="button" title="Mở ảnh" class="w-8 h-8 rounded-lg bg-white/90 hover:bg-white shadow flex items-center justify-center text-on-surface" @click="openUrl(img)">
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
            <button type="button" title="Xoá" class="w-8 h-8 rounded-lg bg-white/90 hover:bg-white shadow flex items-center justify-center text-error" @click="askDelete(img)">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>

          <!-- Meta -->
          <div class="px-2.5 py-2">
            <p class="text-[11px] text-on-surface-variant truncate" :title="img.key">{{ shortName(img.key) }}</p>
            <p class="text-[10px] text-outline">{{ formatBytes(img.size) }}<span v-if="img.uploadedAt"> · {{ formatDate(img.uploadedAt) }}</span></p>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="media.hasMore()" class="flex justify-center mt-8">
        <button type="button" class="btn-outline !py-2.5 !px-6 text-sm" :disabled="media.loadingMore.value" @click="media.loadMore()">
          {{ media.loadingMore.value ? 'Đang tải…' : 'Tải thêm' }}
        </button>
      </div>
      <p class="text-center text-xs text-outline mt-4">{{ media.images.value.length }} ảnh</p>
    </div>

    <!-- Crop / edit -->
    <ImageCropper :is-open="!!cropping" :image="cropping" :saving="cropSaving" @update:isOpen="(v) => { if (!v) cropping = null }" @confirm="onCropConfirm" />

    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="pendingDelete" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="pendingDelete = null">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="material-symbols-outlined text-error">warning</span>
            <h3 class="font-bold text-on-surface">Xoá ảnh này?</h3>
          </div>
          <div class="rounded-xl overflow-hidden h-32 bg-surface-container mb-3">
            <img :src="pendingDelete.url" class="w-full h-full object-contain" />
          </div>
          <p class="text-sm text-on-surface-variant mb-5">
            Ảnh sẽ bị xoá vĩnh viễn khỏi kho lưu trữ. Nếu đang được dùng trong bài viết/dịch vụ, ảnh đó sẽ bị hỏng. Không thể hoàn tác.
          </p>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-outline !py-2 !px-4 text-sm" @click="pendingDelete = null">Huỷ</button>
            <button type="button" class="!py-2 !px-4 text-sm rounded-full font-bold bg-error text-white hover:opacity-90 active:scale-95 transition flex items-center gap-1.5" :disabled="deleting" @click="confirmDelete">
              <span v-if="deleting" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Xoá
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useMediaLibrary, formatBytes } from '@/composables/useMediaLibrary'
import { useNotify } from '@/composables/useNotify'
import { formatDate } from '@/utils/date.js'
import ImageCropper from '@/components/ui/ImageCropper.vue'

const media = useMediaLibrary()
const notify = useNotify()
const fileInput = ref(null)
const pendingDelete = ref(null)
const deleting = ref(false)
const cropping = ref(null)
const cropSaving = ref(false)

onMounted(() => media.load())

function shortName(key) {
  const base = key.split('/').pop() || key
  return base.length > 22 ? base.slice(0, 10) + '…' + base.slice(-8) : base
}

async function copyUrl(img) {
  try {
    await navigator.clipboard.writeText(img.url)
    notify.success('toast.urlCopied')
  } catch {
    notify.error('Không sao chép được. Hãy thử lại.')
  }
}

function openUrl(img) {
  window.open(img.url, '_blank', 'noopener')
}

async function onUpload(e) {
  try {
    const uploaded = await media.upload(e.target.files)
    if (uploaded.length) notify.success('toast.imageUploaded')
  } catch (err) {
    notify.error(err.message || 'toast.imageUploadError')
  } finally {
    e.target.value = ''
  }
}

function askCrop(img) {
  cropping.value = img
}

async function onCropConfirm(rect) {
  if (!cropping.value) return
  cropSaving.value = true
  try {
    await media.crop(cropping.value.key, rect)
    notify.success('Đã tạo ảnh đã cắt.')
    cropping.value = null
  } catch (err) {
    notify.error(err.message || 'Cắt ảnh thất bại.')
  } finally {
    cropSaving.value = false
  }
}

function askDelete(img) {
  pendingDelete.value = img
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await media.remove(pendingDelete.value.key)
    notify.success('toast.imageDeleted')
    pendingDelete.value = null
  } catch (err) {
    notify.error(err.message || 'toast.imageDeleteError')
  } finally {
    deleting.value = false
  }
}
</script>
