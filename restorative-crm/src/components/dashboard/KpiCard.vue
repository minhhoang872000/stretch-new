<template>
  <div
    class="bg-surface-container-lowest p-6 rounded-xl shadow-none hover:shadow-md transition-shadow group"
  >
    <div class="flex justify-between items-start mb-4">
      <div
        class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
        :class="[kpi.iconBg, kpi.iconColor, kpi.iconHoverBg, kpi.iconHoverText]"
      >
        <span class="material-symbols-outlined">{{ kpi.icon }}</span>
      </div>
      <!-- Pulse dot for error state -->
      <div v-if="kpi.pulse" class="w-3 h-3 bg-error rounded-full animate-pulse"></div>
      <!-- Badge -->
      <span
        v-else-if="kpi.badge"
        class="text-xs font-bold px-2 py-1 rounded-full"
        :class="`text-${kpi.badgeColor} bg-${kpi.badgeColor}/10`"
      >
        {{ kpi.badge }}
      </span>
    </div>
    <p class="text-outline text-sm font-medium mb-1">{{ kpi.label }}</p>
    <h3 class="text-3xl font-extrabold text-on-surface">{{ kpi.value }}</h3>
  </div>
</template>

<script setup>
defineProps({
  kpi: { type: Object, required: true }
})
</script>
