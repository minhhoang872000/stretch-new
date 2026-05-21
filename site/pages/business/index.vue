<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: `${t('business_page.hero.label')} — Stretch.vn`,
  description: t('business_page.hero.subtext'),
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <BusinessHero />
      <BusinessSolutions />
      <WhyPartner />
      <BusinessCta />
    </main>
    <TheFooter />
    <BusinessFloatingBar />
  </div>
</template>
