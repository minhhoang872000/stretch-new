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
  <section class="py-12 lg:py-16 bg-[#FCFAF7] relative overflow-hidden">
    <div class="max-w-[1340px] mx-auto px-6 md:px-10 relative z-10 w-full">
      <div class="text-center mb-10 max-w-3xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold text-navy mb-4 tracking-tight">
          {{ $t('event_page.differences.heading') }}
        </h2>
        <p class="text-[15px] md:text-[16px] text-navy/70 leading-relaxed max-w-2xl mx-auto">
          {{ $t('event_page.differences.subtext') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="(card, idx) in cards" :key="idx" class="flex flex-col group">
          <!-- Image Container -->
          <div class="aspect-[4/3] rounded-[24px] overflow-hidden mb-4 border border-navy/5 shadow-sm">
            <NuxtImg 
              :src="card.img" 
              :alt="card.title" 
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            format="webp" />
          </div>
          
          <!-- Content -->
          <div class="flex flex-col">
            <h3 class="text-[17px] font-heading font-bold text-navy mb-2 leading-tight tracking-tight group-hover:text-accent transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-[14px] text-text-secondary leading-relaxed">
              {{ card.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
