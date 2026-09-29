<script setup lang="ts">
import { Autoplay } from "swiper/modules";
import "swiper/css";

const { t } = useI18n();

interface Partner {
  name: string;
  logo: string;
}

const partners: Partner[] = [
  { name: "Decathlon", logo: "/logos/decathlon.png" },
  { name: "Garmin", logo: "/logos/garmin.png" },
  { name: "Hyrox", logo: "/logos/hyrox.webp" },
  { name: "Ironman", logo: "/logos/ironman.png" },
  { name: "Lululemon", logo: "/logos/lululemon.webp" },
  { name: "Partner 1", logo: "/logos/partner-1.png" },
  { name: "Partner 10", logo: "/logos/partner-10.png" },
  { name: "Partner 11", logo: "/logos/partner-11.png" },
  { name: "Partner 12", logo: "/logos/partner-12.png" },
  { name: "Partner 13", logo: "/logos/partner-13.png" },
];

// Continuous logo ticker (Swiper, linear, never stops unless hovered).
// Doubled so loop mode always has more slides than fit on the widest screen.
const allPartners = [...partners, ...partners];
const tickerEl = ref<HTMLElement | null>(null);
const { swiper } = useSwiper(tickerEl, () => ({
  modules: [Autoplay],
  loop: true,
  speed: 4000,
  slidesPerView: 2,
  spaceBetween: 0,
  allowTouchMove: true,
  autoplay: { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true },
  breakpoints: { 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 6 } },
}));
</script>

<template>
  <section class="py-14 lg:py-20 bg-off-white">
    <div class="section-container">
      <!-- Header -->
      <div class="text-center mb-10 lg:mb-14">
        <span
          class="text-[11px] font-heading font-bold text-text-secondary uppercase tracking-[0.2em] block mb-3"
        >
          {{ $t("partners.eyebrow") }}
        </span>
        <h2
          class="text-2xl md:text-3xl lg:text-[34px] font-heading font-bold text-navy leading-tight mb-4"
        >
          {{ $t("partners.title") }}
        </h2>
        <p
          class="text-sm md:text-base text-text-secondary max-w-xl mx-auto leading-relaxed"
        >
          {{ $t("partners.subtitle") }}
        </p>
      </div>

      <!-- Logo ticker -->
      <div ref="tickerEl" class="swiper partners-ticker">
        <div class="swiper-wrapper">
          <div
            v-for="(partner, index) in allPartners"
            :key="`${partner.name}-${index}`"
            class="swiper-slide flex items-center justify-center py-6"
          >
            <div class="flex items-center justify-center px-2 md:px-6 select-none group/logo">
              <NuxtImg
                :src="partner.logo"
                :alt="partner.name"
                class="h-14 md:h-16 lg:h-20 w-auto object-contain grayscale opacity-60 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition-all duration-300"
                format="webp"
                :style="partner.name === 'Lululemon' ? 'mix-blend-mode: multiply;' : ''"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Constant-speed ticker: no easing between slides, soft fade at both edges. */
.partners-ticker :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}
.partners-ticker {
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
</style>
