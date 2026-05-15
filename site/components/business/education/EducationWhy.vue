<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-20 bg-white px-4 md:px-10 overflow-hidden">
    <div class="max-w-[1200px] mx-auto relative">
      <!-- Decorative background blur -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div class="bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FA] rounded-[40px] p-10 md:p-16 lg:p-20 flex flex-col items-center border border-navy/5 shadow-sm relative z-10">
        <h2 class="font-heading font-bold text-navy text-[36px] md:text-[44px] text-center mb-5 tracking-tight">
          {{ $t('education_page.why.title') }}
        </h2>
        <p class="text-navy/70 text-[18px] md:text-[20px] text-center mb-20 max-w-[640px] font-light">
          {{ $t('education_page.why.statement') }}
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 w-full">
          <!-- Item 1 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-20 h-20 rounded-[24px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-8 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-50 transition-transform duration-500 group-hover:scale-110"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[20px] mb-4 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('education_page.why.item1') }}</h3>
          </div>
          
          <!-- Item 2 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-20 h-20 rounded-[24px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-8 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-50 transition-transform duration-500 group-hover:scale-110"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M15 21V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v14"/><path d="M2 21h20"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[20px] mb-4 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('education_page.why.item2') }}</h3>
          </div>
          
          <!-- Item 3 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-20 h-20 rounded-[24px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-8 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-50 transition-transform duration-500 group-hover:scale-110"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[20px] mb-4 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('education_page.why.item3') }}</h3>
          </div>
          
          <!-- Item 4 -->
          <div class="flex flex-col items-center text-center group cursor-pointer relative">
            <div class="w-20 h-20 rounded-[24px] bg-white border border-navy/5 shadow-sm text-accent flex items-center justify-center mb-8 transition-all duration-500 group-hover:shadow-md group-hover:shadow-accent/10 group-hover:-translate-y-1 group-hover:border-accent/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="relative z-50 transition-transform duration-500 group-hover:scale-110"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[20px] mb-4 max-w-[220px] group-hover:text-accent transition-colors duration-300">{{ $t('education_page.why.item4') }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
