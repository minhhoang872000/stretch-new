<script setup lang="ts">
defineProps<{ category: string }>()

const categoryColors: Record<string, string> = {
  Facial: 'bg-primary-fixed text-primary',
  Massage: 'bg-tertiary-fixed text-tertiary',
  Wellness: 'bg-secondary-fixed text-secondary',
  Technology: 'bg-primary-fixed-dim text-primary',
}

const categoryIcons: Record<string, string> = {
  Facial: 'face_retouching_natural',
  Massage: 'spa',
  Wellness: 'self_improvement',
  Technology: 'biotech',
}
</script>

<template>
  <span
    class="badge text-[11px]"
    :class="categoryColors[category] || 'bg-surface-container-highest text-on-surface-variant'"
  >
    <span class="material-symbols-outlined text-sm mr-1">
      {{ categoryIcons[category] || 'category' }}
    </span>
    {{ category }}
  </span>
</template>
