<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('seo.business_title'),
  description: t('seo.business_desc'),
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
