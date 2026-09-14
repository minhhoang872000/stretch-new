<template>
  <figure class="w-full">
    <figcaption v-if="caption" class="sr-only">{{ caption }}</figcaption>
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full block"
      :style="{ height: `${height}px` }"
      preserveAspectRatio="none"
      role="img"
      :aria-label="ariaLabel"
    >
      <!-- Baseline so a flat series still reads as a chart, not an empty box -->
      <line :x1="0" :y1="H - 0.5" :x2="W" :y2="H - 0.5" stroke="#e3e8e6" stroke-width="1" />

      <polygon :points="areaPoints" :fill="fill" />
      <polyline
        :points="linePoints"
        fill="none"
        :stroke="stroke"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />

      <!-- Hover targets: a tooltip per point via the native title element -->
      <g v-if="tooltips">
        <rect
          v-for="(p, i) in points"
          :key="i"
          :x="p.x - stepWidth / 2"
          y="0"
          :width="stepWidth"
          :height="H"
          fill="transparent"
          class="hover:fill-accent/5"
        >
          <title>{{ labels[i] ? `${labels[i]}: ` : '' }}{{ formatValue(values[i]) }}</title>
        </rect>
      </g>

      <circle
        v-if="points.length"
        :cx="points[points.length - 1].x"
        :cy="points[points.length - 1].y"
        r="2.4"
        :fill="stroke"
      />
    </svg>
  </figure>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Inline trend line. Deliberately tiny: no chart library, one series, and a
 * per-point `<title>` so hovering gives the real number instead of a shape.
 */
const props = defineProps({
  values: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 40 },
  stroke: { type: String, default: '#036457' },
  fill: { type: String, default: 'rgba(3, 100, 87, 0.08)' },
  caption: { type: String, default: '' },
  tooltips: { type: Boolean, default: true },
  format: { type: Function, default: null },
  /** Fix the vertical scale (e.g. 0–100 for percentages). */
  min: { type: Number, default: null },
  max: { type: Number, default: null },
})

const W = 100
const H = 30

/**
 * Auto-scaling flatters a series: a retention curve from 100% to 56% fills the
 * whole box and reads like a cliff. Pass an explicit min/max when the absolute
 * level matters (percentages, scores) and the shape stays honest.
 */
const scaled = computed(() => {
  const vals = props.values.length ? props.values : [0, 0]
  const max = props.max != null ? props.max : Math.max(...vals, 1)
  const min = props.min != null ? props.min : Math.min(...vals, 0)
  const span = max - min || 1
  return vals.map((v) => Math.max(0, Math.min(1, (v - min) / span)))
})

const stepWidth = computed(() => (scaled.value.length > 1 ? W / (scaled.value.length - 1) : W))

const points = computed(() =>
  scaled.value.map((v, i) => ({
    x: scaled.value.length > 1 ? (i * W) / (scaled.value.length - 1) : W / 2,
    y: H - 1.5 - v * (H - 4),
  })),
)

const linePoints = computed(() => points.value.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '))
const areaPoints = computed(() => `0,${H} ${linePoints.value} ${W},${H}`)

const formatValue = (v) => (props.format ? props.format(v) : String(v))

const ariaLabel = computed(() => {
  if (!props.values.length) return 'Không có dữ liệu'
  const first = formatValue(props.values[0])
  const last = formatValue(props.values[props.values.length - 1])
  return `${props.caption || 'Biểu đồ xu hướng'}: từ ${first} đến ${last}`
})
</script>
