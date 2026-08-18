<script setup lang="ts">
import type { CatalogProgram } from '~/composables/useLearningCatalog'

const props = defineProps<{
  program: CatalogProgram
  /** Horizontal row instead of a vertical card. */
  list?: boolean
}>()

const { t } = useI18n()
const { formatPrice } = useLearningCatalog()
const { toggle, isSaved } = useSavedPrograms()

const kindLabel = computed(() => t(`learning.catalog.kind_${props.program.kind}`))
const modeLabel = computed(() => t(`learning.catalog.badge_${props.program.mode}`))

/** Scheduled items show date + place; self-paced ones show lessons + length. */
const scheduled = computed(() => Boolean(props.program.date))
</script>

<template>
  <article class="pcard" :class="{ 'pcard--list': list }">
    <div class="pcard__media">
      <NuxtImg
        :src="program.image"
        :alt="program.title"
        class="w-full h-full object-cover"
        format="webp"
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 260px"
        loading="lazy"
      />
      <span class="pcard__kind" :class="`pcard__kind--${program.kind}`">{{ kindLabel }}</span>
      <span class="pcard__mode">{{ modeLabel }}</span>
    </div>

    <div class="pcard__body">
      <h3 class="pcard__title">{{ program.title }}</h3>

      <p class="pcard__meta">
        <template v-if="scheduled">
          <span class="pcard__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="3" x2="8" y2="7" />
              <line x1="16" y1="3" x2="16" y2="7" />
            </svg>
            {{ program.date }}
          </span>
          <span class="pcard__dot">·</span>
          <span class="pcard__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {{ program.location }}
          </span>
        </template>
        <template v-else>
          <span class="pcard__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" stroke="none" />
            </svg>
            {{ t('learning.catalog.lessons', { count: program.lessons }) }}
          </span>
          <span class="pcard__dot">·</span>
          <span class="pcard__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15.5 14" />
            </svg>
            {{ program.duration }}
          </span>
        </template>
      </p>

      <div class="pcard__foot">
        <span class="pcard__price" :class="{ 'pcard__price--free': program.price === 0 }">
          {{ formatPrice(program.price) }}
        </span>
        <button
          type="button"
          class="pcard__save"
          :class="{ 'pcard__save--on': isSaved(program.slug) }"
          :aria-label="isSaved(program.slug) ? t('learning.catalog.unsave') : t('learning.catalog.save')"
          :aria-pressed="isSaved(program.slug)"
          @click="toggle(program.slug)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" :fill="isSaved(program.slug) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pcard {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}
.pcard:hover {
  border-color: #cfdae6;
  box-shadow: 0 12px 28px -14px rgba(11, 42, 74, 0.28);
  transform: translateY(-2px);
}

.pcard__media {
  position: relative;
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  background: var(--color-off-white);
  overflow: hidden;
}
.pcard__media img {
  transition: transform 0.5s ease;
}
.pcard:hover .pcard__media img {
  transform: scale(1.04);
}

/* ── Badges ── */
.pcard__kind,
.pcard__mode {
  position: absolute;
  top: 0.5rem;
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pcard__kind {
  left: 0.5rem;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(4px);
}
.pcard__kind--course {
  color: var(--color-navy-light);
}
.pcard__kind--workshop {
  color: #15803d;
}
.pcard__kind--mini {
  color: var(--color-accent-dark);
}

.pcard__mode {
  right: 0.5rem;
  background: rgba(11, 42, 74, 0.78);
  backdrop-filter: blur(4px);
  color: white;
}

/* ── Body ── */
.pcard__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0.8rem 0.85rem 0.75rem;
}

.pcard__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-heading);
  font-size: 13.5px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--color-navy);
}

.pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.28rem;
  margin-top: 0.45rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}
.pcard__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
}
.pcard__dot {
  opacity: 0.5;
}

.pcard__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.7rem;
}

.pcard__price {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  color: var(--color-accent);
}
.pcard__price--free {
  color: #16a34a;
}

.pcard__save {
  display: flex;
  color: var(--color-text-secondary);
  opacity: 0.55;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.pcard__save:hover {
  opacity: 1;
  color: var(--color-navy);
}
.pcard__save--on {
  opacity: 1;
  color: var(--color-accent);
}

/* ── List variant ── */
@media (min-width: 640px) {
  .pcard--list {
    flex-direction: row;
  }
  .pcard--list .pcard__media {
    width: 210px;
    aspect-ratio: auto;
  }
  .pcard--list .pcard__body {
    padding: 1rem 1.1rem;
  }
  .pcard--list .pcard__title {
    font-size: 15px;
    -webkit-line-clamp: 1;
  }
}
</style>
