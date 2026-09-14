<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import EmptyState from './EmptyState.vue'
import type { Column } from './tableTypes'

/**
 * The console's one table.
 *
 * Rules it enforces so no screen has to re-decide them:
 * - the table scrolls inside its own container, so a wide column set never makes
 *   the page scroll sideways
 * - a sortable header is a real button with an arrow, not a clickable div
 * - an empty result is a message with an action, never a blank rectangle
 * - the row count is stated, because "is this all of it?" is the first question
 */
const props = withDefaults(
  defineProps<{
    columns: Column[]
    rows: Record<string, unknown>[]
    rowKey?: string
    loading?: boolean
    emptyTitle?: string
    emptyHint?: string
    /** Rows per page; 0 turns paging off. */
    pageSize?: number
  }>(),
  { rowKey: 'id', emptyTitle: 'Chưa có dữ liệu', pageSize: 0 },
)

const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

function toggleSort(column: Column) {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDir.value = 'asc'
  }
  page.value = 1
}

const sorted = computed(() => {
  if (!sortKey.value) return props.rows
  const key = sortKey.value
  const factor = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const left = a[key]
    const right = b[key]
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor
    return String(left ?? '').localeCompare(String(right ?? ''), 'vi') * factor
  })
})

const totalPages = computed(() =>
  props.pageSize ? Math.max(1, Math.ceil(sorted.value.length / props.pageSize)) : 1,
)

const visible = computed(() => {
  if (!props.pageSize) return sorted.value
  const start = (page.value - 1) * props.pageSize
  return sorted.value.slice(start, start + props.pageSize)
})
</script>

<template>
  <div class="min-w-0">
    <!-- Loading: skeleton rows keep the layout from jumping when data lands. -->
    <div v-if="props.loading" class="space-y-2.5 p-4">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded-lg bg-track" />
    </div>

    <template v-else-if="visible.length">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-line">
              <th
                v-for="column in props.columns"
                :key="column.key"
                scope="col"
                class="px-4 py-2.5 text-[11px] font-bold tracking-wide text-ink-muted uppercase"
                :class="[column.width, column.numeric ? 'text-right' : '', column.hideOnMobile ? 'hidden sm:table-cell' : '']"
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  class="t-fast inline-flex items-center gap-1 hover:text-navy"
                  :aria-label="`Sắp xếp theo ${column.label}`"
                  @click="toggleSort(column)"
                >
                  {{ column.label }}
                  <AppIcon
                    v-if="sortKey === column.key"
                    :name="sortDir === 'asc' ? 'chevronDown' : 'chevronDown'"
                    :size="12"
                    :stroke-width="2.4"
                    :class="sortDir === 'asc' ? 'rotate-180' : ''"
                  />
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in visible"
              :key="String(row[props.rowKey])"
              class="t-fast border-b border-line/70 last:border-0 hover:bg-shell"
            >
              <td
                v-for="column in props.columns"
                :key="column.key"
                class="px-4 py-3 align-middle text-[13px]"
                :class="[
                  column.numeric ? 'figure text-right' : '',
                  column.hideOnMobile ? 'hidden sm:table-cell' : '',
                ]"
              >
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Count + paging. The count answers "is this all of it?" -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <p class="text-[11.5px] text-ink-muted">
          {{ visible.length }} / {{ sorted.length }} dòng
        </p>
        <div v-if="totalPages > 1" class="flex items-center gap-1">
          <button
            type="button"
            class="t-fast grid size-9 place-items-center rounded-lg border border-line text-navy hover:border-accent-dark hover:text-accent-text disabled:opacity-40"
            :disabled="page === 1"
            @click="page--"
          >
            <AppIcon name="chevronLeft" :size="14" label="Trang trước" />
          </button>
          <span class="figure px-1 text-[12px] text-ink-soft">{{ page }} / {{ totalPages }}</span>
          <button
            type="button"
            class="t-fast grid size-9 place-items-center rounded-lg border border-line text-navy hover:border-accent-dark hover:text-accent-text disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page++"
          >
            <AppIcon name="chevronRight" :size="14" label="Trang sau" />
          </button>
        </div>
      </div>
    </template>

    <EmptyState v-else :title="props.emptyTitle" :hint="props.emptyHint">
      <template v-if="$slots.empty" #action><slot name="empty" /></template>
    </EmptyState>
  </div>
</template>
