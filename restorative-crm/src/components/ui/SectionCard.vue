<template>
  <section class="panel">
    <header
      v-if="title || $slots.actions"
      class="px-3.5 py-2.5 border-b border-line flex items-center gap-3"
    >
      <div class="min-w-0">
        <h2 class="h-section truncate">{{ title }}</h2>
        <p v-if="hint" class="meta mt-0.5">{{ hint }}</p>
      </div>
      <div v-if="$slots.actions" class="ml-auto flex items-center gap-1.5 shrink-0">
        <slot name="actions" />
      </div>
    </header>

    <div :class="flush ? '' : 'p-3.5'">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="px-3.5 py-2.5 border-t border-line bg-panel-2">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  hint: { type: String, default: '' },
  /** Drop the inner padding when the body is a table or a list of rows. */
  flush: { type: Boolean, default: false },
})
</script>
