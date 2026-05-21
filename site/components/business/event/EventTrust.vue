<script setup lang="ts">
const partners = [
  { name: 'Pickleball Vietnam', logo: '/logos/pickleball-vietnam.png', height: 'h-14 md:h-22' },
  { name: 'Ironman 70.3 Vietnam', logo: '/logos/ironman.png', height: 'h-18 md:h-28' },
  { name: 'Lululemon', logo: '/logos/lululemon.webp', height: 'h-14 md:h-22' },
  { name: 'Decathlon', logo: '/logos/decathlon.png', height: 'h-12 md:h-18' },
  { name: 'Garmin', logo: '/logos/garmin.png', height: 'h-6 md:h-9' },
  { name: 'Hyrox', logo: '/logos/hyrox.webp', height: 'h-7 md:h-10' },
]
</script>

<template>
  <section class="py-12 lg:py-16 bg-white relative overflow-hidden border-y border-navy/5">
    <div class="max-w-[1340px] mx-auto px-6 md:px-10 relative z-10 w-full">
      <!-- Title -->
      <div class="text-center mb-8">
        <h3 class="text-sm md:text-[15px] font-heading font-extrabold text-navy/70 tracking-tight">
          {{ $t('event_page.trust.heading') || 'Trusted by organizers and brands' }}
        </h3>
      </div>

      <!-- Logos Row -->
      <div class="flex flex-wrap items-center justify-center sm:justify-between gap-8 md:gap-12 lg:gap-16 max-w-5xl mx-auto">
        <div
          v-for="p in partners"
          :key="p.name"
          class="flex items-center justify-center w-[40%] sm:w-[28%] lg:w-auto transition-all duration-300"
        >
          <img
            :src="p.logo"
            :alt="p.name"
            :class="[
              p.height,
              'w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300',
              (p.name !== 'Lululemon' && p.name !== 'Pickleball Vietnam') ? 'brightness-0' : ''
            ]"
            :style="p.name === 'Lululemon' ? 'filter: grayscale(100%) contrast(1000%); mix-blend-mode: multiply;' : ''"
          />
        </div>
      </div>
    </div>
  </section>
</template>
