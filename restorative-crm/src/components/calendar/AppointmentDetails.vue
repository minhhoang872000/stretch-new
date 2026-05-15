<template>
  <div class="card p-4 lg:p-6">
    <h3 class="text-base font-headline font-bold text-on-surface tracking-tight mb-0.5">{{ $t('calendar.appointmentDetails') }}</h3>
    <p class="text-on-surface-variant text-xs mb-6">{{ selectedAppointment?.dateStr || $t('calendar.selectAppointment') }}</p>

    <template v-if="selectedAppointment">
      <!-- Patient Card -->
      <div class="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 mb-6">
        <img v-if="selectedAppointment.avatar" :src="selectedAppointment.avatar" class="w-11 h-11 rounded-xl object-cover shrink-0" alt="Patient Avatar">
        <div v-else class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
          {{ selectedAppointment.patientName.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-on-surface text-sm truncate">{{ selectedAppointment.patientName }}</h4>
          <p class="text-[11px] text-on-surface-variant">{{ selectedAppointment.patientId }}</p>
        </div>
        <span v-if="selectedAppointment.isVip" class="bg-primary/10 text-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">V.I.P</span>
      </div>

      <!-- Details -->
      <div class="space-y-4">
        <div>
          <span class="label-xs mb-1 block">{{ $t('calendar.serviceType') }}</span>
          <div class="flex gap-2 items-center">
            <span class="material-symbols-outlined text-primary text-lg">local_hospital</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.service }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="label-xs mb-1 block">{{ $t('calendar.provider') }}</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.provider || 'N/A' }}</p>
          </div>
          <div>
            <span class="label-xs mb-1 block">{{ $t('calendar.duration') }}</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.duration || 'N/A' }}</p>
          </div>
        </div>

        <div>
          <span class="label-xs mb-1 block">{{ $t('calendar.notes') }}</span>
          <p class="text-xs text-on-surface-variant leading-relaxed">{{ selectedAppointment.notes || ($t('calendar.notes') + '...') }}</p>
        </div>
      </div>

<!-- Action Buttons -->
<div class="mt-6 space-y-2">
  <button 
    v-if="selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed'"
    @click="markCompleted"
    class="btn-primary w-full flex items-center justify-center gap-2"
    :disabled="updating"
  >
    <span class="material-symbols-outlined text-lg">check_circle</span>
    {{ $t('calendar.markCompleted') }}
  </button>
  <button 
    @click="editBooking"
    class="btn-outline w-full flex items-center justify-center gap-2 !border-surface-container !text-on-surface hover:!bg-surface-container"
  >
    <span class="material-symbols-outlined text-lg">edit</span>
    {{ $t('common.edit') }}
  </button>
</div>
    </template>
    
    <div v-else class="text-center py-10 text-on-surface-variant">
      <span class="material-symbols-outlined text-3xl mb-3 opacity-50 block">event_note</span>
      <p class="text-xs">{{ $t('calendar.clickPill') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'
import { updateBookingStatus as apiUpdateStatus } from '@/services/api.js'

const store = useCalendarStore()
const { selectedAppointment } = storeToRefs(store)
const updating = ref(false)

const markCompleted = async () => {
  if (!selectedAppointment.value) return
  updating.value = true
  try {
    const result = await apiUpdateStatus(selectedAppointment.value.id, 'completed')
    if (result.success) {
      selectedAppointment.value.status = 'completed'
      store.loadBookings()
    }
  } catch (err) {
    console.error('Failed to update booking:', err)
  } finally {
    updating.value = false
  }
}

const editBooking = () => {
  // TODO: Open edit modal
  console.log('Edit booking:', selectedAppointment.value?.id)
}
</script>
