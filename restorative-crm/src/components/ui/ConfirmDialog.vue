<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="open"
        class="fixed inset-0 z-overlay flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="absolute inset-0 bg-ink/30" @click="cancel" />
        <div ref="panel" class="relative panel shadow-pop w-full max-w-sm p-4" @keydown.esc="cancel">
          <div class="flex items-start gap-3">
            <span
              class="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              :class="danger ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent-ink'"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined text-xl">{{ icon }}</span>
            </span>
            <div class="min-w-0">
              <h2 class="text-base font-headline font-bold text-ink">{{ title }}</h2>
              <p v-if="message" class="mt-1 text-[0.8125rem] text-ink-2">{{ message }}</p>
              <slot />
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="btn-ghost" @click="cancel">{{ cancelLabel }}</button>
            <button
              ref="confirmBtn"
              type="button"
              :class="danger ? 'btn-danger' : 'btn-primary'"
              @click="confirm"
            >{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

/**
 * Replaces window.confirm.
 *
 * The native dialog cannot say *what* is being deleted, cannot be styled, and
 * on some browsers is suppressed entirely — none of which you want in front of
 * a destructive action.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Đồng ý' },
  cancelLabel: { type: String, default: 'Huỷ' },
  danger: { type: Boolean, default: false },
  icon: { type: String, default: 'help' },
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

const confirmBtn = ref(null)

function cancel() {
  emit('update:open', false)
  emit('cancel')
}

function confirm() {
  emit('update:open', false)
  emit('confirm')
}

/** Focus the confirm button so Enter and Esc both do the obvious thing. */
watch(() => props.open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  confirmBtn.value?.focus()
})
</script>

<style scoped>
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 140ms ease;
}
.confirm-enter-active .panel,
.confirm-leave-active .panel {
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
.confirm-enter-from .panel,
.confirm-leave-to .panel {
  transform: scale(0.98);
}
</style>
