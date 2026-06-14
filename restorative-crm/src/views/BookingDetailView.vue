<template>
  <main class="p-4 lg:p-8 max-w-3xl mx-auto w-full">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3 mb-6">
      <button @click="goBack" class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Danh sách lịch hẹn
      </button>
      <div v-if="bk" class="flex items-center gap-2">
        <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="statusClass(bk.status)">
          {{ STATUS_LABELS[bk.status] || bk.status }}
        </span>
        <select
          @change="(e) => { changeStatus(e.target.value); e.target.value = '' }"
          class="text-xs rounded-lg border border-outline-variant/20 px-2 py-1.5 bg-surface"
          :disabled="busy"
        >
          <option value="">Đổi trạng thái ↻</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Huỷ</option>
        </select>
        <button @click="remove" :disabled="busy" class="text-error/70 hover:text-error p-1.5 rounded-lg hover:bg-error-container/20" title="Xoá">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="card p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>
    <div v-else-if="error || !bk" class="card p-12 text-center">
      <span class="material-symbols-outlined text-4xl text-outline mb-3 block">event_busy</span>
      <p class="text-sm text-on-surface-variant">{{ error || 'Không tìm thấy lịch hẹn.' }}</p>
      <button @click="goBack" class="btn-primary !text-xs mt-4 inline-flex items-center gap-1.5">
        <span class="material-symbols-outlined text-sm">arrow_back</span> Quay lại
      </button>
    </div>

    <template v-else>
      <!-- Customer card -->
      <div class="card p-5 lg:p-6 mb-5">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-xl shrink-0">
            {{ (bk.name || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-headline font-extrabold text-on-surface">{{ bk.name }}</h1>
              <span
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                :class="bkType === 'business' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-primary/10 text-primary border border-primary/20'"
              >
                <span class="material-symbols-outlined text-sm">{{ bkType === 'business' ? 'corporate_fare' : 'person' }}</span>
                {{ TYPE_LABELS[bkType] }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
              <a v-if="bk.phone" :href="`tel:${bk.phone}`" class="flex items-center gap-1.5 text-primary font-medium hover:underline">
                <span class="material-symbols-outlined text-lg">call</span>{{ bk.phone }}
              </a>
              <a v-if="bk.email" :href="`mailto:${bk.email}`" class="flex items-center gap-1.5 text-primary font-medium hover:underline break-all">
                <span class="material-symbols-outlined text-lg">mail</span>{{ bk.email }}
              </a>
            </div>
            <router-link
              v-if="bk.session_id"
              :to="`/leads/${bk.session_id}`"
              class="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:underline"
            >
              <span class="material-symbols-outlined text-sm">person_search</span> Xem hành trình Lead
            </router-link>
          </div>
        </div>
      </div>

      <!-- Booking info -->
      <div class="card p-5 lg:p-6 mb-5">
        <h2 class="label-xs mb-4">Thông tin đặt lịch</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="label-xs mb-1">Dịch vụ</dt>
            <dd><span class="text-xs font-semibold px-2 py-1 rounded-full" :class="serviceClass(bk.service)">{{ SERVICE_LABELS[bk.service] || bk.service }}</span></dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Người thực hiện</dt>
            <dd class="text-sm font-medium text-on-surface">{{ bk.practitioner || 'Chưa phân công' }}</dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Ngày hẹn</dt>
            <dd class="text-sm font-medium text-on-surface">{{ formatDate(bk.date) }}</dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Giờ hẹn</dt>
            <dd class="text-sm font-medium text-on-surface">{{ bk.time }}</dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Địa điểm</dt>
            <dd class="text-sm font-medium text-on-surface flex items-center gap-1.5">
              <template v-if="note.location">
                <span class="material-symbols-outlined text-base">{{ locationIcon(note.location) }}</span>
                {{ LOCATION_LABELS[note.location] || note.location }}
              </template>
              <span v-else class="text-on-surface-variant/50">—</span>
            </dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Liên hệ qua</dt>
            <dd>
              <span v-if="note.contact" class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" :class="contactClass(note.contact)">
                <span class="material-symbols-outlined text-sm">{{ contactIcon(note.contact) }}</span>
                {{ CONTACT_LABELS[note.contact] || note.contact }}
              </span>
              <span v-else class="text-on-surface-variant/50 text-sm">—</span>
            </dd>
          </div>

          <!-- Business-only fields (present when the booking carries them) -->
          <div v-if="note.participants">
            <dt class="label-xs mb-1">Số người tham gia</dt>
            <dd class="text-sm font-medium text-on-surface">{{ note.participants }}</dd>
          </div>
          <div v-if="note.setting">
            <dt class="label-xs mb-1">Môi trường</dt>
            <dd class="text-sm font-medium text-on-surface">{{ SETTING_LABELS[note.setting] || note.setting }}</dd>
          </div>
          <div v-if="note.address">
            <dt class="label-xs mb-1">Địa chỉ</dt>
            <dd class="text-sm font-medium text-on-surface">{{ note.address }}</dd>
          </div>
          <div v-if="note.role">
            <dt class="label-xs mb-1">Chức vụ / Vị trí</dt>
            <dd class="text-sm font-medium text-on-surface">{{ note.role }}</dd>
          </div>
        </dl>

        <div class="mt-5">
          <dt class="label-xs mb-1">Ghi chú</dt>
          <dd class="text-sm text-on-surface leading-relaxed whitespace-pre-line">{{ note.text || '—' }}</dd>
        </div>
      </div>

      <!-- Meta -->
      <div class="card p-5 lg:p-6">
        <h2 class="label-xs mb-4">Hệ thống</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="label-xs mb-1">Mã lịch hẹn</dt>
            <dd class="text-sm font-mono text-on-surface">{{ bk.id }}</dd>
          </div>
          <div>
            <dt class="label-xs mb-1">Trạng thái</dt>
            <dd><span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="statusClass(bk.status)">{{ STATUS_LABELS[bk.status] || bk.status }}</span></dd>
          </div>
          <div v-if="bk.createdAt">
            <dt class="label-xs mb-1">Thời điểm đặt</dt>
            <dd class="text-sm text-on-surface">{{ formatDateTime(bk.createdAt) }}</dd>
          </div>
          <div v-if="bk.updatedAt">
            <dt class="label-xs mb-1">Cập nhật lần cuối</dt>
            <dd class="text-sm text-on-surface">{{ formatDateTime(bk.updatedAt) }}</dd>
          </div>
          <div v-if="bk.session_id">
            <dt class="label-xs mb-1">Session ID</dt>
            <dd class="text-sm font-mono text-on-surface-variant break-all">{{ bk.session_id }}</dd>
          </div>
        </dl>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchBookingById, updateBookingStatus, deleteBooking } from '@/services/api.js'
import { formatDate, formatDateTime } from '@/utils/date.js'
import { useNotify } from '@/composables/useNotify.js'
import {
  SERVICE_LABELS, LOCATION_LABELS, CONTACT_LABELS, STATUS_LABELS, SETTING_LABELS, TYPE_LABELS,
  parseNote, bookingType, statusClass, serviceClass, locationIcon, contactIcon, contactClass,
} from '@/constants/booking.js'

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const bk = ref(null)
const loading = ref(true)
const error = ref('')
const busy = ref(false)

const note = computed(() => parseNote(bk.value?.note))
const bkType = computed(() => bookingType(note.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchBookingById(route.params.id)
    bk.value = data.booking
  } catch (e) {
    error.value = e.message || 'Không tải được lịch hẹn.'
  } finally {
    loading.value = false
  }
}

async function changeStatus(status) {
  if (!status || !bk.value) return
  busy.value = true
  try {
    await updateBookingStatus(bk.value.id, status)
    bk.value.status = status
    notify.success('toast.bookingUpdated')
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  } finally {
    busy.value = false
  }
}

async function remove() {
  if (!bk.value || !confirm('Xoá lịch hẹn này?')) return
  busy.value = true
  try {
    await deleteBooking(bk.value.id)
    notify.success('toast.bookingDeleted')
    router.push({ name: 'Bookings' })
  } catch (e) {
    console.error(e)
    notify.error(e.message)
    busy.value = false
  }
}

function goBack() {
  router.push({ name: 'Bookings' })
}

onMounted(load)
</script>
