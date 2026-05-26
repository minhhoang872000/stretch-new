<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-10 lg:py-12 bg-white px-4 md:px-10">
    <div class="max-w-[1200px] mx-auto bg-white rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col md:flex-row border border-[#E6ECF2] shadow-[0_8px_30px_rgba(5,17,31,0.03)] relative">
      <!-- Left side: Content -->
      <div class="p-8 md:p-12 lg:p-16 w-full md:w-[50%] flex flex-col justify-center relative bg-white z-20">
        <h2 class="font-heading font-bold text-navy text-[24px] md:text-[32px] leading-[1.2] mb-8 max-w-[480px]">
          {{ $t('wellness_page.problem.statement') }}
        </h2>
        
        <ul class="space-y-5">
          <li v-for="item in ['neck', 'back', 'movement', 'fatigue']" :key="item" class="flex items-center gap-4">
            <span class="w-5 h-[2px] bg-accent shrink-0 rounded-full" />
            <span class="text-navy/90 text-[16px] md:text-[17px] font-heading font-medium tracking-tight">{{ $t(`wellness_page.problem.${item}`) }}</span>
          </li>
        </ul>
      </div>
      
      <!-- Right side: Image with elegant desktop gradient mask blending -->
      <div class="w-full md:w-[50%] min-h-[300px] md:min-h-full relative bg-white">
        <!-- Desktop Gradient Mask -->
        <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/85 to-transparent z-10 pointer-events-none hidden md:block" />
        
        <NuxtImg 
          src="/images/man-neck-pain.png" 
          alt="Workplace discomfort - Neck and shoulder pain" 
          class="w-full h-full object-cover rounded-b-[24px] md:rounded-bl-none md:rounded-r-[32px]" 
          format="webp"
        />
      </div>
    </div>
  </section>
</template>
