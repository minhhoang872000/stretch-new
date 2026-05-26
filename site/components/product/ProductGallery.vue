<script setup lang="ts">
const props = defineProps<{
  images: string[]
}>()

const selectedIndex = ref(0)

const currentImage = computed(() => props.images[selectedIndex.value])
</script>

<template>
  <div class="space-y-4">
    <!-- Main Image -->
    <div class="aspect-[16/10] rounded-3xl overflow-hidden bg-surface-container">
      <NuxtImg
        :src="currentImage"
        alt="Product image"
        class="w-full h-full object-cover transition-opacity duration-300"
        loading="eager"
      format="webp" />
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 transition-all duration-200"
        :class="selectedIndex === i
          ? 'ring-primary shadow-glow'
          : 'ring-transparent opacity-60 hover:opacity-100'"
        @click="selectedIndex = i"
      >
        <NuxtImg
          :src="img"
          alt="Thumbnail"
          class="w-full h-full object-cover"
          loading="lazy"
        format="webp" />
      </button>
    </div>
  </div>
</template>
