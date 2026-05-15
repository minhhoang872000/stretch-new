<template>
  <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 card px-4 lg:px-6 py-4">
    <!-- Month Nav -->
    <div class="flex items-center gap-4 shrink-0">
      <span class="label-xs hidden sm:inline">{{ $t('calendar.month') }}:</span>
      <div class="flex items-center gap-3">
        <button class="w-7 h-7 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <h2 class="text-base lg:text-lg font-headline font-bold text-primary tracking-tight min-w-[120px] text-center">{{ monthLabel }}</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
      <!-- View Toggle -->
      <div class="flex items-center bg-surface-container-low rounded-full p-1 shrink-0">
        <button class="flex-1 sm:flex-none px-5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary shadow-sm transition-all">{{ $t('calendar.month') }}</button>
        <button class="flex-1 sm:flex-none px-5 py-1.5 rounded-full text-xs font-medium text-on-surface hover:bg-surface-container transition-all">{{ $t('calendar.week') }}</button>
        <button class="flex-1 sm:flex-none px-5 py-1.5 rounded-full text-xs font-medium text-on-surface hover:bg-surface-container transition-all">{{ $t('calendar.day') }}</button>
      </div>
      
      <!-- Filters -->
      <div class="flex gap-2">
        <select class="flex-1 sm:flex-none bg-surface-container-low border-none rounded-full text-xs font-bold text-on-surface px-4 py-2 focus:ring-0 cursor-pointer hover:bg-surface-container transition-colors">
          <option>{{ $t('calendar.allProviders') }}</option>
        </select>
        <select class="flex-1 sm:flex-none bg-surface-container-low border-none rounded-full text-xs font-bold text-on-surface px-4 py-2 focus:ring-0 cursor-pointer hover:bg-surface-container transition-colors">
          <option>{{ $t('calendar.allServices') }}</option>
        </select>
      </div>
      
      <!-- New Booking Button -->
      <button @click="openBookingModal" class="btn-primary flex items-center gap-2 justify-center">
        <span class="material-symbols-outlined text-lg">add</span>
        <span class="hidden sm:inline">{{ $t('calendar.newBooking') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'

const store = useCalendarStore()
const openBookingModal = inject('openBookingModal', () => {})

const monthLabel = computed(() => {
  const d = store.currentDate
  return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
})
</script>
