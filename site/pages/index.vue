<script setup lang="ts">
const { trackPageView } = useTracking()
const { t } = useI18n()

useSeo({
  title: t('seo.home_title'),
  description: t('seo.home_desc'),
  type: 'website',
})

onMounted(() => {
  trackPageView()
})
</script>

<template>
  <div>
    <TheHeader />
    <main>
      <HeroSection />
      <PartnersCarousel />
      <ServicesSection />
      <WhereWeWork />
      <WhyStretch />
      <ReviewsSection />
      <CtaSection />
    </main>
    <TheFooter />
    <FloatingCtaBar />
  </div>
</template>
