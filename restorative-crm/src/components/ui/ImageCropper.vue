<template>
  <Teleport to="body">
    <div
      v-if="isOpen && image"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">crop</span>
            <h2 class="text-base font-bold text-on-surface">Cắt / chỉnh ảnh</h2>
          </div>
          <button type="button" class="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Cropper -->
        <div class="bg-neutral-900 flex items-center justify-center" style="height: 60vh;">
          <Cropper
            :src="image.url"
            :canvas="false"
            :stencil-props="stencilProps"
            class="w-full h-full"
            @change="onChange"
          />
        </div>

        <!-- Controls -->
        <div class="px-6 py-4 border-t border-outline-variant/15">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <span class="text-xs font-bold text-on-surface-variant mr-1">Tỉ lệ:</span>
            <button
              v-for="r in ratios"
              :key="r.label"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
              :class="activeRatio === r.label
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/50'"
              @click="activeRatio = r.label"
            >
              {{ r.label }}
            </button>
          </div>
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs text-outline">
              <span v-if="coordinates">{{ Math.round(coordinates.width) }} × {{ Math.round(coordinates.height) }} px</span>
            </p>
            <div class="flex gap-2">
              <button type="button" class="btn-outline !py-2 !px-4 text-sm" @click="close">Huỷ</button>
              <button
                type="button"
                class="btn-primary !py-2 !px-5 text-sm flex items-center gap-1.5"
                :disabled="saving || !coordinates"
                @click="confirm"
              >
                <span v-if="saving" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined text-sm">check</span>
                {{ saving ? 'Đang lưu…' : 'Lưu thành ảnh mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  /** The media item to crop: { key, url } */
  image: { type: Object, default: null },
  /** Whether the parent is currently performing the crop request */
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['update:isOpen', 'confirm'])

const ratios = [
  { label: 'Tự do', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
]
const activeRatio = ref('Tự do')

const stencilProps = computed(() => {
  const r = ratios.find((x) => x.label === activeRatio.value)
  return r && r.value ? { aspectRatio: r.value } : {}
})

const coordinates = ref(null)
function onChange({ coordinates: c }) {
  coordinates.value = c
}

function close() {
  emit('update:isOpen', false)
}

function confirm() {
  if (!coordinates.value) return
  emit('confirm', {
    left: coordinates.value.left,
    top: coordinates.value.top,
    width: coordinates.value.width,
    height: coordinates.value.height,
  })
}
</script>
