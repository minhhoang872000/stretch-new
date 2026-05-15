<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="py-16 px-4 md:px-10 bg-white">
    <div class="max-w-[1200px] mx-auto bg-navy rounded-[32px] p-10 md:p-14 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
      <div class="flex-1 text-center lg:text-left">
        <h2 class="font-heading font-bold text-white text-[32px] md:text-[40px] leading-[1.2] mb-4 max-w-[600px] mx-auto lg:mx-0">
          {{ $t('education_page.cta.title') }}
        </h2>
        <p class="text-white/70 text-[18px]">
          {{ $t('education_page.cta.sub') }}
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        <NuxtLink
          to="#"
          class="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-heading font-bold text-[15px] rounded-xl transition-all shadow-lg shadow-accent/20 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {{ $t('education_page.cta.cta1') }}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </NuxtLink>
        <NuxtLink
          to="#"
          class="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white font-heading font-bold text-[15px] rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {{ $t('education_page.cta.cta2') }}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
