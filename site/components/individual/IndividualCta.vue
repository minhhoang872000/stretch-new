<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="py-8 lg:py-12">
    <div class="section-container">
      <div class="bg-[#021327] rounded-[1.5rem] lg:rounded-[2rem] px-6 py-8 lg:px-10 lg:py-8 overflow-hidden relative border border-white/5 shadow-xl">
        <!-- Subtle texture -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.02]" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;" />
        
        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <!-- Text Content -->
          <div class="w-full lg:w-1/2 text-center lg:text-left">
            <h2 class="text-[22px] lg:text-[28px] font-heading font-bold text-white mb-2 leading-snug">
              {{ $t('individual_page.final_cta.title') }}
            </h2>
            <p class="text-white/80 text-[15px] lg:text-[17px]">
              We're here to help you move and feel your best.
            </p>
          </div>

          <!-- Buttons -->
          <div class="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 shrink-0">
            <NuxtLink :to="localePath('/booking')" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FF7A45] text-white font-heading font-bold text-[15px] rounded-lg hover:bg-[#E66A35] shadow-lg shadow-[#FF7A45]/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              {{ $t('individual_page.final_cta.cta1') }}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </NuxtLink>
            <a href="#" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/30 text-white font-heading font-bold text-[15px] rounded-lg hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              {{ $t('individual_page.final_cta.cta2') }}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </a>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
