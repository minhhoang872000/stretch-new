<script setup lang="ts">
const { trackCTA } = useTracking()
const localePath = useLocalePath()
</script>

<template>
  <section class="py-8 lg:py-12">
    <div class="section-container">
      <div class="bg-[#041930] rounded-[16px] shadow-2xl px-6 py-6 lg:px-10 lg:py-6 overflow-hidden relative group">
        <!-- Subtle noise or texture could be here, but keeping it clean for now -->
        
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <!-- Text Group -->
          <div class="flex flex-col gap-1">
            <h2 class="text-xl lg:text-2xl font-heading font-bold text-white leading-tight">
              {{ $t('cta_bar.title') }}
            </h2>
            <p class="text-white/60 text-[15px]">
              {{ $t('cta_bar.subtitle') }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <!-- Book Button: Vibrant Orange Gradient -->
            <NuxtLink 
              :to="localePath('/booking')" 
              class="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#FF7A45] to-[#F47A1F] text-white font-heading font-bold text-sm rounded-[12px] shadow-lg shadow-orange-950/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
              @click="trackCTA('floating-cta-book', 'general')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ $t('nav.bookSession') }}
            </NuxtLink>

            <!-- Contact Button: Slim Outline -->
            <a 
              href="mailto:hello@stretch.vn" 
              class="flex items-center gap-3 px-8 py-3.5 bg-transparent border border-white/20 text-white font-heading font-bold text-sm rounded-[12px] hover:bg-white/5 transition-all active:scale-[0.98]"
              @click="trackCTA('floating-cta-contact', 'general')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ $t('footer.contact') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
