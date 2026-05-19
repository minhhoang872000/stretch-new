<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-10 lg:py-12 bg-white px-4 md:px-10">
    <div class="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-8">
      <!-- Content -->
      <div class="flex-1">
        <h2 class="font-heading font-bold text-navy text-[22px] md:text-[30px] mb-6 leading-[1.25] text-center lg:text-left">
          {{ $t('education_page.problem.statement') }}
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in ['bullet1', 'bullet2', 'bullet3', 'bullet4']" :key="item" class="flex items-center gap-4 bg-[#F9FAFB] p-4 rounded-2xl border border-navy/5 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-2 h-2 rounded-full bg-accent shrink-0"></div>
            <p class="text-navy/80 text-[14px] font-medium leading-snug">{{ $t(`education_page.problem.${item}`) }}</p>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="w-full lg:w-[40%] shrink-0">
        <div class="relative rounded-[32px] overflow-hidden shadow-2xl group border border-navy/5">
          <img 
            src="/education-class.png" 
            alt="Problem Analysis" 
            class="w-full h-full object-cover aspect-[4/5] lg:aspect-auto transition-transform duration-700 group-hover:scale-110" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
        </div>
      </div>
    </div>
  </section>
</template>
