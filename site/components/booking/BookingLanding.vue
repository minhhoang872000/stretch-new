<script setup lang="ts">
const emit = defineEmits<{
  (e: 'selectFlow', flow: 'individual' | 'business'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <section class="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      <div class="section-container flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <!-- Text content -->
        <div class="flex-1 text-center lg:text-left">
          <span class="eyebrow text-accent mb-6 block tracking-[0.2em]">
            {{ t('booking_v2.landing.eyebrow') }}
          </span>
          <h1 class="text-h1 text-navy mb-8 leading-[1.1]" v-html="t('booking_v2.landing.title', { br: '<br class=\'hidden lg:block\' />' })">
          </h1>
          
          <!-- Trust Stats (Mini) -->
          <div class="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
            <div class="flex items-center gap-3">
              <svg class="text-accent w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 20V10M12 20V4M6 20v-6" />
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <div class="text-left">
                <p class="font-bold text-navy leading-none">{{ t('trust_bar.hours_count') }}</p>
                <p class="text-[10px] text-text-secondary uppercase tracking-wider">{{ t('trust_bar.hours_label') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <svg class="text-accent w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div class="text-left">
                <p class="font-bold text-navy leading-none">{{ t('trust_bar.events_count') }}</p>
                <p class="text-[10px] text-text-secondary uppercase tracking-wider">{{ t('trust_bar.events_label') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <svg class="text-accent w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div class="text-left">
                <p class="font-bold text-navy leading-none">{{ t('trust_bar.partners_count') }}</p>
                <p class="text-[10px] text-text-secondary uppercase tracking-wider">{{ t('trust_bar.partners_label') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="flex-1 relative max-w-xl w-full">
          <div class="aspect-[4/3] rounded-3xl overflow-hidden shadow-elevated">
            <NuxtImg 
              src="/booking-hero-new.png" 
              alt="Physiotherapy" 
              class="w-full h-full object-cover"
            format="webp" />
          </div>
          <!-- Floating Badge -->
          <div class="absolute -bottom-6 -left-6 glass-card p-3 flex items-center gap-3 animate-fade-in-up delay-300">
            <img src="/monaco.jpeg" alt="Monaco Healthcare" class="h-10 w-auto object-contain rounded-lg" />
            <div class="pr-2 border-l border-border-default pl-3 ml-1">
              <p class="text-[9px] text-text-secondary uppercase tracking-wider leading-none mb-1">Powered by</p>
              <p class="font-bold text-navy text-xs">Monaco Healthcare</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Selection Cards -->
    <section class="pb-24">
      <div class="section-container">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Individual Card -->
          <div class="card group p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.individual') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.individual_desc') }}</p>
            <button 
              @click="emit('selectFlow', 'individual')"
              class="btn-orange w-full justify-center group"
            >
              {{ t('booking_v2.landing.start') }}
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <!-- Business Card -->
          <div class="card group p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-navy/5 text-navy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
                <line x1="9" y1="22" x2="9" y2="16" />
                <line x1="15" y1="22" x2="15" y2="16" />
                <line x1="9" y1="16" x2="15" y2="16" />
                <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
              </svg>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.business') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.business_desc') }}</p>
            <button 
              @click="emit('selectFlow', 'business')"
              class="btn-navy w-full justify-center group"
            >
              {{ t('booking_v2.landing.start') }}
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <!-- Not Sure Card -->
          <div class="card group p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-text-secondary/5 text-text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.not_sure') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.not_sure_desc') }}</p>
            <a 
              href="http://zalo.me/4237229823551208502?src=qr&f=1" 
              target="_blank"
              class="btn-outline w-full justify-center"
            >
              {{ t('booking_v2.landing.chat_zalo') }}
            </a>
          </div>
        </div>

        <!-- Summary Bar -->
        <div class="mt-20 glass-card p-10 lg:p-12 border-navy/5">
          <h4 class="text-navy font-bold text-lg mb-8 text-center lg:text-left">{{ t('booking_v2.landing.summary_title') }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 4.5v1h8v-1c0-1.5-1-3.25-2.5-4.5z" />
                  <path d="M12 2v10a4 4 0 0 0 8 0V2" />
                  <path d="M8 2h8" />
                  <circle cx="16" cy="18" r="3" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-navy mb-1">{{ t('booking_v2.landing.summary_assess') }}</p>
                <p class="text-xs text-text-secondary leading-relaxed">{{ t('booking_v2.landing.summary_assess_desc') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" ry="2" transform="rotate(-45 12 12)" />
                  <path d="M10 8.5l5.5 5.5" />
                  <path d="M8.5 10l5.5 5.5" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-navy mb-1">{{ t('booking_v2.landing.summary_treat') }}</p>
                <p class="text-xs text-text-secondary leading-relaxed">{{ t('booking_v2.landing.summary_treat_desc') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-navy mb-1">{{ t('booking_v2.landing.summary_guide') }}</p>
                <p class="text-xs text-text-secondary leading-relaxed">{{ t('booking_v2.landing.summary_guide_desc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
