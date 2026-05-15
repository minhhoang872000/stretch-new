<template>
  <RouterLink to="/services/edit" class="group card overflow-hidden hover:shadow-lg transition-all duration-500 flex flex-col cursor-pointer block">
    <div class="relative h-40 lg:h-44 overflow-hidden">
      <img
        :alt="service.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        :src="service.image"
      />
      <div class="absolute top-3 right-3 flex gap-2">
        <span class="bg-primary/90 text-on-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm uppercase tracking-wider">
          {{ service.tag }}
        </span>
      </div>
    </div>
    <div class="p-4 lg:p-5 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-2 gap-2">
        <h3 class="text-base font-headline font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{{ service.title }}</h3>
        <button class="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-surface-container text-primary transition-colors">
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
      </div>
      <p class="text-on-surface-variant text-sm line-clamp-2 mb-4">{{ service.description }}</p>
      <div class="flex flex-wrap gap-1.5 mt-auto">
        <span
          v-for="(sub, index) in service.subTags"
          :key="index"
          :class="['font-semibold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-tight', sub.style]"
        >
          {{ sub.text }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true
  }
})
</script>
