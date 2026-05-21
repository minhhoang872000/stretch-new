<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const isVisible = ref(false)
const isDismissed = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  if (isDismissed.value) return

  const scrollY = window.scrollY
  const docHeight = document.documentElement.scrollHeight
  const winHeight = window.innerHeight

  // Show after 600px scroll, hide when near footer
  const nearBottom = scrollY + winHeight > docHeight - 400
  isVisible.value = scrollY > 600 && !nearBottom
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
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[1000px]"
    >
      <div class="bg-white/90 backdrop-blur-2xl rounded-[100px] border border-navy/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-4 py-3 md:px-10 md:py-4">
        <div class="flex items-center gap-4 md:gap-10">
          
          <!-- Left: Team Icon -->
          <div class="hidden sm:flex w-12 h-12 rounded-full bg-navy/5 border border-navy/10 items-center justify-center text-navy shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>

          <!-- Center: Text -->
          <div class="flex-1 min-w-0">
            <h4 class="text-[15px] md:text-[17px] font-heading font-bold text-navy truncate leading-tight">
              {{ $t('business_cta_bar.title') }}
            </h4>
            <p class="text-[12px] md:text-[13px] text-navy/50 font-medium truncate">
              {{ $t('business_cta_bar.subtitle') }}
            </p>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 md:gap-6 shrink-0">
            <!-- Talk to Team -->
            <a href="http://zalo.me/4237229823551208502?src=qr&f=1" target="_blank" class="flex items-center gap-2.5 group transition-all">
              <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span class="hidden md:inline text-[15px] font-heading font-bold text-navy/80 group-hover:text-navy">
                {{ $t('business_cta_bar.talk') }}
              </span>
            </a>

            <!-- Divider -->
            <div class="h-8 w-px bg-navy/10 hidden md:block"></div>

            <!-- Request Proposal -->
            <a href="http://zalo.me/4237229823551208502?src=qr&f=1" target="_blank" class="flex items-center gap-2.5 group transition-all">
              <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <span class="hidden md:inline text-[15px] font-heading font-bold text-navy/80 group-hover:text-navy">
                {{ $t('business_cta_bar.proposal') }}
              </span>
            </a>
          </div>

          <!-- Mobile close button (optional but good for UX) -->
          <button
            @click="dismiss"
            class="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-navy/20 hover:text-navy transition-colors md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.float-bar-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.float-bar-leave-active {
  transition: all 0.4s ease;
}
.float-bar-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}
.float-bar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(40px);
}
</style>
