<script setup lang="ts">
const { t } = useI18n()

const deliverables = [
  { id: 1, icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>' }, // Curriculum
  { id: 2, icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' }, // Checklist
  { id: 3, icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' }, // Rubric
  { id: 4, icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' }, // Attendance
  { id: 5, icon: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>' }, // Certificate
  { id: 6, icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' }, // Report
  { id: 7, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' }, // Q&A
  { id: 8, icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' }, // Co-branded shield
]
</script>

<template>
  <section class="py-16 bg-white px-4 md:px-10">
    <div class="max-w-[1400px] mx-auto">
      <div class="w-full bg-[#F9FAFB] rounded-[40px] p-8 md:p-16 border border-navy/5 shadow-sm">
        <div class="flex flex-col lg:flex-row gap-16 xl:gap-24">
          
          <!-- Left: Deliverables Grid -->
          <div class="lg:w-[50%]">
            <h2 class="font-heading font-bold text-navy text-[24px] md:text-[32px] leading-[1.2] mb-12">
              {{ $t('education_page.deliverables.title') }}
            </h2>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
              <div v-for="item in deliverables" :key="item.id" class="flex flex-col items-center text-center group">
                <div class="w-14 h-14 rounded-2xl bg-white border border-navy/5 text-green-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" v-html="item.icon"></svg>
                </div>
                <span class="text-navy/80 text-[13px] font-semibold leading-tight max-w-[120px]">
                  {{ $t(`education_page.deliverables.item${item.id}`) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Vertical Divider (Desktop) -->
          <div class="hidden lg:block w-px bg-navy/10 self-stretch"></div>

          <!-- Right: Assessment & Certification -->
          <div class="lg:w-[50%]">
            <h2 class="font-heading font-bold text-navy text-[24px] md:text-[32px] leading-[1.2] mb-12">
              {{ $t('education_page.assessment_certification.title') }}
            </h2>

            <div class="flex flex-col gap-10">
              <ul class="space-y-5">
                <li v-for="i in 4" :key="i" class="flex items-start gap-4 group">
                  <div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-navy/80 text-[16px] font-medium leading-snug">
                    {{ $t(`education_page.assessment_certification.item${i}`) }}
                  </span>
                </li>
              </ul>

              <!-- Certificate Mockup -->
              <div class="bg-white rounded-2xl p-6 shadow-lg shadow-navy/5 border border-navy/5 relative overflow-hidden">
                <div class="aspect-[1.5] w-full bg-[#FCFAF5] rounded-lg border-[10px] border-[#F1E9D2] flex flex-col items-center justify-center relative p-6 shadow-inner">
                  <div class="absolute inset-2 border border-[#DCD3B6] opacity-40"></div>
                  
                  <div class="text-center relative z-10 w-full scale-90">
                    <h4 class="font-heading font-bold text-[24px] tracking-[0.1em] text-[#2C3E50] mb-1 uppercase">CERTIFICATE</h4>
                    <p class="text-[9px] uppercase tracking-[0.3em] text-[#7F8C8D] mb-6">OF COMPLETION</p>
                    
                    <p class="text-[11px] text-[#34495E] mb-2 italic">This is to certify that</p>
                    <p class="font-serif text-[20px] text-[#2C3E50] mb-3 font-bold border-b border-[#2C3E50]/20 pb-1 inline-block px-10">Name Surname</p>
                    
                    <p class="text-[9px] text-[#7F8C8D] mb-1">has successfully completed</p>
                    <p class="font-heading font-bold text-[14px] text-[#2C3E50] mb-6">Road2Rehab Training Program</p>
                    
                    <div class="flex items-end justify-between mt-2 px-2">
                      <div class="text-left">
                        <p class="font-heading font-black text-[#2C3E50] text-[15px] leading-tight">STRETCH<span class="text-accent">.VN</span></p>
                      </div>
                      <div class="w-12 h-px bg-[#2C3E50]/20"></div>
                      <div class="relative">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F1C40F] to-[#B8860B] shadow-md flex items-center justify-center relative">
                          <div class="absolute inset-1 border border-white/30 rounded-full border-dashed"></div>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" class="opacity-80"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
