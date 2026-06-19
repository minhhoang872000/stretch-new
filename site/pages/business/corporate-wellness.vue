<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('wellness_page.seo_title'),
  description: t('wellness_page.seo_desc'),
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <WellnessHero />
      <WellnessProblem />
      <WellnessDelivery />
      <WellnessWhy />
      <BusinessCta />
      <WellnessFloatingBar />
    </main>
    <TheFooter />
    <ContactWidget />
    <BusinessFloatingBar />
  </div>
</template>
