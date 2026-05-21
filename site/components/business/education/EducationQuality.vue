<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-16 lg:py-24 bg-white px-6 md:px-10 overflow-hidden">
    <div class="max-w-[1340px] mx-auto">
      
      <div class="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch">
        
        <!-- Left: Intro column (about 28% width) -->
        <div class="w-full lg:w-[28%] shrink-0 flex flex-col justify-start text-left">
          <h2 class="font-heading font-bold text-navy text-[24px] md:text-[28px] leading-[1.25] tracking-tight">
            {{ $t('education_page.quality.title') }}
          </h2>
          <!-- Tiny Orange divider line below the title matching the image -->
          <div class="w-8 h-1 bg-[#FF7A45] my-5"></div>
          
          <p class="text-navy/70 text-[14px] leading-relaxed font-medium">
            {{ $t('education_page.quality.statement') }}
          </p>
        </div>
        
        <!-- Right: 4 Columns Grid (centered items, divided by vertical lines) -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-12 md:gap-y-8 xl:gap-y-0 pt-2 items-start">
          
          <!-- Column 1 -->
          <div class="flex flex-col items-center text-center px-4 md:border-r border-navy/10 xl:border-r">
            <!-- Icon 1: Clipboard with checkboxes -->
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#021327" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="mb-5">
              <rect x="5" y="4" width="14" height="17" rx="2" />
              <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              <path d="m8 9 1.5 1.5 2.5-2.5" />
              <line x1="13" y1="10" x2="16" y2="10" />
              <path d="m8 13 1.5 1.5 2.5-2.5" />
              <line x1="13" y1="14" x2="16" y2="14" />
              <path d="m8 17 1.5 1.5 2.5-2.5" />
              <line x1="13" y1="18" x2="16" y2="18" />
            </svg>
            <h3 class="font-heading font-extrabold text-navy text-[14px] md:text-[15px] mb-3 leading-snug tracking-tight">
              {{ $t('education_page.quality.item1_title') }}
            </h3>
            <p class="text-navy/60 text-[12.5px] leading-relaxed font-medium max-w-[220px]">
              {{ $t('education_page.quality.item1_desc') }}
            </p>
          </div>

          <!-- Column 2 -->
          <div class="flex flex-col items-center text-center px-4 md:border-r-0 xl:border-r border-navy/10">
            <!-- Icon 2: Person with checkmark -->
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#021327" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="mb-5">
              <circle cx="12" cy="7" r="4" />
              <path d="M5 20v-1a5 5 0 0 1 5-5h2" />
              <circle cx="18" cy="17" r="4" />
              <path d="m16 17 1.5 1.5 2-2" />
            </svg>
            <h3 class="font-heading font-extrabold text-navy text-[14px] md:text-[15px] mb-3 leading-snug tracking-tight">
              {{ $t('education_page.quality.item2_title') }}
            </h3>
            <p class="text-navy/60 text-[12.5px] leading-relaxed font-medium max-w-[220px]">
              {{ $t('education_page.quality.item2_desc') }}
            </p>
          </div>

          <!-- Column 3 -->
          <div class="flex flex-col items-center text-center px-4 md:border-r border-navy/10 xl:border-r">
            <!-- Icon 3: Open book -->
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#021327" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="mb-5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <h3 class="font-heading font-extrabold text-navy text-[14px] md:text-[15px] mb-3 leading-snug tracking-tight">
              {{ $t('education_page.quality.item3_title') }}
            </h3>
            <p class="text-navy/60 text-[12.5px] leading-relaxed font-medium max-w-[220px]">
              {{ $t('education_page.quality.item3_desc') }}
            </p>
          </div>

          <!-- Column 4 -->
          <div class="flex flex-col items-center text-center px-4">
            <!-- Icon 4: Speech bubbles -->
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#021327" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="mb-5">
              <path d="M18 10c0-3.3-2.7-6-6-6S6 6.7 6 10c0 1.5.6 2.9 1.5 4l-.5 3 3-.8c.6.3 1.3.5 2 .5 3.3 0 6-2.7 6-6z" />
              <circle cx="9.5" cy="10" r="0.8" fill="#021327" />
              <circle cx="12" cy="10" r="0.8" fill="#021327" />
              <circle cx="14.5" cy="10" r="0.8" fill="#021327" />
              <path d="M14 15c.5.5 1.2.8 2 .8l2.5.7-.4-2.5c.6-.8.9-1.8.9-2.8 0-1.8-1-3.4-2.5-4.2" />
            </svg>
            <h3 class="font-heading font-extrabold text-navy text-[14px] md:text-[15px] mb-3 leading-snug tracking-tight">
              {{ $t('education_page.quality.item4_title') }}
            </h3>
            <p class="text-navy/60 text-[12.5px] leading-relaxed font-medium max-w-[220px]">
              {{ $t('education_page.quality.item4_desc') }}
            </p>
          </div>

        </div>
        
      </div>
      
    </div>
  </section>
</template>
