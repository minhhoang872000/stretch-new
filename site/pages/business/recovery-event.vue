<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('event_page.seo_title'),
  description: t('event_page.seo_desc'),
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <EventHero />
      <EventWhoIsFor />
      <EventDifferences />
      <EventWorks />
      <EventTrust />
      <BusinessCta />
    </main>
    <TheFooter />
    <ContactWidget />
    <BusinessFloatingBar />
  </div>
</template>
