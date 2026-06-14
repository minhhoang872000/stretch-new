<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        @click="close"
      ></div>
      
      <!-- Modal Panel -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden z-10">
        <div class="shrink-0 px-5 py-4 border-b border-surface-container flex justify-between items-center">
          <h3 class="text-base font-headline font-bold text-on-surface">{{ title }}</h3>
          <button
            @click="close"
            class="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors shrink-0"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="p-5 overflow-y-auto flex-1">
          <slot></slot>
        </div>

        <div class="shrink-0 px-5 py-3.5 bg-surface-container-low border-t border-surface-container flex justify-end gap-2.5">
          <button 
            @click="close"
            class="px-4 py-2 rounded-full font-bold text-xs text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="loading"
            :class="['!text-xs', submitClass || 'btn-primary', loading ? 'opacity-60 cursor-not-allowed' : '']"
          >
            <span v-if="loading" class="material-symbols-outlined text-sm animate-spin mr-1">progress_activity</span>
            {{ submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Add Item' },
  submitLabel: { type: String, default: 'Save' },
  loading: { type: Boolean, default: false },
  submitClass: { type: String, default: '' },
})

const emit = defineEmits(['update:isOpen', 'submit'])

const close = () => {
  emit('update:isOpen', false)
}

const submit = () => {
  emit('submit')
}
</script>
