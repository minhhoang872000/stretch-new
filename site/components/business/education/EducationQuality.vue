<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-16 bg-white px-4 md:px-10">
    <div class="max-w-[1400px] mx-auto border-t border-navy/5 pt-16">
      <div class="flex flex-col lg:flex-row gap-12 lg:items-start">
        <!-- Left: Intro -->
        <div class="w-full lg:w-[25%] shrink-0 text-center lg:text-left">
          <h2 class="font-heading font-bold text-navy text-[28px] md:text-[34px] leading-[1.2] mb-4 tracking-tight">
            {{ $t('education_page.quality.title') }}
          </h2>
          <div class="w-8 h-1 bg-accent mb-6 mx-auto lg:mx-0"></div>
          <p class="text-navy/60 text-[15px] md:text-[16px] leading-relaxed">
            {{ $t('education_page.quality.statement') }}
          </p>
        </div>
        
        <!-- Right: 4 Columns Grid -->
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 pt-2">
          <div v-for="(item, i) in [1,2,3,4]" :key="i" class="flex flex-col items-center text-center lg:items-start lg:text-left border-l border-navy/5 pl-8 first:border-l-0 first:pl-0">
            <div class="w-16 h-16 rounded-2xl bg-white border border-navy/5 text-navy flex items-center justify-center mb-6 shadow-sm">
              <svg v-if="i===0" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12l2 2 4-4"/><path d="M9 16h6"/><path d="M9 20h6"/></svg>
              <svg v-if="i===1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/><path d="M16 11l2 2 4-4"/></svg>
              <svg v-if="i===2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 6h10"/><path d="M8 10h10"/><path d="M8 14h10"/></svg>
              <svg v-if="i===3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h4"/></svg>
            </div>
            <h3 class="font-heading font-bold text-navy text-[17px] mb-2 leading-tight">
              {{ $t(`education_page.quality.item${item}_title`) }}
            </h3>
            <p class="text-navy/60 text-[14px] leading-relaxed">
              {{ $t(`education_page.quality.item${item}_desc`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
