<script setup lang="ts">
const { t } = useI18n()

const situations = computed(() => [
  { 
    title: t('individual_page.situation.card1'), 
    desc: t('individual_page.situation.desc1'), 
    type: 'shoe', 
    color: 'bg-green-50 text-green-600 border-green-100',
    arrowColor: 'text-green-600'
  },
  { 
    title: t('individual_page.situation.card2'), 
    desc: t('individual_page.situation.desc2'), 
    type: 'knee', 
    color: 'bg-orange-50 text-orange-500 border-orange-100',
    arrowColor: 'text-orange-500'
  },
  { 
    title: t('individual_page.situation.card3'), 
    desc: t('individual_page.situation.desc3'), 
    type: 'spine', 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    arrowColor: 'text-blue-600'
  },
  { 
    title: t('individual_page.situation.card4'), 
    desc: t('individual_page.situation.desc4'), 
    type: 'question', 
    color: 'bg-slate-50 text-slate-400 border-slate-100',
    arrowColor: 'text-slate-400'
  },
])
</script>

<template>
  <section class="py-10 lg:py-16 bg-[#FAFBFC] relative overflow-hidden">
    <!-- Smooth background glows, no grid lines -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#e0eaf5] blur-[150px] rounded-full opacity-60" />
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white blur-[120px] rounded-full opacity-60" />
    </div>

    <div class="max-w-[1200px] mx-auto px-6 md:px-10 relative z-10">
      <h2 class="text-2xl md:text-3.5xl font-heading font-extrabold text-navy text-center mb-12 tracking-tight">
        {{ $t('individual_page.situation.title') }}
      </h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div 
          v-for="sit in situations" 
          :key="sit.title" 
          class="group relative flex flex-col items-center text-center p-8 lg:p-10 bg-white border border-border/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <!-- Circular Icon with soft themed color background -->
          <div 
            class="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105" 
            :class="sit.color"
          >
            <!-- Recover: Energy Recharge (Recharge thể lực sau tập) -->
            <svg v-if="sit.type === 'shoe'" viewBox="0 0 24 24" class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.72" />
              <polygon points="12 7 8 13 11 13 10 17 14 11 11 11 12 7" fill="none" stroke-width="1.3" />
            </svg>

            <!-- Pain: Medical Shield with Heartbeat pulse (Sự an toàn, trị liệu đau mỏi) -->
            <svg v-else-if="sit.type === 'knee'" viewBox="0 0 24 24" class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M8 12h2.5l1.5-3 1.5 6 1.5-3H16" />
            </svg>

            <!-- Tightness: Spine tension hotspots (Giải tỏa các điểm bó cơ, căng cứng) -->
            <svg v-else-if="sit.type === 'spine'" viewBox="0 0 24 24" class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 22v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M12 11v11" />
              <circle cx="12" cy="13" r="1" fill="currentColor" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
              <path d="M9.5 13a2.5 2.5 0 0 1 5 0" />
              <path d="M9.5 17a2.5 2.5 0 0 1 5 0" />
            </svg>

            <!-- Question: Help circle (Dấu hỏi trợ giúp thanh lịch) -->
            <svg v-else-if="sit.type === 'question'" viewBox="0 0 24 24" class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="1.8" />
            </svg>
          </div>

          <!-- Content -->
          <h3 class="text-lg font-heading font-extrabold text-navy mb-3">
            {{ sit.title }}
          </h3>
          <p class="text-sm text-text-secondary leading-relaxed mb-8 flex-grow font-normal">
            {{ sit.desc }}
          </p>

          <!-- Themed Arrow -->
          <div 
            class="mt-auto pt-4 transition-transform duration-300 group-hover:translate-x-1.5" 
            :class="sit.arrowColor"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

