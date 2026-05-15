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
  <section class="py-16 lg:py-24 bg-gradient-to-b from-white via-[#FAFAFA] to-white relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/3 blur-[120px] rounded-full mix-blend-multiply" />
      <div class="absolute top-0 left-0 w-full h-full opacity-[0.02]" style="background-image: radial-gradient(#0B2A4A 2px, transparent 2px); background-size: 30px 30px;"></div>
    </div>
    
    <div class="section-container relative z-10">
      <div class="max-w-[1000px] mx-auto">
        <div class="text-center mb-16 animate-fade-in-up">
          <h2 class="text-[36px] lg:text-[48px] font-heading font-bold text-navy mb-6 tracking-tight">
            {{ $t('individual_page.who_is_this_for.title') }}
          </h2>
          <div class="w-16 h-1.5 bg-gradient-to-r from-accent to-[#ff984f] mx-auto rounded-full shadow-[0_2px_10px_rgba(244,122,31,0.3)]"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div v-for="(item, index) in items" :key="index" 
            class="flex items-center gap-6 p-8 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(11,42,74,0.08)] hover:-translate-y-1.5 hover:bg-white transition-all duration-500 group animate-fade-in-up cursor-default"
            :style="`animation-delay: ${index * 100}ms`"
          >
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_8px_20px_rgba(244,122,31,0.15)] transition-all duration-500 border border-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p class="text-[18px] text-navy font-bold leading-snug group-hover:text-accent transition-colors duration-300">
              {{ item }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
