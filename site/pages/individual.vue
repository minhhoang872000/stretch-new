<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('individual_page.seo_title'),
  description: t('individual_page.seo_desc'),
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <IndividualHero />
      <WhoIsThisFor />
      <WhoWeWorkWith />
      <FindSituation />
      <ExperiencingSection />
      <HowAndExpect />
      <IndividualCta />
      <TrustFeatures />
    </main>
    <TheFooter />
    <FloatingCta />
  </div>
</template>
