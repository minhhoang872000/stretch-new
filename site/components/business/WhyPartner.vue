<script setup lang="ts">
const { t } = useI18n()

const benefits = computed(() => [
  { title: t('business_page.why.item1.title'), desc: t('business_page.why.item1.desc') },
  { title: t('business_page.why.item2.title'), desc: t('business_page.why.item2.desc') },
  { title: t('business_page.why.item3.title'), desc: t('business_page.why.item3.desc') },
  { title: t('business_page.why.item4.title'), desc: t('business_page.why.item4.desc') },
  { title: t('business_page.why.item5.title'), desc: t('business_page.why.item5.desc') },
])
</script>

<template>
  <section class="py-16 lg:py-20 bg-off-white relative overflow-hidden">
    <div class="section-container relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <p class="text-xs font-heading font-bold text-accent uppercase tracking-[0.2em] mb-4">
          {{ $t('business_page.why.label') }}
        </p>
        <h2 class="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-navy max-w-3xl mx-auto leading-tight">
          {{ $t('business_page.why.heading') }}
        </h2>
      </div>

      <!-- Benefits Horizontal Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-12 lg:gap-y-0 lg:divide-x lg:divide-[#E6ECF2]/40">
        <div
          v-for="(item, idx) in benefits"
          :key="item.title"
          class="flex flex-col items-center text-center px-6 lg:px-4 xl:px-8 transition-transform duration-300 hover:-translate-y-1"
        >
          <!-- Elegant Line-Art SVG Icons -->
          <div class="mb-6 flex items-center justify-center min-h-[56px]">
            <!-- Column 1: Experienced Team -->
            <svg v-if="idx === 0" class="w-14 h-14 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>

            <!-- Column 2: Safe & Effective -->
            <svg v-else-if="idx === 1" class="w-14 h-14 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <!-- Column 3: Custom Solutions -->
            <svg v-else-if="idx === 2" class="w-14 h-14 text-navy rotate-[30deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c-1.1 0-2-.9-2-2v-1.5a1.5 1.5 0 0 0-1.5-1.5H6.5A1.5 1.5 0 0 1 5 15.5V14a1.5 1.5 0 0 0-1.5-1.5H2c-1.1 0-2-.9-2-2s.9-2 2-2h1.5A1.5 1.5 0 0 0 5 7.5V6a1.5 1.5 0 0 1 1.5-1.5H8a1.5 1.5 0 0 0 1.5-1.5V1.5C9.5.7 10.3 0 11.2 0s1.7.7 1.7 1.5V3a1.5 1.5 0 0 0 1.5 1.5h1.6A1.5 1.5 0 0 1 19 6v1.5a1.5 1.5 0 0 0 1.5 1.5H22c1.1 0 2 .9 2 2s-.9 2-2 2h-1.5a1.5 1.5 0 0 0-1.5 1.5v1.6a1.5 1.5 0 0 1-1.5 1.5H16c-1.1 0-2 .9-2 2v1.5c0 1.1-.9 2-2 2z" />
            </svg>

            <!-- Column 4: Measurable Impact -->
            <svg v-else-if="idx === 3" class="w-14 h-14 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Bars -->
              <path d="M6 20v-5" />
              <path d="M12 20v-8" />
              <path d="M18 20v-12" />
              <!-- Trend line -->
              <path d="M3 18l6-6 4 3 8-9" />
              <!-- Arrowhead -->
              <path d="M17 6h4v4" />
            </svg>

            <!-- Column 5: People First -->
            <svg v-else-if="idx === 4" class="w-14 h-14 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-heading font-bold text-navy mb-3 leading-snug">
            {{ item.title }}
          </h3>

          <!-- Description -->
          <p class="text-[14px] text-text-secondary leading-relaxed font-normal">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

