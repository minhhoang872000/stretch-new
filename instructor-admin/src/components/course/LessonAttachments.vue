<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import { useToast } from '~/composables/useToast'
import { MATERIAL_ACCEPT, MATERIAL_MAX_MB, fileBadge, formatSize, uploadMaterial } from '~/services/materials'
import type { Attachment } from '~/types'

/**
 * The files a lesson hands out. Upload sends the bytes straight away; the list
 * is part of the lesson, so the course still has to be SAVED for the file to
 * stick — same as every other field in the editor.
 *
 * On a free lesson (or any lesson of a free course) these files are also listed
 * publicly as "Tài liệu miễn phí" on the Learning Hub — the note under the list
 * says so, because that is not obvious from here.
 */
const props = defineProps<{ attachments?: Attachment[]; free: boolean }>()
const emit = defineEmits<{ update: [Attachment[]] }>()

const toast = useToast()
const input = ref<HTMLInputElement | null>(null)
const uploading = ref<string[]>([])
const dragging = ref(false)

async function accept(files: FileList | null) {
  if (!files?.length) return
  const list = [...(props.attachments ?? [])]
  for (const file of Array.from(files)) {
    if (file.size > MATERIAL_MAX_MB * 1024 * 1024) {
      toast.push(`${file.name}: vượt quá ${MATERIAL_MAX_MB}MB`, 'bad', 5000)
      continue
    }
    uploading.value = [...uploading.value, file.name]
    try {
      const attachment = await uploadMaterial(file)
      list.push(attachment)
      emit('update', [...list])
      toast.push(`Đã tải lên ${attachment.name}. Nhớ bấm Lưu khoá học.`)
    } catch (err: any) {
      toast.push(`${file.name}: ${err?.message || 'tải lên thất bại'}`, 'bad', 6000)
    } finally {
      uploading.value = uploading.value.filter((n) => n !== file.name)
    }
  }
  if (input.value) input.value.value = ''
}

function remove(index: number) {
  emit('update', (props.attachments ?? []).filter((_, i) => i !== index))
}

function rename(index: number, name: string) {
  const list = [...(props.attachments ?? [])]
  list[index] = { ...list[index]!, name: name.trim() || list[index]!.name }
  emit('update', list)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  accept(e.dataTransfer?.files ?? null)
}
</script>

<template>
  <div class="mt-5 border-t border-line pt-4">
    <p class="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-navy">
      <AppIcon name="doc" :size="14" />
      Tài liệu đính kèm
      <span v-if="props.attachments?.length" class="figure text-ink-muted">({{ props.attachments.length }})</span>
    </p>

    <ul v-if="props.attachments?.length" class="mb-2.5 flex flex-col gap-1.5">
      <li
        v-for="(file, i) in props.attachments"
        :key="file.key || file.url"
        class="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2"
      >
        <span class="figure grid h-8 w-10 shrink-0 place-items-center rounded-md bg-shell text-[10px] font-bold text-navy">
          {{ fileBadge(file.name) }}
        </span>
        <input
          :value="file.name"
          class="t-fast min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] hover:border-line focus:border-accent-dark focus:outline-none"
          aria-label="Tên tài liệu hiển thị cho học viên"
          @change="rename(i, ($event.target as HTMLInputElement).value)"
        />
        <span class="figure hidden shrink-0 text-[11px] text-ink-muted sm:inline">{{ formatSize(file.size) }}</span>
        <a
          :href="file.url"
          target="_blank"
          rel="noopener"
          class="t-fast grid size-9 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-shell hover:text-navy"
        >
          <AppIcon name="eye" :size="14" label="Xem tệp" />
        </a>
        <button
          type="button"
          class="t-fast grid size-9 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad"
          @click="remove(i)"
        >
          <AppIcon name="trash" :size="14" label="Gỡ tài liệu" />
        </button>
      </li>
    </ul>

    <label
      class="t-fast flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-4 text-center"
      :class="dragging ? 'border-accent-dark bg-shell' : 'border-line-strong hover:border-accent-dark hover:bg-shell'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <AppIcon name="upload" :size="16" />
      <span class="text-[12.5px] font-semibold text-navy">
        {{ uploading.length ? `Đang tải lên ${uploading.join(', ')}…` : 'Chọn hoặc kéo tệp vào đây' }}
      </span>
      <span class="text-[11px] text-ink-muted">PDF, Word, PowerPoint, Excel, TXT, CSV, ZIP, ảnh · tối đa {{ MATERIAL_MAX_MB }}MB mỗi tệp</span>
      <input ref="input" type="file" multiple class="sr-only" :accept="MATERIAL_ACCEPT" @change="accept(($event.target as HTMLInputElement).files)" />
    </label>

    <p class="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed" :class="props.free ? 'text-good' : 'text-ink-muted'">
      <AppIcon name="info" :size="12" class="mt-0.5 shrink-0" />
      <template v-if="props.free">
        Bài học thử: tài liệu ở đây sẽ hiện công khai trong mục “Tài liệu miễn phí” trên Learning Hub.
      </template>
      <template v-else>
        Chỉ học viên đã đăng ký khoá học mới tải được tài liệu của bài này.
      </template>
    </p>
  </div>
</template>
