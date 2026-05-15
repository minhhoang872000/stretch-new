<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string | null
  options: string[] | { label: string, value: string }[]
  placeholder?: string
  error?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: string | { label: string, value: string }) => {
  const value = typeof option === 'string' ? option : option.value
  emit('update:modelValue', value)
  isOpen.value = false
}

const getLabel = (value: string | null) => {
  if (!value) return props.placeholder || 'Select option'
  const option = props.options.find(opt => {
    if (typeof opt === 'string') return opt === value
    return opt.value === value
  })
  if (!option) return value
  return typeof option === 'string' ? option : option.label
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="custom-select-container" ref="containerRef">
    <button 
      type="button"
      @click="toggle"
      class="custom-select-trigger"
      :class="{ 'is-open': isOpen, 'has-error': error }"
    >
      <span :class="{ 'placeholder': !modelValue }">{{ getLabel(modelValue) }}</span>
      <span class="material-symbols-outlined transition-transform duration-300" :class="{ 'rotate-180': isOpen }">
        expand_more
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="custom-select-options">
        <div 
          v-for="option in options" 
          :key="typeof option === 'string' ? option : option.value"
          class="custom-select-option"
          :class="{ 'is-selected': (typeof option === 'string' ? option : option.value) === modelValue }"
          @click="selectOption(option)"
        >
          {{ typeof option === 'string' ? option : option.label }}
          <span v-if="(typeof option === 'string' ? option : option.value) === modelValue" class="material-symbols-outlined !text-sm">
            check
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select-container {
  position: relative;
  width: 100%;
}

.custom-select-trigger {
  width: 100%;
  height: 3.5rem;
  padding: 0 1.5rem;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-navy);
}

.custom-select-trigger:hover {
  border-color: var(--color-navy-soft);
}

.custom-select-trigger.is-open {
  background: white;
  border-color: var(--color-navy);
  box-shadow: 0 0 0 3px rgba(11, 42, 74, 0.08);
}

.custom-select-trigger.has-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.custom-select-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  max-height: 250px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-float);
  z-index: 100;
  overflow-y: auto;
  padding: 0.5rem;
}

.custom-select-option {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  color: var(--color-navy);
}

.custom-select-option:hover {
  background: var(--color-off-white);
}

.custom-select-option.is-selected {
  background: var(--color-off-white);
  color: var(--color-accent);
  font-weight: 600;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
