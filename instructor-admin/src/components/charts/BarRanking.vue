<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import type { BarRow } from './types'

/**
 * Horizontal bar ranking — the right form when the insight IS the order.
 *
 * Why horizontal: the category labels are Vietnamese lesson names, which are long.
 * Vertical bars would force rotated labels; horizontal gives each label a full
 * line. Kept to ≤ 15 rows — past that a ranking becomes a table with a search box.
 *
 * Marks: one hue (single series, so no legend — the title names it), 4px rounded
 * ends anchored to the baseline, a 2px surface gap between bars, and every value
 * printed at the end of its bar so nobody has to estimate a length. The optional
 * table view is the non-visual path to the same numbers.
 */
const props = withDefaults(
  defineProps<{
    rows: BarRow[]
    /** Axis maximum; defaults to the largest value. */
    max?: number
    unit?: string
    /** Emphasise rows at or above this value (uses status colour + a word). */
    alertAbove?: number
    alertLabel?: string
  }>(),
  { unit: '%' },
)

const showTable = ref(false)
const hovered = ref<number | null>(null)

const scaleMax = computed(() => props.max ?? Math.max(1, ...props.rows.map((r) => r.value)))
const width = (value: number) => `${Math.max(1.5, (value / scaleMax.value) * 100)}%`
const isAlert = (value: number) => props.alertAbove !== undefined && value >= props.alertAbove
</script>

<template>
  <div class="min-w-0">
    <div class="mb-2 flex items-center justify-end">
      <button
        type="button"
        class="t-fast inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-ink-muted hover:bg-track hover:text-navy"
        :aria-pressed="showTable"
        @click="showTable = !showTable"
      >
        <AppIcon :name="showTable ? 'chart' : 'table'" :size="13" />
        {{ showTable ? 'Xem dạng biểu đồ' : 'Xem dạng bảng' }}
      </button>
    </div>

    <!-- ── Table view: the same numbers, no geometry ── -->
    <div v-if="showTable" class="overflow-x-auto">
      <table class="w-full text-left text-[12.5px]">
        <thead>
          <tr class="border-b border-line text-[11px] tracking-wide text-ink-muted uppercase">
            <th scope="col" class="py-1.5 pr-3">Hạng mục</th>
            <th scope="col" class="py-1.5 text-right">Giá trị</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in props.rows" :key="row.label" class="border-b border-line/60 last:border-0">
            <td class="py-1.5 pr-3">
              {{ row.label }}
              <span v-if="row.sub" class="block text-[11px] text-ink-muted">{{ row.sub }}</span>
            </td>
            <td class="figure py-1.5 text-right">{{ row.valueText ?? `${row.value}${props.unit}` }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Chart view ── -->
    <ul v-else class="flex flex-col gap-3.5">
      <li
        v-for="(row, index) in props.rows"
        :key="row.label"
        class="group relative"
        @mouseenter="hovered = index"
        @mouseleave="hovered = null"
      >
        <!--
          Three lines, fixed: name + figure, the bar, then the detail line. The
          earlier version put "62% · dừng ở 7:41/12:20" where the figure goes and
          let the name wrap freely, so one row could run five lines and the ranking
          stopped reading as a ranking. The long text belongs on the muted line.
        -->
        <div class="flex items-center justify-between gap-3">
          <p class="min-w-0 flex-1 truncate text-[12.5px] leading-snug text-ink" :title="row.label">
            {{ row.label }}
          </p>
          <p
            class="figure flex shrink-0 items-center gap-1 text-[13px] leading-none font-semibold"
            :class="isAlert(row.value) ? 'text-bad' : 'text-navy'"
          >
            <AppIcon
              v-if="isAlert(row.value)"
              name="warning"
              :size="12"
              :stroke-width="2.2"
              :label="props.alertLabel"
            />
            {{ row.value }}{{ props.unit }}
          </p>
        </div>

        <!-- Hit target is the whole row, taller than the 6px mark itself. -->
        <div class="mt-1.5 flex h-3 items-center">
          <div class="h-1.5 w-full overflow-hidden rounded bg-track">
            <div
              class="t-fast h-full rounded"
              :class="isAlert(row.value) ? 'bg-bad' : 'bg-data'"
              :style="{ width: width(row.value), opacity: hovered === null || hovered === index ? 1 : 0.55 }"
            />
          </div>
        </div>

        <p
          v-if="row.sub || row.valueText"
          class="mt-1 truncate text-[11px] text-ink-muted"
          :title="[row.valueText, row.sub].filter(Boolean).join(' · ')"
        >
          <span v-if="row.valueText" class="figure">{{ row.valueText }}</span>
          <span v-if="row.valueText && row.sub"> · </span>
          <span v-if="row.sub">{{ row.sub }}</span>
        </p>
      </li>
    </ul>
  </div>
</template>
