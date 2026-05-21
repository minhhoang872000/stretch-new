<script setup lang="ts">
// Using dynamic i18n translations
</script>

<template>
  <section class="py-10 bg-[#FAFBFC] border-t border-gray-100/50">
    <div class="max-w-[1200px] mx-auto px-6 md:px-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        
        <!-- Feature 1: Experienced team -->
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 text-navy/80">
            <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            </svg>
          </div>
          <div>
            <h4 class="text-[15px] font-heading font-extrabold text-navy leading-tight mb-0.5">
              {{ $t('individual_page.trust_features.title1') }}
            </h4>
            <p class="text-[13px] text-navy/60 font-medium">
              {{ $t('individual_page.trust_features.desc1') }}
            </p>
          </div>
        </div>

        <!-- Feature 2: Personalized approach -->
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 text-navy/80">
            <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 14a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M6 21a6 6 0 0 1 12 0" />
              <path d="M12 7.5c-3-2-5.5-.5-6 1.5 0 0 1.5 2.5 4.5 1.5" />
              <path d="M12 7.5c3-2 5.5-.5 6 1.5 0 0-1.5 2.5-4.5 1.5" />
              <path d="M6 14.5c-1.5 1-2 3-1 4.5 0 0 2.5.5 3-2.5" />
              <path d="M18 14.5c1.5 1 2 3 1 4.5 0 0-2.5.5-3-2.5" />
            </svg>
          </div>
          <div>
            <h4 class="text-[15px] font-heading font-extrabold text-navy leading-tight mb-0.5">
              {{ $t('individual_page.trust_features.title2') }}
            </h4>
            <p class="text-[13px] text-navy/60 font-medium">
              {{ $t('individual_page.trust_features.desc2') }}
            </p>
          </div>
        </div>

        <!-- Feature 3: Flexible options -->
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 text-navy/80">
            <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="3" />
              <path d="M12 11l1.5 1.5" />
            </svg>
          </div>
          <div>
            <h4 class="text-[15px] font-heading font-extrabold text-navy leading-tight mb-0.5">
              {{ $t('individual_page.trust_features.title3') }}
            </h4>
            <p class="text-[13px] text-navy/60 font-medium">
              {{ $t('individual_page.trust_features.desc3') }}
            </p>
          </div>
        </div>

        <!-- Feature 4: Trusted by athletes -->
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 text-navy/80">
            <svg viewBox="0 0 24 24" class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
              <path d="M18 9l3 3-3 3" stroke-width="1.5" />
              <path d="M20 7l2 2" stroke-width="1" />
            </svg>
          </div>
          <div>
            <h4 class="text-[15px] font-heading font-extrabold text-navy leading-tight mb-0.5">
              {{ $t('individual_page.trust_features.title4') }}
            </h4>
            <p class="text-[13px] text-navy/60 font-medium">
              {{ $t('individual_page.trust_features.desc4') }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
