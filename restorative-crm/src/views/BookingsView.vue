<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
      <div>
        <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Lịch hẹn</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Quản lý lịch hẹn</h1>
        <p class="text-on-surface-variant mt-1.5 text-sm">{{ total }} lịch hẹn — xác nhận, theo dõi, cập nhật trạng thái.</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div v-for="s in stats" :key="s.label" class="bg-surface-container-low rounded-xl p-4">
        <p class="text-xs text-on-surface-variant uppercase tracking-wider">{{ s.label }}</p>
        <p class="text-2xl font-bold mt-1" :class="s.color">{{ s.value }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-surface-container-low rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
      <select
        v-model="filterStatus"
        @change="applyFilters"
        class="text-sm rounded-xl border border-outline-variant/20 px-3 py-2 bg-surface text-on-surface w-40"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="completed">Hoàn thành</option>
        <option value="cancelled">Đã huỷ</option>
      </select>

      <select
        v-model="filterService"
        @change="applyFilters"
        class="text-sm rounded-xl border border-outline-variant/20 px-3 py-2 bg-surface text-on-surface w-48"
      >
        <option value="">Tất cả dịch vụ</option>
        <option v-for="(label, key) in SERVICE_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>

      <input
        v-model="filterDate"
        type="date"
        @change="applyFilters"
        class="text-sm rounded-xl border border-outline-variant/20 px-3 py-2 bg-surface text-on-surface w-44"
      />

      <button @click="resetFilters" class="text-xs text-on-surface-variant hover:text-primary font-semibold ml-auto flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">filter_alt_off</span> Xoá lọc
      </button>
      <button @click="loadBookings" class="text-xs text-primary font-semibold flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">refresh</span> Làm mới
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <!-- Table -->
    <div v-else class="bg-surface-container-low rounded-2xl overflow-x-auto">
      <table class="w-full text-sm min-w-[900px]">
        <thead>
          <tr class="border-b border-outline-variant/20 text-left">
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Khách hàng</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Dịch vụ</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Địa điểm</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Thời gian</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Liên hệ</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Ghi chú</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Trạng thái</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant w-8"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bk in bookings"
            :key="bk.id"
            @click="openDetail(bk)"
            class="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors group cursor-pointer"
          >
            <!-- Khách hàng -->
            <td class="p-4">
              <div class="flex items-center gap-1.5">
                <p class="font-semibold text-on-surface">{{ bk.name }}</p>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0"
                  :class="bookingType(parseNote(bk.note)) === 'business' ? 'bg-teal-50 text-teal-700' : 'bg-primary/10 text-primary'"
                >
                  <span class="material-symbols-outlined text-[11px]">{{ bookingType(parseNote(bk.note)) === 'business' ? 'corporate_fare' : 'person' }}</span>
                  {{ TYPE_LABELS[bookingType(parseNote(bk.note))] }}
                </span>
              </div>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ bk.phone }}</p>
              <p v-if="bk.email" class="text-xs text-on-surface-variant/60">{{ bk.email }}</p>
              <router-link
                v-if="bk.session_id"
                :to="`/leads/${bk.session_id}`"
                @click.stop
                class="inline-flex items-center gap-0.5 mt-1 text-[10px] font-semibold text-primary hover:underline"
              >
                <span class="material-symbols-outlined text-xs">person_search</span> Lead
              </router-link>
            </td>

            <!-- Dịch vụ -->
            <td class="p-4">
              <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="serviceClass(bk.service)">
                {{ SERVICE_LABELS[bk.service] || bk.service }}
              </span>
            </td>

            <!-- Địa điểm -->
            <td class="p-4">
              <div v-if="parseNote(bk.note).location" class="flex items-center gap-1 text-xs text-on-surface-variant">
                <span class="material-symbols-outlined text-sm">{{ locationIcon(parseNote(bk.note).location) }}</span>
                {{ LOCATION_LABELS[parseNote(bk.note).location] || parseNote(bk.note).location }}
              </div>
              <div v-else-if="parseNote(bk.note).address" class="flex items-center gap-1 text-xs text-on-surface-variant">
                <span class="material-symbols-outlined text-sm">apartment</span>
                {{ parseNote(bk.note).address }}
              </div>
              <span v-else class="text-on-surface-variant/30 text-xs">—</span>
            </td>

            <!-- Thời gian -->
            <td class="p-4">
              <p class="text-xs font-semibold text-on-surface">{{ formatDate(bk.date) }}</p>
              <p class="text-xs text-on-surface-variant">{{ bk.time }}</p>
              <p v-if="bk.createdAt" class="text-[10px] text-on-surface-variant/50 mt-0.5">Đặt: {{ formatDate(bk.createdAt?.slice(0,10)) }}</p>
            </td>

            <!-- Liên hệ qua -->
            <td class="p-4">
              <template v-if="parseNote(bk.note).contact">
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" :class="contactClass(parseNote(bk.note).contact)">
                  <span class="material-symbols-outlined text-xs">{{ contactIcon(parseNote(bk.note).contact) }}</span>
                  {{ CONTACT_LABELS[parseNote(bk.note).contact] || parseNote(bk.note).contact }}
                </span>
              </template>
              <span v-else class="text-on-surface-variant/30 text-xs">—</span>
            </td>

            <!-- Ghi chú -->
            <td class="p-4 max-w-[180px]">
              <p v-if="parseNote(bk.note).text" class="text-xs text-on-surface-variant truncate" :title="parseNote(bk.note).text">
                {{ parseNote(bk.note).text }}
              </p>
              <p v-if="bizExtras(bk.note)" class="text-[10px] text-on-surface-variant/60 truncate mt-0.5" :title="bizExtras(bk.note)">
                {{ bizExtras(bk.note) }}
              </p>
              <span v-if="!parseNote(bk.note).text && !bizExtras(bk.note)" class="text-on-surface-variant/30 text-xs">—</span>
            </td>

            <!-- Trạng thái -->
            <td class="p-4">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="statusClass(bk.status)">
                {{ STATUS_LABELS[bk.status] || bk.status }}
              </span>
            </td>

            <!-- Thao tác -->
            <td class="p-4" @click.stop>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                  @change="(e) => { updateStatus(bk.id, e.target.value); e.target.value = '' }"
                  class="text-[11px] rounded-lg border border-outline-variant/20 px-1.5 py-1 bg-surface"
                >
                  <option value="">↻</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Huỷ</option>
                </select>
                <button @click="removeBooking(bk.id)" class="text-error/50 hover:text-error p-1" title="Xoá">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!bookings.length">
            <td colspan="8" class="p-16 text-center">
              <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">event_busy</span>
              </div>
              <p class="text-on-surface-variant font-semibold">Chưa có lịch hẹn</p>
              <p class="text-xs text-on-surface-variant/60 mt-1">Lịch hẹn từ website sẽ hiển thị tại đây.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchBookings, updateBookingStatus, deleteBooking } from '@/services/api.js'
import { formatDate } from '@/utils/date.js'
import { useNotify } from '@/composables/useNotify.js'
import {
  SERVICE_LABELS, LOCATION_LABELS, CONTACT_LABELS, STATUS_LABELS, SETTING_LABELS, TYPE_LABELS,
  parseNote, bookingType, statusClass, serviceClass, locationIcon, contactIcon, contactClass,
} from '@/constants/booking.js'

const router = useRouter()
const notify = useNotify()

const bookings = ref([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const filterService = ref('')
const filterDate = ref('')

function openDetail(bk) {
  router.push({ name: 'BookingDetail', params: { id: bk.id } })
}

const stats = computed(() => [
  { label: 'Tổng', value: total.value, color: 'text-on-surface' },
  { label: 'Chờ xác nhận', value: bookings.value.filter(b => b.status === 'pending').length, color: 'text-yellow-600' },
  { label: 'Đã xác nhận', value: bookings.value.filter(b => b.status === 'confirmed').length, color: 'text-blue-600' },
  { label: 'Hoàn thành', value: bookings.value.filter(b => b.status === 'completed').length, color: 'text-green-600' },
])

// One-line summary of business-only note markers (participants/setting/role).
function bizExtras(note) {
  const p = parseNote(note)
  const parts = []
  if (p.participants) parts.push(`${p.participants} người`)
  if (p.setting) parts.push(SETTING_LABELS[p.setting] || p.setting)
  if (p.role) parts.push(p.role)
  return parts.join(' · ')
}

async function loadBookings() {
  loading.value = true
  try {
    const data = await fetchBookings({
      status: filterStatus.value,
      date: filterDate.value,
      service: filterService.value,
    })
    bookings.value = data.bookings || []
    total.value = data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function updateStatus(id, status) {
  if (!status) return
  try {
    await updateBookingStatus(id, status)
    notify.success('toast.bookingUpdated')
    loadBookings()
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  }
}

async function removeBooking(id) {
  if (!confirm('Xoá lịch hẹn này?')) return
  try {
    await deleteBooking(id)
    notify.success('toast.bookingDeleted')
    loadBookings()
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  }
}

function applyFilters() { loadBookings() }
function resetFilters() {
  filterStatus.value = ''
  filterService.value = ''
  filterDate.value = ''
  loadBookings()
}

onMounted(() => loadBookings())
</script>
