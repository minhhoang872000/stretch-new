<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const headingParts = computed(() => {
  const text = t('individual_page.hero.heading')
  const lastSpace = text.lastIndexOf(' ')
  if (lastSpace === -1) return { before: text, highlight: '' }
  return {
    before: text.slice(0, lastSpace + 1),
    highlight: text.slice(lastSpace + 1),
  }
})

const uspIcons = [
  `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`, // Runners (Activity/Performance)
  `<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`, // Office (Monitor/Posture)
  `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`, // Athletes (Trophy)
]
</script>

<template>
  <section class="relative bg-[#FAFAFA] overflow-hidden pt-4 pb-8 lg:pt-6 lg:pb-12">
    <!-- Premium Mesh Gradient Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Animated Orbs -->
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-accent/10 blur-[120px] rounded-full animate-pulse-slow mix-blend-multiply" />
      <div class="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-[#0B2A4A]/5 blur-[100px] rounded-full mix-blend-multiply" />
      <div class="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-accent/5 blur-[120px] rounded-full mix-blend-multiply" />
      
      <!-- Subtle Grid Pattern -->
      <div class="absolute inset-0 opacity-[0.03]"></div>
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
            <span class="text-[12px] font-heading font-bold text-navy/80 uppercase tracking-[0.15em] group-hover:text-navy transition-colors">{{ $t('individual_page.seo_title').split('—')[0].trim() }}</span>
          </div>

          <!-- Heading -->
          <h1 class="font-heading font-bold text-navy tracking-tight mb-6 text-[44px] leading-[1.05] md:text-[54px] xl:text-[68px] animate-fade-in-up" style="animation-delay: 100ms">
            {{ headingParts.before }}
            <span class="relative inline-block">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#ff984f]">{{ headingParts.highlight }}</span>
              <!-- Curved underline SVG -->
              <svg class="absolute w-full h-[12px] -bottom-1 left-0 text-accent/20 z-0" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>

          <!-- Subtext with accent bar -->
          <div class="flex items-start gap-5 mb-8 max-w-[500px] animate-fade-in-up" style="animation-delay: 200ms">
            <div class="mt-1.5 w-1.5 h-full min-h-[40px] rounded-full bg-gradient-to-b from-accent to-accent/20 shrink-0 hidden sm:block" />
            <p class="text-[18px] text-navy/70 leading-relaxed font-medium">
              {{ $t('individual_page.hero.subtext') }}
            </p>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center gap-4 mb-10 animate-fade-in-up" style="animation-delay: 300ms">
            <NuxtLink :to="localePath('/booking')" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white font-heading font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(244,122,31,0.25)] hover:shadow-[0_12px_24px_rgba(244,122,31,0.35)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden">
              <div class="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out"></div>
              <span class="relative z-10">{{ $t('individual_page.hero.cta1') }}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </NuxtLink>
            
            <a href="http://zalo.me/4237229823551208502?src=qr&f=1" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white backdrop-blur-sm border border-navy/10 text-navy font-heading font-bold text-[16px] rounded-2xl shadow-sm hover:border-navy/20 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
              {{ $t('individual_page.hero.cta2') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </a>
          </div>

          <!-- <div class="flex flex-wrap items-center gap-4 lg:gap-5 animate-fade-in-up" style="animation-delay: 400ms">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:bg-white hover:-translate-y-0.5 transition-all duration-300 group/usp">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/usp:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="uspIcons[i - 1]" />
              </div>
              <span class="text-[13px] text-navy font-bold tracking-tight whitespace-nowrap">{{ $t(`individual_page.customer_carousel.card${i}`) }}</span>
            </div>
          </div> -->
          
        </div>

        <div class="w-full lg:w-[50%] relative animate-fade-in-up" style="animation-delay: 200ms">
          <div class="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[580px] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(11,42,74,0.12)]">
            <img
              src="/individual-hero.png"
              alt="Stretch.vn — Professional physiotherapy treatment session"
              class="w-full h-full object-cover object-[70%_center] transition-transform duration-[2000ms] ease-out hover:scale-[1.04]"
              loading="eager"
            />
            <!-- Premium Overlay Gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent opacity-80 mix-blend-multiply"></div>
          </div>

          <!-- Floating Stat Card -->
          <div class="absolute bottom-6 left-[-2rem] md:left-[-4rem] flex items-center gap-4 px-6 py-4 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-white z-20 animate-fade-in-up hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-default" style="animation-delay: 600ms">
            <div class="flex items-center gap-0.5">
              <svg v-for="s in 5" :key="s" width="18" height="18" viewBox="0 0 24 24" :fill="s <= 4 ? '#F47A1F' : 'none'" :stroke="s <= 4 ? '#F47A1F' : '#CBD5E1'" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="pl-3 border-l border-border-default">
              <p class="text-[22px] font-heading font-bold text-navy leading-none mb-0.5">4.9</p>
              <p class="text-[10px] text-navy/50 font-bold tracking-[0.1em] uppercase">{{ locale === 'vi' ? '500+ khách hàng' : '500+ clients' }}</p>
            </div>
          </div>
          
          <!-- Floating Avatar Group -->
          <div class="hidden sm:flex absolute top-8 right-[-2rem] items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-xl rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-white z-20 animate-fade-in-up hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500" style="animation-delay: 800ms">
            <div class="flex -space-x-3">
              <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" class="w-full h-full object-cover"></div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" class="w-full h-full object-cover"></div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" class="w-full h-full object-cover"></div>
            </div>
            <div class="pl-2">
              <p class="text-[12px] font-bold text-navy">Join them</p>
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
