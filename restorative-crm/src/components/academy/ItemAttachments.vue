<template>
  <div class="w-full rounded-md border border-line bg-panel-2 px-3 py-2.5">
    <p class="text-2xs font-bold text-ink-3 mb-2 flex items-center gap-1.5">
      <span class="material-symbols-outlined text-[0.95rem]">attach_file</span>
      Tài liệu đính kèm
    </p>

    <ul v-if="list.length" class="flex flex-col gap-1.5 mb-2">
      <li
        v-for="(file, i) in list"
        :key="file.key || file.url"
        class="flex items-center gap-2 rounded-md bg-panel border border-line-soft px-2 py-1.5"
      >
        <span class="num text-[0.625rem] font-bold text-ink-2 bg-panel-2 rounded px-1.5 py-1 shrink-0">{{ badge(file.name) }}</span>
        <input
          :value="file.name"
          type="text"
          class="input flex-1 min-w-0 !py-1 text-xs"
          aria-label="Tên tài liệu hiển thị cho học viên"
          @change="rename(i, $event.target.value)"
        />
        <span class="meta num shrink-0 hidden sm:inline">{{ size(file.size) }}</span>
        <a :href="file.url" target="_blank" rel="noopener" class="btn-ghost btn-sm btn-icon shrink-0" aria-label="Xem tệp">
          <span class="material-symbols-outlined text-lg">visibility</span>
        </a>
        <button type="button" class="btn-ghost btn-sm btn-icon shrink-0" aria-label="Gỡ tài liệu" @click="remove(i)">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </li>
    </ul>

    <label
      class="flex items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2.5 cursor-pointer transition-colors"
      :class="dragging ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="material-symbols-outlined text-lg text-ink-3">upload_file</span>
      <span class="text-xs font-bold text-ink-2">
        {{ uploading.length ? `Đang tải lên ${uploading.join(', ')}…` : 'Chọn hoặc kéo tệp vào đây' }}
      </span>
      <span class="meta hidden md:inline">PDF, Word, PowerPoint, Excel, ZIP, ảnh · tối đa {{ MAX_MB }}MB</span>
      <input ref="input" type="file" multiple class="sr-only" :accept="ACCEPT" @change="accept($event.target.files)" />
    </label>

    <p class="meta mt-1.5">
      <template v-if="publicFree">Bài học thử / khoá miễn phí: tài liệu sẽ hiện công khai ở mục “Tài liệu miễn phí” trên Learning Hub.</template>
      <template v-else>Chỉ học viên đã đăng ký khoá học mới tải được tài liệu của bài này.</template>
      Nhớ bấm Lưu để giữ thay đổi.
    </p>
  </div>
</template>

<script setup>
/**
 * Files handed out with one lesson, stored on the lesson itself as
 * `item.attachments = [{ name, url, key, size, mime }]`. This view edits the
 * programme draft in place, so the list is mutated directly on `item`; saving
 * the programme is what persists it.
 */
import { computed, ref } from 'vue'
import { uploadMaterial } from '@/services/api.js'
import { useNotify } from '@/composables/useNotify.js'

const props = defineProps({
  item: { type: Object, required: true },
  /** The programme is free, so every lesson's files are public. */
  programFree: { type: Boolean, default: false },
})

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.jpg,.jpeg,.png,.webp'
const MAX_MB = 25

const notify = useNotify()
const input = ref(null)
const uploading = ref([])
const dragging = ref(false)

const list = computed(() => (Array.isArray(props.item.attachments) ? props.item.attachments : []))
const publicFree = computed(() => props.programFree || !!props.item.free)

async function accept(files) {
  if (!files?.length) return
  for (const file of Array.from(files)) {
    if (file.size > MAX_MB * 1024 * 1024) {
      notify.error(`${file.name}: vượt quá ${MAX_MB}MB`)
      continue
    }
    uploading.value = [...uploading.value, file.name]
    try {
      const attachment = await uploadMaterial(file)
      props.item.attachments = [...list.value, attachment]
      notify.success(`Đã tải lên ${attachment.name}. Nhớ bấm Lưu.`)
    } catch (err) {
      notify.error(`${file.name}: ${err?.message || 'tải lên thất bại'}`)
    } finally {
      uploading.value = uploading.value.filter((n) => n !== file.name)
    }
  }
  if (input.value) input.value.value = ''
}

function remove(i) {
  props.item.attachments = list.value.filter((_, idx) => idx !== i)
}

function rename(i, name) {
  const next = [...list.value]
  next[i] = { ...next[i], name: String(name || '').trim() || next[i].name }
  props.item.attachments = next
}

function onDrop(e) {
  dragging.value = false
  accept(e.dataTransfer?.files)
}

function badge(name) {
  const ext = String(name || '').split('.').pop() || ''
  return ext.length <= 4 ? ext.toUpperCase() : 'FILE'
}

function size(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
</script>
