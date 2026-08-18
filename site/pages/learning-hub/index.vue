<script setup lang="ts">
/**
 * Learning Hub landing page.
 *
 * This route intentionally does NOT render TheHeader/TheFooter: the hub is its
 * own surface with its own chrome (LearningHeader / LearningFooter), reached
 * from the "Learning Hub" entry in the main site header.
 */
const { t } = useI18n()
const { trackPageView } = useTracking()

useSeo({
  title: t('seo.learning_hub_title'),
  description: t('seo.learning_hub_desc'),
  image: '/education-workshop.png',
  type: 'website',
})

onMounted(() => {
  trackPageView()
})
</script>

<template>
  <div class="learning-hub-page bg-white">
    <LearningHeader />

    <main>
      <LearningHero />
      <LearningPrograms />
      <LearningArticles />
      <LearningValueBar />
    </main>

    <LearningFooter />
  </div>
</template>
