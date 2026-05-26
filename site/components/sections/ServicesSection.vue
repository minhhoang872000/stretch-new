<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const individualServices = computed(() => [
  { 
    name: t('services.sport_recovery'), 
    href: '/individual',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v.01M22 20h-7M5 20H2M10.7 20l1.3-3.5M15.4 10l-3.4 6.5M3.5 13l2.5-3.5 1.5 2 2-3.5 4.5 4.5 2-2.5 3 4.5"/></svg>`
  },
  { 
    name: t('services.rehabilitation'), 
    href: '/individual',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  },
  { 
    name: t('services.targeted_relief'), 
    href: '/individual',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>`
  },
])

const businessServices = computed(() => [
  { 
    name: t('services.event_solutions'), 
    href: '/business/recovery-event',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  },
  { 
    name: t('services.education_training'), 
    href: '/business/education-training',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
  },
  { 
    name: t('services.corporate_wellness'), 
    href: '/business/corporate-wellness',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
])
</script>

<template>
  <section id="services" class="py-20 lg:py-28 bg-off-white">
    <div class="section-container">
      <!-- Section Title -->
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-navy relative inline-block">
          {{ $t('services.title') }}
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-full" />
        </h2>
      </div>

      <!-- Two cards side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Individual Card -->
        <div class="group relative bg-white rounded-3xl border border-border-default overflow-hidden flex flex-col min-h-[480px] shadow-sm hover:shadow-xl transition-all duration-500">
          <!-- Card Background Image/Overlay -->
          <div class="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
            <NuxtImg src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop" alt="" class="w-full h-full object-cover grayscale" format="webp" />
            <div class="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
          </div>

          <div class="relative p-6 lg:p-8 flex flex-col flex-1 z-10">
            <!-- Header Section -->
            <div class="flex items-start gap-5 mb-5">
              <div class="w-12 h-12 rounded-full bg-off-white flex items-center justify-center shadow-sm border border-border-default flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-off-white border border-border-default mb-3">
                  <span class="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">{{ $t('services.individual_label') }}</span>
                </div>
                <h3 class="text-2xl lg:text-3xl font-heading font-bold text-navy mb-3 leading-tight max-w-[300px]">
                  {{ $t('services.individual_title') }}
                </h3>
                <p class="text-sm text-text-secondary leading-relaxed max-w-[380px]">
                  {{ $t('services.individual_desc') }}
                </p>
              </div>
            </div>

            <!-- Service Rows -->
            <div class="space-y-3 mb-6 flex-1">
              <NuxtLink
                v-for="service in individualServices"
                :key="service.name"
                :to="localePath(service.href)"
                class="flex items-center justify-between p-3.5 rounded-xl border border-border-default bg-white hover:border-navy hover:shadow-md transition-all cursor-pointer group/row"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 group-hover/row:bg-accent transition-colors">
                    <div v-html="service.icon" />
                  </div>
                  <span class="font-heading font-bold text-navy text-[15px]">{{ service.name }}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-secondary group-hover/row:translate-x-1 group-hover/row:text-navy transition-all">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </div>

            <!-- CTA -->
            <NuxtLink :to="localePath('/individual')" class="w-full bg-navy hover:bg-navy-light text-white font-heading font-bold py-4 px-8 rounded-2xl flex items-center justify-between group/btn transition-all">
              <span class="text-sm uppercase tracking-wider">{{ $t('services.explore_individual') }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Business Card -->
        <div class="group relative bg-white rounded-3xl border border-border-default overflow-hidden flex flex-col min-h-[480px] shadow-sm hover:shadow-xl transition-all duration-500">
          <!-- Card Background Image/Overlay -->
          <div class="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
            <NuxtImg src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop" alt="" class="w-full h-full object-cover grayscale" format="webp" />
            <div class="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
          </div>

          <div class="relative p-6 lg:p-8 flex flex-col flex-1 z-10">
            <!-- Header Section -->
            <div class="flex items-start gap-5 mb-5">
              <div class="w-12 h-12 rounded-full bg-off-white flex items-center justify-center shadow-sm border border-border-default flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-off-white border border-border-default mb-3">
                  <span class="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">{{ $t('services.business_label') }}</span>
                </div>
                <h3 class="text-2xl lg:text-3xl font-heading font-bold text-navy mb-3 leading-tight max-w-[300px]">
                  {{ $t('services.business_title') }}
                </h3>
                <p class="text-sm text-text-secondary leading-relaxed max-w-[380px]">
                  {{ $t('services.business_desc') }}
                </p>
              </div>
            </div>

            <!-- Service Rows -->
            <div class="space-y-3 mb-6 flex-1">
              <NuxtLink
                v-for="service in businessServices"
                :key="service.name"
                :to="localePath(service.href)"
                class="flex items-center justify-between p-3.5 rounded-xl border border-border-default bg-white hover:border-navy hover:shadow-md transition-all cursor-pointer group/row"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 group-hover/row:bg-accent transition-colors">
                    <div v-html="service.icon" />
                  </div>
                  <span class="font-heading font-bold text-navy text-[15px]">{{ service.name }}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-secondary group-hover/row:translate-x-1 group-hover/row:text-navy transition-all">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </div>

            <!-- CTA -->
            <NuxtLink :to="localePath('/business')" class="w-full bg-navy hover:bg-navy-light text-white font-heading font-bold py-4 px-8 rounded-2xl flex items-center justify-between group/btn transition-all">
              <span class="text-sm uppercase tracking-wider">{{ $t('services.explore_business') }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
