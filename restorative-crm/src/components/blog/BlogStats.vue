<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <div
      v-for="stat in stats"
      :key="stat.id"
      :class="['col-span-1 p-6 rounded-xl relative overflow-hidden group', stat.bgClass]"
    >
      <div class="relative z-10">
        <p :class="['text-sm font-medium', stat.labelClass]">{{ stat.label }}</p>
        <h3 :class="['text-3xl font-bold mt-1', stat.textClass]">{{ stat.value }}</h3>
      </div>
      <span
        :class="['material-symbols-outlined absolute -right-4 -bottom-4 text-7xl group-hover:scale-110 transition-transform', stat.iconClass]"
      >
        {{ stat.icon }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useBlogStore } from '@/stores/blog.js'
import { storeToRefs } from 'pinia'

const store = useBlogStore()
const { stats } = storeToRefs(store)
</script>
