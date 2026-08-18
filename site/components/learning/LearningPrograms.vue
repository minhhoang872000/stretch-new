<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { courses, sessions, formatPrice } = useLearningHub()
</script>

<template>
  <section id="programs" class="py-6 lg:py-8 bg-white scroll-mt-[70px]">
    <div class="section-container grid grid-cols-1 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] gap-6 lg:gap-7">
      <!-- ══ Featured programs ══ -->
      <div>
        <div class="hub-section-head">
          <h2 class="hub-section-title">{{ t('learning.programs.title') }}</h2>
          <NuxtLink :to="localePath('/learning-hub/programs')" class="hub-more">
            {{ t('learning.see_all') }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article
            v-for="course in courses"
            :key="course.slug"
            class="course-card"
            :class="course.dark ? 'course-card--dark' : 'course-card--light'"
          >
            <div class="course-card__media">
              <NuxtImg
                :src="course.image"
                :alt="course.title"
                class="w-full h-full object-cover"
                format="webp"
                sizes="(max-width: 640px) 100vw, 320px"
              />
            </div>

            <div class="course-card__body">
              <span class="kind-pill" :class="course.kind === 'mini' ? 'kind-pill--mini' : 'kind-pill--course'">
                {{ course.kind === 'mini' ? t('learning.programs.mini') : t('learning.programs.course') }}
              </span>

              <h3 class="course-card__title">{{ course.title }}</h3>

              <p class="course-card__meta">
                <span class="course-card__meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" stroke="none" />
                  </svg>
                  {{ course.lessons }}
                </span>
                <span class="course-card__meta-dot">·</span>
                <span class="course-card__meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15.5 14" />
                  </svg>
                  {{ course.duration }}
                </span>
              </p>

              <span v-if="course.price === 0" class="free-pill">{{ formatPrice(0) }}</span>
              <p v-else class="course-card__price">{{ formatPrice(course.price) }}</p>

              <a href="#programs" class="course-card__cta">
                {{ course.price === 0 ? t('learning.programs.start_free') : t('learning.programs.view_course') }}
                <svg class="course-card__cta-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </article>
        </div>
      </div>

      <!-- ══ Upcoming schedule ══ -->
      <div id="schedule" class="scroll-mt-[70px]">
        <div class="hub-section-head">
          <h2 class="hub-section-title">{{ t('learning.schedule.title') }}</h2>
          <a href="#schedule" class="hub-more">
            {{ t('learning.see_all') }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        <div class="session-panel">
          <a v-for="s in sessions" :key="s.id" href="#schedule" class="session-row group">
            <span class="session-date">
              <span class="session-date__day">{{ s.day }}</span>
              <span class="session-date__month">{{ s.month }}</span>
            </span>

            <span class="min-w-0 flex-1">
              <span class="session-kind" :class="`session-kind--${s.kind}`">{{ s.format }}</span>
              <span class="session-title">{{ s.title }}</span>
              <span class="session-meta">
                {{ s.mode }}<template v-if="s.location !== s.mode"> · {{ s.location }}</template>
              </span>
            </span>

            <span class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="session-price">{{ formatPrice(s.price) }}</span>
              <!-- Only surfaced once seats get tight — an "open" pill on every row
                   is noise, and scarcity is the part worth showing. -->
              <span v-if="s.status !== 'open'" class="seat-pill" :class="`seat-pill--${s.status}`">
                {{ t(`learning.schedule.status_${s.status}`) }}
              </span>
            </span>

            <svg
              class="text-text-secondary/40 group-hover:text-accent transition-colors flex-shrink-0"
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>

        <div class="mt-2.5 text-right">
          <a href="#schedule" class="hub-more">
            {{ t('learning.schedule.see_all_sessions') }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Shared section chrome ── */
.hub-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.hub-section-title {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-navy);
}

.hub-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  white-space: nowrap;
  transition: color 0.2s ease;
}
.hub-more:hover {
  color: var(--color-accent);
}

/* ── Course cards ── */
.course-card {
  position: relative;
  display: flex;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: white;
  min-height: 208px;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.course-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.course-card__media {
  position: absolute;
  inset: 0;
}
.course-card__media img {
  transition: transform 0.5s ease;
}
.course-card:hover .course-card__media img {
  transform: scale(1.04);
}

/* Dark variant: image fills the card, navy wash over it */
.course-card--dark {
  background: var(--color-navy);
  border-color: var(--color-navy);
}
.course-card--dark .course-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(11, 42, 74, 0.95) 0%, rgba(11, 42, 74, 0.82) 45%, rgba(11, 42, 74, 0.45) 100%);
}

/* Light variant: image occupies the right side only */
.course-card--light .course-card__media {
  left: auto;
  width: 46%;
  mask-image: linear-gradient(90deg, transparent 0%, #000 38%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 38%);
}

.course-card__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
}

.kind-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.kind-pill--mini {
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.kind-pill--course {
  background: rgba(244, 122, 31, 0.12);
  color: var(--color-accent);
  border: 1px solid rgba(244, 122, 31, 0.28);
}

.course-card__title {
  font-family: var(--font-heading);
  font-size: 17px;
  line-height: 1.24;
  font-weight: 800;
  color: var(--color-navy);
  margin-top: 0.7rem;
  max-width: 9em;
}
.course-card--dark .course-card__title {
  color: white;
}

.course-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  margin-top: 0.45rem;
}

.course-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.course-card__meta-dot {
  opacity: 0.55;
}
.course-card--dark .course-card__meta {
  color: rgba(255, 255, 255, 0.72);
}

.free-pill {
  display: inline-flex;
  align-items: center;
  margin-top: 0.6rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(74, 222, 128, 0.5);
  background: rgba(74, 222, 128, 0.14);
  color: #4ade80;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.course-card__price {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-accent);
  margin-top: 0.6rem;
}

.course-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  background: white;
  color: var(--color-navy);
  border: 1.5px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  transition: all 0.2s ease;
}
.course-card__cta:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.course-card--dark .course-card__cta {
  background: white;
  border-color: white;
  color: var(--color-navy);
}
.course-card--dark .course-card__cta:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

/* ── Schedule panel ── */
.session-panel {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
  overflow: hidden;
}

.session-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  transition: background 0.2s ease;
}
.session-row + .session-row {
  border-top: 1px solid var(--color-border);
}
.session-row:hover {
  background: var(--color-off-white);
}

.session-date {
  flex-shrink: 0;
  width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.session-date__day {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  color: var(--color-accent);
  line-height: 1;
}
.session-date__month {
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  margin-top: 3px;
}

.session-kind {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.25rem;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.session-kind--course {
  background: rgba(42, 80, 128, 0.1);
  color: var(--color-navy-light);
}
.session-kind--workshop {
  background: var(--color-success-container);
  color: #15803d;
}

.session-title {
  display: block;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}
.session-row:hover .session-title {
  color: var(--color-accent);
}

.session-meta {
  display: block;
  font-size: 10.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-price {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--color-accent);
  white-space: nowrap;
}

.seat-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}
.seat-pill--open {
  background: var(--color-success-container);
  color: #15803d;
}
.seat-pill--few {
  background: #fef3c7;
  color: #b45309;
}
.seat-pill--full {
  background: var(--color-error-container);
  color: var(--color-error);
}

/* ══ Mobile: course cards turn into a horizontal row — thumbnail on the left,
   copy on the right. The desktop cards are image-backed with the copy laid over
   the photo; at this width that treatment leaves the title fighting the image,
   so the media becomes a plain sibling column instead and both variants render
   on white. ══ */
@media (max-width: 1023px) {
  .course-card {
    min-height: 0;
    align-items: stretch;
    background: white;
    border-color: var(--color-border);
  }
  .course-card--dark {
    background: white;
    border-color: var(--color-border);
  }

  .course-card__media,
  .course-card--light .course-card__media {
    position: relative;
    inset: auto;
    width: 42%;
    flex-shrink: 0;
    mask-image: none;
    -webkit-mask-image: none;
  }
  .course-card--dark .course-card__media::after {
    display: none;
  }

  /* Static so the badge below anchors to the card, not to the copy column. */
  .course-card__body {
    position: static;
    justify-content: center;
    gap: 0.15rem;
    padding: 0.85rem 0.9rem;
  }

  /* The badge moves out of the copy flow and sits over the thumbnail. */
  .kind-pill {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 2;
    background: rgba(255, 255, 255, 0.93);
    border: none;
    backdrop-filter: blur(4px);
  }
  .kind-pill--mini {
    color: #15803d;
  }
  .kind-pill--course {
    color: var(--color-navy);
  }

  .course-card__title,
  .course-card--dark .course-card__title {
    margin-top: 0;
    max-width: none;
    font-size: 15.5px;
    color: var(--color-navy);
  }

  .course-card__meta,
  .course-card--dark .course-card__meta {
    margin-top: 0.4rem;
    color: var(--color-text-secondary);
  }

  /* Free price reads as text here, not as a chip. */
  .free-pill {
    margin-top: 0.55rem;
    padding: 0;
    border: none;
    background: none;
    color: #16a34a;
    font-size: 12px;
    letter-spacing: 0.06em;
  }

  .course-card__price {
    margin-top: 0.55rem;
    font-size: 14px;
  }

  /* And the CTA is a text link rather than a bordered button. */
  .course-card__cta,
  .course-card--dark .course-card__cta {
    margin-top: 0.65rem;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-navy-light);
  }
  .course-card__cta-arrow {
    display: block;
  }

  .session-row {
    gap: 0.6rem;
    padding: 0.8rem 0.85rem;
  }
  .session-date__day {
    font-size: 20px;
  }
  .session-title {
    font-size: 13.5px;
  }
}

/* Desktop keeps the plain button label. */
@media (min-width: 1024px) {
  .course-card__cta-arrow {
    display: none;
  }
}
</style>
