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
    accent: 'accent',
    icon: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M8 12h8"/><path d="M10 8h4"/>`,
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
    accent: 'navy-light',
    icon: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
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
    accent: 'navy',
    icon: `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/>`,
  },
])

const accentColors: Record<string, string> = {
  accent: 'bg-accent',
  'navy-light': 'bg-[#2A5080]',
  navy: 'bg-navy',
}
const accentBorders: Record<string, string> = {
  accent: 'border-accent/20 hover:border-accent/40',
  'navy-light': 'border-[#2A5080]/20 hover:border-[#2A5080]/40',
  navy: 'border-navy/20 hover:border-navy/40',
}
const accentBgLight: Record<string, string> = {
  accent: 'bg-accent/5',
  'navy-light': 'bg-[#2A5080]/5',
  navy: 'bg-navy/5',
}
const accentCheckBg: Record<string, string> = {
  accent: 'bg-accent/10',
  'navy-light': 'bg-[#2A5080]/10',
  navy: 'bg-navy/10',
}
</script>

<template>
  <section id="solutions" class="py-10 lg:py-16 bg-[#05111f] relative overflow-hidden">
    <!-- Dark Mesh Background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#0B2A4A] blur-[150px] rounded-full opacity-60" />
      <div class="absolute bottom-[-15%] right-[-5%] w-[40%] h-[40%] bg-accent/20 blur-[130px] rounded-full opacity-50" />
      <!-- Subtle Grid -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
      <div class="text-center mb-12 animate-fade-in-up">
        <p class="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-heading font-bold text-accent uppercase tracking-[0.2em] mb-4 backdrop-blur-sm">
          {{ $t('business_page.solutions.label') }}
        </p>
        <h2 class="text-2xl md:text-4xl lg:text-[44px] leading-[1.1] font-heading font-bold text-white max-w-4xl mx-auto">
          {{ $t('business_page.solutions.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        <div
          v-for="(sol, index) in solutions"
          :key="sol.id"
          class="flex flex-col bg-white/[0.03] backdrop-blur-xl rounded-[24px] overflow-hidden border border-white/10 transition-all duration-500 group hover:-translate-y-1.5 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-fade-in-up"
          :style="`animation-delay: ${index * 150}ms`"
        >
          <!-- Image -->
          <div class="relative h-[180px] p-3 pb-0">
            <div class="w-full h-full rounded-[16px] overflow-hidden relative">
              <img :src="sol.img" :alt="sol.title" class="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#05111f] via-transparent to-transparent opacity-80" />
            </div>
            
            <!-- Icon badge -->
            <div
              class="absolute bottom-[-1rem] left-8 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 border border-white/20 backdrop-blur-md z-20"
              :class="sol.accent === 'accent' ? 'bg-accent/90' : sol.accent === 'navy-light' ? 'bg-[#2A5080]/90' : 'bg-navy/90'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="sol.icon" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 lg:p-6 pt-6 flex-1 flex flex-col relative z-10">
            <!-- Accent label -->
            <span class="text-[11px] font-heading font-bold uppercase tracking-widest mb-2 opacity-80" :class="sol.accent === 'accent' ? 'text-accent' : sol.accent === 'navy-light' ? 'text-blue-400' : 'text-blue-300'">
              Solution {{ sol.id }}
            </span>
            <h3 class="text-xl lg:text-2xl font-heading font-bold text-white mb-3">{{ sol.title }}</h3>
            <p class="text-white/60 mb-5 text-[14px] leading-relaxed">{{ sol.desc }}</p>

            <ul class="space-y-3 mb-6">
              <li v-for="item in sol.items" :key="item" class="flex items-start gap-3 group/item">
                <div class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover/item:border-white/30 transition-colors">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" :stroke="sol.accent === 'accent' ? '#F47A1F' : sol.accent === 'navy-light' ? '#60a5fa' : '#93c5fd'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span class="text-[13px] text-white/70 font-medium group-hover/item:text-white transition-colors">{{ item }}</span>
              </li>
            </ul>

            <div class="mt-auto pt-8 border-t border-white/10 relative">
              <NuxtLink
                :to="localePath(sol.link)"
                class="inline-flex items-center gap-2 font-heading font-bold text-[15px] transition-all hover:gap-3 group/link"
                :class="sol.accent === 'accent' ? 'text-accent hover:text-[#ff984f]' : sol.accent === 'navy-light' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-300 hover:text-blue-200'"
              >
                {{ sol.cta }}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="transition-transform group-hover/link:translate-x-1"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
