<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative bg-white pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
    <div class="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center relative">
      <!-- Left: Content -->
      <div class="relative z-10 w-full lg:w-[55%] px-6 md:px-10 lg:pl-[max(3rem,calc((100vw-1400px)/2+3rem))] lg:pr-8 py-10 lg:py-0">
        <div class="w-full max-w-[560px]">
          <!-- Eyebrow -->
          <p class="text-[13px] font-heading font-bold text-[#F47A1F] uppercase tracking-[0.1em] mb-4">
            {{ $t('wellness_page.hero.label') }}
          </p>
          
          <!-- Heading -->
          <h1 class="font-heading font-bold text-navy text-[44px] leading-[1.1] md:text-[56px] lg:text-[64px] mb-6 tracking-tight">
            {{ $t('wellness_page.hero.heading') }}
          </h1>
          
          <!-- Subtext -->
          <p class="text-[18px] text-navy/70 leading-relaxed font-light max-w-[480px] mb-10">
            {{ $t('wellness_page.hero.subtext') }}
          </p>
          
          <!-- CTAs -->
          <div class="flex flex-wrap items-center gap-4">
            <NuxtLink
              to="#"
              class="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-heading font-bold text-[15px] rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              {{ $t('wellness_page.hero.cta1') }}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </NuxtLink>
            <NuxtLink
              to="#"
              class="inline-flex items-center gap-3 px-8 py-4 bg-white border border-navy/20 text-navy font-heading font-bold text-[15px] rounded-xl hover:border-navy/40 hover:bg-navy/5 transition-all"
            >
              {{ $t('wellness_page.hero.cta2') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Right: Image -->
      <div class="w-full lg:w-[45%] lg:absolute lg:right-0 lg:top-0 lg:h-full min-h-[400px] relative mt-10 lg:mt-0">
        <!-- Fade mask for desktop -->
        <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 hidden lg:block" />
        <img
          src="/images/wellness-solution.png"
          alt="Corporate Wellness Program"
          class="w-full h-full object-cover object-center lg:rounded-l-[40px]"
        />
      </div>
    </div>
  </section>
</template>
