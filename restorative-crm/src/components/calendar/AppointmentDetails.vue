<template>
  <div class="card p-4 lg:p-6">
    <h3 class="text-base font-headline font-bold text-on-surface tracking-tight mb-0.5">Chi tiết cuộc hẹn</h3>
    <p class="text-on-surface-variant text-xs mb-6">{{ selectedAppointment?.dateStr || 'Chọn một cuộc hẹn' }}</p>

    <template v-if="selectedAppointment">
      <div class="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 mb-6">
        <img v-if="selectedAppointment.avatar" :src="selectedAppointment.avatar" class="w-11 h-11 rounded-xl object-cover shrink-0" alt="">
        <div v-else class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
          {{ selectedAppointment.patientName.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-on-surface text-sm truncate">{{ selectedAppointment.patientName }}</h4>
          <p class="text-[11px] text-on-surface-variant">{{ selectedAppointment.patientId }}</p>
        </div>
        <span
          class="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0"
          :class="selectedAppointment.type === 'business' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-primary/10 text-primary border border-primary/20'"
        >
          <span class="material-symbols-outlined text-xs">{{ selectedAppointment.type === 'business' ? 'corporate_fare' : 'person' }}</span>
          {{ TYPE_LABELS[selectedAppointment.type] || 'Cá nhân' }}
        </span>
      </div>

      <div class="space-y-4">
        <div>
          <span class="label-xs mb-1 block">Loại dịch vụ</span>
          <div class="flex gap-2 items-center">
            <span class="material-symbols-outlined text-primary text-lg">local_hospital</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.service }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div>
            <span class="label-xs mb-1 block">Số điện thoại</span>
            <a v-if="selectedAppointment.phone" :href="`tel:${selectedAppointment.phone}`"
               class="flex gap-2 items-center text-sm font-medium text-primary hover:underline">
              <span class="material-symbols-outlined text-lg">call</span>
              {{ selectedAppointment.phone }}
            </a>
            <p v-else class="text-sm text-on-surface-variant">—</p>
          </div>
          <div>
            <span class="label-xs mb-1 block">Email</span>
            <a v-if="selectedAppointment.email" :href="`mailto:${selectedAppointment.email}`"
               class="flex gap-2 items-center text-sm font-medium text-primary hover:underline break-all">
              <span class="material-symbols-outlined text-lg">mail</span>
              {{ selectedAppointment.email }}
            </a>
            <p v-else class="text-sm text-on-surface-variant">—</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="label-xs mb-1 block">Người thực hiện</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.provider || 'N/A' }}</p>
          </div>
          <div>
            <span class="label-xs mb-1 block">Thời lượng</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.duration || 'N/A' }}</p>
          </div>
        </div>

        <div v-if="selectedAppointment.location">
          <span class="label-xs mb-1 block">Địa điểm</span>
          <div class="flex gap-2 items-center">
            <span class="material-symbols-outlined text-primary text-lg">location_on</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.location }}</p>
          </div>
        </div>

        <!-- Liên hệ qua (cá nhân) -->
        <div v-if="selectedAppointment.contact">
          <span class="label-xs mb-1 block">Liên hệ qua</span>
          <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.contact }}</p>
        </div>

        <!-- Doanh nghiệp -->
        <div v-if="selectedAppointment.address">
          <span class="label-xs mb-1 block">Địa chỉ</span>
          <div class="flex gap-2 items-center">
            <span class="material-symbols-outlined text-primary text-lg">apartment</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.address }}</p>
          </div>
        </div>
        <div v-if="selectedAppointment.participants || selectedAppointment.setting" class="grid grid-cols-2 gap-3">
          <div v-if="selectedAppointment.participants">
            <span class="label-xs mb-1 block">Số người tham gia</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.participants }}</p>
          </div>
          <div v-if="selectedAppointment.setting">
            <span class="label-xs mb-1 block">Môi trường</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.setting }}</p>
          </div>
        </div>
        <div v-if="selectedAppointment.role">
          <span class="label-xs mb-1 block">Chức vụ / Vị trí</span>
          <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.role }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="label-xs mb-1 block">Giờ hẹn</span>
            <p class="text-sm font-medium text-on-surface">{{ selectedAppointment.time || 'N/A' }}</p>
          </div>
          <div>
            <span class="label-xs mb-1 block">Trạng thái</span>
            <span class="inline-block text-xs font-bold px-2.5 py-1 rounded-full" :class="statusClass(selectedAppointment.status)">
              {{ STATUS_LABELS[selectedAppointment.status] || selectedAppointment.status || '—' }}
            </span>
          </div>
        </div>

        <div>
          <span class="label-xs mb-1 block">Ghi chú</span>
          <p class="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">{{ selectedAppointment.notes || 'Không có ghi chú' }}</p>
        </div>
      </div>

      <div class="mt-6 space-y-2">
        <button
          v-if="selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed'"
          @click="markCompleted"
          class="btn-primary w-full flex items-center justify-center gap-2"
          :disabled="updating"
        >
          <span v-if="updating" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">check_circle</span>
          Đánh dấu hoàn tất
        </button>
        <button @click="editBooking"
          class="btn-outline w-full flex items-center justify-center gap-2 !border-surface-container !text-on-surface hover:!bg-surface-container">
          <span class="material-symbols-outlined text-lg">edit</span>
          Sửa
        </button>
      </div>
    </template>

    <div v-else class="text-center py-10 text-on-surface-variant">
      <span class="material-symbols-outlined text-3xl mb-3 opacity-50 block">event_note</span>
      <p class="text-xs">Nhấp vào bất kỳ cuộc hẹn nào để xem chi tiết.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCalendarStore } from '@/stores/calendar.js'
import { storeToRefs } from 'pinia'
import { updateBookingStatus as apiUpdateStatus } from '@/services/api.js'
import { STATUS_LABELS, TYPE_LABELS, statusClass } from '@/constants/booking.js'

const store = useCalendarStore()
const { selectedAppointment } = storeToRefs(store)
const updating = ref(false)

const markCompleted = async () => {
  if (!selectedAppointment.value) return
  updating.value = true
  try {
    await apiUpdateStatus(selectedAppointment.value.id, 'completed')
    selectedAppointment.value.status = 'completed'
    store.loadBookings()
  } catch (err) {
    console.error('Failed to update booking:', err)
  } finally {
    updating.value = false
  }
}

const editBooking = () => {
  console.log('Edit booking:', selectedAppointment.value?.id)
}
</script>
