<script setup lang="ts">
const { t, locale } = useI18n()
const { trackCTA } = useTracking()
const localePath = useLocalePath()

function handleLearnMore(e: Event) {
  trackCTA('hero-learn-more', 'business')
  e.preventDefault()
  const el = document.getElementById('solutions')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <section class="relative bg-[#FAFAFA] overflow-hidden pt-6 pb-12 lg:pt-8 lg:pb-16">
    <!-- Premium Mesh Gradient Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Animated Orbs -->
      <div class="absolute top-[10%] right-[-10%] w-[50%] h-[60%] bg-[#0B2A4A]/10 blur-[120px] rounded-full animate-pulse-slow mix-blend-multiply" />
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-accent/8 blur-[100px] rounded-full mix-blend-multiply" />
      <div class="absolute top-[40%] left-[20%] w-[35%] h-[35%] bg-accent/5 blur-[100px] rounded-full mix-blend-multiply" />
      

    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
      <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <!-- Left: Content -->
        <div class="w-full lg:w-[50%] flex flex-col justify-center pt-6 lg:pt-0">

          <!-- Eyebrow Badge -->
          <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-6 animate-fade-in-up w-fit group cursor-default hover:bg-white/80 transition-all duration-500">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span class="text-[12px] font-heading font-bold text-navy/80 uppercase tracking-[0.15em] group-hover:text-navy transition-colors">{{ $t('business_page.hero.label') }}</span>
          </div>

          <!-- Heading -->
          <h1 class="font-heading font-bold text-navy tracking-tight mb-6 text-[44px] leading-[1.05] md:text-[54px] xl:text-[68px] animate-fade-in-up" style="animation-delay: 100ms">
            <span class="relative inline-block">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-navy to-[#1e446d]">
                {{ locale === 'vi' ? 'Con người tốt hơn.' : 'Better people.' }}
              </span>
            </span>
            <br />
            <span class="relative inline-block">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#ff984f]">
                {{ locale === 'vi' ? 'Hiệu suất tốt hơn.' : 'Better performance.' }}
              </span>
              <!-- Curved underline SVG -->
              <svg class="absolute w-full h-[12px] -bottom-1 left-0 text-accent/20 z-0" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>

          <!-- Subtext with accent bar -->
          <div class="flex items-start gap-5 mb-8 max-w-[500px] animate-fade-in-up" style="animation-delay: 200ms">
            <div class="mt-1.5 w-1.5 h-full min-h-[40px] rounded-full bg-gradient-to-b from-navy to-navy/20 shrink-0 hidden sm:block" />
            <p class="text-[18px] text-navy/70 leading-relaxed font-medium">
              {{ $t('business_page.hero.subtext') }}
            </p>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center gap-4 mb-10 animate-fade-in-up" style="animation-delay: 300ms">
            <a href="https://zalo.me/4237229823551208502" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white font-heading font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(244,122,31,0.25)] hover:shadow-[0_12px_24px_rgba(244,122,31,0.35)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden" @click="trackCTA('hero-book-now', 'business')">
              <div class="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out"></div>
              <span class="relative z-10">{{ $t('business_page.hero.cta1') }}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            
            <a href="#solutions" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-white backdrop-blur-sm border border-navy/10 text-navy font-heading font-bold text-[16px] rounded-2xl shadow-sm hover:border-navy/20 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]" @click="handleLearnMore">
              {{ $t('business_page.hero.cta2') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </a>
          </div>

        </div>

        <!-- Right: Image with Floating Elements -->
        <div class="w-full lg:w-[50%] relative animate-fade-in-up" style="animation-delay: 200ms">
          <!-- Main Image Container -->
          <div class="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[580px] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(11,42,74,0.12)] border-[8px] border-white/50 bg-white/50 backdrop-blur-sm p-2">
            <img
              src="/images/business-hero.png"
              alt="Business workshop — Stretch.vn"
              class="w-full h-full object-cover rounded-[28px] transition-transform duration-[2000ms] ease-out hover:scale-[1.04]"
              loading="eager"
              fetchpriority="high"
            />
            <!-- Premium Overlay Gradient -->
            <div class="absolute inset-2 rounded-[28px] bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-80 mix-blend-multiply pointer-events-none"></div>
          </div>

          <!-- Floating Stat Card -->
          <div class="absolute bottom-8 right-[-1rem] md:right-[-2rem] flex items-center gap-4 px-6 py-4 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-white z-20 animate-fade-in-up hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-default" style="animation-delay: 600ms">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1e446d] flex items-center justify-center text-white shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="pl-2">
              <p class="text-[24px] font-heading font-bold text-navy leading-none mb-0.5">50<span class="text-accent">+</span></p>
              <p class="text-[10px] text-navy/50 font-bold tracking-[0.1em] uppercase">Business partners</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}
</style>
