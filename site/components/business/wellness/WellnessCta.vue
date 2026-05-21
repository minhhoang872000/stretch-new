<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="w-full bg-navy py-10 md:py-12 px-6 md:px-10 lg:px-16 overflow-hidden">
    <div class="max-w-[1340px] mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
      <!-- Left Column: Title and Subtitle -->
      <div class="text-left flex-1 w-full">
        <h3 class="font-heading font-bold text-white text-[20px] md:text-[24px] lg:text-[26px] leading-tight mb-2 tracking-tight">
          {{ $t('wellness_page.cta.title') }}
        </h3>
        <p class="text-white/60 text-[14px] md:text-[15px] font-medium">
          {{ $t('wellness_page.cta.sub') }}
        </p>
      </div>
      
      <!-- Right Column: Horizontal Buttons -->
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0 z-10">
        <!-- Button 1: Request Wellness Plan -->
        <a
          href="https://zalo.me/4237229823551208502"
          target="_blank"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent/90 text-white font-heading font-bold text-[14px] md:text-[15px] rounded-xl transition-all shadow-md shadow-accent/10 active:scale-[0.98]"
        >
          <span>{{ $t('wellness_page.cta.cta1') }}</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
            <line x1="4" y1="10" x2="16" y2="10"/>
            <polyline points="10 4 16 10 10 16"/>
          </svg>
        </a>
        
        <!-- Button 2: Talk to Team -->
        <a
          href="https://zalo.me/4237229823551208502"
          target="_blank"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-white/20 hover:border-white/40 text-white font-heading font-bold text-[14px] md:text-[15px] rounded-xl hover:bg-white/5 transition-all active:scale-[0.98]"
        >
          <span>{{ $t('wellness_page.cta.cta2') }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 text-white/80">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>
