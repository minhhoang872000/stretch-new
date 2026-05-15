<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
    <!-- Bento Grid Header -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <SeoHealthCard class="lg:col-span-8" />
      <SeoGlobalPatterns class="lg:col-span-4" />
    </div>

    <!-- SEO Pages List -->
    <SeoPagesList />

    <!-- Bottom Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SeoOgImage />
      <SeoSitemapConfig />
    </div>
  </main>
</template>

<script setup>
import SeoHealthCard from '@/components/seo/SeoHealthCard.vue'
import SeoGlobalPatterns from '@/components/seo/SeoGlobalPatterns.vue'
import SeoPagesList from '@/components/seo/SeoPagesList.vue'
import SeoOgImage from '@/components/seo/SeoOgImage.vue'
import SeoSitemapConfig from '@/components/seo/SeoSitemapConfig.vue'
</script>
