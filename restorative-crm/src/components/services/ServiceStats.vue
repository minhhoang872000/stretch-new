<template>
  <section class="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
    <div
      v-for="stat in stats"
      :key="stat.id"
      class="bg-surface-container p-6 rounded-2xl"
    >
      <p class="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">
        {{ stat.label }}
      </p>
      <div class="flex items-center gap-2">
        <span
          v-if="stat.icon"
          class="material-symbols-outlined"
          :class="stat.iconColor"
          data-icon="stat.icon"
        >
          {{ stat.icon }}
        </span>
        <p class="text-3xl font-headline font-extrabold" :class="stat.valueColor">
          {{ stat.value }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useServicesStore } from '@/stores/services.js'
import { storeToRefs } from 'pinia'

const store = useServicesStore()
const { stats } = storeToRefs(store)
</script>
