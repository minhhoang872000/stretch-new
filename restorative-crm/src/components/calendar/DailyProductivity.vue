<template>
  <div class="bg-primary text-on-primary p-5 lg:p-6 rounded-2xl shadow-lg relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

    <span class="label-xs !text-on-primary/60 block mb-4">Daily Productivity</span>
    
    <div class="flex items-end gap-1.5 mb-1">
      <h2 class="text-3xl lg:text-4xl font-headline font-extrabold tracking-tighter">{{ stats.filled }}</h2>
      <span class="text-xl font-headline opacity-50 mb-0.5">/ {{ stats.total }}</span>
    </div>
    
    <p class="text-xs opacity-70">{{ stats.label }}</p>
  </div>
</template>

<script setup>
import { dailyProductivity } from '@/data/mockData.js'
const stats = dailyProductivity
</script>
