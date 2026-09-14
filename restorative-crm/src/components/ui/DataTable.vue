<template>
  <section class="panel overflow-hidden">
    <!-- Toolbar: search, filter slots, bulk actions ------------------------ -->
    <div v-if="!hideToolbar" class="px-3 py-2.5 border-b border-line flex flex-wrap items-center gap-2">
      <label v-if="searchable" class="relative flex-1 min-w-[180px] max-w-xs">
        <span class="sr-only">Tìm trong danh sách</span>
        <span
          class="material-symbols-outlined text-base text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >search</span>
        <input
          :value="query"
          type="search"
          class="input pl-8"
          :placeholder="searchPlaceholder"
          @input="$emit('update:query', $event.target.value)"
        />
      </label>

      <slot name="filters" />

      <button
        v-if="activeFilterCount > 0"
        type="button"
        class="btn-ghost btn-sm"
        @click="$emit('reset')"
      >
        <span class="material-symbols-outlined text-base">filter_alt_off</span>
        Xoá lọc ({{ activeFilterCount }})
      </button>

      <div class="ml-auto flex items-center gap-2">
        <p v-if="!loading" class="meta whitespace-nowrap">
          <span class="num font-bold text-ink-2">{{ total }}</span> dòng
        </p>
        <slot name="actions" />
      </div>
    </div>

    <!-- Bulk bar: only appears with a selection, so it never steals space --->
    <div
      v-if="selected.length"
      class="px-3 py-2 bg-accent-soft border-b border-accent-line/60 flex flex-wrap items-center gap-2"
    >
      <p class="text-xs font-bold text-accent-ink">Đã chọn {{ selected.length }} dòng</p>
      <div class="flex items-center gap-1.5 ml-auto">
        <slot name="bulk" />
        <button type="button" class="btn-ghost btn-sm" @click="$emit('clear-selection')">Bỏ chọn</button>
      </div>
    </div>

    <!-- Table ------------------------------------------------------------- -->
    <div class="overflow-x-auto">
      <table class="tbl" :class="{ 'tbl-rows': clickable }">
        <thead>
          <tr>
            <th v-if="selectable" class="w-9">
              <input
                type="checkbox"
                class="checkbox"
                :checked="allSelected"
                :aria-label="allSelected ? 'Bỏ chọn cả trang' : 'Chọn cả trang'"
                @change="$emit('toggle-page')"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width } : null"
              :class="[col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '', col.thClass]"
            >
              <button
                v-if="col.sortable"
                type="button"
                class="inline-flex items-center gap-0.5 hover:text-accent transition-colors"
                @click="$emit('sort', col.key)"
              >
                {{ col.label }}
                <span
                  class="material-symbols-outlined text-sm"
                  :class="sort && sort.key === col.key ? 'text-accent' : 'text-ink-4'"
                  aria-hidden="true"
                >{{ sortIcon(col.key) }}</span>
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
            <th v-if="$slots['row-actions']" class="w-10" />
          </tr>
        </thead>

        <tbody>
          <!-- Loading: skeleton rows that match the real layout, not a spinner -->
          <template v-if="loading">
            <tr v-for="n in skeletonRows" :key="`sk-${n}`">
              <td v-if="selectable"><div class="skeleton h-4 w-4" /></td>
              <td v-for="col in columns" :key="col.key">
                <div class="skeleton h-3.5" :style="{ width: `${40 + ((n * 17 + col.key.length * 7) % 45)}%` }" />
              </td>
              <td v-if="$slots['row-actions']" />
            </tr>
          </template>

          <tr v-else-if="!rows.length">
            <td :colspan="colspan" class="!p-0">
              <slot name="empty">
                <EmptyState
                  :icon="emptyIcon"
                  :title="emptyTitle"
                  :hint="emptyHint"
                >
                  <slot name="empty-action" />
                </EmptyState>
              </slot>
            </td>
          </tr>

          <template v-else>
          <tr
            v-for="(row, index) in rows"
            :key="row[rowKey]"
            :class="[
              clickable ? 'cursor-pointer' : '',
              selected.includes(row[rowKey]) ? 'bg-accent-soft/50' : '',
            ]"
            :tabindex="clickable ? 0 : null"
            @click="clickable && $emit('row-click', row)"
            @keydown.enter="clickable && $emit('row-click', row)"
          >
            <td v-if="selectable" @click.stop>
              <input
                type="checkbox"
                class="checkbox"
                :checked="selected.includes(row[rowKey])"
                :aria-label="`Chọn dòng ${index + 1}`"
                @change="$emit('toggle-row', row[rowKey])"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '',
                col.tdClass,
                col.mono ? 'font-mono text-xs' : '',
              ]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="index">
                {{ formatCell(row, col) }}
              </slot>
            </td>
            <td v-if="$slots['row-actions']" class="text-right" @click.stop>
              <slot name="row-actions" :row="row" />
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -------------------------------------------------------- -->
    <div
      v-if="pageCount > 1 && !loading"
      class="px-3 py-2 border-t border-line flex items-center justify-between gap-3"
    >
      <p class="meta">
        Trang <span class="num font-bold text-ink-2">{{ page }}</span> / {{ pageCount }}
      </p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn-ghost btn-sm btn-icon"
          :disabled="page <= 1"
          aria-label="Trang trước"
          @click="$emit('update:page', page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          type="button"
          class="btn-ghost btn-sm btn-icon"
          :disabled="page >= pageCount"
          aria-label="Trang sau"
          @click="$emit('update:page', page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from './EmptyState.vue'

/**
 * The one table in the console.
 *
 * Columns are declared as data so a list screen is a column array plus the
 * cells that genuinely need markup — everything else (sticky header, skeleton
 * loading, empty state, selection, paging) comes for free and stays identical
 * across modules.
 */
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },

  // toolbar
  hideToolbar: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Tìm theo tên, mã, số điện thoại…' },
  query: { type: String, default: '' },
  activeFilterCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  // selection
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },

  // sorting + paging
  sort: { type: Object, default: null },
  page: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },

  // empty state
  emptyIcon: { type: String, default: 'inbox' },
  emptyTitle: { type: String, default: 'Không có dòng nào khớp' },
  emptyHint: { type: String, default: 'Thử bỏ một bộ lọc hoặc đổi từ khoá tìm kiếm.' },
})

defineEmits([
  'update:query', 'update:page', 'sort', 'reset', 'row-click',
  'toggle-row', 'toggle-page', 'clear-selection',
])

const skeletonRows = 6

const colspan = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + 1,
)

function sortIcon(key) {
  if (!props.sort || props.sort.key !== key) return 'unfold_more'
  return props.sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'
}

function formatCell(row, col) {
  const raw = row[col.key]
  if (typeof col.format === 'function') return col.format(raw, row)
  return raw == null || raw === '' ? '—' : raw
}
</script>
