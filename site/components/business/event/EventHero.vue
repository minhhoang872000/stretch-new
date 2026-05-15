<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative bg-navy overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[160px] rounded-full" />
      <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[140px] rounded-full" />
      <div class="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-white/3 blur-[120px] rounded-full" />
      <!-- Grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 60px 60px;" />
    </div>

    <div class="relative flex flex-col lg:flex-row min-h-[600px] lg:min-h-[720px]">
      <!-- Left: Content -->
      <div class="relative z-10 w-full lg:w-[52%] flex items-center py-12 lg:py-16 px-6 md:px-10 lg:pl-[max(3rem,calc((100vw-80rem)/2+3rem))] lg:pr-8">
        <div class="w-full max-w-[580px]">
          <!-- Eyebrow Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-10 animate-fade-in-up">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span class="text-[12px] font-heading font-bold text-accent uppercase tracking-[0.2em]">{{ $t('event_page.hero.label') }}</span>
          </div>

          <!-- Heading -->
          <h1 class="font-heading font-bold text-white tracking-tight mb-8 text-[48px] leading-[1.06] md:text-[60px] lg:text-[72px] animate-fade-in-up" style="animation-delay: 100ms">
            {{ $t('event_page.hero.heading') }}
          </h1>

          <!-- Subtext -->
          <div class="flex items-start gap-5 mb-12 max-w-[460px] animate-fade-in-up" style="animation-delay: 200ms">
            <span class="mt-2 w-1.5 h-12 rounded-full bg-accent shrink-0" />
            <p class="text-[18px] text-white/60 leading-relaxed font-light">
              {{ $t('event_page.hero.subtext') }}
            </p>
          </div>

          <!-- CTAs -->
          <div class="flex flex-wrap items-center gap-4 mb-16 animate-fade-in-up" style="animation-delay: 300ms">
            <NuxtLink
              to="#"
              class="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-heading font-bold text-[15px] rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {{ $t('event_page.hero.cta1') }}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </NuxtLink>
            <NuxtLink
              to="#"
              class="inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/15 text-white font-heading font-bold text-[15px] rounded-2xl hover:bg-white/10 hover:border-white/25 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {{ $t('event_page.hero.cta2') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </NuxtLink>
          </div>

          <!-- Stats Row -->
          <div class="flex flex-wrap items-center gap-10 animate-fade-in-up" style="animation-delay: 400ms">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <p class="text-[24px] font-heading font-bold text-white leading-none mb-1">{{ $t('event_page.stats.sessions') }}</p>
                <p class="text-[11px] text-white/40 font-medium uppercase tracking-wider">{{ $t('event_page.stats.sessions_label') }}</p>
              </div>
            </div>
            <div class="w-px h-10 bg-white/10" />
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p class="text-[24px] font-heading font-bold text-white leading-none mb-1">{{ $t('event_page.stats.events') }}</p>
                <p class="text-[11px] text-white/40 font-medium uppercase tracking-wider">{{ $t('event_page.stats.events_label') }}</p>
              </div>
            </div>
            <div class="w-px h-10 bg-white/10" />
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <p class="text-[24px] font-heading font-bold text-white leading-none mb-1">{{ $t('event_page.stats.partners') }}</p>
                <p class="text-[11px] text-white/40 font-medium uppercase tracking-wider">{{ $t('event_page.stats.partners_label') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Image -->
      <div class="relative w-full lg:w-[48%] min-h-[400px] lg:min-h-0 overflow-hidden">
        <img
          src="/images/event-solution.png"
          alt="Recovery Event Solutions"
          class="w-full h-full object-cover object-center lg:absolute lg:inset-0 transition-transform duration-[1200ms] ease-out hover:scale-[1.02]"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-navy to-transparent lg:w-48 pointer-events-none" />
      </div>
    </div>
  </section>
</template>
