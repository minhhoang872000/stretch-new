<script setup lang="ts">
import type { CatalogProgram } from '~/composables/useLearningCatalog'
/**
 * A titled row of programme cards — "Xem gần đây", "Học gì tiếp theo?".
 * Renders nothing when the list is empty, so callers can mount it freely.
 */
defineProps<{
  title: string
  sub?: string
  items: CatalogProgram[]
  action?: string
}>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <section v-if="items.length" class="strip">
    <div class="strip__head">
      <div class="min-w-0">
        <h2 class="strip__title">{{ title }}</h2>
        <p v-if="sub" class="strip__sub">{{ sub }}</p>
      </div>
      <button v-if="action" type="button" class="strip__action" @click="emit('action')">{{ action }}</button>
    </div>
    <div class="strip__grid">
      <LearningCatalogCard v-for="program in items" :key="program.slug" :program="program" />
    </div>
  </section>
</template>

<style scoped>
.strip__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}
.strip__title {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-navy);
}
.strip__sub {
  margin-top: 0.25rem;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}
.strip__action {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.strip__action:hover {
  color: var(--color-accent);
}
.strip__grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.85rem;
}
@media (min-width: 640px) {
  .strip__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .strip__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
