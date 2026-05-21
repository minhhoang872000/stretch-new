<script setup lang="ts">
const { t, locale } = useI18n()

const heading = computed(() => {
  return locale.value === 'vi' ? 'Phù hợp với' : 'Who this is for'
})
</script>

<template>
  <section class="py-12 lg:py-16 bg-white px-4 md:px-8 lg:px-10 overflow-hidden">
    <div class="max-w-[1340px] mx-auto relative z-10">
      <!-- Outer Warm Peach/Cream Card Container -->
      <div class="bg-[#FCFAF7] rounded-[24px] md:rounded-[32px] border border-[#EFEBE4] py-14 px-6 md:px-10 flex flex-col items-center">
        <!-- Title -->
        <h2 class="font-heading font-bold text-navy text-[28px] md:text-[34px] text-center mb-14 tracking-tight">
          {{ heading }}
        </h2>
        
        <!-- 4 Columns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0 w-full">
          <!-- Item 1: Tournament organizers -->
          <div class="flex flex-col items-center text-center px-4 lg:border-r border-[#E5E7EB]/60">
            <!-- Trophy Icon -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-5">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-3 leading-snug max-w-[220px]">
              {{ $t('event_page.who_is_for.item1.title') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ $t('event_page.who_is_for.item1.desc') }}
            </p>
          </div>
          
          <!-- Item 2: Sport events & races -->
          <div class="flex flex-col items-center text-center px-4 md:border-r lg:border-r border-[#E5E7EB]/60">
            <!-- Running Icon -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-5">
              <path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M9.5 9h5l1 3.5M10.5 12.5l-1.5 5 2.5 1.5"/>
              <path d="m14 12.5 1.5 4-2.5 3"/>
              <path d="M10 9v3.5l-3.5 1"/>
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-3 leading-snug max-w-[220px]">
              {{ $t('event_page.who_is_for.item2.title') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ $t('event_page.who_is_for.item2.desc') }}
            </p>
          </div>
          
          <!-- Item 3: Brand activations -->
          <div class="flex flex-col items-center text-center px-4 lg:border-r border-[#E5E7EB]/60">
            <!-- Megaphone Icon -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-5">
              <path d="m3 11 18-5v12L3 14v-3z"/>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-3 leading-snug max-w-[220px]">
              {{ $t('event_page.who_is_for.item3.title') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ $t('event_page.who_is_for.item3.desc') }}
            </p>
          </div>
          
          <!-- Item 4: Corporate sport days -->
          <div class="flex flex-col items-center text-center px-4">
            <!-- Building with People Icon -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-5">
              <path d="M3 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
              <path d="M6 7h2v2H6V7zm0 4h2v2H6v-2z" />
              <path d="M10 7h2v2h-2V7zm0 4h2v2h-2v-2z" />
              <circle cx="15" cy="14" r="2" />
              <path d="M12 19.5v-.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
              <circle cx="18" cy="16" r="2" />
              <path d="M15 21v-.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-3 leading-snug max-w-[220px]">
              {{ $t('event_page.who_is_for.item4.title') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ $t('event_page.who_is_for.item4.desc') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
