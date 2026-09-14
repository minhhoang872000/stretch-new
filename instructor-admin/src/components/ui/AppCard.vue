<script setup lang="ts">
/**
 * A flat panel: one hairline border, no shadow stack, no gradient.
 *
 * `overflow-hidden` matters more than it looks: without it, a table or a divided
 * list inside the card paints its own row background over the rounded corners, so
 * hovering the first row squares off the card.
 *
 * Horizontal rhythm is fixed at 16px (`px-4`) for the header AND for whatever the
 * body puts inside it — a table with `px-3` cells under a `px-4` header reads as a
 * misalignment, because it is one.
 */
// `withDefaults` matters here: a bare optional Boolean prop compiles to
// `{ type: Boolean }`, which Vue initialises to `false` when absent — so a
// plain `padded === false` check would strip the padding off every card.
const props = withDefaults(defineProps<{ title?: string; hint?: string; padded?: boolean }>(), {
  padded: true,
})
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
    <header
      v-if="props.title || $slots.actions"
      class="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-3"
    >
      <div class="min-w-0">
        <h2 v-if="props.title" class="font-heading text-[15px] leading-tight font-bold text-navy">{{ props.title }}</h2>
        <p v-if="props.hint" class="mt-1 text-xs leading-relaxed text-ink-muted">{{ props.hint }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <div :class="props.padded ? 'p-4' : ''">
      <slot />
    </div>
  </section>
</template>
