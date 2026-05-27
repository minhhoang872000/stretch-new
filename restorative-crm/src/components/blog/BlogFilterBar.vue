<template>
  <div class="bg-surface-container-low/50 backdrop-blur rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4 ghost-border">
    <!-- Keyword search with PrimeVue InputText -->
    <div class="flex-1 w-full min-w-[200px] sm:min-w-[300px] relative flex items-center">
      <span class="material-symbols-outlined absolute left-4 text-slate-400 z-10">search</span>
      <InputText
        v-model="store.searchQuery"
        class="w-full bg-surface-container-lowest border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
        placeholder="Filter by title or keyword..."
      />
    </div>

    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <!-- Category Dropdown with PrimeVue -->
      <Dropdown
        v-model="store.filterCategory"
        :options="categoryOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Category"
        class="p-dropdown-sm bg-surface-container-lowest border-none rounded-xl w-48 text-sm"
      />

      <!-- Status Dropdown with PrimeVue -->
      <Dropdown
        v-model="store.filterStatus"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Status"
        class="p-dropdown-sm bg-surface-container-lowest border-none rounded-xl w-40 text-sm"
      />

      <button 
        @click="resetFilters" 
        class="bg-surface-container-highest text-on-surface-variant w-12 h-12 rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors"
        title="Clear Filters"
      >
        <span class="material-symbols-outlined">filter_alt_off</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useBlogStore } from '@/stores/blog.js'

const store = useBlogStore()

const categoryOptions = [
  { label: 'All Categories', value: 'All Categories' },
  { label: 'Physical Health', value: 'Physical Health' },
  { label: 'Mental Wellness', value: 'Mental Wellness' },
  { label: 'Recovery Tech', value: 'Recovery Tech' }
]

const statusOptions = [
  { label: 'Status: All', value: 'Status: All' },
  { label: 'Published', value: 'Published' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Archived', value: 'Archived' }
]

function resetFilters() {
  store.searchQuery = ''
  store.filterCategory = 'All Categories'
  store.filterStatus = 'Status: All'
}
</script>

