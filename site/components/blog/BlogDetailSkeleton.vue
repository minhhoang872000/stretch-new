<script setup lang="ts">
// Loading placeholder for the blog detail page. Mirrors the real layout (hero +
// 2-column body/sidebar) so the swap to real content doesn't shift the page.
</script>

<template>
  <div class="animate-pulse">
    <!-- Hero -->
    <div class="bg-white border-b border-border py-8 lg:py-12">
      <div class="section-container">
        <div class="h-3 w-28 bg-gray-200 rounded mb-6"></div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <!-- Left: title + excerpt + meta -->
          <div class="lg:col-span-7">
            <div class="h-3 w-24 bg-gray-200 rounded mb-4"></div>
            <div class="h-8 w-full bg-gray-200 rounded mb-3"></div>
            <div class="h-8 w-3/4 bg-gray-200 rounded mb-5"></div>
            <div class="h-3 w-full bg-gray-100 rounded mb-2"></div>
            <div class="h-3 w-5/6 bg-gray-100 rounded mb-6"></div>
            <div class="flex gap-6">
              <div class="h-3 w-20 bg-gray-100 rounded"></div>
              <div class="h-3 w-24 bg-gray-100 rounded"></div>
              <div class="h-3 w-16 bg-gray-100 rounded"></div>
            </div>
          </div>
          <!-- Right: hero image -->
          <div class="lg:col-span-5">
            <div class="rounded-2xl bg-gray-200 aspect-[4/3] w-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="py-10 lg:py-12">
      <div class="section-container">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Article body -->
          <div class="lg:col-span-8 bg-white border border-border rounded-2xl p-6 lg:p-10">
            <div class="space-y-3">
              <div
                v-for="n in 3"
                :key="'a' + n"
                class="h-3 bg-gray-100 rounded"
                :class="n === 3 ? 'w-2/3' : 'w-full'"
              ></div>
            </div>
            <div class="h-5 w-1/3 bg-gray-200 rounded my-6"></div>
            <div class="space-y-3">
              <div
                v-for="n in 4"
                :key="'b' + n"
                class="h-3 bg-gray-100 rounded"
                :class="n === 4 ? 'w-1/2' : 'w-full'"
              ></div>
            </div>
            <div class="rounded-xl bg-gray-100 h-48 w-full my-6"></div>
            <div class="space-y-3">
              <div v-for="n in 3" :key="'c' + n" class="h-3 bg-gray-100 rounded w-full"></div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-4 space-y-6">
            <div
              v-for="n in 3"
              :key="'s' + n"
              class="bg-white border border-border rounded-2xl p-5"
            >
              <div class="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-2">
                <div class="h-3 w-full bg-gray-100 rounded"></div>
                <div class="h-3 w-5/6 bg-gray-100 rounded"></div>
                <div class="h-3 w-2/3 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
