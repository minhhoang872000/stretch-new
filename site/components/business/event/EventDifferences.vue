<script setup lang="ts">
const { t } = useI18n()

const cards = computed(() => [
  {
    title: t('event_page.differences.card1.title'),
    desc: t('event_page.differences.card1.desc'),
    img: '/event-booth.png'
  },
  {
    title: t('event_page.differences.card2.title'),
    desc: t('event_page.differences.card2.desc'),
    img: '/event-flow.png'
  },
  {
    title: t('event_page.differences.card3.title'),
    desc: t('event_page.differences.card3.desc'),
    img: '/event-response.png'
  },
  {
    title: t('event_page.differences.card4.title'),
    desc: t('event_page.differences.card4.desc'),
    img: '/event-warmup.png'
  }
])
</script>

<template>
  <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
    <div class="section-container relative z-10">
      <div class="text-center mb-16 max-w-4xl mx-auto">
        <h2 class="text-3xl lg:text-4xl font-heading font-bold text-navy mb-6 tracking-tight">
          {{ $t('event_page.differences.heading') }}
        </h2>
        <p class="text-[17px] md:text-[19px] text-text-secondary leading-relaxed max-w-3xl mx-auto">
          {{ $t('event_page.differences.subtext') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="(card, idx) in cards" :key="idx" class="flex flex-col group">
          <!-- Image Container -->
          <div class="aspect-[4/3] rounded-[24px] overflow-hidden mb-6 border border-navy/5 shadow-sm">
            <img 
              :src="card.img" 
              :alt="card.title" 
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
          </div>
          
          <!-- Content -->
          <div class="flex flex-col">
            <h3 class="text-[20px] font-heading font-bold text-navy mb-3 leading-tight tracking-tight group-hover:text-accent transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-[16px] text-text-secondary leading-relaxed">
              {{ card.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
