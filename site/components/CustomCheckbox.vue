<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label?: string
  error?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div 
    class="custom-checkbox-container" 
    @click="toggle"
    :class="{ 'is-checked': modelValue, 'has-error': error }"
  >
    <div class="custom-checkbox-box">
      <Transition name="check">
        <svg v-if="modelValue" class="w-3.5 h-3.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Transition>
    </div>
    <span v-if="label" class="custom-checkbox-label">
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.custom-checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--color-border);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  flex-shrink: 0;
}

.custom-checkbox-container:hover .custom-checkbox-box {
  border-color: var(--color-navy-soft);
}

.custom-checkbox-container.is-checked .custom-checkbox-box {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.custom-checkbox-container.has-error .custom-checkbox-box {
  border-color: #ef4444;
}

.custom-checkbox-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.custom-checkbox-container:hover .custom-checkbox-label {
  color: var(--color-navy);
}

/* Checkmark Animation */
.check-enter-active {
  animation: check-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-leave-active {
  transition: opacity 0.1s ease;
}

.check-leave-to {
  opacity: 0;
}

@keyframes check-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
