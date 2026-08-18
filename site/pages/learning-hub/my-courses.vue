<script setup lang="ts">
/**
 * The learner's own courses — in-progress on the left, finished on the right.
 *
 * Signed-in only. The demo session cookie is readable during SSR, so the guard
 * below runs on the server and the page never flashes before redirecting.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const { loggedIn } = useHubSession()
const { open: openAuth } = useAuthModal()
const { active, completed } = useMyLearning()

const tab = ref<'learning' | 'done'>('learning')

useSeo({
  title: t('learning.my.title'),
  description: t('learning.my.subtitle'),
  image: '/education-class.png',
  type: 'website',
})

// Nothing here makes sense signed out — send them to the hub and pop the login.
onMounted(() => {
  if (!loggedIn.value) {
    navigateTo(localePath('/learning-hub'))
    openAuth('login')
    return
  }
  trackPageView()
})
</script>

<template>
  <div class="bg-off-white min-h-screen flex flex-col">
    <LearningHeader />

    <main class="flex-1">
      <div class="section-container py-5 lg:py-7">
        <!-- ── Head ── -->
        <nav class="crumbs">
          <NuxtLink :to="localePath('/learning-hub')">{{ t('learning.catalog.breadcrumb_home') }}</NuxtLink>
          <span>›</span>
          <span class="crumbs__current">{{ t('learning.my.breadcrumb') }}</span>
        </nav>

        <div class="head">
          <div class="min-w-0">
            <h1 class="head__title">{{ t('learning.my.title') }}</h1>
            <p class="head__sub">{{ t('learning.my.subtitle') }}</p>
          </div>

          <aside class="tip">
            <span class="tip__icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="tip__title">{{ t('learning.my.tip_title') }}</p>
              <p class="tip__sub">{{ t('learning.my.tip_sub') }}</p>
            </div>
          </aside>
        </div>

        <!-- ── Tabs ── -->
        <div class="tabs">
          <button type="button" class="tab" :class="{ 'tab--on': tab === 'learning' }" @click="tab = 'learning'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" stroke="none" />
            </svg>
            {{ t('learning.my.tab_learning', { count: active.length }) }}
          </button>
          <button type="button" class="tab" :class="{ 'tab--on': tab === 'done' }" @click="tab = 'done'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="8.5 12.2 11 14.7 15.6 9.6" />
            </svg>
            {{ t('learning.my.tab_done', { count: completed.length }) }}
          </button>
        </div>

        <div class="layout">
          <!-- ══ In progress ══ -->
          <section :class="{ 'is-hidden-mobile': tab !== 'learning' }">
            <article v-for="item in active" :key="item.slug" class="ecard">
              <div class="ecard__media">
                <NuxtImg
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  format="webp"
                  sizes="(max-width: 639px) 40vw, 190px"
                  loading="lazy"
                />
              </div>

              <div class="ecard__body">
                <div class="ecard__top">
                  <span class="ecard__mode">{{ t(`learning.catalog.badge_${item.mode}`) }}</span>
                  <button type="button" class="ecard__more" :aria-label="t('learning.my.options')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="12" cy="19" r="1.6" />
                    </svg>
                  </button>
                </div>

                <h2 class="ecard__title">{{ item.title }}</h2>
                <p class="ecard__lesson">
                  {{ t('learning.my.lesson_progress', { current: item.lesson, total: item.lessons }) }}
                </p>

                <div class="ecard__bar">
                  <span class="ecard__track">
                    <span class="ecard__fill" :style="{ width: `${item.percent}%` }" />
                  </span>
                  <span class="ecard__pct">{{ item.percent }}%</span>
                </div>

                <p class="ecard__next">
                  {{ t('learning.my.next_up') }}
                  <strong>{{ item.nextLesson }}</strong>
                </p>

                <div class="ecard__foot">
                  <span class="ecard__meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15.5 14" />
                    </svg>
                    {{ t('learning.my.time_left', { time: item.timeLeft }) }}
                  </span>
                  <span class="ecard__meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {{ t('learning.my.updated', { date: item.updatedAt }) }}
                  </span>

                  <NuxtLink :to="localePath('/learning-hub/programs')" class="ecard__cta">
                    {{ t('learning.my.continue') }}
                  </NuxtLink>
                </div>
              </div>
            </article>

            <div v-if="!active.length" class="blank">
              <p class="blank__text">{{ t('learning.my.empty_learning') }}</p>
              <NuxtLink :to="localePath('/learning-hub/programs')" class="blank__btn">
                {{ t('learning.my.browse') }}
              </NuxtLink>
            </div>
          </section>

          <!-- ══ Completed ══ -->
          <section :class="{ 'is-hidden-mobile': tab !== 'done' }">
            <div class="done">
              <h2 class="done__title">{{ t('learning.my.completed_title', { count: completed.length }) }}</h2>

              <div v-for="item in completed" :key="item.slug" class="drow">
                <div class="drow__media">
                  <NuxtImg
                    :src="item.image"
                    :alt="item.title"
                    class="w-full h-full object-cover"
                    format="webp"
                    sizes="72px"
                    loading="lazy"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="drow__title">{{ item.title }}</p>
                  <p class="drow__date">{{ t('learning.my.completed_on', { date: item.completedAt }) }}</p>
                  <div class="drow__actions">
                    <NuxtLink :to="localePath('/learning-hub/programs')" class="drow__btn">
                      {{ t('learning.my.relearn') }}
                    </NuxtLink>
                    <NuxtLink :to="localePath(`/certificates/${item.certificateCode}`)" class="drow__link">
                      {{ t('learning.my.certificate') }} →
                    </NuxtLink>
                  </div>
                </div>

                <span class="drow__tick" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="8 12.2 11 15.2 16 9.6" />
                  </svg>
                </span>
              </div>

              <p v-if="!completed.length" class="blank__text">{{ t('learning.my.empty_done') }}</p>

              <div v-else class="award">
                <span class="award__icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="9" r="6" />
                    <polyline points="8.5 14 7 22 12 19.5 17 22 15.5 14" />
                  </svg>
                </span>
                <div class="min-w-0">
                  <p class="award__title">{{ t('learning.my.badge_title', { count: completed.length }) }}</p>
                  <p class="award__sub">{{ t('learning.my.badge_sub') }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <LearningFooter />
  </div>
</template>

<style scoped>
.crumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.crumbs a:hover {
  color: var(--color-accent);
}
.crumbs__current {
  color: var(--color-navy);
  font-weight: 600;
}

/* ── Head ── */
.head {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 0.7rem;
}

.head__title {
  font-family: var(--font-heading);
  font-size: 25px;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}

.head__sub {
  margin-top: 0.3rem;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}

.tip__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--color-off-white);
  color: var(--color-navy);
}

.tip__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
}

.tip__sub {
  margin-top: 0.15rem;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 1.4rem;
  margin-top: 1.2rem;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0 0.6rem;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}
.tab:hover {
  color: var(--color-navy);
}
.tab--on {
  color: var(--color-accent);
}
.tab--on::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2.5px;
  border-radius: 2px;
  background: var(--color-accent);
}

/* ── Layout ── */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.1rem;
}

/* ── Enrolment card ── */
.ecard {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}
.ecard + .ecard {
  margin-top: 0.85rem;
}

.ecard__media {
  position: relative;
  flex-shrink: 0;
  width: 34%;
  max-width: 190px;
  background: var(--color-off-white);
}

.ecard__body {
  flex: 1;
  min-width: 0;
  padding: 0.8rem 0.9rem;
}

.ecard__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ecard__mode {
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-navy-light);
}

.ecard__more {
  display: flex;
  color: var(--color-text-secondary);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}
.ecard__more:hover {
  opacity: 1;
}

.ecard__title {
  margin-top: 0.25rem;
  font-family: var(--font-heading);
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--color-navy);
}

.ecard__lesson {
  margin-top: 0.3rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.ecard__bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.5rem;
}

.ecard__track {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: var(--color-border);
  overflow: hidden;
}

.ecard__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--color-accent);
}

.ecard__pct {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-accent);
}

.ecard__next {
  margin-top: 0.55rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.ecard__next strong {
  font-weight: 600;
  color: var(--color-navy);
}

.ecard__foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.9rem;
  margin-top: 0.7rem;
}

.ecard__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.ecard__cta {
  margin-left: auto;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s ease;
}
.ecard__cta:hover {
  background: var(--color-accent-dark);
}

/* ── Completed panel ── */
.done {
  padding: 0.9rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}

.done__title {
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-navy);
  margin-bottom: 0.7rem;
}

.drow {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.7rem 0;
}
.drow + .drow {
  border-top: 1px solid var(--color-border);
}

.drow__media {
  flex-shrink: 0;
  width: 62px;
  height: 46px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-off-white);
}

.drow__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.3;
}

.drow__date {
  margin-top: 0.15rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.drow__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.45rem;
}

.drow__btn {
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.drow__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.drow__link {
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.drow__link:hover {
  color: var(--color-accent);
}

.drow__tick {
  flex-shrink: 0;
  color: var(--color-success);
}

.award {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.8rem;
  padding: 0.7rem 0.75rem;
  border-radius: 10px;
  background: var(--color-success-container);
}

.award__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  color: #15803d;
}

.award__title {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: #14532d;
}

.award__sub {
  margin-top: 0.1rem;
  font-size: 10.5px;
  line-height: 1.45;
  color: #166534;
}

/* ── Empty ── */
.blank {
  padding: 2.5rem 1.5rem;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: white;
}
.blank__text {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.blank__btn {
  display: inline-block;
  margin-top: 0.8rem;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
}

/* ── Mobile: the tabs actually switch panels ── */
@media (max-width: 1023px) {
  .is-hidden-mobile {
    display: none;
  }
}

/* ── Desktop: both columns visible, tabs only move focus ── */
@media (min-width: 640px) {
  .head {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .tip {
    width: 330px;
    flex-shrink: 0;
  }
  .head__title {
    font-size: 28px;
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 1.25rem;
  }
  .is-hidden-mobile {
    display: block;
  }
}
</style>
