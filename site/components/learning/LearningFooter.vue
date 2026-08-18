<script setup lang="ts">
/**
 * Compact footer for the Learning Hub surface (the main site footer belongs to
 * the marketing pages and links to services the hub doesn't cover).
 */
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer id="support" class="bg-navy text-white scroll-mt-20">
    <div class="section-container pt-10 pb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">
        <!-- Brand -->
        <div>
          <NuxtLink :to="localePath('/learning-hub')" class="inline-flex items-center gap-1.5 mb-2">
            <span class="text-lg font-heading font-bold text-white tracking-tight">Stretch.vn</span>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="2" width="4" height="12" rx="2" fill="#F47A1F" />
              <rect x="2" y="6" width="12" height="4" rx="2" fill="#F47A1F" />
            </svg>
          </NuxtLink>
          <p class="text-[10px] font-heading font-extrabold uppercase tracking-[0.14em] text-accent mb-3">
            {{ t('learning.brand') }}
          </p>
          <p class="text-sm text-white/60 leading-relaxed">
            {{ t('learning.footer.desc') }}
          </p>
        </div>

        <!-- Learn -->
        <div>
          <p class="text-sm font-heading font-semibold text-white mb-4">{{ t('learning.footer.learn') }}</p>
          <ul class="space-y-2.5">
            <li><a href="#programs" class="text-sm text-white/60 hover:text-white transition-colors">{{ t('learning.nav.programs') }}</a></li>
            <li><a href="#schedule" class="text-sm text-white/60 hover:text-white transition-colors">{{ t('learning.nav.schedule') }}</a></li>
            <li>
              <NuxtLink :to="localePath('/sharing-hub')" class="text-sm text-white/60 hover:text-white transition-colors">
                {{ t('learning.nav.hub') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Stretch.vn -->
        <div>
          <p class="text-sm font-heading font-semibold text-white mb-4">Stretch.vn</p>
          <ul class="space-y-2.5">
            <li>
              <NuxtLink :to="localePath('/')" class="text-sm text-white/60 hover:text-white transition-colors">
                {{ t('learning.back_to_site') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/individual')" class="text-sm text-white/60 hover:text-white transition-colors">
                {{ t('nav.individual') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/business')" class="text-sm text-white/60 hover:text-white transition-colors">
                {{ t('nav.business') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/booking')" class="text-sm text-white/60 hover:text-white transition-colors">
                {{ t('nav.bookSession') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <p class="text-sm font-heading font-semibold text-white mb-4">{{ t('learning.footer.support') }}</p>
          <ul class="space-y-2.5">
            <li>
              <a href="tel:+84938713498" class="text-sm text-white/60 hover:text-white transition-colors">
                +84 938 713 498
              </a>
            </li>
            <li>
              <a href="mailto:info@stretch.vn" class="text-sm text-white/60 hover:text-white transition-colors">
                info@stretch.vn
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/stretchvn/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-white/60 hover:text-white transition-colors"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p class="pt-5 text-xs text-white/40">
        © {{ year }} Stretch.vn — {{ t('learning.brand') }}
      </p>
    </div>
  </footer>
</template>
