<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const metrics = computed(() => [
  {
    count: t('trust_bar.hours_count'),
    label: t('trust_bar.hours_label'),
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    count: t('trust_bar.events_count'),
    label: t('trust_bar.events_label'),
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`
  },
  {
    count: t('trust_bar.partners_count'),
    label: t('trust_bar.partners_label'),
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2 6-6"/><path d="m8 14 2 2 2-2"/><path d="M5 21 3 19l7-7 2 2"/><path d="M19 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1l-3 3-3-3h-5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12z"/></svg>`
  }
])
</script>

<template>
  <section class="relative bg-white overflow-hidden pb-6">
    <!-- Background subtle pattern -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy/3 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4 pointer-events-none" />

    <div class="section-container relative z-10">
      <!-- Main Hero Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 pb-4 lg:pt-14 lg:pb-8">
        <!-- Left column: Copy -->
        <div class="order-2 lg:order-1">
          <!-- Label -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-off-white border border-border-default mb-4">
            <div class="w-1.5 h-1.5 rounded-full bg-accent" />
            <span class="text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-widest">
              {{ $t('hero.eyebrow') }}
            </span>
          </div>

          <!-- Headline -->
          <h1 class="text-h1 font-heading font-bold text-navy mb-4 tracking-tight">
            {{ $t('hero.title1') }}<br>
            {{ $t('hero.title2') }} <span class="text-highlight-orange">{{ $t('hero.titleHighlight') }}</span>
          </h1>

          <!-- Subtext -->
          <p class="text-body text-text-secondary max-w-lg mb-5">
            {{ $t('hero.subtitle') }}
          </p>

          <!-- USP Chips -->
          <div class="flex flex-wrap gap-6 mb-6">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-off-white border border-border-default flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <span class="text-sm font-semibold text-navy block leading-tight">{{ $t('hero.usp1_title') }}</span>
                <span class="text-xs text-text-secondary">{{ $t('hero.usp1_sub') }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-off-white border border-border-default flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <span class="text-sm font-semibold text-navy block leading-tight">{{ $t('hero.usp2_title') }}</span>
                <span class="text-xs text-text-secondary">{{ $t('hero.usp2_sub') }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-off-white border border-border-default flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <span class="text-sm font-semibold text-navy block leading-tight">{{ $t('hero.usp3_title') }}</span>
                <span class="text-xs text-text-secondary">{{ $t('hero.usp3_sub') }}</span>
              </div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap gap-4">
            <NuxtLink :to="localePath('/booking')" class="btn-navy px-8">
              {{ $t('hero.bookSession') }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </NuxtLink>
            <a href="#services" class="btn-outline px-8">
              {{ $t('hero.learnMore') }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Right column: Image -->
        <div class="order-1 lg:order-2 relative">
          <div class="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[1.15/1] bg-off-white shadow-xl">
            <img
              src="/hero-physiotherapy.png"
              alt="Professional physiotherapy session — a therapist treating a patient"
              class="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <!-- Decorative dots -->
          <div class="absolute -top-6 -right-6 hidden lg:grid grid-cols-4 gap-2 opacity-20">
            <span v-for="i in 16" :key="i" class="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
        </div>
      </div>

      <!-- Integrated Trust Bar -->
      <div class="bg-white/80 backdrop-blur-md border border-border rounded-3xl p-6 lg:p-8 shadow-float mt-4 lg:-mt-6 relative z-20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
          <div
            v-for="(metric, index) in metrics"
            :key="index"
            class="flex items-center gap-5 lg:px-6"
            :class="{ 'lg:border-r border-border': index < metrics.length }"
          >
            <div class="text-navy opacity-40" v-html="metric.icon" />
            <div>
              <p class="text-xl lg:text-2xl font-heading font-bold text-navy leading-none mb-1">{{ metric.count }}</p>
              <p class="text-[11px] lg:text-xs text-text-secondary font-medium leading-tight uppercase tracking-wide">{{ metric.label }}</p>
            </div>
          </div>

          <!-- Monaco Branding -->
          <div class="flex items-center gap-4 lg:pl-6">
            <div class="flex flex-col">
              <span class="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1.5">{{ $t('why_stretch.powered_by') }}</span>
              <div class="flex items-center gap-2.5">
                <img src="~/assets/image/monaco.jpeg" alt="Monaco Healthcare" class="h-8 w-auto object-contain" />
                <span class="text-sm font-heading font-bold text-navy tracking-tighter uppercase">Monaco Healthcare</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
