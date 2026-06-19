<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const { t } = useI18n()

const trackRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

let scrollRaf: number | null = null

const updateScrollButtons = () => {
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = requestAnimationFrame(() => {
    const el = trackRef.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 10
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
  })
}

const scroll = (direction: 'left' | 'right') => {
  const el = trackRef.value
  if (!el) return
  const scrollAmount = 360 // one card width + gap
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
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
  if (el) el.removeEventListener('scroll', updateScrollButtons)
  window.removeEventListener('resize', updateScrollButtons)
})

const ctaLink = 'https://zalo.me/4237229823551208502'

const cards = [
  {
    key: 'workshop',
    image: '/image-business1.webp',
    alt: 'Movement workshops',
  },
  {
    key: 'coffeetalk',
    image: '/image-business2.webp',
    alt: 'Wellness coffee talk with specialists',
  },
  {
    key: 'recovery',
    image: '/image-business3.webp',
    alt: 'Recovery day activation',
  },
]
</script>

<template>
  <section class="py-12 lg:py-16 bg-white overflow-hidden">
    <div class="max-w-[1200px] mx-auto px-6 md:px-10">
      <h2 class="font-heading font-bold text-navy text-[28px] md:text-[34px] text-center mb-10">
        {{ $t('wellness_page.delivery.title') }}
      </h2>

      <!-- Slider Area with flanking arrows -->
      <div class="flex items-stretch gap-2 md:gap-4">

        <!-- Left Arrow -->
        <button
          @click="scroll('left')"
          class="hidden md:flex w-11 h-11 self-center rounded-full border border-navy/10 bg-white items-center justify-center text-navy/60 hover:text-navy hover:border-navy/20 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="!canScrollLeft"
          aria-label="Scroll left"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <!-- Track -->
        <div ref="trackRef" class="flex-1 overflow-x-auto pb-4 hide-scrollbar scroll-smooth min-w-0">
          <div class="flex items-stretch gap-5 md:gap-6 py-2 px-1 min-w-max">

            <article
              v-for="(card, index) in cards"
              :key="card.key"
              class="w-[300px] sm:w-[340px] shrink-0 flex flex-col bg-white rounded-[24px] shadow-sm border border-navy/10 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <!-- Image with number badge -->
              <div class="relative">
                <div class="overflow-hidden aspect-video">
                  <NuxtImg
                    :src="card.image"
                    :alt="card.alt"
                    class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    format="webp"
                    loading="lazy"
                  />
                </div>
                <span class="absolute -bottom-4 left-5 w-9 h-9 rounded-full bg-navy text-white text-[13px] font-heading font-bold flex items-center justify-center shadow-md ring-4 ring-white">
                  {{ (index + 1).toString().padStart(2, '0') }}
                </span>
              </div>

              <div class="flex flex-col flex-1 p-5 pt-7">
                <!-- Title -->
                <h3 class="font-heading font-bold text-navy text-[18px] leading-snug mb-2">
                  {{ $t(`wellness_page.delivery.${card.key}_title`) }}
                </h3>

                <!-- Description -->
                <p class="text-navy/65 text-[14px] leading-relaxed mb-6">
                  {{ $t(`wellness_page.delivery.${card.key}_desc`) }}
                </p>

                <!-- CTA link -->
                <a
                  :href="ctaLink"
                  target="_blank"
                  class="mt-auto inline-flex items-center gap-1.5 text-accent font-heading font-bold text-[14px] hover:gap-2.5 transition-all"
                >
                  {{ $t('wellness_page.delivery.cta_label') }}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>

          </div>
        </div>

        <!-- Right Arrow -->
        <button
          @click="scroll('right')"
          class="hidden md:flex w-11 h-11 self-center rounded-full border border-navy/10 bg-white items-center justify-center text-navy/60 hover:text-navy hover:border-navy/20 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
