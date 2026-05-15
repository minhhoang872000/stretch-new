<template>
  <div class="card overflow-hidden flex flex-col h-full">
    <!-- Responsive Wrapper -->
    <div class="overflow-x-auto no-scrollbar flex-1 flex flex-col">
      <div class="min-w-[700px] flex-1 flex flex-col">
        <!-- Days of Week -->
        <div class="grid grid-cols-7 border-b border-outline-variant/10">
          <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="px-2 py-3 text-center label-xs">
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar Grid -->
        <div class="flex-1 grid grid-cols-7 grid-rows-5 bg-outline-variant/10 gap-[1px]">
          <div v-for="(day, index) in calendarDays" :key="index" 
               class="min-h-[100px] lg:min-h-[110px] p-1.5 lg:p-2 hover:bg-surface-container-low/30 transition-colors group relative border-t-2"
               :class="[
                 day.isSelected ? 'bg-primary/5 border-primary' : 'bg-white border-transparent',
                 !day.isCurrentMonth ? 'opacity-30' : ''
               ]"
               @click="selectDate(day)">
            
            <span class="text-xs font-bold px-1.5 py-0.5" :class="[
              day.isSelected ? 'text-primary' : 'text-on-surface-variant',
            ]">
              {{ day.date.getDate() }}
            </span>
            
            <!-- Bookings for this day -->
            <div class="mt-0.5 space-y-0.5">
              <div v-for="booking in getBookingsForDay(day.date.getDate())" :key="booking.id" 
                   @click.stop="selectBooking(booking)"
                   class="px-1.5 py-1 rounded text-[9px] lg:text-[10px] font-bold truncate cursor-pointer transition-all border"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'

const store = useCalendarStore()
const { bookings, selectedDate, selectedAppointment, currentDate } = storeToRefs(store)

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
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d)
    days.push({
      date: dayDate,
      isCurrentMonth: true,
      isSelected: d === selectedDate.value
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

const getBookingsForDay = (dayOfMonth) => {
  return bookings.value.filter(b => b.dateValue === dayOfMonth)
}

const selectDate = (day) => {
  if (!day.isCurrentMonth) return
  const dayOfMonth = day.date.getDate()
  store.selectDate(dayOfMonth)
}

const selectBooking = (booking) => {
  store.selectAppointment(booking)
}
</script>
