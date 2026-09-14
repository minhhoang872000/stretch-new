<template>
  <Teleport to="body">
    <Transition name="slide-over">
      <div v-if="open" class="fixed inset-0 z-overlay flex justify-end" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-ink/25" @click="close" />

        <aside
          ref="panel"
          class="relative h-full bg-panel border-l border-line shadow-pop flex flex-col w-full"
          :class="widthClass"
          @keydown.esc="close"
        >
          <header class="shrink-0 px-4 py-3 border-b border-line flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <p v-if="eyebrow" class="label-xs mb-0.5">{{ eyebrow }}</p>
              <h2 class="text-base font-headline font-bold text-ink truncate">{{ title }}</h2>
              <p v-if="subtitle" class="meta mt-0.5 truncate">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost btn-sm btn-icon shrink-0"
              aria-label="Đóng bảng"
              @click="close"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-4 py-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="shrink-0 px-4 py-3 border-t border-line bg-panel-2 flex items-center gap-2 justify-end"
          >
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

/**
 * Editing happens in a slide-over, not a modal.
 *
 * A modal blocks the row you are editing; a panel keeps the list visible on the
 * left, which is what makes "edit five bookings in a row" bearable.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg | xl
})

const emit = defineEmits(['update:open', 'close'])

const panel = ref(null)

const WIDTHS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}
const widthClass = computed(() => WIDTHS[props.size] || WIDTHS.md)

function close() {
  emit('update:open', false)
  emit('close')
}

/** Move focus into the panel so Esc and Tab land somewhere sensible. */
watch(() => props.open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  const target = panel.value?.querySelector('[data-autofocus]') || panel.value
  target?.focus?.()
})
</script>

<style scoped>
.slide-over-enter-active,
.slide-over-leave-active {
  transition: opacity 180ms ease;
}
.slide-over-enter-active aside,
.slide-over-leave-active aside {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-over-enter-from,
.slide-over-leave-to {
  opacity: 0;
}
.slide-over-enter-from aside,
.slide-over-leave-to aside {
  transform: translateX(16px);
}
</style>
