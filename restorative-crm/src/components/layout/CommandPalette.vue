<template>
  <Teleport to="body">
    <Transition name="palette">
      <div
        v-if="layout.isPaletteOpen"
        class="fixed inset-0 z-palette flex items-start justify-center pt-[12vh] px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Tìm nhanh"
      >
        <div class="absolute inset-0 bg-ink/30" @click="layout.closePalette" />

        <div class="relative w-full max-w-xl panel shadow-pop overflow-hidden">
          <div class="flex items-center gap-2 px-3 h-12 border-b border-line">
            <span class="material-symbols-outlined text-xl text-ink-3" aria-hidden="true">search</span>
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              class="flex-1 bg-transparent border-0 text-sm text-ink placeholder:text-ink-4
                     focus:outline-none focus:ring-0"
              placeholder="Đi tới trang, hoặc gõ việc cần làm…"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="go(results[cursor])"
              @keydown.esc="layout.closePalette"
            />
            <span class="kbd">esc</span>
          </div>

          <ul v-if="results.length" class="max-h-[52vh] overflow-y-auto p-1.5">
            <template v-for="(item, i) in results" :key="item.key">
              <li
                v-if="i === 0 || results[i - 1].group !== item.group"
                class="label-xs px-2 pt-2.5 pb-1"
              >{{ item.group }}</li>
              <li>
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 h-9 px-2 rounded-md text-left
                         text-[0.8125rem] font-semibold transition-colors"
                  :class="i === cursor ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:bg-panel-3'"
                  @click="go(item)"
                  @mousemove="cursor = i"
                >
                  <span class="material-symbols-outlined text-lg shrink-0 text-ink-3">{{ item.icon }}</span>
                  <span class="truncate">{{ item.label }}</span>
                  <span v-if="item.count" class="num chip chip-warn ml-auto">{{ item.count }}</span>
                  <span
                    v-else-if="i === cursor"
                    class="material-symbols-outlined text-base ml-auto text-accent"
                    aria-hidden="true"
                  >keyboard_return</span>
                </button>
              </li>
            </template>
          </ul>

          <div v-else class="px-4 py-8 text-center">
            <p class="text-sm font-bold text-ink">Không tìm thấy “{{ query }}”</p>
            <p class="mt-1 text-xs text-ink-3">Thử tên module: chương trình, lịch hẹn, đơn hàng, chứng nhận…</p>
          </div>

          <div class="px-3 py-2 border-t border-line bg-panel-2 flex items-center gap-3">
            <span class="meta flex items-center gap-1"><span class="kbd">↑</span><span class="kbd">↓</span> di chuyển</span>
            <span class="meta flex items-center gap-1"><span class="kbd">↵</span> mở</span>
            <span class="meta ml-auto">{{ results.length }} kết quả</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout.js'
import { useMockDb } from '@/stores/db.js'
import { navIndex, paletteActions } from '@/data/navigation.js'

/**
 * Ctrl/⌘-K palette.
 *
 * With ~30 screens, scanning the sidebar is slower than typing three letters —
 * and the badge counts ride along, so "đánh giá" also tells you how many are
 * waiting before you commit to the click.
 */
const layout = useLayoutStore()
const router = useRouter()
const db = useMockDb()

const query = ref('')
const cursor = ref(0)
const inputEl = ref(null)

const BADGE_BY_PATH = {
  '/bookings': 'bookingsPending',
  '/sales/orders': 'ordersPending',
  '/academy/reviews': 'reviewsPending',
  '/enquiries': 'enquiriesNew',
  '/academy/videos': 'videosMissing',
}

const entries = computed(() => [
  ...navIndex.map((item) => ({
    key: item.path,
    label: item.label,
    group: item.group,
    icon: item.icon,
    to: item.path,
    count: db.counts[BADGE_BY_PATH[item.path]] || 0,
  })),
  ...paletteActions.map((a) => ({ key: a.id, label: a.label, group: a.group, icon: a.icon, to: a.to, count: 0 })),
])

/** Diacritic-insensitive match, so "danh gia" finds "Đánh giá". */
function fold(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
}

const results = computed(() => {
  const q = fold(query.value.trim())
  if (!q) return entries.value
  const terms = q.split(/\s+/)
  return entries.value.filter((item) => {
    const haystack = fold(`${item.label} ${item.group} ${item.to}`)
    return terms.every((t) => haystack.includes(t))
  })
})

watch(results, () => { cursor.value = 0 })

function move(step) {
  if (!results.value.length) return
  cursor.value = (cursor.value + step + results.value.length) % results.value.length
}

function go(item) {
  if (!item) return
  layout.closePalette()
  router.push(item.to)
}

watch(() => layout.isPaletteOpen, async (open) => {
  if (!open) return
  query.value = ''
  cursor.value = 0
  await nextTick()
  inputEl.value?.focus()
})

function onKeydown(event) {
  const key = event.key?.toLowerCase()
  if ((event.ctrlKey || event.metaKey) && key === 'k') {
    event.preventDefault()
    layout.togglePalette()
    return
  }
  // "/" is a shortcut only when not already typing into a field.
  const tag = document.activeElement?.tagName
  if (key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !layout.isPaletteOpen) {
    event.preventDefault()
    layout.openPalette()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.palette-enter-active,
.palette-leave-active {
  transition: opacity 140ms ease;
}
.palette-enter-active .panel,
.palette-leave-active .panel {
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}
.palette-enter-from .panel,
.palette-leave-to .panel {
  transform: translateY(-8px) scale(0.99);
}
</style>
