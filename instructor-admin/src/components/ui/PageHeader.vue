<script setup lang="ts">
/** The heading block every screen opens with: what this page is, then its actions. */
const props = defineProps<{ title: string; hint?: string }>()
</script>

<template>
  <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <h1 class="text-xl font-bold tracking-tight text-navy sm:text-2xl">{{ props.title }}</h1>
      <p v-if="props.hint" class="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
        {{ props.hint }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
