<script setup lang="ts">
defineProps<{
  product: {
    name: string
    description: string
    price: number
    category: string
    tags: string[]
    available: boolean
    id: string
  }
}>()
</script>

<template>
  <div class="mt-10">
    <!-- Category + Tags -->
    <div class="flex items-center gap-3 mb-4">
      <ProductBadge :category="product.category" />
      <span
        v-for="tag in product.tags"
        :key="tag"
        class="badge bg-surface-container text-on-surface-variant"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Title -->
    <h1 class="font-heading text-display-md mb-6">{{ product.name }}</h1>

    <!-- Price -->
    <div class="flex items-baseline gap-3 mb-8">
      <span class="font-heading text-3xl font-black text-primary">
        {{ formatPrice(product.price) }}
      </span>
      <span class="text-body-sm text-on-surface-variant">/ buổi</span>
    </div>

    <!-- Availability -->
    <div class="flex items-center gap-2 mb-8">
      <span
        class="w-2.5 h-2.5 rounded-full"
        :class="product.available ? 'bg-success animate-pulse-soft' : 'bg-error'"
      />
      <span class="text-body-sm font-medium" :class="product.available ? 'text-success' : 'text-error'">
        {{ product.available ? 'Đang nhận đặt lịch' : 'Tạm ngừng' }}
      </span>
    </div>

    <!-- Description -->
    <div class="prose prose-lg max-w-none mb-10 text-on-surface-variant" v-html="product.description" />

    <!-- CTA -->
    <div class="flex flex-wrap gap-4">
      <BaseButton variant="accent" size="lg" :href="`/booking?service=${product.id}`">
        <span class="material-symbols-outlined text-lg">calendar_month</span>
        Đặt lịch ngay
      </BaseButton>
      <BaseButton variant="outline" size="lg" href="/products">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Xem dịch vụ khác
      </BaseButton>
    </div>
  </div>
</template>
