<script setup lang="ts">
const { t } = useI18n()
const { trackCTA } = useTracking()
const localePath = useLocalePath()

const partners = [
  { name: 'ironman', logo: '/logos/ironman.png' },
  { name: 'GARMIN', logo: '/logos/garmin.png' },
  { name: 'hyrox', logo: '/logos/hyrox.webp' },
  { name: 'decathlon', logo: '/logos/decathlon.png' },
  { name: 'partner-1', logo: '/logos/partner-1.png' },
]

const existingPartners = [
  { name: 'Frasers Property', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Frasers_Property_logo.svg/2560px-Frasers_Property_logo.svg.png' },
  { name: 'Skercher Running Club', logo: '/logos/skercher.png' },
  { name: 'FE Viet', logo: '/logos/fe-viet.png' },
  { name: 'PPA', logo: '/logos/ppa.png' },
  { name: 'Manulife', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Manulife_logo.svg/1200px-Manulife_logo.svg.png' },
]

// Assuming we should use the old ones if the new ones are not uploaded yet. I will use the old ones to avoid broken links but name it partners.
const displayPartners = partners
</script>

<template>
  <section class="py-20 lg:py-28 bg-off-white relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[140px] rounded-full" />
      <div class="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] bg-navy/5 blur-[130px] rounded-full" />
    </div>

    <div class="section-container relative z-10 px-4">
      <!-- Main Combined Card -->
      <div class="relative bg-[#021327] rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl overflow-hidden mx-auto max-w-[1100px] border border-white/5">
        <!-- Subtle texture -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.02]" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;" />

        <div class="relative z-10">
          <!-- Top: Trust -->
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-8 py-8 lg:px-12 lg:py-10 border-b border-white/10">
            <div class="w-full lg:w-1/3 text-left">
              <h3 class="text-[18px] lg:text-[22px] font-heading font-bold text-white leading-snug">
                {{ $t('business_page.trust.heading') }}
              </h3>
            </div>
            <div class="w-full lg:w-2/3 flex flex-wrap items-center justify-start lg:justify-end gap-x-12 gap-y-8">
              <div v-for="p in displayPartners" :key="p.name" class="flex items-center justify-center w-[140px] md:w-[200px]">
                <img :src="p.logo" :alt="p.name" class="h-10 md:h-14 lg:h-16 w-auto max-w-full object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300" />
              </div>
            </div>
          </div>

          <!-- Bottom: CTA -->
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 px-8 py-8 lg:px-12 lg:pb-16 lg:pt-10">
            <div class="w-full lg:flex-1 text-left">
              <h2 class="text-[26px] lg:text-[32px] font-heading font-bold text-[#FF7A45] mb-2 leading-tight">
                {{ $t('business_page.cta.heading') }}
              </h2>
              <p class="text-white/80 text-[15px] lg:text-[17px]">
                {{ $t('business_page.cta.sub') }}
              </p>
            </div>
            <div class="w-full lg:w-auto flex flex-wrap items-center justify-start lg:justify-end gap-4">
              <NuxtLink
                to="#"
                class="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#FF7A45] text-white font-heading font-bold text-[15px] rounded-lg hover:bg-[#E66A35] shadow-lg shadow-[#FF7A45]/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                @click="trackCTA('business-cta-book', 'corporate')"
              >
                {{ $t('business_page.cta.cta1') }}
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </NuxtLink>
              <NuxtLink
                to="#"
                class="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent border border-white/20 text-white font-heading font-bold text-[15px] rounded-lg hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                @click="trackCTA('business-cta-contact', 'corporate')"
              >
                {{ $t('business_page.cta.cta2') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="max-w-[850px] mx-auto relative z-20 -mt-8 lg:-mt-10 px-4">
        <div class="bg-white rounded-[2rem] border border-border-default px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-navy/5">
          
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full border border-border-default bg-[#F9FAFB] flex items-center justify-center flex-shrink-0 text-navy">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="text-left">
              <h4 class="text-navy font-heading font-bold text-[15px] leading-snug">{{ $t('business_page.cta.bar_text') }}</h4>
              <p class="text-text-secondary text-[13px] mt-0.5">{{ $t('business_page.cta.bar_sub') }}</p>
            </div>
          </div>
          
          <div class="hidden md:block w-px h-10 bg-border-default mx-2"></div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full md:w-auto">
            <NuxtLink to="#" class="flex items-center gap-2.5 text-navy font-heading font-bold text-[14px] hover:text-[#FF7A45] transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF7A45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {{ $t('business_page.cta.cta1') }}
            </NuxtLink>
            
            <div class="hidden sm:block w-px h-6 bg-border-default"></div>

            <NuxtLink to="#" class="flex items-center gap-2.5 text-navy font-heading font-bold text-[14px] hover:text-[#FF7A45] transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF7A45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              {{ $t('business_page.cta.cta2') }}
            </NuxtLink>
          </div>
        </div>
      </div> -->
    </div>
  </section>
</template>
