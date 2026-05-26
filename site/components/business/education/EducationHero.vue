<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative bg-white pt-16 lg:pt-0 overflow-hidden min-h-[420px] lg:min-h-[520px] flex flex-col justify-center">
    <div class="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center">
      <!-- Left: Content -->
      <div class="w-full lg:w-[55%] px-6 md:px-10 lg:px-16 py-8 lg:py-16">
        <div class="w-full max-w-[580px]">
          <!-- Eyebrow -->
          <p class="text-[13px] font-heading font-bold text-[#F47A1F] uppercase tracking-[0.1em] mb-3">
            {{ $t('education_page.hero.label') }}
          </p>
          
          <!-- Heading -->
          <h1 class="font-heading font-bold text-navy text-[32px] md:text-[42px] lg:text-[48px] leading-[1.15] mb-5 tracking-tight">
            {{ $t('education_page.hero.heading') }}
          </h1>
          
          <!-- Subtext -->
          <p class="text-[15px] md:text-[16px] text-navy/70 leading-relaxed font-light max-w-[480px] mb-6">
            {{ $t('education_page.hero.subtext') }}
          </p>
          
          <!-- CTAs -->
          <div class="flex flex-wrap items-center gap-4">
            <a
              href="https://zalo.me/4237229823551208502"
              target="_blank"
              class="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-heading font-bold text-[15px] rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              {{ $t('education_page.hero.cta1') }}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <a
              href="https://zalo.me/4237229823551208502"
              target="_blank"
              class="inline-flex items-center gap-3 px-8 py-4 bg-white border border-navy/20 text-navy font-heading font-bold text-[15px] rounded-xl hover:border-navy/40 hover:bg-navy/5 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {{ $t('education_page.hero.cta2') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Right: Mobile/Tablet Flow Image -->
      <div class="w-full lg:hidden px-6 pb-12">
        <NuxtImg
          src="/images/education-solution.png"
          alt="Education & Training Session"
          class="w-full aspect-[4/3] object-cover rounded-2xl"
          fetchpriority="high"
          format="webp"
        />
      </div>
    </div>

    <!-- Right: Absolute Image Bleeding to Right Edge (Desktop Only) -->
    <div class="hidden lg:block absolute right-0 top-0 bottom-0 w-[42%] xl:w-[40%] 2xl:w-[38%] max-w-[850px] xl:max-w-[950px] 2xl:max-w-[1100px] h-full z-0">
      <!-- Fade mask for desktop: extra wide gradient to guarantee text readability and flawless aesthetics -->
      <div class="absolute inset-y-0 left-0 w-[200px] xl:w-[350px] bg-gradient-to-r from-white via-white/95 via-white/60 to-transparent z-10" />
      <NuxtImg
        src="/images/education-solution.png"
        alt="Education & Training Session"
        class="w-full h-full object-cover object-[center_right] rounded-l-[40px]"
        fetchpriority="high"
        format="webp"
      />
    </div>
  </section>
</template>
