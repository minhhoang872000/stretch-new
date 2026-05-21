<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: product, pending, error } = await useFetch(`/api/products/${slug}`)

// Dynamic SEO
watchEffect(() => {
  if (product.value) {
    const p = product.value as any
    useSeo({
      title: `${p.name} – Stretch.vn`,
      description: p.shortDescription,
      image: p.coverImage,
      type: 'product',
    })
  }
})

// Schema.org Product
useSchemaOrg([
  defineProduct({
    name: () => (product.value as any)?.name,
    description: () => (product.value as any)?.shortDescription,
    image: () => (product.value as any)?.images,
    offers: {
      price: () => (product.value as any)?.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
    },
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Trang chủ', item: '/' },
      { name: 'Dịch vụ', item: '/products' },
      { name: () => (product.value as any)?.name || '' },
    ],
  }),
])
</script>

<template>
  <div>
    <TheHeader />
    <main class="pt-24 pb-24">
      <div class="section-container">
        <!-- Breadcrumb -->
        <nav class="py-6 text-body-sm text-on-surface-variant">
          <NuxtLink to="/" class="hover:text-primary transition-colors">Trang chủ</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/products" class="hover:text-primary transition-colors">Dịch vụ</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-on-surface font-medium">{{ (product as any)?.name || '...' }}</span>
        </nav>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <BaseSkeleton type="rect" width="100%" height="400px" />
          <div class="space-y-4">
            <BaseSkeleton type="rect" width="100px" height="28px" />
            <BaseSkeleton type="rect" width="80%" height="40px" />
            <BaseSkeleton type="rect" width="150px" height="36px" />
            <BaseSkeleton type="text" :lines="5" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-24">
          <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">search_off</span>
          <h2 class="font-heading text-heading-lg mb-2">Không tìm thấy dịch vụ</h2>
          <p class="text-on-surface-variant mb-6">Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
          <BaseButton variant="primary" href="/products">Xem tất cả dịch vụ</BaseButton>
        </div>

        <!-- Product Detail -->
        <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery :images="(product as any).images" />
          <ProductDetailCard :product="(product as any)" />
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
