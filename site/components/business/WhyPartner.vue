<script setup lang="ts">
const { t } = useI18n()

const benefits = computed(() => [
  { icon: 'groups', title: t('business_page.why.item1.title'), desc: t('business_page.why.item1.desc') },
  { icon: 'verified_user', title: t('business_page.why.item2.title'), desc: t('business_page.why.item2.desc') },
  { icon: 'extension', title: t('business_page.why.item3.title'), desc: t('business_page.why.item3.desc') },
  { icon: 'monitoring', title: t('business_page.why.item4.title'), desc: t('business_page.why.item4.desc') },
  { icon: 'favorite', title: t('business_page.why.item5.title'), desc: t('business_page.why.item5.desc') },
])
</script>

<template>
  <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
    <!-- Subtle dot pattern background -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.035]" style="background-image: radial-gradient(#0B2A4A 1.5px, transparent 1.5px); background-size: 20px 20px;" />

    <!-- Decorative orbs -->
    <div class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-accent/6 blur-[150px] rounded-full pointer-events-none" />
    <div class="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-navy/5 blur-[120px] rounded-full pointer-events-none" />

    <div class="section-container relative z-10">
      <div class="text-center mb-16">
        <p class="text-xs font-heading font-bold text-accent uppercase tracking-widest mb-4">
          {{ $t('business_page.why.label') }}
        </p>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy max-w-3xl mx-auto">
          {{ $t('business_page.why.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div
          v-for="(item, idx) in benefits"
          :key="item.title"
          class="relative flex flex-col items-center text-center p-6 rounded-3xl transition-all duration-500 group hover:bg-white hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-border-default"
        >
          <!-- Number accent -->
          <span class="absolute top-4 right-5 text-[64px] font-heading font-bold text-navy/[0.04] leading-none select-none pointer-events-none transition-colors duration-500 group-hover:text-accent/[0.08]">
            {{ String(idx + 1).padStart(2, '0') }}
          </span>

          <!-- Icon -->
          <div class="relative w-20 h-20 rounded-[28px] bg-off-white border border-border-default flex items-center justify-center mb-6 group-hover:bg-navy group-hover:border-navy group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 z-10">
            <span class="material-symbols-outlined text-[36px] text-navy group-hover:text-white transition-colors duration-500">{{ item.icon }}</span>
          </div>

          <h3 class="text-lg font-heading font-bold text-navy mb-3 z-10">{{ item.title }}</h3>
          <p class="text-sm text-text-secondary leading-relaxed z-10">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
