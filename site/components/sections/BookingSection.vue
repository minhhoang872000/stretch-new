<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <section id="booking" class="py-16 md:py-24 bg-surface-container">
    <div class="section-container">
      <div class="max-w-4xl mx-auto text-center">
        <span class="badge-accent mb-4 inline-block">{{ $t('bookingSection.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('bookingSection.title') }}</h2>
        <p class="section-subtitle">
          {{ $t('bookingSection.subtitle') }}
        </p>

        <!-- 3-Step Visual -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16">
          <div class="flex flex-col items-center text-center group">
            <div class="w-20 h-20 rounded-[24px] bg-white shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-300">
              <span class="material-symbols-outlined text-primary text-3xl">touch_app</span>
            </div>
            <div class="font-heading text-caption text-primary-container font-bold uppercase tracking-[0.22em] mb-2">{{ $t('bookingSection.step1') }}</div>
            <h3 class="font-heading font-bold text-lg mb-2">{{ $t('bookingSection.step1Title') }}</h3>
            <p class="text-body-sm text-on-surface-variant">{{ $t('bookingSection.step1Desc') }}</p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div class="w-20 h-20 rounded-[24px] bg-white shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-300">
              <span class="material-symbols-outlined text-primary text-3xl">calendar_month</span>
            </div>
            <div class="font-heading text-caption text-primary-container font-bold uppercase tracking-[0.22em] mb-2">{{ $t('bookingSection.step2') }}</div>
            <h3 class="font-heading font-bold text-lg mb-2">{{ $t('bookingSection.step2Title') }}</h3>
            <p class="text-body-sm text-on-surface-variant">{{ $t('bookingSection.step2Desc') }}</p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div class="w-20 h-20 rounded-[24px] bg-white shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-300">
              <span class="material-symbols-outlined text-primary text-3xl">verified</span>
            </div>
            <div class="font-heading text-caption text-primary-container font-bold uppercase tracking-[0.22em] mb-2">{{ $t('bookingSection.step3') }}</div>
            <h3 class="font-heading font-bold text-lg mb-2">{{ $t('bookingSection.step3Title') }}</h3>
            <p class="text-body-sm text-on-surface-variant">{{ $t('bookingSection.step3Desc') }}</p>
          </div>
        </div>

        <BaseButton variant="accent" size="lg" :href="localePath('/booking')">
          <span class="material-symbols-outlined text-lg">calendar_month</span>
          {{ $t('nav.bookSession') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>
