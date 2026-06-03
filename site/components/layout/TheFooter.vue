<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="bg-navy text-white">
    <div class="section-container pt-16 pb-8">
      <!-- Top section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
        <!-- Logo + tagline -->
        <div class="lg:col-span-1">
          <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-1 mb-3">
            <span class="text-xl font-heading font-bold text-white tracking-tight">Stretch.vn</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="2" width="4" height="12" rx="2" fill="#F47A1F"/>
              <rect x="2" y="6" width="12" height="4" rx="2" fill="#F47A1F"/>
            </svg>
          </NuxtLink>
          <div class="mb-6 flex flex-col gap-2">
            <p class="text-[10px] text-white/40 font-medium uppercase tracking-widest">{{ $t('footer.poweredBy') }}</p>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-white/60 uppercase tracking-wider">Monaco Healthcare</span>
            </div>
          </div>
          <p class="text-sm text-white/60 leading-relaxed">
            {{ $t('footer.desc') }}
          </p>
        </div>

        <!-- For Individual -->
        <div>
          <NuxtLink :to="localePath('/individual')" class="text-sm font-heading font-semibold text-white hover:text-accent transition-colors mb-4 block">{{ $t('footer.individual') }}</NuxtLink>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath('/individual')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.sport_recovery') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/individual')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.rehabilitation') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/individual')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.targeted_relief') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- For Business -->
        <div>
          <NuxtLink :to="localePath('/business')" class="text-sm font-heading font-semibold text-white hover:text-accent transition-colors mb-4 block">{{ $t('footer.business') }}</NuxtLink>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath('/business/recovery-event')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.event_solutions') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/business/education-training')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.education_training') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/business/corporate-wellness')" class="text-sm text-white/60 hover:text-white transition-colors">{{ $t('services.corporate_wellness') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="text-sm font-heading font-semibold text-white mb-4">{{ $t('footer.company') }}</h4>
          <ul class="space-y-2.5">
            <li>
              <a 
                :href="locale === 'en' 
                  ? 'https://drive.google.com/file/d/1G70-bvwKMqXhYtlpVGmpHq0kS_aiYlMp/view?usp=sharing'
                  : 'https://drive.google.com/file/d/1s9rT4pXn4VrxqVDpeOo6nM-BLnU0a5cl/view?usp=sharing'"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-white/60 hover:text-white transition-colors"
              >
                {{ $t('footer.about') }}
              </a>
            </li>
            <li>
              <NuxtLink 
                :to="localePath('/sharing-hub')"
                class="text-sm text-white/60 hover:text-white transition-colors"
              >
                {{ $t('sharing_hub.nav') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Connect & Address -->
        <div class="lg:col-span-1">
          <h4 class="text-sm font-heading font-semibold text-white mb-4">{{ $t('footer.contact') }}</h4>
          <ul class="space-y-4 mb-6">
            <li class="flex items-start gap-3 group">
              <svg class="text-accent w-[18px] h-[18px] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+84938713498" class="text-sm text-white/60 group-hover:text-white transition-colors">+84 938 713 498</a>
            </li>
            <li class="flex items-start gap-3 group">
              <svg class="text-accent w-[18px] h-[18px] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:admin@stretch.vn" class="text-sm text-white/60 group-hover:text-white transition-colors">admin@stretch.vn</a>
            </li>
            <li class="flex items-start gap-3 group">
              <svg class="text-accent w-[18px] h-[18px] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <p class="text-sm text-white/60 group-hover:text-white transition-colors mb-2">
                  {{ $t('footer.address') }}
                </p>
                <a href="https://maps.app.goo.gl/k6WA3NPJonKxiob2A?g_st=ic" target="_blank" class="text-xs text-accent font-bold hover:underline flex items-center gap-1">
                  {{ $t('footer.view_map') }}
                  <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </li>
          </ul>

          <!-- Opening Hours -->
          <div class="border-t border-white/10 pt-5 mb-6">
            <h5 class="text-xs font-heading font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="text-accent w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ $t('footer.opening_hours') }}
            </h5>
            <ul class="space-y-1.5">
              <li class="text-sm text-white/60">{{ $t('footer.hours_weekday') }}</li>
              <li class="text-sm text-white/60">{{ $t('footer.hours_last_booking') }}</li>
              <li class="text-sm text-white/50 italic">{{ $t('footer.hours_sunday') }}</li>
            </ul>
          </div>
          
          <div class="flex gap-3">
            <!-- Social links -->
            <a href="https://www.facebook.com/stretchvn/" target="_blank" rel="noopener noreferrer" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-white/70">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/stretch.vn" target="_blank" rel="noopener noreferrer" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/70">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="5"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@Stretchvn" target="_blank" rel="noopener noreferrer" class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-white/70">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="pt-12 flex flex-col items-center gap-8 border-t border-white/5 mt-4">
        <!-- Big Logo -->
        <div class="opacity-10 grayscale hover:opacity-20 transition-opacity duration-500">
          <NuxtLink :to="localePath('/')" class="flex flex-col items-center gap-4">
            <span class="text-6xl md:text-8xl font-heading font-black tracking-tighter text-white">STRETCH.VN</span>
            <div class="flex gap-2">
              <div v-for="i in 5" :key="i" class="w-2 h-2 rounded-full bg-accent" />
            </div>
          </NuxtLink>
        </div>

        <div class="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
          <p>{{ $t('footer.copyright', { year: new Date().getFullYear(), rights: $t('footer.rights') }) }}</p>
          <div class="flex gap-10">
            <span>{{ $t('footer.website') }}: www.stretch.vn</span>
            <span>{{ $t('footer.email') }}: admin@stretch.vn</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
