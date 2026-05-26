<script setup lang="ts">
const { t } = useI18n()
const scrollRef = ref<HTMLElement | null>(null)
const activeIndicator = ref(0)

const cards = computed(() => [
  { title: t('individual_page.customer_carousel.card3'), desc: t('individual_page.customer_carousel.card3_desc'), img: '/office-who.png' },
  { title: t('individual_page.customer_carousel.card4'), desc: t('individual_page.customer_carousel.card4_desc'), img: '/active-who.png' },
  { title: t('individual_page.customer_carousel.card5'), desc: t('individual_page.customer_carousel.card5_desc'), img: '/recovery-who.png' },
  { title: t('individual_page.customer_carousel.card6'), desc: t('individual_page.customer_carousel.card6_desc'), img: '/older-who.png' },
])

function scrollLeft() {
  if (!scrollRef.value) return
  scrollRef.value.scrollBy({ left: -300, behavior: 'smooth' })
}

function scrollRight() {
  if (!scrollRef.value) return
  scrollRef.value.scrollBy({ left: 300, behavior: 'smooth' })
}

let scrollTimeout: number | null = null

function onScroll(event: Event) {
  const el = event.target as HTMLElement
  if (!el) return
  
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
  scrollTimeout = requestAnimationFrame(() => {
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    if (maxScrollLeft <= 0) return
    
    const scrollRatio = el.scrollLeft / maxScrollLeft
    activeIndicator.value = Math.min(3, Math.max(0, Math.round(scrollRatio * 3)))
  })
}

function scrollToStep(stepIndex: number) {
  if (!scrollRef.value) return
  const el = scrollRef.value
  const maxScrollLeft = el.scrollWidth - el.clientWidth
  const targetScrollLeft = (stepIndex / 3) * maxScrollLeft
  el.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
}
</script>

<template>
  <section class="py-8 lg:py-14 bg-off-white overflow-hidden">
    <div class="section-container">
      <!-- Centered Header Section -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="text-2xl md:text-3xl font-heading font-extrabold text-navy mb-3 tracking-tight">
          {{ $t('individual_page.customer_carousel.title') }}
        </h2>
        <p class="text-base text-text-secondary font-medium">
          {{ $t('individual_page.customer_carousel.subtitle') }}
        </p>
      </div>

      <!-- Carousel/Grid Container with relative positioning -->
      <div class="relative px-2 md:px-10 lg:px-0">
        <!-- Floating Left Arrow (Hidden on desktop since all 4 cards display in a static grid) -->
        <button 
          @click="scrollLeft" 
          class="lg:hidden absolute -left-1 md:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          aria-label="Scroll left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <!-- Viewport (Horizontal carousel on mobile/tablet, 4-column grid on desktop) -->
        <div 
          ref="scrollRef" 
          @scroll="onScroll" 
          class="flex lg:grid lg:grid-cols-4 gap-5 lg:gap-6 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-6 lg:pb-0 snap-x snap-mandatory px-1 md:px-2 lg:px-0"
        >
          <div 
            v-for="card in cards" 
            :key="card.title" 
            class="flex-shrink-0 w-[270px] sm:w-[280px] lg:w-auto snap-start group cursor-pointer"
          >
            <!-- White Card Container -->
            <div class="bg-white border border-border/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden flex flex-col h-full">
              <!-- Card Image -->
              <div class="relative w-full aspect-[4/3.4] overflow-hidden bg-off-white">
                <NuxtImg 
                  :src="card.img" 
                  :alt="card.title" 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy" 
                format="webp" />
              </div>
              
              <!-- Card Text Content -->
              <div class="pt-5 pb-6 px-5 flex flex-col flex-grow text-center">
                <h4 class="text-lg font-heading font-extrabold text-navy mb-2 group-hover:text-accent transition-colors duration-300">
                  {{ card.title }}
                </h4>
                <p class="text-sm text-text-secondary leading-relaxed font-normal">
                  {{ card.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Right Arrow (Hidden on desktop) -->
        <button 
          @click="scrollRight" 
          class="lg:hidden absolute -right-1 md:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          aria-label="Scroll right"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
      
      <!-- Dot Indicators (Hidden on desktop) -->
      <div class="lg:hidden flex justify-center items-center gap-2 mt-6">
        <button 
          v-for="i in 4" 
          :key="i"
          @click="scrollToStep(i - 1)"
          class="transition-all duration-300 cursor-pointer h-2 rounded-full"
          :class="[
            activeIndicator === i - 1 
              ? 'w-6 bg-accent' 
              : 'w-2 bg-navy/20 hover:bg-navy/40'
          ]"
          :aria-label="`Go to slide ${i}`"
        ></button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

