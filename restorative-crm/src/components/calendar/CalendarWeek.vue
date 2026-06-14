<template>
  <div class="card overflow-hidden flex flex-col h-full">
    <div class="grid grid-cols-7 flex-1 min-w-0 divide-x divide-outline-variant/10">
      <div v-for="day in store.weekDates" :key="day.toISOString()"
           class="flex flex-col min-h-[400px]"
           :class="isToday(day) ? 'bg-primary/5' : ''">
        <!-- Day header -->
        <button
          @click="store.selectDate(day)"
          class="px-1 sm:px-2 py-2.5 text-center border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low"
          :class="isSelected(day) ? 'bg-primary/10' : ''">
          <p class="label-xs">{{ weekDayLabel(day) }}</p>
          <p class="text-base lg:text-lg font-headline font-bold mt-0.5"
             :class="isToday(day) ? 'text-primary' : 'text-on-surface'">
            {{ day.getDate() }}
          </p>
        </button>

        <!-- Bookings -->
        <div class="flex-1 p-1 sm:p-1.5 space-y-1 overflow-y-auto no-scrollbar">
          <button v-for="booking in store.bookingsForDate(day)" :key="booking.id"
                  @click="store.selectAppointment(booking)"
                  class="w-full text-left px-1.5 py-1 rounded-md text-[10px] lg:text-[11px] font-bold border transition-all"
                  :class="[
                    booking.color, booking.textColor, booking.border,
                    selectedAppointment?.id === booking.id ? 'ring-2 ring-primary/30' : 'hover:opacity-80'
                  ]">
            <span class="block">{{ booking.time }}</span>
            <span class="block font-medium truncate opacity-90">{{ booking.patientName }}</span>
          </button>
          <p v-if="!store.bookingsForDate(day).length" class="text-center text-[10px] text-outline pt-4">—</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCalendarStore, dayKey } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const store = useCalendarStore()
const { selectedAppointment } = storeToRefs(store)
const { locale } = useI18n()

const WEEKDAYS = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
}
const weekDayLabel = (d) => (WEEKDAYS[locale.value] || WEEKDAYS.en)[d.getDay()]

const todayKey = dayKey(new Date())
const isToday = (d) => dayKey(d) === todayKey
const isSelected = (d) => dayKey(d) === dayKey(store.selectedDate)
</script>
