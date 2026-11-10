<script setup lang="ts">
/**
 * Error page. Also prerendered as /404.html (nuxt.config prerender.routes),
 * which Cloudflare Pages serves with a 404 status for any path that is neither
 * a file nor routed to the Worker — before it existed, every unknown URL got
 * the homepage with a 200 (a soft 404).
 *
 * Bilingual on purpose: /404.html is one file for every locale.
 */
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)

useHead({
  htmlAttrs: { lang: 'vi-VN' },
  title: is404.value ? 'Không tìm thấy trang · Page not found — Stretch.vn' : 'Đã có lỗi · Something went wrong — Stretch.vn',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-white px-4 py-16">
    <div class="max-w-lg text-center">
      <p class="text-sm font-semibold tracking-widest text-gray-400">{{ error?.statusCode || 500 }}</p>
      <h1 class="mt-3 text-3xl font-bold text-gray-900">
        {{ is404 ? 'Không tìm thấy trang' : 'Đã có lỗi xảy ra' }}
      </h1>
      <p class="mt-2 text-gray-500">
        {{ is404 ? 'Page not found' : 'Something went wrong' }}
      </p>
      <p class="mt-6 text-gray-600">
        {{ is404
          ? 'Trang bạn tìm có thể đã được đổi địa chỉ hoặc không còn tồn tại.'
          : 'Vui lòng thử lại sau ít phút.' }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/vi" class="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white">Về trang chủ</a>
        <a href="/vi/sharing-hub" class="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900">Góc Chia Sẻ</a>
        <a href="/" class="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900">English</a>
      </div>
    </div>
  </main>
</template>
