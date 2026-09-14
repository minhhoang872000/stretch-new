<template>
  <ul class="space-y-2">
    <li v-for="(item, i) in items" :key="item.label" class="group">
      <component
        :is="item.to ? 'RouterLink' : 'div'"
        :to="item.to || undefined"
        class="block"
      >
        <div class="flex items-baseline justify-between gap-3 mb-1">
          <span class="text-xs text-ink-2 truncate group-hover:text-ink transition-colors">
            <span class="num text-ink-4 mr-1.5">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ item.label }}
          </span>
          <span class="num text-xs font-bold text-ink shrink-0">{{ item.display ?? item.value }}</span>
        </div>
        <!-- The number is always printed next to the bar, so length is a
             convenience rather than the only way to read the value. -->
        <div class="h-1.5 rounded-full bg-panel-3 overflow-hidden">
          <div
            class="h-full rounded-full transition-[width] duration-300"
            :class="item.tone ? TONES[item.tone] : 'bg-accent'"
            :style="{ width: `${width(item.value)}%` }"
          />
        </div>
        <p v-if="item.hint" class="meta mt-1 truncate">{{ item.hint }}</p>
      </component>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** `[{ label, value, display?, hint?, tone?, to? }]` */
  items: { type: Array, default: () => [] },
})

const TONES = {
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-4',
}

const max = computed(() => Math.max(...props.items.map((i) => Number(i.value) || 0), 1))
const width = (value) => Math.max(2, Math.round(((Number(value) || 0) / max.value) * 100))
</script>
