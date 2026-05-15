<script setup lang="ts">
const { t } = useI18n()

const whereCards = computed(() => [
  { title: t('event_page.where_works.item1'), img: '/pickleball.png' },
  { title: t('event_page.where_works.item2'), img: '/marathon.png' },
  { title: t('event_page.where_works.item3'), img: '/tennis.png' },
  { title: t('event_page.where_works.item4'), img: '/corporate-sports.png' }
])

const howSteps = computed(() => [
  {
    title: t('event_page.how_works.step1.title'),
    desc: t('event_page.how_works.step1.desc'),
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`
  },
  {
    title: t('event_page.how_works.step2.title'),
    desc: t('event_page.how_works.step2.desc'),
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
  }
])
</script>

<template>
  <section class="py-12 lg:py-20 bg-white relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[15%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[140px] rounded-full" />
      <div class="absolute bottom-[15%] left-[-10%] w-[35%] h-[35%] bg-navy/5 blur-[120px] rounded-full" />
    </div>

    <div class="section-container relative z-10">
      <div class="flex flex-col lg:flex-row gap-20 lg:gap-24">

        <!-- Left: Where this works -->
        <div class="w-full lg:w-[55%]">
          <div class="mb-10">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-accent" />
              <span class="text-[11px] font-heading font-bold text-accent uppercase tracking-[0.2em]">{{ $t('event_page.where_works.label') }}</span>
            </div>
            <h2 class="text-2xl lg:text-4xl font-heading font-bold text-navy mb-4">
              {{ $t('event_page.where_works.heading') }}
            </h2>
            <p class="text-[15px] text-text-secondary leading-relaxed">
              {{ $t('event_page.where_works.subtext') }}
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="(card, idx) in whereCards" :key="idx" class="group flex flex-col items-center">
              <div class="w-full aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-transparent group-hover:border-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10 transition-all duration-500 relative">
                <img :src="card.img" :alt="card.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <p class="text-[13px] font-heading font-bold text-navy text-center px-1">{{ card.title }}</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="hidden lg:block w-px bg-border-default" />
        <div class="lg:hidden h-px bg-border-default w-full max-w-sm mx-auto" />

        <!-- Right: How it works -->
        <div class="w-full lg:w-[45%] flex flex-col items-center">
          <div class="mb-10 w-full text-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy/5 border border-navy/10 mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-navy" />
              <span class="text-[11px] font-heading font-bold text-navy uppercase tracking-[0.2em]">{{ $t('event_page.how_works.label') }}</span>
            </div>
            <h2 class="text-2xl lg:text-4xl font-heading font-bold text-navy mb-4">
              {{ $t('event_page.how_works.heading') }}
            </h2>
            <p class="text-[15px] text-text-secondary leading-relaxed">
              {{ $t('event_page.how_works.subtext') }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-6 lg:gap-8 w-full justify-center items-center sm:items-start">

            <!-- Step 1 -->
            <div class="flex flex-col items-center flex-1 max-w-[200px] text-center">
              <div class="relative w-20 h-20 rounded-3xl bg-off-white border-2 border-border-default flex items-center justify-center mb-6 group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                <span class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-accent/30">1</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="howSteps[0].icon" />
              </div>
              <h3 class="text-[16px] font-heading font-bold text-navy mb-2">{{ howSteps[0].title }}</h3>
              <p class="text-[14px] text-text-secondary leading-relaxed">{{ howSteps[0].desc }}</p>
            </div>

            <!-- Arrow -->
            <div class="hidden sm:flex items-center justify-center text-border-default mt-8">
              <div class="w-12 h-12 rounded-full bg-off-white border border-border-default flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex flex-col items-center flex-1 max-w-[200px] text-center">
              <div class="relative w-20 h-20 rounded-3xl bg-off-white border-2 border-border-default flex items-center justify-center mb-6 group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                <span class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-accent/30">2</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="howSteps[1].icon" />
              </div>
              <h3 class="text-[16px] font-heading font-bold text-navy mb-2">{{ howSteps[1].title }}</h3>
              <p class="text-[14px] text-text-secondary leading-relaxed">{{ howSteps[1].desc }}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>
