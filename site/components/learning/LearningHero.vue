<script setup lang="ts">
/**
 * Learning Hub home banner — a horizontal slider with three slides:
 *
 *  1. Khóa học thịnh hành — the self-paced course with the most learners.
 *  2. Workshop — the next scheduled workshop; when none is published it
 *     points at the training calendar instead of showing an empty slide.
 *  3. Đội ngũ — the teaching team (public fields from /api/instructors).
 *
 * All from live data (catalogue falls back to its seed list), no photos: each
 * slide is a solid brand panel. The hub headline stays as a visually hidden
 * <h1> so the page keeps its heading for search and screen readers.
 *
 * Autoplays every 6s, pauses on hover / keyboard focus / hidden tab, and stays
 * still for people who ask for reduced motion. Swipe, arrows and dots all work.
 */
import type { CatalogProgram } from '~/composables/useLearningCatalog'

import { A11y, Autoplay, EffectCreative, Keyboard, Parallax } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'

const { t } = useI18n()
const localePath = useLocalePath()
const { programs, formatPrice } = useLearningCatalog()

interface TeamMember { id: string; name: string; role: string; programs: number; learners: number }
const { data: team } = useAsyncData(
  'hub-instructors',
  () => $fetch<{ instructors: TeamMember[] }>('/api/instructors'),
  { default: () => ({ instructors: [] as TeamMember[] }) },
)

function kindLabel(kind: string) {
  if (kind === 'mini') return t('learning.catalog.kind_mini')
  if (kind === 'workshop') return t('learning.catalog.kind_workshop')
  return t('learning.catalog.kind_course')
}

function metaOf(p: CatalogProgram) {
  return p.date
    ? [p.date, p.time, p.location].filter(Boolean).join(' · ')
    : [p.lessons ? `${p.lessons} bài học` : '', p.duration || ''].filter(Boolean).join(' · ')
}

/** Most-enrolled self-paced course; the first one when there are no counts. */
const trending = computed<CatalogProgram | null>(() => {
  const selfPaced = programs.value.filter((p) => p.kind !== 'workshop')
  const pool = selfPaced.length ? selfPaced : programs.value
  return [...pool].sort((a, b) => (b.enrolled ?? 0) - (a.enrolled ?? 0))[0] ?? null
})

/** Next workshop, dated ones first. */
const workshop = computed<CatalogProgram | null>(() => {
  const all = programs.value.filter((p) => p.kind === 'workshop')
  return all.find((p) => p.date) ?? all[0] ?? null
})

/** The same person can be listed twice in the console; show each name once. */
const instructors = computed(() => {
  const seen = new Set<string>()
  return (team.value?.instructors ?? []).filter((i) => {
    const key = i.name.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
})
const teamLearners = computed(() =>
  (team.value?.instructors ?? []).reduce((s, i) => s + (i.learners || 0), 0).toLocaleString('vi-VN'),
)

function initialsOf(name: string) {
  const w = name.trim().split(/\s+/).filter(Boolean)
  if (!w.length) return '?'
  return ((w[0]?.[0] || '') + (w.length > 1 ? w[w.length - 1]?.[0] || '' : '')).toUpperCase()
}

const total = 3

// ── Slider: Swiper (creative effect + parallax text) ──
const viewport = ref<HTMLElement | null>(null)
const { swiper, activeIndex: index } = useSwiper(viewport, () => ({
  modules: [Autoplay, EffectCreative, Parallax, A11y, Keyboard],
  loop: true,
  speed: 900,
  grabCursor: true,
  parallax: true,
  effect: 'creative',
  creativeEffect: {
    // The outgoing slide sinks back and fades; the next one sweeps in over it.
    prev: { translate: ['-20%', 0, -1], scale: 0.9, opacity: 0 },
    next: { translate: ['100%', 0, 0] },
  },
  autoplay: { delay: 6000, pauseOnMouseEnter: true, disableOnInteraction: false },
  keyboard: { enabled: true, onlyInViewport: true },
  a11y: { enabled: true, prevSlideMessage: t('learning.hero.prev'), nextSlideMessage: t('learning.hero.next') },
}))

const prev = () => swiper.value?.slidePrev()
const next = () => swiper.value?.slideNext()
const go = (i: number) => swiper.value?.slideToLoop(i)

/** Links on hidden slides must not be reachable with Tab. */
const tab = (i: number) => (index.value === i ? 0 : -1)
</script>

<template>
  <section
    class="hub-banner"
    :aria-label="t('learning.hero.slides_label')"
    aria-roledescription="carousel"
  >
    <h1 class="sr-only">{{ t('learning.hero.title1') }} {{ t('learning.hero.title2') }}</h1>

    <div class="section-container hub-banner__frame">
      <div ref="viewport" class="hub-banner__viewport swiper">
        <div class="swiper-wrapper">
          <!-- ══ 1. Khóa học thịnh hành ══ -->
          <div class="swiper-slide hub-slide hub-slide--0" role="group" aria-roledescription="slide" :aria-label="`1 / ${total}`" :aria-hidden="index !== 0">
            <NuxtImg
              src="/education-gallery-2.png"
              alt=""
              class="hub-slide__img"
              format="webp"
              sizes="100vw lg:1200px"
              loading="eager"
              data-swiper-parallax="25%"
            />
            <div class="hub-slide__body">
              <p class="hub-slide__eyebrow" data-swiper-parallax="-120" data-swiper-parallax-opacity="0">
                {{ t('learning.hero.trending_label') }}<template v-if="trending"> · {{ kindLabel(trending.kind) }}</template>
              </p>
              <template v-if="trending">
                <h2 class="hub-slide__title" data-swiper-parallax="-260" data-swiper-parallax-opacity="0">{{ trending.title }}</h2>
                <p class="hub-slide__sub" data-swiper-parallax="-340" data-swiper-parallax-opacity="0">
                  {{ metaOf(trending) }}<template v-if="trending.enrolled"> · {{ t('learning.hero.enrolled', { n: trending.enrolled.toLocaleString('vi-VN') }) }}</template>
                </p>
                <div class="hub-slide__actions" data-swiper-parallax="-420" data-swiper-parallax-opacity="0">
                  <NuxtLink :to="localePath(`/learning-hub/programs/${trending.slug}`)" class="hub-slide__cta" :tabindex="tab(0)">
                    {{ t('learning.programs.view_course') }} <span aria-hidden="true">→</span>
                  </NuxtLink>
                  <span class="hub-slide__price">{{ trending.price > 0 ? formatPrice(trending.price) : t('learning.hero.free') }}</span>
                </div>
                <NuxtLink :to="localePath('/learning-hub/programs')" class="hub-slide__explore" :tabindex="tab(0)">
                  {{ t('learning.hero.cta_primary') }} <span aria-hidden="true">→</span>
                </NuxtLink>
              </template>
              <template v-else>
                <h2 class="hub-slide__title" data-swiper-parallax="-260" data-swiper-parallax-opacity="0">{{ t('learning.hero.title1') }} <span class="hub-slide__accent">{{ t('learning.hero.title2') }}</span></h2>
                <p class="hub-slide__sub" data-swiper-parallax="-340" data-swiper-parallax-opacity="0">{{ t('learning.hero.subtitle') }}</p>
                <div class="hub-slide__actions" data-swiper-parallax="-420" data-swiper-parallax-opacity="0">
                  <NuxtLink :to="localePath('/learning-hub/programs')" class="hub-slide__cta" :tabindex="tab(0)">
                    {{ t('learning.hero.cta_primary') }} <span aria-hidden="true">→</span>
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>

          <!-- ══ 2. Workshop ══ -->
          <div class="swiper-slide hub-slide hub-slide--2" role="group" aria-roledescription="slide" :aria-label="`2 / ${total}`" :aria-hidden="index !== 1">
            <NuxtImg
              src="/education-workshop.png"
              alt=""
              class="hub-slide__img"
              format="webp"
              sizes="100vw lg:1200px"
              loading="lazy"
              data-swiper-parallax="25%"
            />
            <div class="hub-slide__body">
              <p class="hub-slide__eyebrow" data-swiper-parallax="-120" data-swiper-parallax-opacity="0">{{ t('learning.hero.workshop_label') }}</p>
              <template v-if="workshop">
                <h2 class="hub-slide__title" data-swiper-parallax="-260" data-swiper-parallax-opacity="0">{{ workshop.title }}</h2>
                <p v-if="metaOf(workshop)" class="hub-slide__sub" data-swiper-parallax="-340" data-swiper-parallax-opacity="0">{{ metaOf(workshop) }}</p>
                <div class="hub-slide__actions" data-swiper-parallax="-420" data-swiper-parallax-opacity="0">
                  <NuxtLink :to="localePath(`/learning-hub/programs/${workshop.slug}`)" class="hub-slide__cta" :tabindex="tab(1)">
                    {{ t('learning.programs.view_course') }} <span aria-hidden="true">→</span>
                  </NuxtLink>
                  <span class="hub-slide__price">{{ workshop.price > 0 ? formatPrice(workshop.price) : t('learning.hero.free') }}</span>
                </div>
              </template>
              <template v-else>
                <h2 class="hub-slide__title" data-swiper-parallax="-260" data-swiper-parallax-opacity="0">{{ t('learning.hero.workshop_fallback_title') }}</h2>
                <p class="hub-slide__sub" data-swiper-parallax="-340" data-swiper-parallax-opacity="0">{{ t('learning.hero.workshop_fallback_sub') }}</p>
                <div class="hub-slide__actions" data-swiper-parallax="-420" data-swiper-parallax-opacity="0">
                  <NuxtLink :to="localePath('/learning-hub/schedule')" class="hub-slide__cta" :tabindex="tab(1)">
                    {{ t('learning.hero.workshop_cta') }} <span aria-hidden="true">→</span>
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>

          <!-- ══ 3. Đội ngũ ══ -->
          <div class="swiper-slide hub-slide hub-slide--1" role="group" aria-roledescription="slide" :aria-label="`3 / ${total}`" :aria-hidden="index !== 2">
            <NuxtImg
              src="/education.webp"
              alt=""
              class="hub-slide__img"
              format="webp"
              sizes="100vw lg:1200px"
              loading="lazy"
              data-swiper-parallax="25%"
            />
            <div class="hub-slide__body hub-slide__body--wide">
              <p class="hub-slide__eyebrow" data-swiper-parallax="-120" data-swiper-parallax-opacity="0">{{ t('learning.hero.team_label') }}</p>
              <h2 class="hub-slide__title" data-swiper-parallax="-260" data-swiper-parallax-opacity="0">{{ t('learning.hero.team_title') }}</h2>
              <p v-if="instructors.length" class="hub-slide__sub" data-swiper-parallax="-340" data-swiper-parallax-opacity="0">
                {{ t('learning.hero.team_sub', { n: instructors.length, learners: teamLearners }) }}
              </p>
              <ul v-if="instructors.length" class="hub-team">
                <li v-for="person in instructors.slice(0, 4)" :key="person.id" class="hub-team__item">
                  <span class="hub-team__avatar" aria-hidden="true">{{ initialsOf(person.name) }}</span>
                  <span class="hub-team__text">
                    <span class="hub-team__name">{{ person.name }}</span>
                    <span class="hub-team__role">{{ person.role }}</span>
                  </span>
                </li>
              </ul>
              <div class="hub-slide__actions" data-swiper-parallax="-420" data-swiper-parallax-opacity="0">
                <NuxtLink :to="localePath('/learning-hub/programs')" class="hub-slide__cta" :tabindex="tab(2)">
                  {{ t('learning.hero.team_cta') }} <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrows -->
        <button type="button" class="hub-banner__arrow hub-banner__arrow--prev" :aria-label="t('learning.hero.prev')" @click="prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button type="button" class="hub-banner__arrow hub-banner__arrow--next" :aria-label="t('learning.hero.next')" @click="next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <!-- Dots -->
        <div class="hub-banner__dots">
          <button
            v-for="n in total"
            :key="n"
            type="button"
            class="hub-banner__dot"
            :class="{ 'hub-banner__dot--on': index === n - 1 }"
            :aria-label="t('learning.hero.goto', { n })"
            :aria-current="index === n - 1"
            @click="go(n - 1)"
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
/* Arrows and dots sit above Swiper's layers. */
.hub-banner__arrow,
.hub-banner__dots {
  z-index: 5;
}

/* ── Slide ── */
.hub-slide {
  height: auto;
  min-height: 300px;
  display: flex;
  align-items: center;
  padding: 2.25rem 1.5rem 3.25rem;
  color: white;
  position: relative;
  overflow: hidden;
}
/* Photo background: the image fills the slide (drifting with parallax as it
   slides), under a navy gradient that keeps the text on the left readable. */
.hub-slide {
  background: var(--color-navy);
}
.hub-slide__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 70% center;
  z-index: 0;
  /* Room for the parallax drift, so no edge shows while sliding. */
  transform: scale(1.15);
}
.hub-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 42, 74, 0.55) 0%, rgba(11, 42, 74, 0.92) 70%);
}
@media (min-width: 1024px) {
  .hub-slide::after {
    background: linear-gradient(90deg, rgba(11, 42, 74, 0.96) 0%, rgba(11, 42, 74, 0.82) 42%, rgba(11, 42, 74, 0.2) 100%);
  }
}

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

/* Secondary link to the whole catalogue, under the slide CTA. */
.hub-slide__explore {
  display: inline-block;
  margin-top: 0.9rem;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(255, 255, 255, 0.35);
  transition: color 0.2s ease;
}
.hub-slide__explore:hover {
  color: var(--color-accent);
}

/* ── Team slide ── */
.hub-slide__body--wide {
  max-width: 820px;
}
.hub-team {
  margin-top: 1.1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem 1rem;
}
.hub-team__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.hub-team__avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
}
.hub-team__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.hub-team__name {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hub-team__role {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (min-width: 1024px) {
  .hub-team {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
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
