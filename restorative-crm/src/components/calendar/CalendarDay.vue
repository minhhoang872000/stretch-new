<template>
  <div class="card overflow-hidden flex flex-col h-full">
    <div class="px-4 lg:px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between gap-3">
      <div>
        <p class="label-xs">{{ weekDayLabel }}</p>
        <h3 class="text-lg lg:text-xl font-headline font-bold text-on-surface tracking-tight">{{ dayLabel }}</h3>
      </div>
      <span class="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
        {{ dayBookings.length }} lịch hẹn
      </span>
    </div>

    <div class="flex-1 overflow-y-auto p-4 lg:p-6">
      <div v-if="dayBookings.length" class="space-y-2">
        <button v-for="booking in dayBookings" :key="booking.id"
                @click="store.selectAppointment(booking)"
                class="w-full flex items-stretch gap-3 text-left rounded-xl border transition-all p-3"
                :class="selectedAppointment?.id === booking.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-outline-variant/15 hover:bg-surface-container-low'">
          <div class="w-16 shrink-0 text-center">
            <p class="text-sm font-bold text-on-surface">{{ booking.time }}</p>
            <p class="text-[10px] text-outline">{{ booking.duration }}</p>
          </div>
          <div class="w-1 rounded-full shrink-0" :class="booking.color"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-on-surface truncate">{{ booking.patientName }}</p>
            <p class="text-xs text-on-surface-variant truncate">{{ booking.service }}</p>
          </div>
          <span class="self-center text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                :class="[booking.color, booking.textColor]">
            {{ booking.status }}
          </span>
        </button>
      </div>
      <div v-else class="text-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-3 opacity-40 block">event_available</span>
        <p class="text-sm">Không có lịch hẹn nào trong ngày này.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'

const store = useCalendarStore()
const { selectedAppointment, selectedDate } = storeToRefs(store)

const dayBookings = computed(() => store.bookingsForDate(selectedDate.value))

const dayLabel = computed(() =>
  new Date(selectedDate.value).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
)
const weekDayLabel = computed(() =>
  new Date(selectedDate.value).toLocaleDateString('vi-VN', { weekday: 'long' })
)
</script>
