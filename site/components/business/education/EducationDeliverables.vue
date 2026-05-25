<script setup lang="ts">
const { t } = useI18n()

const showCertificateModal = ref(false)

// Clean emerald green outline icons for deliverables (stroke width 1.35)
const deliverables = [
  // 1. Curriculum structure
  {
    id: 1,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="14" y2="14"/>
    </svg>`
  },
  // 2. Practical checklist
  {
    id: 2,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 12 2 2 4-4" />
      <circle cx="18" cy="18" r="3" />
      <line x1="20" y1="20" x2="22" y2="22" />
    </svg>`
  },
  // 3. Assessment rubric
  {
    id: 3,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>`
  },
  // 4. Attendance record
  {
    id: 4,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>`
  },
  // 5. Completion certificate
  {
    id: 5,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="3" />
      <path d="m10 11 1.5 1.5 3-3" />
    </svg>`
  },
  // 6. Post-training report
  {
    id: 6,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="9" y1="9" x2="9" y2="15" />
      <line x1="13" y1="11" x2="13" y2="15" />
      <line x1="17" y1="7" x2="17" y2="15" />
    </svg>`
  },
  // 7. Follow-up support
  {
    id: 7,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>`
  },
  // 8. Co-branded certificate (optional)
  {
    id: 8,
    svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polygon points="12 8 13.5 11 16.5 11.5 14 13.5 15 16.5 12 15 9 16.5 10 13.5 7.5 11.5 10.5 11 12 8" />
    </svg>`
  }
]
</script>

<template>
  <section class="py-16 bg-[#F9FAFB] px-6 md:px-10 overflow-hidden">
    <div class="max-w-[1340px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Card 1: What your organization receives -->
      <div class="bg-white rounded-[24px] border border-navy/5 shadow-sm p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
        <div>
          <h2 class="font-heading font-bold text-navy text-[22px] md:text-[26px] leading-[1.25] mb-10 tracking-tight text-left">
            {{ $t('education_page.deliverables.title') }}
          </h2>
          
          <!-- Row 1: 5 items side-by-side -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 gap-y-8 mb-8 pb-8 border-b border-navy/5">
            <div v-for="item in deliverables.slice(0, 5)" :key="item.id" class="flex flex-col items-center text-center">
              <div class="mb-4" v-html="item.svg"></div>
              <span class="text-navy text-[12px] font-extrabold leading-snug max-w-[100px] tracking-tight">
                {{ $t(`education_page.deliverables.item${item.id}`) }}
              </span>
            </div>
          </div>

          <!-- Row 2: 3 items centered side-by-side -->
          <div class="flex flex-wrap justify-center gap-6 sm:gap-12">
            <div v-for="item in deliverables.slice(5, 8)" :key="item.id" class="flex flex-col items-center text-center">
              <div class="mb-4" v-html="item.svg"></div>
              <span class="text-navy text-[12px] font-extrabold leading-snug max-w-[100px] tracking-tight">
                {{ $t(`education_page.deliverables.item${item.id}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Assessment & certification -->
      <div class="bg-white rounded-[24px] border border-navy/5 shadow-sm p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
        <div>
          <h2 class="font-heading font-bold text-navy text-[22px] md:text-[26px] leading-[1.25] mb-10 tracking-tight text-left">
            {{ $t('education_page.assessment_certification.title') }}
          </h2>
          
          <div class="flex flex-col sm:flex-row gap-8 items-center lg:items-start xl:items-center">
            
            <!-- Left: List of 4 items with checkmark outline icon inside circles -->
            <div class="flex-1 w-full">
              <ul class="space-y-6">
                <li v-for="i in 4" :key="i" class="flex items-start gap-4">
                  <div class="w-6 h-6 rounded-full border border-navy/15 flex items-center justify-center text-navy shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span class="text-navy text-[13.5px] font-bold leading-snug tracking-tight">
                    {{ $t(`education_page.assessment_certification.item${i}`) }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Right: Beautiful Certificate Mockup exactly matching layout -->
            <div class="shrink-0 flex items-center justify-center">
              <div
                class="relative cursor-pointer group rounded-[12px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-navy/10 w-[255px] h-[181px]"
                @click="showCertificateModal = true"
              >
                <!-- Scaled mockup inside -->
                <div class="absolute top-0 left-0 w-[340px] h-[241px] origin-top-left scale-[0.75] pointer-events-none select-none">
                  <div class="aspect-[1.41] h-full bg-[#FCFAF7] border-[8px] border-[#F3EAD5] relative p-4 flex flex-col justify-between overflow-hidden">
                    
                    <!-- Double border decoration inner line -->
                    <div class="absolute inset-1.5 border border-[#E3D3B5] opacity-50 pointer-events-none"></div>
                    
                    <div class="text-center z-10 w-full pt-1">
                      <p class="font-serif font-bold text-[18px] tracking-[0.05em] text-[#1E293B] uppercase mb-0.5">CERTIFICATE</p>
                      <p class="text-[7.5px] uppercase tracking-[0.2em] text-[#64748B] font-semibold mb-3">OF COMPLETION</p>
                      
                      <p class="text-[8px] text-[#475569] mb-1 italic">This is to certify that</p>
                      <p class="font-serif text-[15px] text-[#0F172A] mb-1 font-bold border-b border-[#0F172A]/20 pb-0.5 inline-block px-6">Name Surname</p>
                      
                      <p class="text-[7px] text-[#64748B] mb-0.5">has successfully completed</p>
                      <p class="font-heading font-extrabold text-[10px] text-[#0F172A] mb-3">Road2Rehab Training Program</p>
                    </div>
                    
                    <!-- Date & Signature & Seal row -->
                    <div class="flex items-end justify-between px-3 pb-1 z-10">
                      
                      <!-- STRETCH Logo -->
                      <div class="text-left">
                        <p class="font-heading font-black text-[#0F172A] text-[11px] leading-tight">STRETCH<span class="text-[#FF7A45]">.VN</span></p>
                        <span class="text-[6px] text-[#94A3B8] font-bold block mt-0.5">Date</span>
                      </div>
                      
                      <!-- Signature -->
                      <div class="flex flex-col items-center">
                        <!-- Signature SVG -->
                        <svg width="40" height="20" viewBox="0 0 100 40" fill="none" class="opacity-80">
                          <path d="M10 25c15-5 30-20 40-15s-10 20 5 10 25-15 35-5" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <div class="w-12 h-px bg-[#0F172A]/20 my-0.5"></div>
                        <span class="text-[6px] text-[#64748B] font-bold">Instructor</span>
                      </div>
                      
                      <!-- Golden Seal -->
                      <div class="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        
                        <!-- Ribbon tail 1 -->
                        <div class="absolute -bottom-1.5 left-1 w-2.5 h-4 bg-[#B8860B] origin-top rotate-[25deg] clip-path-ribbon"></div>
                        <!-- Ribbon tail 2 -->
                        <div class="absolute -bottom-1.5 right-1 w-2.5 h-4 bg-[#9A7B1C] origin-top -rotate-[25deg] clip-path-ribbon"></div>
    
                        <!-- Outer serrated gold seal circle -->
                        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-[#E8C263] via-[#D89F3A] to-[#A36D16] shadow-sm flex items-center justify-center">
                          <!-- Inner circular border -->
                          <div class="absolute inset-0.5 border border-white/30 rounded-full border-dashed"></div>
                          <!-- Center star icon -->
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" class="opacity-90">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
    
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Hover Overlay with localized text -->
                <div class="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 text-white z-20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                  <span class="text-[10px] font-bold tracking-wider uppercase px-3 text-center leading-normal">
                    {{ $t('education_page.assessment_certification.view_certificate') }}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Modal for viewing certificate in high fidelity -->
    <BaseModal v-model="showCertificateModal">
      <div class="flex flex-col items-center justify-center p-2 pt-6">
        <!-- The original full-sized certificate mockup -->
        <div class="w-[340px] h-[241px] aspect-[1.41] bg-[#FCFAF7] rounded-[12px] border-[8px] border-[#F3EAD5] relative p-4 flex flex-col justify-between shadow-lg relative overflow-hidden select-none">
          <!-- Double border decoration inner line -->
          <div class="absolute inset-1.5 border border-[#E3D3B5] opacity-50 pointer-events-none"></div>
          
          <div class="text-center z-10 w-full pt-1">
            <p class="font-serif font-bold text-[18px] tracking-[0.05em] text-[#1E293B] uppercase mb-0.5">CERTIFICATE</p>
            <p class="text-[7.5px] uppercase tracking-[0.2em] text-[#64748B] font-semibold mb-3">OF COMPLETION</p>
            
            <p class="text-[8px] text-[#475569] mb-1 italic">This is to certify that</p>
            <p class="font-serif text-[15px] text-[#0F172A] mb-1 font-bold border-b border-[#0F172A]/20 pb-0.5 inline-block px-6">Name Surname</p>
            
            <p class="text-[7px] text-[#64748B] mb-0.5">has successfully completed</p>
            <p class="font-heading font-extrabold text-[10px] text-[#0F172A] mb-3">Road2Rehab Training Program</p>
          </div>
          
          <!-- Date & Signature & Seal row -->
          <div class="flex items-end justify-between px-3 pb-1 z-10">
            
            <!-- STRETCH Logo -->
            <div class="text-left">
              <p class="font-heading font-black text-[#0F172A] text-[11px] leading-tight">STRETCH<span class="text-[#FF7A45]">.VN</span></p>
              <span class="text-[6px] text-[#94A3B8] font-bold block mt-0.5">Date</span>
            </div>
            
            <!-- Signature -->
            <div class="flex flex-col items-center">
              <!-- Signature SVG -->
              <svg width="40" height="20" viewBox="0 0 100 40" fill="none" class="opacity-80">
                <path d="M10 25c15-5 30-20 40-15s-10 20 5 10 25-15 35-5" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <div class="w-12 h-px bg-[#0F172A]/20 my-0.5"></div>
              <span class="text-[6px] text-[#64748B] font-bold">Instructor</span>
            </div>
            
            <!-- Golden Seal -->
            <div class="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
              
              <!-- Ribbon tail 1 -->
              <div class="absolute -bottom-1.5 left-1 w-2.5 h-4 bg-[#B8860B] origin-top rotate-[25deg] clip-path-ribbon"></div>
              <!-- Ribbon tail 2 -->
              <div class="absolute -bottom-1.5 right-1 w-2.5 h-4 bg-[#9A7B1C] origin-top -rotate-[25deg] clip-path-ribbon"></div>

              <!-- Outer serrated gold seal circle -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-[#E8C263] via-[#D89F3A] to-[#A36D16] shadow-sm flex items-center justify-center">
                <!-- Inner circular border -->
                <div class="absolute inset-0.5 border border-white/30 rounded-full border-dashed"></div>
                <!-- Center star icon -->
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" class="opacity-90">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Interactive metadata -->
        <p class="text-[12px] text-navy/60 text-center mt-6 max-w-[280px]">
          {{ $t('education_page.assessment_certification.item3') }}
        </p>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped>
.clip-path-ribbon {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%);
}
</style>
