<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-12 lg:py-16 bg-white px-4 md:px-10 overflow-hidden">
    <div class="max-w-[1200px] mx-auto relative">
      <!-- Decorative background blur -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div class="bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FA] rounded-[32px] p-8 md:p-12 lg:p-14 flex flex-col items-center border border-navy/5 shadow-sm relative z-10">
        <h2 class="font-heading font-bold text-navy text-[28px] md:text-[36px] text-center mb-4 tracking-tight">
          {{ $t('wellness_page.why.title') }}
        </h2>
        <p class="text-navy/70 text-[15px] md:text-[16px] text-center mb-12 max-w-[640px] font-light">
          {{ $t('wellness_page.why.statement') }}
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <!-- Item 1 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-16 h-16 rounded-[20px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-10 transition-transform duration-500 group-hover:scale-110"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[17px] mb-2 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('wellness_page.why.real') }}</h3>
            <p class="text-navy/60 text-[14px] leading-relaxed max-w-[260px] group-hover:text-navy/80 transition-colors duration-300">Programs designed from the physical challenges your team faces every day.</p>
          </div>
          
          <!-- Item 2 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-16 h-16 rounded-[20px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-10 transition-transform duration-500 group-hover:scale-110"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M15 21V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v14"/><path d="M2 21h20"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[17px] mb-2 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('wellness_page.why.designed') }}</h3>
            <p class="text-navy/60 text-[14px] leading-relaxed max-w-[260px] group-hover:text-navy/80 transition-colors duration-300">Flexible setup that works in offices, meeting rooms, or small spaces.</p>
          </div>
          
          <!-- Item 3 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-16 h-16 rounded-[20px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-10 transition-transform duration-500 group-hover:scale-110"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[17px] mb-2 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('wellness_page.why.simple') }}</h3>
            <p class="text-navy/60 text-[14px] leading-relaxed max-w-[260px] group-hover:text-navy/80 transition-colors duration-300">Clear guidance your team can understand and apply right away.</p>
          </div>
          
          <!-- Item 4 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-16 h-16 rounded-[20px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-10 transition-transform duration-500 group-hover:scale-110"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[17px] mb-2 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('wellness_page.why.followup') }}</h3>
            <p class="text-navy/60 text-[14px] leading-relaxed max-w-[260px] group-hover:text-navy/80 transition-colors duration-300">We provide insights and practical recommendations to keep improving.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
