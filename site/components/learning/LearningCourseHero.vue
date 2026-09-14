<script setup lang="ts">
/**
 * Course detail hero — the navy band above the fold.
 *
 * It carries what a buyer decides on: what this is, who teaches it, how it is
 * rated, and the stat row (level / length / schedule / certificate). The price
 * and the CTA live in the side panel on desktop and in the sticky bottom bar on
 * mobile, so they are NOT repeated here.
 */
import type { ProgramDetail } from '~/composables/useProgramDetail'

const props = defineProps<{ detail: ProgramDetail }>()

const { t } = useI18n()
const localePath = useLocalePath()

const p = computed(() => props.detail.program)

const stats = computed(() => {
  const d = props.detail
  const out = [
    { label: t('learning.course.stat_level'), value: d.level },
    d.scheduled
      ? { label: t('learning.course.stat_when'), value: `${p.value.date} · ${p.value.location}` }
      : { label: t('learning.course.stat_length'), value: t('learning.course.length_value', { lessons: p.value.lessons ?? 0, duration: p.value.duration ?? '' }) },
    { label: t('learning.course.stat_language'), value: d.language },
    { label: t('learning.course.stat_certificate'), value: t('learning.course.certificate_value') },
  ]
  return out
})
</script>

<template>
  <header class="hero">
    <div class="section-container hero__inner">
      <div class="hero__col">
        <!-- ── Breadcrumb ── -->
        <nav class="crumbs">
          <NuxtLink :to="localePath('/learning-hub')">{{ t('learning.catalog.breadcrumb_home') }}</NuxtLink>
          <span>›</span>
          <NuxtLink :to="localePath('/learning-hub/programs')">{{ t('learning.catalog.breadcrumb') }}</NuxtLink>
          <span>›</span>
          <span class="crumbs__current">{{ p.title }}</span>
        </nav>

        <div class="hero__badges">
          <span class="badge badge--kind">{{ t(`learning.catalog.kind_${p.kind}`) }}</span>
          <span class="badge badge--mode">{{ t(`learning.catalog.badge_${p.mode}`) }}</span>
          <span class="badge badge--topic">{{ t(`learning.catalog.topic_${p.topic}`) }}</span>
        </div>

        <h1 class="hero__title">{{ p.title }}</h1>
        <p class="hero__sub">{{ detail.subtitle }}</p>

        <!-- ── Instructor + social proof ── -->
        <div class="hero__meta">
          <span class="who">
            <span class="who__avatar">{{ detail.instructor.initials }}</span>
            <span class="who__text">
              <span class="who__label">{{ t('learning.course.taught_by') }}</span>
              <span class="who__name">{{ detail.instructor.name }}</span>
            </span>
          </span>

          <span class="hero__divider" />

          <span class="rate">
            <span class="rate__num">{{ detail.rating.avg }}</span>
            <span class="rate__stars" aria-hidden="true">
              <svg v-for="i in 5" :key="i" width="13" height="13" viewBox="0 0 24 24" :fill="i <= Math.round(detail.rating.avg) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6">
                <polygon points="12 3 14.9 9.2 21.5 10 16.7 14.7 18 21.2 12 18 6 21.2 7.3 14.7 2.5 10 9.1 9.2" />
              </svg>
            </span>
            <a href="#reviews" class="rate__count">
              {{ t('learning.course.rating_count', { count: detail.rating.count }) }}
            </a>
          </span>

          <span class="hero__divider" />

          <span class="hero__enrolled">
            {{ detail.scheduled
              ? t('learning.course.attended', { count: detail.enrolled })
              : t('learning.course.enrolled', { count: detail.enrolled.toLocaleString('vi-VN') }) }}
          </span>
        </div>
      </div>

      <!-- Kept out of the flow on mobile: the image says less than the title does. -->
      <div class="hero__media">
        <NuxtImg
          :src="p.image"
          :alt="p.title"
          class="w-full h-full object-cover"
          format="webp"
          sizes="(max-width: 1023px) 100vw, 420px"
          loading="eager"
        />
      </div>
    </div>

    <!-- ── Stat bar ── -->
    <div class="section-container">
      <dl class="stats">
        <div v-for="stat in stats" :key="stat.label" class="stats__cell">
          <dt class="stats__label">{{ stat.label }}</dt>
          <dd class="stats__value">{{ stat.value }}</dd>
        </div>
      </dl>
    </div>
  </header>
</template>

<style scoped>
.hero {
  padding: 1.1rem 0 0;
  background: linear-gradient(160deg, var(--color-navy) 0%, #10365c 55%, var(--color-navy-soft) 100%);
  color: white;
}

.hero__inner {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-bottom: 1.3rem;
}

.hero__col {
  min-width: 0;
}

/* ── Breadcrumb ── */
.crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.68);
}
.crumbs a:hover {
  color: var(--color-accent-light);
}
.crumbs__current {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: white;
  font-weight: 600;
}

/* ── Badges ── */
.hero__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.85rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.badge--kind {
  background: var(--color-accent);
  color: white;
}
.badge--mode,
.badge--topic {
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.88);
}

/* ── Title ── */
.hero__title {
  margin-top: 0.7rem;
  font-family: var(--font-heading);
  font-size: 26px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
}

.hero__sub {
  margin-top: 0.6rem;
  max-width: 46rem;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

/* ── Meta row ── */
.hero__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
  font-size: 12px;
}

.hero__divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

.who {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.who__avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
}
.who__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.who__label {
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.who__name {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
}

.rate {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.rate__num {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 800;
  color: #ffc76b;
}
.rate__stars {
  display: inline-flex;
  gap: 1px;
  color: #ffc76b;
}
.rate__count {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.rate__count:hover {
  color: white;
}

.hero__enrolled {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.7);
}

/* ── Media ── */
.hero__media {
  order: -1;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
}

/* ── Stat bar ── */
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  background: rgba(255, 255, 255, 0.14);
}

.stats__cell {
  padding: 0.7rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(2px);
}

.stats__label {
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.stats__value {
  margin-top: 0.2rem;
  font-size: 11.5px;
  line-height: 1.45;
  font-weight: 600;
  color: white;
}

/* ── Desktop ── */
@media (min-width: 640px) {
  .hero__title {
    font-size: 32px;
  }
  .stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .hero {
    padding-top: 1.4rem;
  }
  .hero__inner {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    padding-bottom: 1.6rem;
  }
  .hero__media {
    order: 0;
    width: 400px;
    flex-shrink: 0;
    aspect-ratio: 16 / 10;
  }
  .hero__title {
    font-size: 36px;
  }
}
</style>
