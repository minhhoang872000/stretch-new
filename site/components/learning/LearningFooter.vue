<script setup lang="ts">
/**
 * Compact footer for the Learning Hub surface (the main site footer belongs to
 * the marketing pages and links to services the hub doesn't cover).
 *
 * Kept to about a fifth of a phone screen: one brand line, one wrapping row of
 * links, one row of contacts, the copyright. The old four-column layout
 * stacked into ~780 px on mobile — taller than the viewport.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()

const links = computed(() => [
  { label: t('learning.nav.programs'), to: localePath('/learning-hub/programs') },
  { label: t('learning.nav.schedule'), to: localePath('/learning-hub/schedule') },
  { label: t('learning.nav.hub'), to: localePath('/sharing-hub') },
  { label: t('nav.bookSession'), to: localePath('/booking') },
  { label: t('learning.back_to_site'), to: localePath('/') },
])
</script>

<template>
  <footer id="support" class="bg-navy text-white scroll-mt-20">
    <div class="section-container py-5 lg:py-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <!-- Brand + one-line promise -->
        <div class="flex items-baseline gap-2 min-w-0">
          <NuxtLink :to="localePath('/learning-hub')" class="inline-flex items-center gap-1.5 shrink-0">
            <span class="text-base font-heading font-bold text-white tracking-tight">Stretch.vn</span>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="6" y="2" width="4" height="12" rx="2" fill="#F47A1F" />
              <rect x="2" y="6" width="12" height="4" rx="2" fill="#F47A1F" />
            </svg>
          </NuxtLink>
          <span class="text-[10px] font-heading font-extrabold uppercase tracking-[0.14em] text-accent shrink-0">
            {{ t('learning.brand') }}
          </span>
        </div>

        <!-- Links, wrapping on one or two short lines -->
        <nav class="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]" :aria-label="t('learning.footer.learn')">
          <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="text-white/70 hover:text-white transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-white/60">
          <a href="tel:+84938713498" class="hover:text-white transition-colors">+84 938 713 498</a>
          <a href="mailto:info@stretch.vn" class="hover:text-white transition-colors">info@stretch.vn</a>
          <a href="https://www.facebook.com/stretchvn/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
            Facebook
          </a>
        </div>
        <p class="text-[11.5px] text-white/40">© {{ year }} Stretch.vn — {{ t('learning.brand') }}</p>
      </div>
    </div>
  </footer>
</template>
