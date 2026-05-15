<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header Controls -->
    <CalendarHeader />

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 min-h-[600px]">
      <!-- Calendar Grid -->
      <div class="xl:col-span-8 h-full">
        <CalendarGrid />
      </div>
      
      <!-- Details Sidebar -->
      <div class="xl:col-span-4 flex flex-col gap-5">
        <AppointmentDetails class="flex-1" />
        <DailyProductivity />
      </div>
    </div>

    <!-- Add Booking Modal -->
    <ActionModal 
      v-model:isOpen="isModalOpen" 
      :title="$t('calendar.newBooking')" 
      :submitLabel="$t('calendar.newBooking')"
      @submit="handleNewBooking"
    >
      <div class="space-y-4">
        <div>
          <label class="label-xs mb-1.5 block">{{ $t('calendar.addPatient') }}</label>
          <input v-model="newBooking.patientName" type="text" class="input-field" :placeholder="$t('calendar.addPatient')" />
        </div>
        <div>
          <label class="label-xs mb-1.5 block">{{ $t('common.services') }}</label>
          <select v-model="newBooking.service" class="input-field">
            <option>Acupuncture</option>
            <option>Deep Tissue Massage</option>
            <option>Physical Therapy</option>
            <option>Hydrotherapy</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label-xs mb-1.5 block">Date (Oct)</label>
            <input v-model="newBooking.dateValue" type="number" min="1" max="31" class="input-field" />
          </div>
          <div>
            <label class="label-xs mb-1.5 block">Time</label>
            <input v-model="newBooking.time" type="time" class="input-field" />
          </div>
        </div>
      </div>
    </ActionModal>
  </main>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import AppointmentDetails from '@/components/calendar/AppointmentDetails.vue'
import DailyProductivity from '@/components/calendar/DailyProductivity.vue'
import ActionModal from '@/components/ui/ActionModal.vue'
import { useCalendarStore } from '@/stores/calendar.js'

const store = useCalendarStore()
const isModalOpen = ref(false)

onMounted(() => {
  store.loadBookings()
})

const newBooking = ref({
  patientName: '',
  service: 'Acupuncture',
  dateValue: 8,
  time: '10:00'
})

const openModal = () => {
  isModalOpen.value = true
}

// Provide openModal so CalendarHeader can use it
provide('openBookingModal', openModal)

const handleNewBooking = () => {
  if (!newBooking.value.patientName) return

  store.bookings.push({
    id: Date.now(),
    patientName: newBooking.value.patientName,
    patientId: 'ID: ' + Math.floor(Math.random() * 90000 + 10000),
    service: newBooking.value.service,
    provider: 'Dr. Auto Assigned',
    duration: '45 Min',
    dateStr: `Oct ${newBooking.value.dateValue}, 2024 at ${newBooking.value.time}`,
    dateValue: parseInt(newBooking.value.dateValue),
    time: newBooking.value.time,
    displayTime: `${newBooking.value.time} - ${newBooking.value.service.substring(0,4)}...`,
    color: 'bg-primary',
    textColor: 'text-on-primary',
    border: 'border-transparent'
  })
  
  isModalOpen.value = false
  newBooking.value.patientName = ''
}
</script>
