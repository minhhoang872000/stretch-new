<script setup lang="ts">
const { t } = useI18n()

const leftSymptoms = computed(() => [
  t('individual_page.experiencing.item1'),
  t('individual_page.experiencing.item2'),
  t('individual_page.experiencing.item3'),
])

const rightSymptoms = computed(() => [
  t('individual_page.experiencing.item4'),
  t('individual_page.experiencing.item5'),
  t('individual_page.experiencing.item6'),
])
</script>

<template>
  <section class="py-16 lg:py-0 bg-[#F7F7F7] relative overflow-hidden lg:h-[380px] lg:flex lg:items-center">
    
    <!-- Desktop absolute image: Large, contained fully inside the section -->
    <div class="hidden lg:block absolute bottom-0 lg:left-[22%] xl:left-[24%] lg:w-[380px] xl:w-[440px] lg:h-[95%] z-10 pointer-events-none">
      <img 
        src="/experiencing-pain-absolute.png" 
        alt="Person experiencing shoulder discomfort" 
        class="w-full h-full object-contain object-bottom mix-blend-multiply"
      />
    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative z-20 w-full">
      
      <!-- Desktop: Space-between layout (Left: Heading, Right: Checklist) | Mobile: stacked -->
      <div class="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between gap-10 lg:gap-0">
        
        <!-- Left Column: Heading (Narrower to make room for the large absolute image) -->
        <div class="w-full lg:w-[24%] text-center lg:text-left">
          <h2 class="text-3xl md:text-4xl lg:text-[2.6rem] font-heading font-extrabold text-navy leading-[1.15] tracking-tight">
            {{ $t('individual_page.experiencing.title') }}
          </h2>
        </div>

        <!-- Mobile Center Column: Image (Hidden on desktop because it's absolute above) -->
        <div class="block lg:hidden w-full flex justify-center">
          <div class="relative w-[220px] md:w-[260px] max-w-[300px]">
            <img 
              src="/experiencing-pain-absolute.png" 
              alt="Person experiencing shoulder discomfort" 
              class="w-full h-auto object-contain mix-blend-multiply"
            />
          </div>
        </div>

        <!-- Right Column: Two vertical columns of symptoms (Pushed right with ml-auto) -->
        <div class="w-full lg:w-[48%] lg:ml-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 w-full">
            
            <!-- Left symptom column -->
            <div class="flex flex-col gap-5">
              <div 
                v-for="symptom in leftSymptoms" 
                :key="symptom" 
                class="flex items-start gap-3"
              >
                <!-- Check-circle icon -->
                <div class="w-6 h-6 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="text-sm md:text-[15px] text-navy font-semibold leading-snug">
                  {{ symptom }}
                </span>
              </div>
            </div>

            <!-- Right symptom column -->
            <div class="flex flex-col gap-5">
              <div 
                v-for="symptom in rightSymptoms" 
                :key="symptom" 
                class="flex items-start gap-3"
              >
                <!-- Check-circle icon -->
                <div class="w-6 h-6 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="text-sm md:text-[15px] text-navy font-semibold leading-snug">
                  {{ symptom }}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>
