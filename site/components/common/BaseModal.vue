<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

// Close on Escape
onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="close"
        />

        <!-- Modal Content -->
        <div
          class="relative bg-white rounded-4xl shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <!-- Close Button -->
          <button
            class="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center
                   hover:bg-surface-container-highest transition-colors z-10"
            @click="close"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Title -->
          <div v-if="title" class="px-8 pt-8 pb-4">
            <h3 class="font-heading font-bold text-heading-lg">{{ title }}</h3>
          </div>

          <!-- Slot -->
          <div class="px-8 pb-8" :class="title ? '' : 'pt-8'">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95) translateY(10px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
}
</style>
