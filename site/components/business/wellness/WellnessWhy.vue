<script setup lang="ts">
const { t, locale } = useI18n()
</script>

<template>
  <section class="py-8 lg:py-12 bg-white px-4 md:px-6 lg:px-8 overflow-hidden">
    <div class="max-w-[1340px] mx-auto relative z-10">
      <!-- Outer Warm Peach/Cream Card Container -->
      <div class="bg-[#FCFAF7] rounded-[24px] md:rounded-[32px] border border-[#EFEBE4] py-6 md:py-8 px-4 md:px-6 flex flex-col items-center">
        <!-- Title & Subtitle -->
        <h2 class="font-heading font-bold text-navy text-[28px] md:text-[34px] text-center mb-2 tracking-tight">
          {{ $t('wellness_page.why.title') }}
        </h2>
        <p class="text-navy/60 text-[14px] md:text-[15px] text-center mb-6 md:mb-8 max-w-[600px] font-medium leading-relaxed">
          {{ $t('wellness_page.why.statement') }}
        </p>

        <!-- Grid list of 4 items -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 lg:gap-y-0 w-full">
          <!-- Item 1 -->
          <div class="flex flex-col items-center text-center px-4 lg:border-r border-[#E5E7EB]/60">
            <!-- Icon 1: User / Person Outline -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-3">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-2 leading-snug">
              {{ $t('wellness_page.why.real') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ locale === 'vi' ? 'Chương trình được thiết kế từ các vấn đề vận động thực tế mà nhân sự của bạn đối mặt mỗi ngày.' : 'Programs designed from the physical challenges your team faces every day.' }}
            </p>
          </div>
          
          <!-- Item 2 -->
          <div class="flex flex-col items-center text-center px-4 md:border-r lg:border-r border-[#E5E7EB]/60">
            <!-- Icon 2: Office Building with People Outlines -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-3">
              <path d="M3 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
              <path d="M6 7h2v2H6V7zm0 4h2v2H6v-2z" />
              <path d="M10 7h2v2h-2V7zm0 4h2v2h-2v-2z" />
              <!-- Person outline 1 -->
              <circle cx="15" cy="14" r="2" />
              <path d="M12 19.5v-.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
              <!-- Person outline 2 -->
              <circle cx="18" cy="16" r="2" />
              <path d="M15 21v-.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-2 leading-snug">
              {{ $t('wellness_page.why.designed') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ locale === 'vi' ? 'Thiết lập linh hoạt phù hợp cho văn phòng, phòng họp hoặc các không gian nhỏ.' : 'Flexible setup that works in offices, meeting rooms, or small spaces.' }}
            </p>
          </div>
          
          <!-- Item 3 -->
          <div class="flex flex-col items-center text-center px-4 lg:border-r border-[#E5E7EB]/60">
            <!-- Icon 3: Checkmark inside Circle -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-3">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-2 leading-snug">
              {{ $t('wellness_page.why.simple') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ locale === 'vi' ? 'Hướng dẫn rõ ràng giúp nhân sự của bạn có thể hiểu và áp dụng được ngay.' : 'Clear guidance your team can understand and apply right away.' }}
            </p>
          </div>
          
          <!-- Item 4 -->
          <div class="flex flex-col items-center text-center px-4">
            <!-- Icon 4: Bar Chart / Statistics Outline -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-3">
              <rect x="4" y="13" width="3" height="8" rx="1" />
              <rect x="11" y="8" width="3" height="13" rx="1" />
              <rect x="18" y="3" width="3" height="18" rx="1" />
            </svg>
            <h3 class="font-heading font-bold text-navy text-[16px] md:text-[18px] mb-2 leading-snug">
              {{ $t('wellness_page.why.followup') }}
            </h3>
            <p class="text-navy/60 text-[13px] md:text-[14px] leading-relaxed max-w-[250px]">
              {{ locale === 'vi' ? 'Chúng tôi cung cấp báo cáo đo lường và các khuyến nghị thực tế để tiếp tục cải thiện.' : 'We provide insights and practical recommendations to keep improving.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
