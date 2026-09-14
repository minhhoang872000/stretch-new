<template>
  <header class="mb-5 lg:mb-6">
    <!-- Back link: every detail screen needs a way out that is not the browser button. -->
    <RouterLink
      v-if="backTo"
      :to="backTo"
      class="inline-flex items-center gap-1 text-xs font-bold text-ink-3 hover:text-accent transition-colors mb-2"
    >
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ backLabel }}
    </RouterLink>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p v-if="eyebrow" class="label-xs mb-1">{{ eyebrow }}</p>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="h-page">{{ title }}</h1>
          <slot name="title-badge" />
        </div>
        <p v-if="subtitle" class="mt-1.5 text-[0.8125rem] text-ink-2 max-w-[68ch]">{{ subtitle }}</p>
      </div>

      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <slot name="below" />
  </header>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backTo: { type: [String, Object], default: null },
  backLabel: { type: String, default: 'Quay lại' },
})
</script>
