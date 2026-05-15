<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-16 bg-white px-4 md:px-10">
    <div class="max-w-[1200px] mx-auto bg-[#F9FAFB] rounded-[32px] overflow-hidden flex flex-col md:flex-row">
      <!-- Left side: Content -->
      <div class="p-10 md:p-16 w-full md:w-[55%] flex flex-col justify-center relative bg-[#F9FAFB]">
        <!-- Gradient mask overlay for image edge -->
        <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10 hidden md:block" />
        
        <h2 class="font-heading font-bold text-navy text-[28px] md:text-[36px] leading-[1.3] mb-10 max-w-[440px] relative z-20">
          {{ $t('wellness_page.problem.statement') }}
        </h2>
        
        <ul class="space-y-6 relative z-20">
          <li v-for="item in ['neck', 'back', 'movement', 'fatigue']" :key="item" class="flex items-center gap-5">
            <span class="w-6 h-0.5 bg-accent rounded-full shrink-0"></span>
            <span class="text-navy/80 text-[18px] font-medium">{{ $t(`wellness_page.problem.${item}`) }}</span>
          </li>
        </ul>
      </div>
      
      <!-- Right side: Image -->
      <div class="w-full md:w-[45%] h-[300px] md:h-auto bg-[#F9FAFB]">
        <img 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" 
          alt="Workplace discomfort" 
          class="w-full h-full object-cover rounded-b-[32px] md:rounded-bl-none md:rounded-r-[32px]" 
        />
      </div>
    </div>
  </section>
</template>
