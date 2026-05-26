<script setup lang="ts">
defineProps<{
  product: {
    id: string
    slug: string
    name: string
    shortDescription: string
    price: number
    coverImage: string
    category: string
    tags: string[]
  }
}>()
</script>

<template>
  <article class="relative group bg-surface-container-low rounded-[24px] border border-primary-container p-8 transition-all hover:bg-white hover:shadow-2xl overflow-hidden">
    <!-- Left color bar -->
    <div class="absolute left-0 top-0 bottom-0 w-2 bg-primary-container" />

    <!-- Image -->
    <NuxtLink :to="`/products/${product.slug}`">
      <div class="mb-6 rounded-[24px] overflow-hidden aspect-video">
        <NuxtImg
          :src="product.coverImage"
          :alt="product.name"
          class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
          width="640"
          height="360"
        format="webp" />
      </div>
    </NuxtLink>

    <!-- Content -->
    <ProductBadge :category="product.category" class="mb-3" />

    <h3 class="font-heading text-2xl font-bold mb-2 uppercase group-hover:text-primary transition-colors">
      <NuxtLink :to="`/products/${product.slug}`">
        {{ product.name }}
      </NuxtLink>
    </h3>

    <p class="text-body-md text-on-surface-variant mb-6">
      {{ product.shortDescription }}
    </p>

    <!-- Footer: Price + CTA -->
    <div class="flex justify-between items-center">
      <span class="font-heading text-2xl text-primary">
        {{ formatPrice(product.price) }}
      </span>
      <BaseButton variant="primary" size="sm" :href="`/booking?service=${product.id}`" class="!rounded-full !w-12 !h-12 !p-0">
        <span class="material-symbols-outlined">arrow_forward</span>
      </BaseButton>
    </div>

    <!-- Popular tag -->
    <div
      v-if="product.tags?.includes('popular')"
      class="absolute top-4 right-4 badge-accent"
    >
      Most Popular
    </div>
  </article>
</template>
