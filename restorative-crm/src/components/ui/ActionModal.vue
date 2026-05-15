<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        @click="close"
      ></div>
      
      <!-- Modal Panel -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div class="px-5 py-4 border-b border-surface-container flex justify-between items-center">
          <h3 class="text-base font-headline font-bold text-on-surface">{{ title }}</h3>
          <button 
            @click="close"
            class="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div class="p-5">
          <slot></slot>
        </div>
        
        <div class="px-5 py-3.5 bg-surface-container-low border-t border-surface-container flex justify-end gap-2.5">
          <button 
            @click="close"
            class="px-4 py-2 rounded-full font-bold text-xs text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="submit"
            class="btn-primary !text-xs"
          >
            {{ submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Add Item'
  },
  submitLabel: {
    type: String,
    default: 'Save'
  }
})

const emit = defineEmits(['update:isOpen', 'submit'])

const close = () => {
  emit('update:isOpen', false)
}

const submit = () => {
  emit('submit')
}
</script>
