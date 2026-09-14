<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to || undefined"
    class="panel px-3.5 py-3 flex flex-col gap-1.5 transition-[border-color,transform] duration-150"
    :class="to ? 'hover:border-accent-line hover:-translate-y-px' : ''"
  >
    <div class="flex items-center justify-between gap-2">
      <p class="label-xs truncate">{{ label }}</p>
      <span
        v-if="icon"
        class="material-symbols-outlined text-lg shrink-0"
        :class="toneText"
        aria-hidden="true"
      >{{ icon }}</span>
    </div>

    <div class="flex items-end gap-2">
      <p v-if="!loading" class="num text-[1.375rem] leading-none font-bold text-ink tracking-tight">
        {{ value }}<span v-if="unit" class="text-sm font-semibold text-ink-3 ml-1">{{ unit }}</span>
      </p>
      <div v-else class="skeleton h-6 w-20" />

      <span
        v-if="delta != null"
        class="text-2xs font-bold leading-none pb-0.5 flex items-center gap-0.5"
        :class="delta >= 0 ? 'text-ok' : 'text-danger'"
      >
        <span class="material-symbols-outlined text-sm">{{ delta >= 0 ? 'trending_up' : 'trending_down' }}</span>
        {{ delta >= 0 ? '+' : '' }}{{ delta }}%
      </span>
    </div>

    <p v-if="hint" class="text-xs text-ink-3 truncate">{{ hint }}</p>
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  /** Trailing unit shown smaller next to the value ("thao tác", "buổi", …). */
  unit: { type: String, default: '' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  /** Percentage change vs the previous period; drives the arrow colour. */
  delta: { type: Number, default: null },
  tone: { type: String, default: 'neutral' }, // neutral | accent | ok | warn | danger | info
  to: { type: [String, Object], default: null },
  loading: { type: Boolean, default: false },
})

const TONES = {
  neutral: 'text-ink-3',
  accent: 'text-accent',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
}

const toneText = computed(() => TONES[props.tone] || TONES.neutral)
</script>
