<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > 800
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="isVisible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-[800px]">
      <div class="bg-navy/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        <p class="text-white font-medium text-sm md:text-base text-center md:text-left">
          {{ $t('individual_page.floating_cta.text') }}
        </p>
        <div class="flex items-center gap-3">
          <NuxtLink :to="localePath('/booking')" class="btn-orange px-6 py-2.5 text-sm">
            {{ $t('individual_page.floating_cta.cta1') }}
          </NuxtLink>
          <a href="http://zalo.me/4237229823551208502?src=qr&f=1" target="_blank" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white font-heading font-bold text-sm rounded-xl hover:bg-white/20 transition-all border border-white/10">
            {{ $t('individual_page.floating_cta.cta2') }}
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>
