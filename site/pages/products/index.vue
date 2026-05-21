<script setup lang="ts">
const { t } = useI18n()

useSeo({
  title: t('products.title') + ' – Stretch.vn',
  description: 'Explore all professional recovery programs by Stretch.vn: Deep Tissue Massage, Aromatherapy, Facial Hydration, and Hot Stone Therapy.',
  type: 'website',
})

const { products, pending } = useProducts()
</script>

<template>
  <div>
    <TheHeader />
    <main class="gradient-bg">
      <!-- Page Header -->
      <header class="max-w-7xl mx-auto px-8 pt-32 pb-16 text-center">
        <span class="badge-accent mb-4 inline-block">{{ $t('products.eyebrow') }}</span>
        <h1 class="font-heading text-h1 mb-4">{{ $t('products.allPrograms') }} <span class="neon-highlight">{{ $t('products.allProgramsHighlight') }}</span></h1>
        <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          {{ $t('products.allProgramsSubtitle') }}
        </p>
        <div class="divider-accent mt-8" />
      </header>

      <div class="max-w-7xl mx-auto px-8 pb-32">
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProductSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProductCard
            v-for="(product, index) in (products as any[])"
            :key="product.id"
            :product="product"
            :style="{ animationDelay: `${index * 0.08}s` }"
            class="animate-fade-in-up opacity-0"
          />
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
