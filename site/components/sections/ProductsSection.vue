<script setup lang="ts">
const { products, pending } = useProducts()
const localePath = useLocalePath()
</script>

<template>
  <section id="products" class="py-16 md:py-24">
    <div class="section-container">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="badge-accent mb-4 inline-block">{{ $t('products.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('products.title') }}</h2>
        <p class="section-subtitle">
          {{ $t('products.subtitle') }}
        </p>
        <div class="divider-accent mt-8" />
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProductSkeleton v-for="i in 3" :key="i" />
      </div>

      <!-- Product Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProductCard
          v-for="(product, index) in (products as any[])?.slice(0, 6)"
          :key="product.id"
          :product="product"
          :style="{ animationDelay: `${index * 0.1}s` }"
          class="animate-fade-in-up opacity-0"
        />
      </div>

      <!-- View All Button -->
      <div v-if="!pending" class="text-center mt-16">
        <BaseButton variant="outline" size="lg" :href="localePath('/products')">
          {{ $t('products.viewAll') }}
          <span class="material-symbols-outlined">arrow_forward</span>
        </BaseButton>
      </div>
    </div>
  </section>
</template>
