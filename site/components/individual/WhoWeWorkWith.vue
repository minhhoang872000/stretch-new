<script setup lang="ts">
const { t } = useI18n()
const scrollRef = ref<HTMLElement | null>(null)

const cards = computed(() => [
  { title: t('individual_page.customer_carousel.card1'), desc: t('individual_page.customer_carousel.card1_desc'), img: '/runner-who.png' },
  { title: t('individual_page.customer_carousel.card2'), desc: t('individual_page.customer_carousel.card2_desc'), img: '/office-who.png' },
  { title: t('individual_page.customer_carousel.card3'), desc: t('individual_page.customer_carousel.card3_desc'), img: '/athlete-who.png' },
  { title: t('individual_page.customer_carousel.card4'), desc: t('individual_page.customer_carousel.card4_desc'), img: '/recovery-who.png' },
])

function scrollLeft() {
  scrollRef.value?.scrollBy({ left: -320, behavior: 'smooth' })
}
function scrollRight() {
  scrollRef.value?.scrollBy({ left: 320, behavior: 'smooth' })
}
</script>

<template>
  <section class="py-12 lg:py-20 bg-white overflow-hidden">
    <div class="section-container relative">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div class="max-w-2xl">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-navy mb-4 leading-tight">
            {{ $t('individual_page.customer_carousel.title') }}
          </h2>
          <p class="text-lg text-text-secondary">
            {{ $t('individual_page.customer_carousel.subtitle') }}
          </p>
        </div>
        
        <!-- Arrows on Desktop -->
        <div class="hidden md:flex gap-3 mb-1">
          <button @click="scrollLeft" class="w-12 h-12 rounded-full bg-white border border-border-default shadow-sm flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.5 15l-5-5 5-5"/></svg>
          </button>
          <button @click="scrollRight" class="w-12 h-12 rounded-full bg-white border border-border-default shadow-sm flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7.5 15l5-5-5-5"/></svg>
          </button>
        </div>
      </div>

      <div ref="scrollRef" class="flex gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
        <div v-for="card in cards" :key="card.title" class="flex-shrink-0 w-[280px] md:w-[320px] snap-start group cursor-pointer">
          <div class="relative rounded-2xl overflow-hidden aspect-[4/5] mb-5 bg-off-white shadow-md group-hover:shadow-xl transition-all duration-500">
            <img :src="card.img" :alt="card.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <h4 class="text-xl font-heading font-bold text-navy mb-2 group-hover:text-primary transition-colors duration-300">{{ card.title }}</h4>
          <p class="text-sm text-text-secondary leading-relaxed line-clamp-2">{{ card.desc }}</p>
        </div>
      </div>
      
      <!-- Mobile Indicators/Hints -->
      <div class="flex md:hidden justify-center gap-1 mt-2">
        <div class="w-1.5 h-1.5 rounded-full bg-navy/20"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-navy/40"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-navy/20"></div>
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

