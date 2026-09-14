<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SparkPoint } from './types'

/**
 * Change over time, small — one series, so no legend: the caption names it.
 *
 * Specs held from the visualisation rules: a 2px line, a soft area under it for
 * shape (not a second encoding), one 8px marker on the hovered point, a
 * crosshair, and a tooltip with the actual figure. No number printed on every
 * point — the tooltip is where precision lives, the shape is what the eye reads.
 */
const props = withDefaults(
  defineProps<{ points: SparkPoint[]; unit?: string; height?: number }>(),
  { unit: '', height: 64 },
)

const W = 320
const PAD = 4

const hovered = ref<number | null>(null)

const maxValue = computed(() => Math.max(1, ...props.points.map((p) => p.value)))

const coords = computed(() =>
  props.points.map((point, index) => {
    const span = Math.max(1, props.points.length - 1)
    const x = PAD + (index / span) * (W - PAD * 2)
    const y = props.height - PAD - (point.value / maxValue.value) * (props.height - PAD * 2)
    return { x, y, point }
  }),
)

const linePath = computed(() => coords.value.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' '))

const areaPath = computed(() => {
  if (!coords.value.length) return ''
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  return `${linePath.value} L${last.x.toFixed(1)} ${props.height - PAD} L${first.x.toFixed(1)} ${props.height - PAD} Z`
})

const active = computed(() => (hovered.value === null ? null : coords.value[hovered.value]))

/** Clamped so the label never hangs off the card at the first or last point. */
const tooltipStyle = computed(() => {
  if (!active.value) return {}
  const ratio = (active.value.x / W) * 100
  const clamped = Math.min(88, Math.max(12, ratio))
  return { left: `${clamped}%`, transform: 'translateX(-50%)' }
})

function onMove(event: MouseEvent) {
  const box = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - box.left) / box.width
  const index = Math.round(ratio * (props.points.length - 1))
  hovered.value = Math.max(0, Math.min(props.points.length - 1, index))
}
</script>

<template>
  <div class="relative min-w-0">
    <svg
      :viewBox="`0 0 ${W} ${props.height}`"
      :style="{ height: `${props.height}px` }"
      class="w-full"
      preserveAspectRatio="none"
      role="img"
      :aria-label="`Xu hướng ${props.points.length} kỳ, cao nhất ${maxValue}${props.unit}`"
      @mousemove="onMove"
      @mouseleave="hovered = null"
    >
      <path :d="areaPath" fill="var(--color-data)" opacity="0.10" />
      <path
        :d="linePath"
        fill="none"
        stroke="var(--color-data)"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />

      <template v-if="active">
        <line
          :x1="active.x"
          :x2="active.x"
          :y1="PAD"
          :y2="props.height - PAD"
          stroke="var(--color-ink-muted)"
          stroke-width="1"
          stroke-dasharray="3 3"
          vector-effect="non-scaling-stroke"
        />
        <circle
          :cx="active.x"
          :cy="active.y"
          r="4"
          fill="var(--color-surface)"
          stroke="var(--color-data)"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </template>
    </svg>

    <!-- Tooltip: the precise figure, positioned off the hovered point. -->
    <div
      v-if="active"
      class="pointer-events-none absolute -top-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] whitespace-nowrap text-navy"
      :style="tooltipStyle"
    >
      <span class="text-ink-muted">{{ active.point.label }} · </span>
      <span class="figure font-semibold">{{ active.point.value }}{{ props.unit }}</span>
    </div>
  </div>
</template>
