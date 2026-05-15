<script setup lang="ts">
const { t } = useI18n()

const locations = computed(() => [
  {
    id: 'home',
    title: t('where_we_work.home_title'),
    desc: t('where_we_work.home_desc'),
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    id: 'clinic',
    title: t('where_we_work.clinic_title'),
    desc: t('where_we_work.clinic_desc'),
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>`
  },
  {
    id: 'event',
    title: t('where_we_work.event_title'),
    desc: t('where_we_work.event_desc'),
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  }
])
</script>

<template>
  <section class="py-12 bg-white">
    <div class="section-container">
      <div class="bg-white border border-border-default rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <!-- Subtle background pattern -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#0B2A4A 1px, transparent 1px); background-size: 20px 20px;" />

        <!-- Title -->
        <div class="text-center mb-12 relative">
          <h2 class="text-2xl md:text-3xl font-heading font-bold text-navy">
            {{ $t('where_we_work.title') }}
          </h2>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-0 relative mb-12">
          <div
            v-for="(loc, index) in locations"
            :key="loc.id"
            class="flex items-center gap-5 px-4 md:px-8 py-6 md:py-0 relative"
            :class="{ 'md:border-r border-border-default': index < locations.length - 1 }"
          >
            <!-- Icon Circle -->
            <div class="w-16 h-16 rounded-full bg-off-white flex items-center justify-center flex-shrink-0 shadow-sm border border-border-default/50">
              <div class="text-navy" v-html="loc.icon" />
            </div>

            <!-- Content -->
            <div>
              <h3 class="font-heading font-bold text-navy text-[15px] mb-1.5">{{ loc.title }}</h3>
              <p class="text-[13px] text-text-secondary leading-relaxed max-w-[180px]">
                {{ loc.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Google Maps Link -->
        <div class="flex justify-center">
          <a 
            href="https://maps.app.goo.gl/WwCZrHPgufY7Ehyr8" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2.5 text-navy hover:text-accent font-heading font-bold text-sm group transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="border-b border-navy/20 group-hover:border-accent/40 pb-0.5">{{ $t('where_we_work.explore_location') }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="translate-y-[0.5px] group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
