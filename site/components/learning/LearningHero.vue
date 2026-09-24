<script setup lang="ts">
/**
 * Learning Hub home banner — a horizontal slider.
 *
 * Slide 1 carries the hub's message and the main CTA; the rest feature the
 * first courses of the live catalogue (API first, seed list as fallback), so a
 * banner can never advertise a course the catalogue does not have. No photos:
 * each slide is a solid brand panel, which keeps the banner light and legible.
 *
 * Autoplays every 6s, pauses on hover / keyboard focus / hidden tab, and stays
 * still for people who ask for reduced motion. Swipe, arrows and dots all work.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { open } = useAuthModal()
const { loggedIn } = useHubSession()
const { programs, formatPrice } = useLearningCatalog()

interface CourseSlide {
  slug: string
  kindLabel: string
  title: string
  meta: string
  price: string
}

const courseSlides = computed<CourseSlide[]>(() =>
  programs.value.slice(0, 3).map((p) => ({
    slug: p.slug,
    kindLabel:
      p.kind === 'mini'
        ? t('learning.catalog.kind_mini')
        : p.kind === 'workshop'
          ? t('learning.catalog.kind_workshop')
          : t('learning.catalog.kind_course'),
    title: p.title,
    meta: p.date
      ? [p.date, p.location].filter(Boolean).join(' · ')
      : [p.lessons ? `${p.lessons} bài học` : '', p.duration || ''].filter(Boolean).join(' · '),
    price: p.price > 0 ? formatPrice(p.price) : t('learning.hero.free'),
  })),
)

const total = computed(() => 1 + courseSlides.value.length)
const index = ref(0)

function go(i: number) {
  const n = total.value
  index.value = ((i % n) + n) % n
}
const next = () => go(index.value + 1)
const prev = () => go(index.value - 1)

// ── Autoplay ──
const INTERVAL = 6000
let timer: ReturnType<typeof setInterval> | null = null
const paused = ref(false)
const reducedMotion = ref(false)

function stop() {
  if (timer) clearInterval(timer)
  timer = null
}
function start() {
  stop()
  if (reducedMotion.value || total.value < 2) return
  timer = setInterval(() => {
    if (!paused.value && document.visibilityState === 'visible') next()
  }, INTERVAL)
}
/** A manual move restarts the countdown, so the slide just chosen gets its full time. */
function manual(action: () => void) {
  action()
  start()
}

// ── Swipe ──
let touchX = 0
function onTouchStart(e: TouchEvent) {
  touchX = e.touches[0]?.clientX ?? 0
  paused.value = true
}
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  paused.value = false
  if (Math.abs(dx) > 40) manual(dx < 0 ? next : prev)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  start()
})
onBeforeUnmount(stop)
// The catalogue can arrive after mount and change the slide count.
watch(total, () => {
  if (index.value >= total.value) index.value = 0
  start()
})
</script>

<template>
  <section
    class="hub-banner"
    :aria-label="t('learning.hero.slides_label')"
    aria-roledescription="carousel"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div class="section-container hub-banner__frame">
      <div
        class="hub-banner__viewport"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div class="hub-banner__track" :style="{ transform: `translateX(-${index * 100}%)` }">
          <!-- ══ Slide 1: the hub's message ══ -->
          <div
            class="hub-slide hub-slide--0"
            role="group"
            aria-roledescription="slide"
            :aria-label="`1 / ${total}`"
            :aria-hidden="index !== 0"
          >
            <div class="hub-slide__body">
              <h1 class="hub-slide__title">
                {{ t('learning.hero.title1') }}<br />
                <span class="hub-slide__accent">{{ t('learning.hero.title2') }}</span>
              </h1>
              <p class="hub-slide__sub">{{ t('learning.hero.subtitle') }}</p>
              <div class="hub-slide__actions">
                <a href="#programs" class="hub-slide__cta" :tabindex="index === 0 ? 0 : -1">
                  {{ t('learning.hero.cta_primary') }}
                  <span aria-hidden="true">→</span>
                </a>
                <!-- ClientOnly: /learning-hub is prerendered signed-out. -->
                <ClientOnly>
                  <span v-if="!loggedIn" class="hub-slide__account">
                    {{ t('learning.hero.have_account') }}
                    <button
                      type="button"
                      class="hub-slide__login"
                      :tabindex="index === 0 ? 0 : -1"
                      @click="open('login')"
                    >
                      {{ t('learning.login') }} →
                    </button>
                  </span>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- ══ Featured courses ══ -->
          <div
            v-for="(slide, i) in courseSlides"
            :key="slide.slug"
            class="hub-slide"
            :class="`hub-slide--${(i % 3) + 1}`"
            role="group"
            aria-roledescription="slide"
            :aria-label="`${i + 2} / ${total}`"
            :aria-hidden="index !== i + 1"
          >
            <div class="hub-slide__body">
              <p class="hub-slide__eyebrow">{{ t('learning.hero.featured') }} · {{ slide.kindLabel }}</p>
              <h2 class="hub-slide__title hub-slide__title--course">{{ slide.title }}</h2>
              <p v-if="slide.meta" class="hub-slide__sub">{{ slide.meta }}</p>
              <div class="hub-slide__actions">
                <NuxtLink
                  :to="localePath(`/learning-hub/programs/${slide.slug}`)"
                  class="hub-slide__cta"
                  :tabindex="index === i + 1 ? 0 : -1"
                >
                  {{ t('learning.programs.view_course') }}
                  <span aria-hidden="true">→</span>
                </NuxtLink>
                <span class="hub-slide__price">{{ slide.price }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrows -->
        <button
          v-if="total > 1"
          type="button"
          class="hub-banner__arrow hub-banner__arrow--prev"
          :aria-label="t('learning.hero.prev')"
          @click="manual(prev)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          v-if="total > 1"
          type="button"
          class="hub-banner__arrow hub-banner__arrow--next"
          :aria-label="t('learning.hero.next')"
          @click="manual(next)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <!-- Dots -->
        <div v-if="total > 1" class="hub-banner__dots">
          <button
            v-for="n in total"
            :key="n"
            type="button"
            class="hub-banner__dot"
            :class="{ 'hub-banner__dot--on': index === n - 1 }"
            :aria-label="t('learning.hero.goto', { n })"
            :aria-current="index === n - 1"
            @click="manual(() => go(n - 1))"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hub-banner {
  background: #fbfcfd;
  border-bottom: 1px solid var(--color-border);
}
.hub-banner__frame {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}
.hub-banner__viewport {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
}
.hub-banner__track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .hub-banner__track {
    transition: none;
  }
}

/* ── Slide ── */
.hub-slide {
  flex: 0 0 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  padding: 2.25rem 1.5rem 3.25rem;
  color: white;
  position: relative;
  overflow: hidden;
}
/* Solid brand panels with one soft light, instead of photos. */
.hub-slide::after {
  content: '';
  position: absolute;
  right: -80px;
  top: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}
.hub-slide--0 { background: var(--color-navy); }
.hub-slide--1 { background: #0f4c5c; }
.hub-slide--2 { background: #7a3e14; }
.hub-slide--3 { background: #1f3a5f; }

.hub-slide__body {
  position: relative;
  z-index: 1;
  max-width: 620px;
}
.hub-slide__eyebrow {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 0.6rem;
}
.hub-slide__title {
  font-family: var(--font-heading);
  font-size: 28px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.02em;
  /* Global h1/h2 styles paint headings navy — invisible on these panels. */
  color: white;
}
.hub-slide__title--course {
  font-size: 26px;
}
.hub-slide__accent {
  color: var(--color-accent);
}
.hub-slide__sub {
  margin-top: 0.8rem;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  max-width: 440px;
}
.hub-slide__actions {
  margin-top: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem 1.2rem;
}
.hub-slide__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.8rem 1.25rem;
  border-radius: 12px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.1s ease;
}
.hub-slide__cta:hover {
  background: var(--color-accent-dark);
}
.hub-slide__cta:active {
  transform: scale(0.97);
}
.hub-slide__price {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 800;
}
.hub-slide__account {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}
.hub-slide__login {
  font-family: var(--font-heading);
  font-weight: 700;
  color: white;
  transition: color 0.2s ease;
}
.hub-slide__login:hover {
  color: var(--color-accent);
}

/* ── Controls ── */
.hub-banner__arrow {
  display: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  transition: background 0.2s ease;
}
.hub-banner__arrow:hover {
  background: rgba(255, 255, 255, 0.26);
}
.hub-banner__arrow--prev { left: 14px; }
.hub-banner__arrow--next { right: 14px; }

.hub-banner__dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.hub-banner__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  transition: width 0.3s ease, background 0.3s ease;
}
.hub-banner__dot--on {
  width: 22px;
  background: white;
}

@media (min-width: 1024px) {
  .hub-banner__frame {
    padding-top: 1.75rem;
    padding-bottom: 1.75rem;
  }
  .hub-slide {
    min-height: 360px;
    padding: 3rem 5rem 3.5rem;
  }
  .hub-slide__title {
    font-size: 42px;
  }
  .hub-slide__title--course {
    font-size: 36px;
  }
  .hub-slide__sub {
    font-size: 15px;
  }
  .hub-banner__arrow {
    display: flex;
  }
}
</style>
