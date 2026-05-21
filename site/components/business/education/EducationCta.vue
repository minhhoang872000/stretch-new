<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-12 bg-[#021327] w-full text-white relative overflow-hidden">
    <!-- Subtle background mesh gradient decoration for premium feeling -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#09264a,transparent_60%)] opacity-40"></div>
    
    <div class="max-w-[1340px] mx-auto px-6 md:px-10 relative z-10">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-2">
        
        <!-- Left Column: Titles -->
        <div class="text-left">
          <h2 class="font-heading font-bold text-white text-[24px] md:text-[28px] leading-[1.25] tracking-tight">
            {{ $t('education_page.cta.title') }}
          </h2>
          <p class="text-white/70 text-[14px] leading-relaxed mt-2 font-medium">
            {{ $t('education_page.cta.sub') }}
          </p>
        </div>
        
        <!-- Right Column: Buttons Row -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <!-- Button 1: Solid Orange with Arrow -->
          <a
            href="https://zalo.me/4237229823551208502"
            target="_blank"
            class="inline-flex justify-center items-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-heading font-extrabold text-[14px] rounded-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-[#FF5500]/15"
          >
            {{ $t('education_page.cta.cta1') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>

          <!-- Button 2: Outline White with Speech Bubble -->
          <a
            href="https://zalo.me/4237229823551208502"
            target="_blank"
            class="inline-flex justify-center items-center gap-2 px-6 py-3 bg-transparent border border-white/30 hover:border-white/60 text-white font-heading font-extrabold text-[14px] rounded-lg hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {{ $t('education_page.cta.cta2') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </div>

      </div>
    </div>
  </section>
</template>
