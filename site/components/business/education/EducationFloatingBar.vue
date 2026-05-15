<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const isVisible = ref(false)
const isClosed = ref(false)

const handleScroll = () => {
  if (isClosed.value) return
  isVisible.value = window.scrollY > 500
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible && !isClosed"
      class="fixed bottom-6 right-6 lg:right-10 z-50 animate-fade-in-up"
    >
      <div class="bg-white rounded-2xl shadow-2xl border border-navy/5 p-3 flex flex-col sm:flex-row items-center gap-4 max-w-[calc(100vw-3rem)]">
        <p class="text-navy font-medium px-3 whitespace-nowrap hidden sm:block text-[15px]">
          {{ $t('education_page.floating.text') }}
        </p>
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <NuxtLink
            to="#"
            class="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 border border-navy/10 text-navy font-heading font-bold text-[13px] rounded-xl hover:bg-navy/5 transition-colors"
          >
            {{ $t('education_page.floating.cta1') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </NuxtLink>
          <NuxtLink
            to="#"
            class="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-heading font-bold text-[13px] rounded-xl transition-colors shadow-md shadow-accent/20"
          >
            {{ $t('education_page.floating.cta2') }}
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
          <button
            class="p-2 text-navy/40 hover:text-navy/80 hover:bg-navy/5 rounded-lg transition-colors ml-1"
            @click="isClosed = true"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
