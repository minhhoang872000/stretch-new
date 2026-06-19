<script setup lang="ts">
const { trackPageView } = useTracking()

useSeo({
  title: 'Stretch.vn — Professional Movement Recovery',
  description: 'Personalized recovery & movement support — at our clinic, at home, or at your event. Book your session online.',
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
