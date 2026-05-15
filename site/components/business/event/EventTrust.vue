<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'

const allLogos = [
  { name: 'Pickleball Vietnam', logo: '/logos/pickleball-vietnam.png' },
  { name: 'Ironman 70.3 Vietnam', logo: '/logos/ironman.png' },
  { name: 'Lululemon', logo: '/logos/lululemon.webp' },
  { name: 'Decathlon', logo: '/logos/decathlon.png' },
  { name: 'Garmin', logo: '/logos/garmin.png' },
  { name: 'Hyrox', logo: '/logos/hyrox.webp' },
]

// Add the other numbered partners
const additionalPartners = [1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21].map(n => ({
  name: `Partner ${n}`,
  logo: `/logos/partner-${n}.png`
}))

const partners = [...allLogos, ...additionalPartners]
</script>

<template>
  <section class="py-16 lg:py-20 bg-white relative overflow-hidden border-y border-navy/5">
    <div class="relative z-10">
      <div class="text-center mb-10">
        <p class="text-[11px] font-heading font-bold text-navy/30 uppercase tracking-[0.2em] mb-3">{{ $t('event_page.trust.label') }}</p>
        <h3 class="text-xl lg:text-2xl font-heading font-bold text-navy max-w-2xl mx-auto">
          {{ $t('event_page.trust.heading') }}
        </h3>
      </div>

      <div class="w-full">
        <Swiper
          :modules="[Autoplay, FreeMode]"
          :slides-per-view="'auto'"
          :space-between="100"
          :loop="true"
          :free-mode="true"
          :speed="5000"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
          }"
          class="logo-swiper"
        >
          <SwiperSlide v-for="p in partners" :key="p.logo" class="!w-auto">
            <div class="flex items-center justify-center h-24 md:h-32 transition-all duration-500">
              <img
                :src="p.logo"
                :alt="p.name"
                class="h-full w-auto object-contain max-w-[200px] md:max-w-[260px] "
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.logo-swiper :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}

.logo-swiper {
  cursor: grab;
}

.logo-swiper:active {
  cursor: grabbing;
}
</style>
