<template>
  <div class="card overflow-hidden flex flex-col h-full">
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Days of Week -->
      <div class="grid grid-cols-7 border-b border-outline-variant/10">
        <div v-for="day in weekDays" :key="day.full" class="px-1 sm:px-2 py-2.5 sm:py-3 text-center label-xs">
          <span class="sm:hidden">{{ day.short }}</span>
          <span class="hidden sm:inline">{{ day.full }}</span>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex-1 grid grid-cols-7 grid-rows-5 bg-outline-variant/10 gap-[1px]">
        <div v-for="(day, index) in calendarDays" :key="index"
             class="min-h-[64px] sm:min-h-[90px] lg:min-h-[110px] p-1 sm:p-1.5 lg:p-2 hover:bg-surface-container-low/30 transition-colors group relative border-t-2 overflow-hidden"
             :class="[
               day.isSelected ? 'bg-primary/5 border-primary' : 'bg-white border-transparent',
               !day.isCurrentMonth ? 'opacity-30' : ''
             ]"
             @click="selectDate(day)">

          <span class="text-[11px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5" :class="[
            day.isSelected ? 'text-primary' : 'text-on-surface-variant',
          ]">
            {{ day.date.getDate() }}
          </span>

          <!-- Bookings for this day -->
          <div class="mt-0.5 space-y-0.5">
            <div v-for="booking in getBookingsForDay(day.date)" :key="booking.id"
                 @click.stop="selectBooking(booking)"
                 class="px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9px] lg:text-[10px] font-bold truncate cursor-pointer transition-all border"
                 :class="[
                   booking.color,
                   booking.textColor,
                   booking.border,
                   selectedAppointment?.id === booking.id ? 'ring-2 ring-primary/30' : 'hover:opacity-80'
                 ]">
              {{ booking.displayTime }}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendarStore, dayKey } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'

const store = useCalendarStore()
const { selectedDate, selectedAppointment, currentDate } = storeToRefs(store)

const weekDays = [
  { short: 'S', full: 'Sun' },
  { short: 'M', full: 'Mon' },
  { short: 'T', full: 'Tue' },
  { short: 'W', full: 'Wed' },
  { short: 'T', full: 'Thu' },
  { short: 'F', full: 'Fri' },
  { short: 'S', full: 'Sat' },
]

const calendarDays = computed(() => {
  const date = new Date(currentDate.value)
  const year = date.getFullYear()
  const month = date.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const days = []
  
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
      isSelected: false
    })
  }
  
  const selectedKey = dayKey(selectedDate.value)
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d)
    days.push({
      date: dayDate,
      isCurrentMonth: true,
      isSelected: dayKey(dayDate) === selectedKey
    })
  }
  
  const remaining = 35 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
      isSelected: false
    })
  }
  
  return days.slice(0, 35)
})

const getBookingsForDay = (date) => store.bookingsForDate(date)

const selectDate = (day) => {
  if (!day.isCurrentMonth) return
  store.selectDate(day.date)
}

const selectBooking = (booking) => {
  store.selectAppointment(booking)
}
</script>
