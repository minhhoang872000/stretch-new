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

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
      <h2 class="text-2xl md:text-3.5xl font-heading font-extrabold text-navy text-center mb-12 tracking-tight">
        {{ $t('individual_page.situation.title') }}
      </h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div 
          v-for="sit in situations" 
          :key="sit.title" 
          class="group relative flex flex-col items-center text-center p-8 lg:p-10 bg-white border border-border/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <!-- Perfectly Circular Icon with soft themed color background -->
          <div 
            class="w-20 h-20 rounded-full flex items-center justify-center mb-6 border shadow-sm transition-all duration-300 group-hover:scale-105" 
            :class="sit.color"
          >
            <!-- Custom SVGs matching the mockup layout -->
            <svg 
              v-if="sit.type === 'shoe'" 
              viewBox="0 0 24 24" 
              class="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="1.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <!-- Shoe body -->
              <path d="M4 11.5C4 10 5.5 8 8 8c1.5 0 2.5.5 3.5 1.5L15 13c1 1 2 1.5 3.5 1.5h1c1 0 1.5.5 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5H6.5c-2 0-3.5-1.5-3.5-3.5v-1.5L4 11.5z" />
              <!-- Shoe collar/opening -->
              <path d="M7.5 8.5L9.5 11" />
              <!-- Shoe laces -->
              <path d="M12.5 10.5l-1 1" />
              <path d="M14 12l-1 1" />
              <!-- Motion lines -->
              <path d="M2.5 7.5l2 1" stroke-width="1.2" />
              <path d="M1.5 10.5h2" stroke-width="1.2" />
            </svg>
            
            <svg 
              v-else-if="sit.type === 'knee'" 
              viewBox="0 0 24 24" 
              class="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="1.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <!-- Leg bent at knee showing simplified bone structure -->
              <!-- Femur (upper bone) -->
              <path d="M9 5c.5 0 1 .5 1.2 1.2L12 10.5c.3.8.3 1.8 0 2.5l-2.2 4.3" />
              <path d="M11.5 4.5l1.8 4c.5 1.2.3 2.5-.5 3.5L10 16" />
              <!-- Knee cap (Patella) -->
              <circle cx="13.2" cy="11.8" r="1.8" fill="currentColor" stroke="none" />
              <!-- Orange pain sparks radiating to the right -->
              <path d="M17 9.5c1 1.2 1 2.8 0 4" stroke-width="1.8" />
              <path d="M19.5 8c1.6 1.8 1.6 4.2 0 6" stroke-width="1.2" />
            </svg>
            
            <svg 
              v-else-if="sit.type === 'spine'" 
              viewBox="0 0 24 24" 
              class="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="1.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <!-- Back profile torso body contour (Shoulders, neck) -->
              <path d="M4 20c.5-4.5 3-8 5.5-9.5V8c-.6-.8-.8-1.8-.4-2.5C9.5 4.5 10.8 4 12 4s2.5.5 2.9 1.5c.4.7.2 1.7-.4 2.5v2.5c2.5 1.5 5 5 5.5 9.5" />
              <!-- Vertebrae spinal column vertebrae -->
              <line x1="12" y1="8" x2="12" y2="20" stroke-width="2.2" stroke-dasharray="0.5 4.5" />
              <!-- Spine joints horizontal details -->
              <path d="M10.5 11.5h3" stroke-width="1.2" />
              <path d="M10 14.5h4" stroke-width="1.2" />
              <path d="M9.8 17.5h4.4" stroke-width="1.2" />
            </svg>
            
            <svg 
              v-else-if="sit.type === 'question'" 
              viewBox="0 0 24 24" 
              class="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="1.6" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M9.5 9c0-1.8 1-3 2.5-3s2.5 1.2 2.5 3c0 1.5-1 2.2-2 3c-.8.6-1 1.2-1 2.2" stroke-width="1.8" />
              <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none" />
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

