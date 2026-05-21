<script setup lang="ts">
// Translations are dynamically managed through $t
</script>

<template>
  <section class="py-14 lg:py-16 bg-[#FAFBFC]">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      
      <!-- Premium White Card Container with fine border and subtle shadow -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 lg:p-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 relative">
          
          <!-- Left half: How Stretch supports you -->
          <div class="lg:pr-12 lg:border-r lg:border-gray-200/80 flex flex-col items-center">
            <h3 class="text-xl md:text-2xl font-heading font-extrabold text-navy text-center mb-2">
              {{ $t('individual_page.how_supports.title') }}
            </h3>
            <p class="text-sm md:text-base text-gray-500 text-center mb-10 max-w-[420px]">
              {{ $t('individual_page.how_supports.line') }}
            </p>
            
            <div class="grid grid-cols-3 gap-4 w-full">
              
              <!-- Item 1: Understand how you move -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Magnifying glass with profile -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="9" r="3" />
                    <path d="M7 16c0-1.8 1.8-3 4-3s4 1.2 4 3" />
                    <circle cx="11" cy="11" r="8" stroke-width="1.2" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-width="1.8" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.how_supports.item1') }}
                </span>
              </div>
              
              <!-- Item 2: Support the right areas -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Target Crosshair -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="7.5" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="1" x2="12" y2="4.5" stroke-width="1.5" />
                    <line x1="12" y1="19.5" x2="12" y2="23" stroke-width="1.5" />
                    <line x1="1" y1="12" x2="4.5" y2="12" stroke-width="1.5" />
                    <line x1="19.5" y1="12" x2="23" y2="12" stroke-width="1.5" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.how_supports.item2') }}
                </span>
              </div>
              
              <!-- Item 3: Help you move more efficiently -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Arrow Up Circle -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 16V8M8.5 11.5L12 8l3.5 3.5" stroke-width="1.5" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.how_supports.item3') }}
                </span>
              </div>
              
            </div>
          </div>
          
          <!-- Right half: What to expect -->
          <div class="lg:pl-12 flex flex-col items-center">
            <h3 class="text-xl md:text-2xl font-heading font-extrabold text-navy text-center mb-2">
              {{ $t('individual_page.what_to_expect.title') }}
            </h3>
            <p class="text-sm md:text-base text-gray-500 text-center mb-10 max-w-[420px]">
              {{ $t('individual_page.what_to_expect.line') }}
            </p>
            
            <div class="grid grid-cols-3 gap-4 w-full">
              
              <!-- Item 1: Movement assessment -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Clipboard Checklist -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="4" width="14" height="17" rx="2" />
                    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
                    <!-- Checklist lines -->
                    <line x1="11" y1="9.5" x2="16" y2="9.5" stroke-width="1.5" />
                    <line x1="11" y1="13.5" x2="16" y2="13.5" stroke-width="1.5" />
                    <line x1="11" y1="17.5" x2="16" y2="17.5" stroke-width="1.5" />
                    <!-- Checklist checkboxes -->
                    <rect x="7.5" y="8.5" width="2" height="2" rx="0.5" stroke-width="1.2" />
                    <rect x="7.5" y="12.5" width="2" height="2" rx="0.5" stroke-width="1.2" />
                    <rect x="7.5" y="16.5" width="2" height="2" rx="0.5" stroke-width="1.2" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.what_to_expect.item1') }}
                </span>
              </div>
              
              <!-- Item 2: Targeted treatment -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Cupping hands with upwards chevron -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 16.5c1 3.5 3 4.5 5 4.5M3 13.5c1.5 3.5 3.5 5 6 5.5" />
                    <path d="M19 16.5c-1 3.5-3 4.5-5 4.5M21 13.5c-1.5 3.5-3.5 5-6 5.5" />
                    <path d="M9.5 9.5L12 7l2.5 2.5" stroke-width="1.5" />
                    <path d="M10.5 12L12 10.5l1.5 1.5" stroke-width="1.2" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.what_to_expect.item2') }}
                </span>
              </div>
              
              <!-- Item 3: Simple guidance to take with you -->
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-16 h-16 flex items-center justify-center text-navy mb-1">
                  <!-- Custom SVG: Profile and Check Shield -->
                  <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3 17.5c0-2.2 2.2-3.5 5-3.5" />
                    <path d="M14 11v3c0 2 1.5 3.5 2.5 4 1-.5 2.5-2 2.5-4v-3l-2.5-1.2L14 11z" />
                    <polyline points="15.5 13.5 16.5 14.5 18 12.5" stroke-width="1.5" />
                  </svg>
                </div>
                <span class="text-[13px] md:text-sm font-semibold text-navy leading-snug">
                  {{ $t('individual_page.what_to_expect.item3') }}
                </span>
              </div>
              
            </div>
            
            <!-- Duration info inside this column -->
            <div class="mt-8 pt-5 border-t border-gray-100 w-full text-center">
              <p class="text-sm md:text-base font-extrabold text-navy">
                {{ $t('individual_page.what_to_expect.duration') }}
              </p>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  </section>
</template>
