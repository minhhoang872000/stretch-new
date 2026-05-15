<script setup lang="ts">
const { t } = useI18n()

const symptoms = computed(() => [
  t('individual_page.experiencing.item1'),
  t('individual_page.experiencing.item2'),
  t('individual_page.experiencing.item3'),
  t('individual_page.experiencing.item4'),
  t('individual_page.experiencing.item5'),
  t('individual_page.experiencing.item6'),
])
</script>

<template>
  <section class="py-16 lg:py-24 bg-[#F8FAFC]">
    <div class="section-container">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <!-- Left Side: Image with Decoration -->
        <div class="relative order-2 lg:order-1">
          <div class="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-navy/5 rounded-full blur-3xl"></div>
          
          <div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4]">
            <img 
              src="/experiencing-pain-new.png" 
              alt="Person experiencing physical discomfort" 
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent"></div>
          </div>
          
          <!-- Floating Badge -->
          <div class="absolute -bottom-6 -right-6 md:right-10 bg-white p-6 rounded-2xl shadow-xl max-w-[200px] hidden md:block">
            <p class="text-sm font-medium text-navy leading-snug">
              {{ $t('individual_page.how_supports.line') }}
            </p>
          </div>
        </div>

        <!-- Right Side: Content -->
        <div class="order-1 lg:order-2">
          <h2 class="text-3xl md:text-5xl font-heading font-bold text-navy leading-tight mb-8">
            {{ $t('individual_page.experiencing.title') }}
          </h2>
          
          <div class="space-y-6">
            <div v-for="symptom in symptoms" :key="symptom" class="flex items-start gap-5 group">
              <div class="w-7 h-7 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-navy group-hover:text-white transition-colors duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="text-lg text-navy font-medium leading-relaxed">{{ symptom }}</span>
            </div>
          </div>
          
          <div class="mt-12">
            <NuxtLink to="/booking" class="btn-primary inline-flex items-center gap-2">
              {{ $t('individual_page.hero.cta1') }}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M10 5l5 5-5 5"/></svg>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

