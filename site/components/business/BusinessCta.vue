<script setup lang="ts">
const { trackCTA } = useTracking()
</script>

<template>
  <section class="w-full bg-[#021327] py-10 md:py-14 relative overflow-hidden border-t border-white/5">
    <!-- Subtle background texture -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.02]" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;" />

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 relative z-10 w-full">
      
      <!-- Top Row: Trust & Partners -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-6 pb-8">
        <!-- Title on the left -->
        <div class="w-full lg:max-w-[340px] text-left">
          <h3 class="text-xl md:text-2xl font-heading font-extrabold text-white leading-tight">
            {{ $t('business_page.trust.heading') }}
          </h3>
        </div>
        
        <!-- White Partner Logos on the right -->
        <div class="w-full lg:flex-1 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 md:gap-8 lg:gap-10">
          
          <!-- Logo 1: Adidas -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto h-8 text-white/70 hover:text-white transition-all duration-300">
            <svg viewBox="0 0 24 24" class="h-7 md:h-8 w-auto" fill="currentColor">
              <path d="M2.5 18h3.3l5.5-9.6H8L2.5 18zm5.5 0h3.3l7.5-13.1h-3.3L8 18zm5.5 0H17.3L23 8h-3.3l-4.2 10z"/>
            </svg>
          </div>

          <!-- Logo 2: Garmin -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto h-8 text-white/70 hover:text-white transition-all duration-300">
            <svg viewBox="0 0 100 24" class="h-4 md:h-[18px] w-auto" fill="currentColor">
              <text x="0" y="18" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="16" letter-spacing="1.5">GARMIN</text>
              <polygon points="90,6 96,16 84,16" />
            </svg>
          </div>

          <!-- Logo 3: Standard Chartered -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto text-white/70 hover:text-white transition-all duration-300 text-center font-sans tracking-widest text-[9px] md:text-[11px] font-extrabold leading-tight">
            STANDARD<br/>CHARTERED
          </div>

          <!-- Logo 4: Vinfast -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto text-white/70 hover:text-white transition-all duration-300 text-center font-sans tracking-[0.25em] text-[13px] md:text-[15px] font-black uppercase">
            VINFAST
          </div>

          <!-- Logo 5: Viettel -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto text-white/70 hover:text-white transition-all duration-300 text-center font-sans text-[15px] md:text-[18px] font-extrabold tracking-wide lowercase">
            viettel
          </div>

          <!-- Logo 6: Manulife -->
          <div class="flex items-center justify-center w-[30%] sm:w-[22%] lg:w-auto text-white/70 hover:text-white transition-all duration-300 text-center font-sans text-[15px] md:text-[18px] font-black tracking-tight">
            Manulife
          </div>

        </div>
      </div>

      <!-- Divider line -->
      <div class="w-full border-t border-white/10 my-2 md:my-4"></div>

      <!-- Bottom Row: CTA & Actions -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-8">
        <!-- Title & Subtitle on the left -->
        <div class="w-full lg:flex-1 text-left">
          <h2 class="text-2xl md:text-3xl font-heading font-extrabold text-[#FF5500] mb-2 leading-tight">
            {{ $t('business_page.cta.heading') }}
          </h2>
          <p class="text-white/75 text-[15px] md:text-base font-normal">
            {{ $t('business_page.cta.sub') }}
          </p>
        </div>

        <!-- Buttons on the right -->
        <div class="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-4">
          <!-- Button 1: Solid Orange -->
          <NuxtLink
            to="#"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#FF5500] hover:bg-[#E64C00] text-white font-heading font-bold text-[15px] rounded-lg shadow-lg shadow-[#FF5500]/20 transition-all cursor-pointer"
            @click="trackCTA('business-cta-book', 'corporate')"
          >
            {{ $t('business_page.cta.cta1') }}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>

          <!-- Button 2: Border outline -->
          <NuxtLink
            to="#"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-transparent border border-white/20 hover:border-white/40 text-white font-heading font-bold text-[15px] rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            @click="trackCTA('business-cta-contact', 'corporate')"
          >
            {{ $t('business_page.cta.cta2') }}
          </NuxtLink>
        </div>
      </div>

    </div>
  </section>
</template>
