<template>
  <main class="page space-y-6">
    <PageHeader
      eyebrow="Nội dung"
      title="SEO"
      subtitle="Sức khoẻ SEO của site: thẻ meta theo trang, mẫu tiêu đề dùng chung, ảnh OG và sitemap."
    >
      <template #actions>
        <RouterLink to="/search-console" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">manage_search</span>
          Search Console
        </RouterLink>
      </template>
    </PageHeader>

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
import PageHeader from '@/components/ui/PageHeader.vue'
import SeoHealthCard from '@/components/seo/SeoHealthCard.vue'
import SeoGlobalPatterns from '@/components/seo/SeoGlobalPatterns.vue'
import SeoPagesList from '@/components/seo/SeoPagesList.vue'
import SeoOgImage from '@/components/seo/SeoOgImage.vue'
import SeoSitemapConfig from '@/components/seo/SeoSitemapConfig.vue'
</script>
