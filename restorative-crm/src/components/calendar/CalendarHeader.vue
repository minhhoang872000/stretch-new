<template>
  <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 card px-4 lg:px-6 py-4">
    <!-- Date Nav -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="flex items-center gap-2">
        <button @click="store.prev" class="w-6 h-6 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <h2 class="text-sm lg:text-base font-headline font-bold text-primary tracking-tight min-w-[150px] text-center">{{ rangeLabel }}</h2>
        <button @click="store.next" class="w-6 h-6 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
      <!-- View Toggle -->
      <div class="flex items-center bg-surface-container-low rounded-full p-0.5 shrink-0">
        <button v-for="v in views" :key="v.key" @click="store.setView(v.key)"
          class="flex-1 sm:flex-none px-3 py-1 rounded-full text-[11px] transition-all"
          :class="store.view === v.key ? 'font-bold bg-primary text-on-primary shadow-sm' : 'font-medium text-on-surface hover:bg-surface-container'">
          {{ $t('calendar.' + v.key) }}
        </button>
      </div>

      <!-- Service Filter -->
      <select v-model="store.filterService" class="bg-surface-container-low border-none rounded-full text-[11px] font-bold text-on-surface px-3 py-1.5 focus:ring-0 cursor-pointer hover:bg-surface-container transition-colors">
        <option value="">{{ $t('calendar.allServices') }}</option>
        <option v-for="s in store.services" :key="s" :value="s">{{ s }}</option>
      </select>

      <!-- New Booking Button -->
      <button @click="openBookingModal" class="btn-primary !px-3 !py-1.5 !text-xs flex items-center gap-1.5 justify-center">
        <span class="material-symbols-outlined text-base">add</span>
        <span class="hidden sm:inline">{{ $t('calendar.newBooking') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'
import { useI18n } from 'vue-i18n'

const store = useCalendarStore()
const { locale } = useI18n()
const openBookingModal = inject('openBookingModal', () => {})

const views = [
  { key: 'month' },
  { key: 'week' },
  { key: 'day' },
]

const loc = computed(() => (locale.value === 'vi' ? 'vi-VN' : 'en-US'))

// Header title adapts to the active view: month name, week range, or full day.
const rangeLabel = computed(() => {
  const d = new Date(store.currentDate)
  if (store.view === 'month') {
    return d.toLocaleDateString(loc.value, { month: 'long', year: 'numeric' })
  }
  if (store.view === 'week') {
    const week = store.weekDates
    const start = week[0]
    const end = week[6]
    const sameMonth = start.getMonth() === end.getMonth()
    const startStr = start.toLocaleDateString(loc.value, { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString(loc.value, { day: 'numeric', month: 'short', year: 'numeric' })
    return sameMonth
      ? `${start.getDate()} – ${endStr}`
      : `${startStr} – ${endStr}`
  }
  return new Date(store.selectedDate).toLocaleDateString(loc.value, { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>
