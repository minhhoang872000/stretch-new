<script setup lang="ts">
const { t } = useI18n()

const situations = computed(() => [
  { 
    title: t('individual_page.situation.card1'), 
    desc: t('individual_page.situation.desc1'), 
    icon: 'fitness_center', 
    color: 'bg-green-50 text-green-600 border-green-100',
    arrowColor: 'text-green-600'
  },
  { 
    title: t('individual_page.situation.card2'), 
    desc: t('individual_page.situation.desc2'), 
    icon: 'healing', 
    color: 'bg-orange-50 text-orange-500 border-orange-100',
    arrowColor: 'text-orange-500'
  },
  { 
    title: t('individual_page.situation.card3'), 
    desc: t('individual_page.situation.desc3'), 
    icon: 'accessibility_new', 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    arrowColor: 'text-blue-600'
  },
  { 
    title: t('individual_page.situation.card4'), 
    desc: t('individual_page.situation.desc4'), 
    icon: 'help_outline', 
    color: 'bg-slate-50 text-slate-400 border-slate-100',
    arrowColor: 'text-slate-400'
  },
])
</script>

<template>
  <section class="py-16 lg:py-24 bg-[#F4F7FA] relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#e0eaf5] blur-[150px] rounded-full" />
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white blur-[120px] rounded-full" />
      <!-- Subtle Grid Pattern -->
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: linear-gradient(#0B2A4A 1.5px, transparent 1.5px), linear-gradient(90deg, #0B2A4A 1.5px, transparent 1px); background-size: 32px 32px;"></div>
    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
      <h2 class="text-[32px] md:text-[44px] font-heading font-bold text-navy text-center mb-20 animate-fade-in-up tracking-tight">
        {{ $t('individual_page.situation.title') }}
      </h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div v-for="(sit, index) in situations" :key="sit.title" class="group relative flex flex-col items-center text-center p-10 lg:px-8 lg:py-16 bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white hover:border-white/80 shadow-[0_8px_30px_rgba(11,42,74,0.04)] hover:shadow-[0_20px_60px_rgba(11,42,74,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden animate-fade-in-up" :style="`animation-delay: ${index * 150}ms`">
          
          <!-- Background accent glow on hover -->
          <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <!-- Circle Icon -->
          <div class="w-24 h-24 rounded-[28px] flex items-center justify-center mb-10 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]" :class="sit.color">
            <span class="material-symbols-outlined text-[42px]">{{ sit.icon }}</span>
          </div>

          <!-- Content -->
          <h3 class="text-[22px] font-heading font-bold text-navy mb-5 relative z-10">{{ sit.title }}</h3>
          <p class="text-[16px] text-text-secondary leading-relaxed mb-12 flex-1 px-2 opacity-80 group-hover:opacity-100 transition-opacity relative z-10">
            {{ sit.desc }}
          </p>

          <!-- Arrow -->
          <div class="relative z-10 mt-auto pt-4 transition-all duration-500 group-hover:translate-x-2" :class="sit.arrowColor">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
