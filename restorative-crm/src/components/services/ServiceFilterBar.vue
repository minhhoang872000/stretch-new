<template>
  <div class="bg-surface-container-low p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2">
    <div class="flex gap-1 overflow-x-auto p-1 no-scrollbar w-full sm:w-auto">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'px-6 py-2 rounded-xl text-sm whitespace-nowrap transition-colors font-semibold',
          category.active 
            ? 'bg-surface-container-lowest shadow-sm text-primary' 
            : 'hover:bg-surface-container-highest text-on-surface-variant'
        ]"
      >
        {{ category.label }}
      </button>
    </div>
    <div class="mt-2 sm:mt-0 sm:ml-auto flex items-center gap-2 pr-2 w-full sm:w-auto justify-end">
      <button class="w-10 h-10 flex items-center justify-center bg-surface-container-highest hover:bg-surface-container transition-colors rounded-xl text-on-surface-variant">
        <span class="material-symbols-outlined" data-icon="filter_list">filter_list</span>
      </button>
      <button class="w-10 h-10 flex items-center justify-center bg-surface-container-highest hover:bg-surface-container transition-colors rounded-xl text-on-surface-variant">
        <span class="material-symbols-outlined" data-icon="sort">sort</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useServicesStore } from '@/stores/services.js'
import { storeToRefs } from 'pinia'

const store = useServicesStore()
const { categories } = storeToRefs(store)
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
