<script setup lang="ts">
const partners = [
  { name: 'Decathlon', logo: '/logos/decathlon.png' },
  { name: 'Garmin', logo: '/logos/garmin.png' },
  { name: 'Ironman 70.3 Vietnam', logo: '/logos/ironman.png' },
  { name: 'Lululemon', logo: '/logos/lululemon.webp' },
  { name: 'Hyrox', logo: '/logos/hyrox.webp' },
]
</script>

<template>
  <section class="py-10 lg:py-16 bg-white relative overflow-hidden border-y border-navy/5">
    <div class="section-container relative z-10">
      <div class="text-center mb-8">
        <p class="text-xs font-heading font-bold text-accent-dark uppercase tracking-widest mb-3">
          {{ $t('business_page.trust.label') || 'TRUSTED PARTNERS' }}
        </p>
        <h3 class="text-xl lg:text-3xl font-heading font-bold text-navy max-w-2xl mx-auto leading-tight">
          {{ $t('business_page.trust.heading') }}
        </h3>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-14">
        <div
          v-for="p in partners"
          :key="p.name"
          class="flex items-center justify-center w-[140px] md:w-[220px]"
        >
          <img
            :src="p.logo"
            :alt="p.name"
            class="h-10 md:h-16 w-auto object-contain max-w-full grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  </section>
</template>
