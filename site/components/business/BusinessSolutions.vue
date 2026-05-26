<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const solutions = computed(() => [
  {
    id: '01',
    title: t('business_page.solutions.card1.title'),
    desc: t('business_page.solutions.card1.desc'),
    items: [
      t('business_page.solutions.card1.item1'),
      t('business_page.solutions.card1.item2'),
      t('business_page.solutions.card1.item3'),
      t('business_page.solutions.card1.item4'),
    ],
    cta: t('business_page.solutions.card1.cta'),
    link: '/business/corporate-wellness',
    img: '/images/wellness-solution.png',
  },
  {
    id: '02',
    title: t('business_page.solutions.card2.title'),
    desc: t('business_page.solutions.card2.desc'),
    items: [
      t('business_page.solutions.card2.item1'),
      t('business_page.solutions.card2.item2'),
      t('business_page.solutions.card2.item3'),
      t('business_page.solutions.card2.item4'),
    ],
    cta: t('business_page.solutions.card2.cta'),
    link: '/business/recovery-event',
    img: '/images/event-solution.png',
  },
  {
    id: '03',
    title: t('business_page.solutions.card3.title'),
    desc: t('business_page.solutions.card3.desc'),
    items: [
      t('business_page.solutions.card3.item1'),
      t('business_page.solutions.card3.item2'),
      t('business_page.solutions.card3.item3'),
      t('business_page.solutions.card3.item4'),
    ],
    cta: t('business_page.solutions.card3.cta'),
    link: '/business/education-training',
    img: '/images/education-solution.png',
  },
])
</script>

<template>
  <section id="solutions" class="py-16 lg:py-24 bg-white relative">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
      <div class="text-center mb-12 animate-fade-in-up">
        <p class="text-xs font-heading font-bold text-accent uppercase tracking-[0.2em] mb-3">
          {{ $t('business_page.solutions.label') }}
        </p>
        <h2 class="text-2xl md:text-4xl lg:text-[40px] leading-[1.2] font-heading font-bold text-navy max-w-4xl mx-auto">
          {{ $t('business_page.solutions.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        <NuxtLink
          v-for="(sol, index) in solutions"
          :key="sol.id"
          :to="localePath(sol.link)"
          class="flex flex-col bg-[#F8F9FA] rounded-[24px] overflow-hidden border border-[#E5E7EB]/50 transition-all duration-500 group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] animate-fade-in-up cursor-pointer"
          :style="`animation-delay: ${index * 150}ms`"
        >
          <!-- Image -->
          <div class="relative h-[220px] p-3 pb-0">
            <div class="w-full h-full rounded-[20px] overflow-hidden relative">
              <NuxtImg :src="sol.img" :alt="sol.title" class="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" format="webp" />
            </div>
            
            <!-- Number badge -->
            <div
              class="absolute bottom-[-1.25rem] left-8 w-11 h-11 rounded-full flex items-center justify-center text-white bg-navy shadow-md border-2 border-white z-20 text-[13px] font-heading font-bold"
            >
              {{ sol.id }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 lg:p-8 pt-8 flex-1 flex flex-col relative z-10">
            <h3 class="text-xl lg:text-2xl font-heading font-bold text-navy mb-3">{{ sol.title }}</h3>
            <p class="text-gray-600 mb-5 text-[14px] leading-relaxed">{{ sol.desc }}</p>

            <ul class="space-y-3 mb-6">
              <li v-for="item in sol.items" :key="item" class="flex items-start gap-3 group/item">
                <div class="mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span class="text-[13px] text-gray-700 font-medium group-hover/item:text-navy transition-colors">{{ item }}</span>
              </li>
            </ul>

            <div class="mt-auto pt-6 border-t border-gray-200/60 relative">
              <span
                class="inline-flex items-center gap-2 font-heading font-bold text-[15px] text-accent group-hover:text-[#ff984f] transition-all group-hover:gap-3"
              >
                {{ sol.cta }}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="transition-transform group-hover:translate-x-1"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
