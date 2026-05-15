<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="py-20 bg-white">
    <div class="max-w-[1200px] mx-auto px-6 md:px-10">
      <h2 class="font-heading font-bold text-navy text-[36px] md:text-[42px] text-center mb-16">
        {{ $t('wellness_page.delivery.title') }}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        <!-- Block 1 -->
        <div class="flex flex-col group cursor-pointer">
          <div class="rounded-[24px] overflow-hidden aspect-[4/3] mb-6">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" 
              alt="Movement workshops" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <h3 class="font-heading font-bold text-navy text-[22px] mb-3">1. {{ $t('wellness_page.delivery.workshop_title') }}</h3>
          <p class="text-navy/70 text-[16px] leading-relaxed">{{ $t('wellness_page.delivery.workshop_desc') }}</p>
        </div>
        
        <!-- Block 2 -->
        <div class="flex flex-col group cursor-pointer">
          <div class="rounded-[24px] overflow-hidden aspect-[4/3] mb-6">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
              alt="Mini assessment station" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <h3 class="font-heading font-bold text-navy text-[22px] mb-3">2. {{ $t('wellness_page.delivery.assessment_title') }}</h3>
          <p class="text-navy/70 text-[16px] leading-relaxed">{{ $t('wellness_page.delivery.assessment_desc') }}</p>
        </div>
        
        <!-- Block 3 -->
        <div class="flex flex-col group cursor-pointer">
          <div class="rounded-[24px] overflow-hidden aspect-[4/3] mb-6">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" 
              alt="Recovery day activation" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <h3 class="font-heading font-bold text-navy text-[22px] mb-3">3. {{ $t('wellness_page.delivery.recovery_title') }}</h3>
          <p class="text-navy/70 text-[16px] leading-relaxed">{{ $t('wellness_page.delivery.recovery_desc') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
