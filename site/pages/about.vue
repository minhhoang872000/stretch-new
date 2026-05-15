<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeo({
  title: t('nav.method') + ' – Stretch.vn',
  description: 'Learn about Stretch.vn — redefining recovery through neuromuscular science and spiritual clarity.',
  type: 'website',
})
</script>

<template>
  <div>
    <TheHeader />
    <main class="gradient-bg">
      <!-- Hero -->
      <div class="bg-footer text-white py-20">
        <div class="max-w-7xl mx-auto px-8 text-center">
          <span class="badge bg-accent/20 text-accent font-bold mb-4 inline-block">{{ $t('about.eyebrow') }}</span>
          <h1 class="font-heading text-h1 mb-6">{{ $t('about.title1') }} <span class="neon-highlight">{{ $t('about.titleHighlight') }}</span></h1>
          <p class="text-body-lg text-white/70 max-w-2xl mx-auto">
            {{ $t('about.subtitle') }}
          </p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-8 py-20">
        <!-- Story Section -->
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <span class="eyebrow mb-4 block">{{ $t('about.storyEyebrow') }}</span>
              <h2 class="font-heading text-h2 mb-6">{{ $t('about.storyTitle') }}</h2>
              <p class="text-body-lg text-on-surface-variant leading-relaxed mb-4">
                {{ $t('about.storyP1') }}
              </p>
              <p class="text-body-lg text-on-surface-variant leading-relaxed">
                {{ $t('about.storyP2') }}
              </p>
            </div>
            <div class="aspect-square rounded-[40px] overflow-hidden bg-surface-container">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop"
                alt="Electric Zen Studio"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <!-- Values -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div class="text-center p-8 bg-white rounded-[24px] shadow-card border border-primary-container/20">
              <div class="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-3xl text-primary">biotech</span>
              </div>
              <h3 class="font-heading font-bold text-lg mb-3">{{ $t('about.val1Title') }}</h3>
              <p class="text-body-md text-on-surface-variant">
                {{ $t('about.val1Desc') }}
              </p>
            </div>
            <div class="text-center p-8 bg-white rounded-[24px] shadow-card border border-primary-container/20">
              <div class="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-3xl text-primary">self_improvement</span>
              </div>
              <h3 class="font-heading font-bold text-lg mb-3">{{ $t('about.val2Title') }}</h3>
              <p class="text-body-md text-on-surface-variant">
                {{ $t('about.val2Desc') }}
              </p>
            </div>
            <div class="text-center p-8 bg-white rounded-[24px] shadow-card border border-primary-container/20">
              <div class="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-3xl text-primary">electric_bolt</span>
              </div>
              <h3 class="font-heading font-bold text-lg mb-3">{{ $t('about.val3Title') }}</h3>
              <p class="text-body-md text-on-surface-variant">
                {{ $t('about.val3Desc') }}
              </p>
            </div>
          </div>

          <!-- CTA -->
          <div class="text-center">
            <h2 class="font-heading text-heading-lg mb-4">{{ $t('about.ctaTitle') }}</h2>
            <p class="text-body-lg text-on-surface-variant mb-8">
              {{ $t('about.ctaDesc') }}
            </p>
            <BaseButton variant="accent" size="lg" :href="localePath('/booking')">
              <span class="material-symbols-outlined text-lg">calendar_month</span>
              {{ $t('nav.bookSession') }}
            </BaseButton>
          </div>
        </div>
      </div>
      <CtaSection />
    </main>
    <TheFooter />
  </div>
</template>
