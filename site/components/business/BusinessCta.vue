<script setup lang="ts">
const { trackCTA } = useTracking();
</script>

<template>
  <section
    class="w-full bg-[#021327] py-10 md:py-14 relative overflow-hidden border-t border-white/5"
  >
    <!-- Subtle background texture -->
    <div
      class="absolute inset-0 pointer-events-none opacity-[0.02]"
      style="
        background-image: radial-gradient(white 1px, transparent 1px);
        background-size: 24px 24px;
      "
    />

    <div
      class="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 relative z-10 w-full"
    >
      <!-- Top Row: Trust & Partners -->
      <div
        class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-6 pb-8"
      >
        <!-- Title on the left -->
        <div class="w-full lg:max-w-[340px] text-left">
          <h3
            class="text-xl md:text-2xl font-heading font-extrabold text-white leading-tight"
          >
            {{ $t("business_page.trust.heading") }}
          </h3>
        </div>

        <!-- White Partner Logos on the right -->
        <div
          class="w-full lg:flex-1 flex flex-wrap lg:flex-nowrap items-center justify-around gap-6 md:gap-8 lg:gap-10 bg-white py-6 md:py-8 px-8 md:px-12 rounded-2xl shadow-sm border border-white/10"
        >
          <!-- Logo 1: Decathlon -->
          <div
            class="flex items-center justify-center w-[28%] sm:w-[18%] lg:w-auto h-24 md:h-28 text-black transition-all duration-300"
          >
            <NuxtImg
              src="/logos/decathlon.png"
              alt="Decathlon"
              class="h-15 md:h-20 w-auto object-contain brightness-0 opacity-85 hover:opacity-100 transition-opacity duration-300"
              style="filter: brightness(0)"
            format="webp" />
          </div>

           <!-- Logo 2: Garmin -->
          <div
            class="flex items-center justify-center w-[28%] sm:w-[18%] lg:w-auto h-24 md:h-28 text-black transition-all duration-300"
          >
            <NuxtImg
              src="/logos/garmin.png"
              alt="Garmin"
              class="h-7 md:h-10 w-auto object-contain brightness-0 opacity-85 hover:opacity-100 transition-opacity duration-300"
              style="filter: brightness(0)"
            format="webp" />
          </div>

          <!-- Logo 3: Hyrox -->
          <div
            class="flex items-center justify-center w-[28%] sm:w-[18%] lg:w-auto h-24 md:h-28 text-black transition-all duration-300"
          >
            <NuxtImg
              src="/logos/hyrox.webp"
              alt="Hyrox"
              class="h-8 md:h-12 w-auto object-contain brightness-0 opacity-85 hover:opacity-100 transition-opacity duration-300"
              style="filter: brightness(0)"
            format="webp" />
          </div>

          <!-- Logo 4: Ironman -->
          <div
            class="flex items-center justify-center w-[28%] sm:w-[18%] lg:w-auto h-24 md:h-28 text-black transition-all duration-300"
          >
            <NuxtImg
              src="/logos/ironman.png"
              alt="Ironman"
              class="h-18 md:h-24 w-auto object-contain brightness-0 opacity-85 hover:opacity-100 transition-opacity duration-300"
              style="filter: brightness(0)"
            format="webp" />
          </div>

          <!-- Logo 5: Lululemon -->
          <div
            class="flex items-center justify-center w-[28%] sm:w-[18%] lg:w-auto h-24 md:h-28 text-black transition-all duration-300"
          >
            <NuxtImg
              src="/logos/lululemon.webp"
              alt="Lululemon"
              class="h-15 md:h-20 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity duration-300"
              style="filter: grayscale(100%) contrast(1000%); mix-blend-mode: multiply;"
            format="webp" />
          </div>
        </div>
      </div>

      <!-- Divider line -->
      <div class="w-full border-t border-white/10 my-2 md:my-4"></div>

      <!-- Bottom Row: CTA & Actions -->
      <div
        class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-8"
      >
        <!-- Title & Subtitle on the left -->
        <div class="w-full lg:flex-1 text-left">
          <h2
            class="text-2xl md:text-3xl font-heading font-extrabold text-[#FF5500] mb-2 leading-tight"
          >
            {{ $t("business_page.cta.heading") }}
          </h2>
          <p class="text-white/75 text-[15px] md:text-base font-normal">
            {{ $t("business_page.cta.sub") }}
          </p>
        </div>

        <!-- Buttons on the right -->
        <div
          class="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-4"
        >
          <!-- Button 1: Solid Orange -->
          <a
            href="https://zalo.me/4237229823551208502"
            target="_blank"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#FF5500] hover:bg-[#E64C00] text-white font-heading font-bold text-[15px] rounded-lg shadow-lg shadow-[#FF5500]/20 transition-all cursor-pointer"
            @click="trackCTA('business-cta-book', 'corporate')"
          >
            {{ $t("business_page.cta.cta1") }}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 15l5-5-5-5"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>

          <!-- Button 2: Border outline -->
          <a
            href="https://zalo.me/4237229823551208502"
            target="_blank"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-transparent border border-white/20 hover:border-white/40 text-white font-heading font-bold text-[15px] rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            @click="trackCTA('business-cta-contact', 'corporate')"
          >
            {{ $t("business_page.cta.cta2") }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
