<script setup lang="ts">
const { t, tm } = useI18n()

const levels = [
  {
    id: '0',
    color: 'text-green-600',
    borderColor: 'border-t-green-600',
    bgColor: 'bg-green-50',
    icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><circle cx="18" cy="18" r="3"/><path d="M20 20l2 2"/></svg>'
  },
  {
    id: '1',
    color: 'text-orange-500',
    borderColor: 'border-t-orange-500',
    bgColor: 'bg-orange-50',
    icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L9 12l3 3-5 7 5-5-2-3 4-5z"/></svg>'
  },
  {
    id: '2',
    color: 'text-blue-600',
    borderColor: 'border-t-blue-600',
    bgColor: 'bg-blue-50',
    icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><circle cx="12" cy="14" r="4"/><path d="M12 10v4l2 2"/></svg>'
  },
  {
    id: '3',
    color: 'text-purple-600',
    borderColor: 'border-t-purple-600',
    bgColor: 'bg-purple-50',
    icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
  },
  {
    id: '4',
    color: 'text-red-500',
    borderColor: 'border-t-red-500',
    bgColor: 'bg-red-50',
    icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M16 3l4 4"/><path d="M20 7H16"/></svg>'
  }
]
</script>

<template>
  <section class="py-20 bg-[#F9FAFB] overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      
      <div class="flex flex-col xl:flex-row gap-12 xl:gap-8 items-start">
        
        <!-- Intro Column -->
        <div class="w-full xl:w-[240px] shrink-0 pt-6">
          <h2 class="font-heading font-bold text-navy text-[32px] md:text-[38px] leading-[1.2] mb-6">
            {{ $t('education_page.system.title') }}
          </h2>
          <div class="w-10 h-1 bg-accent mb-6"></div>
          <p class="text-navy/70 text-[16px] leading-relaxed">
            Each level builds on the previous — from understanding the body to applying recovery in real situations.
          </p>
        </div>
        
        <!-- Track Container -->
        <div class="flex-1 w-full overflow-x-auto pb-8 hide-scrollbar">
          <div class="flex items-stretch min-w-max gap-4 xl:gap-6 py-2">
            
            <template v-for="(level, index) in levels" :key="level.id">
              <!-- Arrow -->
              <div v-if="index !== 0" class="flex items-center justify-center text-navy/20 self-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              
              <!-- Card -->
              <div class="w-[280px] flex flex-col bg-white rounded-[20px] shadow-sm border border-navy/5 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <!-- Color border top -->
                <div class="border-t-[6px] w-full" :class="level.borderColor"></div>
                
                <div class="p-6 flex-1 flex flex-col items-center text-center">
                  <div class="text-[12px] font-bold uppercase tracking-widest mb-6" :class="level.color" style="white-space: pre-line">
                    {{ $t(`education_page.system.level${level.id}`) }}
                  </div>
                  
                  <div class="mb-6 relative z-50" :class="level.color" v-html="level.icon"></div>
                  
                  <h3 class="font-heading font-bold text-navy text-[18px] mb-3 min-h-[54px] flex items-center justify-center">
                    {{ $t(`education_page.system.level${level.id}_title`) }}
                  </h3>
                  
                  <p class="text-navy/60 text-[14px] leading-relaxed mb-6 min-h-[42px]">
                    {{ $t(`education_page.system.level${level.id}_desc`) }}
                  </p>
                  
                  <ul class="w-full text-left space-y-3 mb-8">
                    <li v-for="i in 4" :key="i" class="flex items-start gap-2">
                      <span class="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-navy/30"></span>
                      <span class="text-navy/80 text-[14px]">{{ $t(`education_page.system.level${level.id}_item${i}`) }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- Output Footer -->
                <div class="p-5 mt-auto border-t border-navy/5 bg-[#FAFAFA]">
                  <p class="text-[13px] font-medium" :class="level.color">
                    {{ $t(`education_page.system.level${level.id}_output`) }}
                  </p>
                </div>
              </div>
            </template>
            
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
