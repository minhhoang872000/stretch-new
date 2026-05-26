<script setup lang="ts">
const { t } = useI18n()

const whereCards = computed(() => [
  { title: t('event_page.where_works.item1'), img: '/pickleball.png' },
  { title: t('event_page.where_works.item2'), img: '/marathon.png' },
  { title: t('event_page.where_works.item3'), img: '/tennis.png' },
  { title: t('event_page.where_works.item4'), img: '/corporate-sports.png' }
])

const howSteps = computed(() => [
  {
    title: t('event_page.how_works.step1.title'),
    desc: t('event_page.how_works.step1.desc'),
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`
  },
  {
    title: t('event_page.how_works.step2.title'),
    desc: t('event_page.how_works.step2.desc'),
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
  }
])
</script>

<template>
  <section class="py-12 lg:py-16 bg-white relative overflow-hidden">
    <div class="max-w-[1340px] mx-auto px-6 md:px-10 relative z-10 w-full">
      <div class="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">

        <!-- Left: Where this works -->
        <div class="w-full lg:w-[53%] flex flex-col items-center">
          <!-- Heading & Subtitle -->
          <div class="text-center mb-10 w-full">
            <h2 class="text-[24px] md:text-[28px] font-heading font-bold text-navy mb-2 tracking-tight">
              {{ $t('event_page.where_works.heading') }}
            </h2>
            <p class="text-navy/60 text-[14px] md:text-[15px] font-medium leading-relaxed max-w-[440px] mx-auto">
              {{ $t('event_page.where_works.subtext') }}
            </p>
          </div>

          <!-- 4 Vertical Grid Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div v-for="(card, idx) in whereCards" :key="idx" class="flex flex-col items-center text-center">
              <!-- Rounded Vertical Image Container -->
              <div class="w-full aspect-[4/5] rounded-[16px] overflow-hidden mb-3 border border-[#F1F1F1] shadow-sm bg-gray-50">
                <NuxtImg 
                  :src="card.img" 
                  :alt="card.title" 
                  class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                format="webp" />
              </div>
              <p class="text-[13px] md:text-[14px] font-heading font-extrabold text-navy leading-snug tracking-tight max-w-[120px] mx-auto">
                {{ card.title }}
              </p>
            </div>
          </div>
        </div>

        <!-- Divider Line -->
        <div class="hidden lg:block w-px bg-[#E5E7EB]/60 self-stretch my-2" />
        <div class="lg:hidden h-px bg-[#E5E7EB]/60 w-full my-4" />

        <!-- Right: How it works -->
        <div class="w-full lg:w-[47%] flex flex-col items-center">
          <!-- Heading & Subtitle -->
          <div class="text-center mb-10 w-full">
            <h2 class="text-[24px] md:text-[28px] font-heading font-bold text-navy mb-2 tracking-tight">
              {{ $t('event_page.how_works.heading') }}
            </h2>
            <p class="text-navy/60 text-[14px] md:text-[15px] font-medium leading-relaxed max-w-[440px] mx-auto">
              {{ $t('event_page.how_works.subtext') }}
            </p>
          </div>

          <!-- Step Steps Row -->
          <div class="flex flex-row items-start gap-3 md:gap-5 justify-center w-full mt-2">
            <!-- Step 1 -->
            <div class="flex flex-col items-center text-center flex-1 max-w-[190px]">
              <!-- Circular Outline Icon Badge -->
              <div class="w-[88px] h-[88px] rounded-full border border-[#E5E7EB] flex items-center justify-center mb-4 bg-white">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M9 12h6M9 16h6"/>
                </svg>
              </div>
              <h3 class="font-heading font-extrabold text-navy text-[15px] mb-2 leading-none">
                {{ howSteps[0].title }}
              </h3>
              <p class="text-navy/60 text-[12.5px] md:text-[13px] leading-relaxed max-w-[170px]">
                {{ howSteps[0].desc }}
              </p>
            </div>

            <!-- Arrow Divider -->
            <div class="flex items-center justify-center self-start mt-8 text-[#A3A3A3]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            <!-- Step 2 -->
            <div class="flex flex-col items-center text-center flex-1 max-w-[190px]">
              <!-- Circular Outline Icon Badge -->
              <div class="w-[88px] h-[88px] rounded-full border border-[#E5E7EB] flex items-center justify-center mb-4 bg-white">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 class="font-heading font-extrabold text-navy text-[15px] mb-2 leading-none">
                {{ howSteps[1].title }}
              </h3>
              <p class="text-navy/60 text-[12.5px] md:text-[13px] leading-relaxed max-w-[170px]">
                {{ howSteps[1].desc }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
