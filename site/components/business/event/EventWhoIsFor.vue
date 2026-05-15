<script setup lang="ts">
const { t } = useI18n()

const features = computed(() => [
  {
    title: t('event_page.who_is_for.item1.title'),
    desc: t('event_page.who_is_for.item1.desc'),
    icon: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`
  },
  {
    title: t('event_page.who_is_for.item2.title'),
    desc: t('event_page.who_is_for.item2.desc'),
    icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`
  },
  {
    title: t('event_page.who_is_for.item3.title'),
    desc: t('event_page.who_is_for.item3.desc'),
    icon: `<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>`
  },
  {
    title: t('event_page.who_is_for.item4.title'),
    desc: t('event_page.who_is_for.item4.desc'),
    icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
  }
])
</script>

<template>
  <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[-15%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
      <div class="absolute bottom-[10%] left-[-15%] w-[40%] h-[40%] bg-navy/5 blur-[130px] rounded-full" />
    </div>

    <div class="section-container relative z-10">
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-accent" />
          <span class="text-[11px] font-heading font-bold text-accent uppercase tracking-[0.2em]">{{ $t('event_page.who_is_for.label') }}</span>
        </div>
        <h2 class="text-3xl lg:text-5xl font-heading font-bold text-navy">
          {{ $t('event_page.who_is_for.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(feature, idx) in features" :key="idx" class="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-off-white/50 border border-transparent hover:border-border-default hover:bg-white hover:shadow-xl hover:shadow-navy/5 hover:-translate-y-1 transition-all duration-500">
          <!-- Number accent -->
          <span class="absolute top-4 right-4 text-[80px] font-heading font-bold text-navy/[0.03] leading-none select-none pointer-events-none group-hover:text-accent/[0.06] transition-colors duration-500">
            {{ String(idx + 1).padStart(2, '0') }}
          </span>

          <!-- Icon -->
          <div class="relative w-20 h-20 rounded-3xl bg-white border border-border-default flex items-center justify-center mb-6 group-hover:bg-accent group-hover:border-accent group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-500 z-10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="feature.icon" class="text-navy group-hover:text-white transition-colors duration-500" />
          </div>

          <h3 class="text-lg font-heading font-bold text-navy mb-3 z-10">{{ feature.title }}</h3>
          <p class="text-[15px] text-text-secondary leading-relaxed z-10">{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
