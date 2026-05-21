<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const { t, locale } = useI18n()

const trackRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updateScrollButtons = () => {
  const el = trackRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

const scroll = (direction: 'left' | 'right') => {
  const el = trackRef.value
  if (!el) return
  const scrollAmount = 280 // Scroll one card width + gap
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  const el = trackRef.value
  if (el) {
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    setTimeout(updateScrollButtons, 500)
    window.addEventListener('resize', updateScrollButtons, { passive: true })
  }
})

onBeforeUnmount(() => {
  const el = trackRef.value
  if (el) {
    el.removeEventListener('scroll', updateScrollButtons)
  }
  window.removeEventListener('resize', updateScrollButtons)
})

const getOutputParts = (levelId: string) => {
  const fullText = t(`education_page.system.level${levelId}_output`)
  const parts = fullText.split(':')
  if (parts.length > 1) {
    return {
      label: parts[0].trim() + ':',
      content: parts.slice(1).join(':').trim()
    }
  }
  return {
    label: 'Output:',
    content: fullText
  }
}

const levels = [
  {
    id: '0',
    color: 'text-[#10B981]',
    borderColor: 'border-t-[#10B981]',
    bgColor: 'bg-green-50/50',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="7" r="3"/>
      <path d="M9 10c-3.5 0-6 2-6 4.5V17h12v-2.5c0-2.5-2.5-4.5-6-4.5z"/>
      <circle cx="17" cy="7" r="2.5"/>
      <path d="M21 17v-2c0-1.5-1.2-2.8-3-3.4"/>
    </svg>`
  },
  {
    id: '1',
    color: 'text-[#F47A1F]',
    borderColor: 'border-t-[#F47A1F]',
    bgColor: 'bg-orange-50/50',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 4c0 0-2 1-3 3s-1 4-2 6"/>
      <path d="M13 13c-1 2-3 4-5 5l-2 1"/>
      <path d="M13 13c1 2 2 4 4 6l2 1"/>
      <circle cx="18" cy="3" r="1.5"/>
    </svg>`
  },
  {
    id: '2',
    color: 'text-[#2563EB]',
    borderColor: 'border-t-[#2563EB]',
    bgColor: 'bg-blue-50/50',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="4" r="2.5"/>
      <path d="M12 6.5v7"/>
      <path d="M12 13.5l-4 6.5"/>
      <path d="M12 13.5l4 6.5"/>
      <path d="M12 9l-5-3"/>
      <path d="M12 9l5-3"/>
    </svg>`
  },
  {
    id: '3',
    color: 'text-[#8B5CF6]',
    borderColor: 'border-t-[#8B5CF6]',
    bgColor: 'bg-purple-50/50',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="17" cy="4" r="2.5"/>
      <path d="M15 7l-4 4 1 3-3 5"/>
      <path d="M11 11l-4 1"/>
      <path d="M12 14l5 1 2 4"/>
    </svg>`
  },
  {
    id: '4',
    color: 'text-[#EF4444]',
    borderColor: 'border-t-[#EF4444]',
    bgColor: 'bg-red-50/50',
    icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="13" r="8"/>
      <path d="M12 5V2"/>
      <path d="M10 2h4"/>
      <path d="M19 7l1.5-1.5"/>
      <path d="M12 9v8"/>
      <path d="M8 13h8"/>
    </svg>`
  }
]
</script>

<template>
  <section class="py-12 lg:py-16 bg-[#F9FAFB] overflow-hidden">
    <div class="max-w-[1340px] mx-auto px-6 md:px-10">
      
      <div class="flex flex-col xl:flex-row gap-6 xl:gap-8 items-stretch">
        
        <!-- Intro Column (Layout like before, centered vertically inside stretch layout) -->
        <div class="w-full xl:w-[220px] shrink-0 flex flex-col justify-center text-left py-2">
          <h2 class="font-heading font-bold text-navy text-[24px] md:text-[28px] leading-[1.25] mb-4 tracking-tight">
            {{ $t('education_page.system.title') }}
          </h2>
          <div class="w-8 h-1 bg-[#FF7A45] mb-5"></div>
          <p class="text-navy/70 text-[14px] leading-relaxed font-medium">
            {{ locale === 'vi' ? 'Mỗi cấp độ xây dựng trên nền tảng của cấp độ trước — từ việc thấu hiểu cơ thể đến áp dụng phục hồi trong các tình huống thực tế.' : 'Each level builds on the foundation of the previous one — from understanding the body to applying recovery in real-world situations.' }}
          </p>
        </div>
        
        <!-- Slider Area with fixed left and right arrows flanking the scroll area -->
        <div class="flex-1 w-full flex items-center gap-2 md:gap-4 min-w-0">
          
          <!-- Fixed Left Arrow Button (Outside the track scrolling viewport, always visible, never hidden) -->
          <button 
            @click="scroll('left')" 
            class="w-11 h-11 rounded-full border border-navy/10 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/20 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollLeft"
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          
          <!-- Track Container (Flex-1 scrollable track in the center) -->
          <div ref="trackRef" class="flex-1 overflow-x-auto pb-6 hide-scrollbar scroll-smooth min-w-0">
            <div class="flex items-stretch min-w-max gap-3 xl:gap-4 py-2 px-1">
              
              <!-- Card iteration -->
              <template v-for="(level, index) in levels" :key="level.id">
                <!-- Interconnecting Arrow (Hidden on first item) -->
                <div v-if="index !== 0" class="flex items-center justify-center text-navy/20 self-center px-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Card -->
                <div class="w-[220px] flex flex-col bg-white rounded-[16px] shadow-sm border border-navy/5 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <!-- Color border top -->
                  <div class="border-t-[4px] w-full" :class="level.borderColor"></div>
                  
                  <div class="p-5 flex-1 flex flex-col items-center text-center">
                    <!-- Level Title -->
                    <div class="text-[11px] font-extrabold uppercase tracking-widest mb-4" :class="level.color" style="white-space: pre-line">
                      {{ $t(`education_page.system.level${level.id}`) }}
                    </div>
                    
                    <!-- Icon -->
                    <div class="mb-4" :class="level.color" v-html="level.icon"></div>
                    
                    <!-- Title -->
                    <h3 class="font-heading font-extrabold text-navy text-[14px] leading-tight mb-2 min-h-[40px] flex items-center justify-center tracking-tight">
                      {{ $t(`education_page.system.level${level.id}_title`) }}
                    </h3>
                    
                    <!-- Subtitle / Desc -->
                    <p class="text-navy/60 text-[12px] leading-relaxed mb-4 min-h-[54px] font-medium">
                      {{ $t(`education_page.system.level${level.id}_desc`) }}
                    </p>
                    
                    <!-- Bullet list with top divider -->
                    <ul class="w-full text-left space-y-2 mb-6 border-t border-[#F1F1F1] pt-4">
                      <li v-for="i in 4" :key="i" class="flex items-start gap-2">
                        <span class="w-1 h-1 rounded-full mt-2 shrink-0 bg-navy/30"></span>
                        <span class="text-navy/80 text-[12px] font-medium leading-snug">{{ $t(`education_page.system.level${level.id}_item${i}`) }}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Output Footer -->
                  <div class="p-4 mt-auto border-t border-navy/5 bg-[#FAFAFA]/60 text-center">
                    <p class="text-[11.5px] font-bold text-navy/70 leading-snug">
                      <span :class="level.color">{{ getOutputParts(level.id).label }}</span>
                      <span class="font-semibold"> {{ getOutputParts(level.id).content }}</span>
                    </p>
                  </div>
                </div>
              </template>

            </div>
          </div>
          
          <!-- Fixed Right Arrow Button (Outside the track scrolling viewport, always visible, never hidden) -->
          <button 
            @click="scroll('right')" 
            class="w-11 h-11 rounded-full border border-navy/10 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/20 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollRight"
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          
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
