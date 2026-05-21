<script setup lang="ts">
const { t } = useI18n()

const items = computed(() => [
  t('individual_page.who_is_this_for.item1'),
  t('individual_page.who_is_this_for.item2'),
  t('individual_page.who_is_this_for.item3'),
  t('individual_page.who_is_this_for.item4'),
])
</script>

<template>
  <section class="py-6 lg:py-10 bg-gradient-to-b from-white via-[#FAFAFA] to-white relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/3 blur-[120px] rounded-full mix-blend-multiply" />
    </div>
    
    <div class="section-container relative z-10">
      <div class="max-w-[860px] mx-auto">
        <div class="text-center mb-6 animate-fade-in-up">
          <h2 class="text-[22px] lg:text-[26px] font-heading font-bold text-navy mb-3 tracking-tight">
            {{ $t('individual_page.who_is_this_for.title') }}
          </h2>
          <div class="w-10 h-1 bg-gradient-to-r from-accent to-[#ff984f] mx-auto rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          <div v-for="(item, index) in items" :key="index" 
            class="flex items-center gap-4 p-4 rounded-[14px] bg-white/70 backdrop-blur-xl border border-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(11,42,74,0.06)] hover:-translate-y-1 hover:bg-white transition-all duration-400 group cursor-default"
            :style="`animation-delay: ${index * 80}ms`"
          >
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-400 border border-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p class="text-[14px] text-navy font-semibold leading-snug group-hover:text-accent transition-colors duration-300">
              {{ item }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
