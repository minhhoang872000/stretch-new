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
              <span class="material-symbols-outlined text-accent !text-2xl">exercise</span>
              <div class="text-left">
                <p class="font-bold text-navy leading-none">{{ t('trust_bar.hours_count') }}</p>
                <p class="text-[10px] text-text-secondary uppercase tracking-wider">{{ t('trust_bar.hours_label') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-accent !text-2xl">calendar_month</span>
              <div class="text-left">
                <p class="font-bold text-navy leading-none">{{ t('trust_bar.events_count') }}</p>
                <p class="text-[10px] text-text-secondary uppercase tracking-wider">{{ t('trust_bar.events_label') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-accent !text-2xl">groups</span>
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
            <img 
              src="/booking-hero-new.png" 
              alt="Physiotherapy" 
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Floating Badge -->
          <div class="absolute -bottom-6 -left-6 glass-card p-3 flex items-center gap-3 animate-fade-in-up delay-300">
            <img src="~/assets/image/monaco.jpeg" alt="Monaco Healthcare" class="h-10 w-auto object-contain rounded-lg" />
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
              <span class="material-symbols-outlined !text-4xl">person</span>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.individual') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.individual_desc') }}</p>
            <button 
              @click="emit('selectFlow', 'individual')"
              class="btn-orange w-full justify-center group"
            >
              {{ t('booking_v2.landing.start') }}
              <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

          <!-- Business Card -->
          <div class="card group p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-navy/5 text-navy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined !text-4xl">corporate_fare</span>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.business') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.business_desc') }}</p>
            <button 
              @click="emit('selectFlow', 'business')"
              class="btn-navy w-full justify-center group"
            >
              {{ t('booking_v2.landing.start') }}
              <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

          <!-- Not Sure Card -->
          <div class="card group p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-text-secondary/5 text-text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined !text-4xl">chat</span>
            </div>
            <h3 class="text-h3 text-navy mb-2">{{ t('booking_v2.landing.not_sure') }}</h3>
            <p class="text-text-secondary text-sm mb-8">{{ t('booking_v2.landing.not_sure_desc') }}</p>
            <a 
              href="https://zalo.me/yourid" 
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
                <span class="material-symbols-outlined !text-xl">stethoscope</span>
              </div>
              <div>
                <p class="font-bold text-navy mb-1">{{ t('booking_v2.landing.summary_assess') }}</p>
                <p class="text-xs text-text-secondary leading-relaxed">{{ t('booking_v2.landing.summary_assess_desc') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                <span class="material-symbols-outlined !text-xl">personal_injury</span>
              </div>
              <div>
                <p class="font-bold text-navy mb-1">{{ t('booking_v2.landing.summary_treat') }}</p>
                <p class="text-xs text-text-secondary leading-relaxed">{{ t('booking_v2.landing.summary_treat_desc') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                <span class="material-symbols-outlined !text-xl">self_improvement</span>
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
