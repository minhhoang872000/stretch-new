<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('education_page.seo_title'),
  description: t('education_page.seo_desc'),
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <EducationHero />
      <EducationProblem />
      <EducationSystem />
      <EducationWhy />
      <EducationQuality />
      <EducationDeliverables />
      <EducationCta />
      <EducationFloatingBar />
    </main>
    <TheFooter />
    <ContactWidget />
    <BusinessFloatingBar />
  </div>
</template>
