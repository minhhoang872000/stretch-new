<template>
  <Transition name="progress-fade">
    <div v-if="store.active" class="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none overflow-hidden">
      <!-- Track -->
      <div class="absolute inset-0 bg-emerald-500/10"></div>
      <!-- Bar -->
      <div
        class="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
        :style="{
          width: store.progress + '%',
          transition: store.progress === 100
            ? 'width 0.25s ease-in'
            : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 12px 2px rgba(52, 211, 153, 0.6), 0 0 4px 1px rgba(52, 211, 153, 0.8)'
        }"
      ></div>
      <!-- Shimmer -->
      <div
        class="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
        :style="{ left: Math.max(0, store.progress - 12) + '%' }"
      ></div>
    </div>
  </Transition>
</template>

<script setup>
import { useLoadingStore } from '@/stores/loading.js'
const store = useLoadingStore()
</script>

<style scoped>
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.2s ease;
}
.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateX(500%); opacity: 0; }
}
.animate-shimmer {
  animation: shimmer 1.4s ease-in-out infinite;
}
</style>
