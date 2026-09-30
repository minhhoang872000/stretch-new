<script setup lang="ts">
/**
 * "Đã lưu" — the programmes a visitor bookmarked from a course card or page.
 *
 * Open to everyone, signed in or not: the list lives in this browser
 * (useSavedPrograms → localStorage), so it is read after mount. Slugs that are
 * no longer in the catalogue (unpublished since) are left out quietly.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const { programs } = useLearningCatalog()
const { saved } = useSavedPrograms()

// The list comes from localStorage, which only exists in the browser.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  trackPageView()
})

/** Newest saved first. */
const items = computed(() => {
  const bySlug = new Map(programs.value.map((p) => [p.slug, p]))
  return [...saved.value].reverse().map((slug) => bySlug.get(slug)).filter((p): p is NonNullable<typeof p> => !!p)
})

useSeo({
  title: t('learning.saved.title'),
  description: t('learning.saved.subtitle'),
  image: '/education-class.png',
  type: 'website',
  noIndex: true,
})
</script>

<template>
  <div class="bg-off-white min-h-screen flex flex-col">
    <LearningHeader />

    <main class="flex-1">
      <div class="section-container py-5 lg:py-7">
        <nav class="crumbs">
          <NuxtLink :to="localePath('/learning-hub')">{{ t('learning.catalog.breadcrumb_home') }}</NuxtLink>
          <span>›</span>
          <span class="crumbs__current">{{ t('learning.saved.breadcrumb') }}</span>
        </nav>

        <div class="head">
          <div>
            <h1 class="head__title">
              {{ t('learning.saved.title') }}
              <span v-if="mounted && items.length" class="head__count">{{ t('learning.saved.count', { count: items.length }) }}</span>
            </h1>
            <p class="head__sub">{{ t('learning.saved.subtitle') }}</p>
          </div>
        </div>

        <!-- Before mount the list is unknown (it lives in the browser): a skeleton, not a false "empty". -->
        <div v-if="!mounted" class="grid">
          <div v-for="n in 3" :key="n" class="skeleton" />
        </div>

        <TransitionGroup v-else-if="items.length" tag="div" name="saved" class="grid">
          <LearningCatalogCard v-for="program in items" :key="program.slug" :program="program" />
        </TransitionGroup>

        <div v-else class="blank">
          <span class="blank__icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <p class="blank__title">{{ t('learning.saved.empty_title') }}</p>
          <p class="blank__text">{{ t('learning.saved.empty_sub') }}</p>
          <NuxtLink :to="localePath('/learning-hub/programs')" class="blank__btn">{{ t('learning.saved.cta') }} →</NuxtLink>
        </div>

        <p v-if="mounted && items.length" class="note">{{ t('learning.saved.device_note') }}</p>
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

.head {
  margin-top: 0.7rem;
  margin-bottom: 1.2rem;
}
.head__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
  font-family: var(--font-heading);
  font-size: 25px;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}
.head__count {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(244, 122, 31, 0.1);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--color-accent-dark);
}
.head__sub {
  margin-top: 0.3rem;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.85rem;
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.skeleton {
  height: 300px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef2f6 25%, #f6f8fa 50%, #eef2f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* A card un-saved from this page leaves smoothly. */
.saved-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.saved-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.saved-move {
  transition: transform 0.3s ease;
}

.blank {
  padding: 3rem 1.5rem;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  background: white;
}
.blank__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(244, 122, 31, 0.1);
  color: var(--color-accent);
}
.blank__title {
  margin-top: 0.9rem;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 800;
  color: var(--color-navy);
}
.blank__text {
  margin: 0.35rem auto 0;
  max-width: 380px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.blank__btn {
  display: inline-block;
  margin-top: 1.1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s ease;
}
.blank__btn:hover {
  background: var(--color-accent-dark);
}

.note {
  margin-top: 1.2rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
