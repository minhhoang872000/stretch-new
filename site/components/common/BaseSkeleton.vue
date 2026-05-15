<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'rect' | 'circle' | 'text'
  width?: string
  height?: string
  lines?: number
}>(), {
  type: 'rect',
  width: '100%',
  height: '1rem',
  lines: 1,
})
</script>

<template>
  <!-- Circle -->
  <div
    v-if="type === 'circle'"
    class="rounded-full bg-surface-container-highest animate-pulse"
    :style="{ width, height }"
  />

  <!-- Text lines -->
  <div v-else-if="type === 'text'" class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="h-4 bg-surface-container-highest rounded animate-pulse"
      :style="{ width: i === lines ? '70%' : '100%' }"
    />
  </div>

  <!-- Rectangle -->
  <div
    v-else
    class="bg-surface-container-highest rounded-2xl animate-pulse"
    :style="{ width, height }"
  />
</template>
