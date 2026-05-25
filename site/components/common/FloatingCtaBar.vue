<script setup lang="ts">
const localePath = useLocalePath()
const { openContact } = useContact()
const isVisible = ref(false)
const isDismissed = ref(false)
const isShaking = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Start periodic shake
  setInterval(() => {
    if (isVisible.value) {
      isShaking.value = true
      setTimeout(() => isShaking.value = false, 1000)
    }
  }, 6000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

let scrollTimeout: number | null = null

function handleScroll() {
  if (isDismissed.value) return

  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
  scrollTimeout = requestAnimationFrame(() => {
    const scrollY = window.scrollY
    const docHeight = document.documentElement.scrollHeight
    const winHeight = window.innerHeight

    // Show after 400px scroll, hide when near footer (last 400px)
    const nearBottom = scrollY + winHeight > docHeight - 400
    isVisible.value = scrollY > 400 && !nearBottom
  })
}

function dismiss() {
  isDismissed.value = true
  isVisible.value = false
}
</script>

<template>
  <Transition name="float-bar">
    <div
      v-if="isVisible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[900px]"
    >
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-border-default shadow-float px-6 py-4 lg:px-8 lg:py-5">
        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <!-- Text -->
          <div class="flex-1 text-center sm:text-left">
            <p class="text-sm font-heading font-semibold text-navy">{{ $t('cta_bar.title') }}</p>
            <p class="text-xs text-text-secondary mt-0.5">{{ $t('cta_bar.subtitle') }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <NuxtLink :to="localePath('/booking')" class="btn-orange text-sm px-5 py-2.5">
              {{ $t('nav.bookSession') }}
            </NuxtLink>
            <button 
              @click="openContact"
              class="btn-outline text-sm px-5 py-2.5 transition-all"
              :class="isShaking ? 'shake-button' : ''"
            >
              {{ $t('cta_bar.get_advice') }}
            </button>
          </div>

          <!-- Close -->
          <button
            @click="dismiss"
            class="absolute top-3 right-3 sm:static w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-navy hover:bg-off-white transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/>
              <line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes shake-btn {
  0% { transform: scale(1); }
  10% { transform: scale(1.05) rotate(-2deg); }
  20% { transform: scale(1.05) rotate(2deg); }
  30% { transform: scale(1.05) rotate(-2deg); }
  40% { transform: scale(1.05) rotate(2deg); }
  50% { transform: scale(1) rotate(0); }
  100% { transform: scale(1) rotate(0); }
}
.shake-button {
  animation: shake-btn 0.6s ease-in-out;
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.float-bar-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.float-bar-leave-active {
  transition: all 0.3s ease;
}
.float-bar-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}
.float-bar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
