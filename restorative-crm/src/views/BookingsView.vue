<template>
  <main class="page">
    <PageHeader
      eyebrow="Trị liệu"
      title="Lịch hẹn"
      :subtitle="`${total} lịch hẹn — xác nhận, theo dõi, cập nhật trạng thái.`"
    >
      <template #actions>
        <RouterLink to="/calendar" class="btn-outline btn-sm">
          <span class="material-symbols-outlined text-lg">calendar_month</span>
          Xem lịch tuần
        </RouterLink>
        <button type="button" class="btn-ghost btn-sm" @click="loadBookings">
          <span class="material-symbols-outlined text-lg">refresh</span>
          Làm mới
        </button>
      </template>
    </PageHeader>

    <p
      v-if="usingMock"
      class="panel-quiet px-3 py-2.5 mb-3 flex items-start gap-2 text-xs text-ink-2"
    >
      <span class="material-symbols-outlined text-base text-warn shrink-0">science</span>
      API lịch hẹn không phản hồi nên trang đang hiển thị dữ liệu mẫu. Thao tác xác nhận hoặc xoá
      sẽ không gửi được lên server.
    </p>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div v-for="s in stats" :key="s.label" class="panel px-3.5 py-3">
        <p class="text-xs text-on-surface-variant uppercase tracking-wider">{{ s.label }}</p>
        <p class="text-2xl font-bold mt-1" :class="s.color">{{ s.value }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="panel px-3 py-2.5 mb-3 flex flex-wrap gap-2 items-center">
      <select
        v-model="filterStatus"
        @change="applyFilters"
        class="select w-40"
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
        class="select w-48"
      >
        <option value="">Tất cả dịch vụ</option>
        <option v-for="(label, key) in SERVICE_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>

      <input
        v-model="filterDate"
        type="date"
        @change="applyFilters"
        class="select w-44"
      />

      <button type="button" class="btn-ghost btn-sm ml-auto" @click="resetFilters">
        <span class="material-symbols-outlined text-base">filter_alt_off</span>
        Xoá lọc
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <!-- Table -->
    <div v-else class="panel overflow-x-auto">
      <table class="tbl tbl-rows min-w-[900px]">
        <thead>
          <tr class="border-b border-outline-variant/20 text-left">
            <th>Khách hàng</th>
            <th>Dịch vụ</th>
            <th>Địa điểm</th>
            <th>Thời gian</th>
            <th>Liên hệ</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th class="w-8"></th>
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
            <td>
              <div class="flex items-center gap-1.5">
                <p class="font-semibold text-on-surface">{{ bk.name }}</p>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0"
                  :class="bookingType(parseNote(bk.note)) === 'business' ? 'bg-info-soft text-info' : 'bg-primary/10 text-primary'"
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
            <td>
              <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="serviceClass(bk.service)">
                {{ SERVICE_LABELS[bk.service] || bk.service }}
              </span>
            </td>

            <!-- Địa điểm -->
            <td>
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
            <td>
              <p class="text-xs font-semibold text-on-surface">{{ formatDate(bk.date) }}</p>
              <p class="text-xs text-on-surface-variant">{{ bk.time }}</p>
              <p v-if="bk.createdAt" class="text-[10px] text-on-surface-variant/50 mt-0.5">Đặt: {{ formatDate(bk.createdAt?.slice(0,10)) }}</p>
            </td>

            <!-- Liên hệ qua -->
            <td>
              <template v-if="parseNote(bk.note).contact">
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" :class="contactClass(parseNote(bk.note).contact)">
                  <span class="material-symbols-outlined text-xs">{{ contactIcon(parseNote(bk.note).contact) }}</span>
                  {{ CONTACT_LABELS[parseNote(bk.note).contact] || parseNote(bk.note).contact }}
                </span>
              </template>
              <span v-else class="text-on-surface-variant/30 text-xs">—</span>
            </td>

            <!-- Ghi chú -->
            <td class="max-w-[180px]">
              <p v-if="parseNote(bk.note).text" class="text-xs text-on-surface-variant truncate" :title="parseNote(bk.note).text">
                {{ parseNote(bk.note).text }}
              </p>
              <p v-if="bizExtras(bk.note)" class="text-[10px] text-on-surface-variant/60 truncate mt-0.5" :title="bizExtras(bk.note)">
                {{ bizExtras(bk.note) }}
              </p>
              <span v-if="!parseNote(bk.note).text && !bizExtras(bk.note)" class="text-on-surface-variant/30 text-xs">—</span>
            </td>

            <!-- Trạng thái -->
            <td>
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
                <button @click="askRemove(bk)" class="text-error/50 hover:text-error p-1" title="Xoá lịch hẹn" aria-label="Xoá lịch hẹn">
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

    <ConfirmDialog
      v-model:open="confirmOpen"
      danger
      icon="delete"
      title="Xoá lịch hẹn này?"
      :message="deleteMessage"
      confirm-label="Xoá lịch hẹn"
      @confirm="removeBooking(pendingDelete.id)"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchBookings, updateBookingStatus, deleteBooking } from '@/services/api.js'
import { formatDate } from '@/utils/date.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useMockDb } from '@/stores/db.js'
import {
  SERVICE_LABELS, LOCATION_LABELS, CONTACT_LABELS, STATUS_LABELS, SETTING_LABELS, TYPE_LABELS,
  parseNote, bookingType, statusClass, serviceClass, locationIcon, contactIcon, contactClass,
} from '@/constants/booking.js'

const router = useRouter()
const db = useMockDb()
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
  { label: 'Tổng', value: total.value, color: 'text-ink' },
  { label: 'Chờ xác nhận', value: bookings.value.filter(b => b.status === 'pending').length, color: 'text-warn' },
  { label: 'Đã xác nhận', value: bookings.value.filter(b => b.status === 'confirmed').length, color: 'text-info' },
  { label: 'Hoàn thành', value: bookings.value.filter(b => b.status === 'completed').length, color: 'text-ok' },
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

/**
 * The API stays the source of truth. When it cannot be reached the screen falls
 * back to the mock dataset instead of showing an empty table — otherwise the
 * dashboard counts lịch hẹn the list claims do not exist.
 */
const usingMock = ref(false)

function loadFromMock() {
  const rows = db.list('bookings').filter((b) => {
    if (filterStatus.value && b.status !== filterStatus.value) return false
    if (filterService.value && b.service !== filterService.value) return false
    if (filterDate.value && b.date !== filterDate.value) return false
    return true
  })
  bookings.value = rows
  total.value = rows.length
  usingMock.value = true
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
    usingMock.value = false
  } catch (e) {
    console.error(e)
    loadFromMock()
  } finally {
    loading.value = false
  }
}

async function updateStatus(id, status) {
  if (!status) return
  // On mock data the write goes to the mock DB, so the demo stays coherent
  // instead of showing an error for every action.
  if (usingMock.value) {
    db.patch('bookings', id, { status })
    loadFromMock()
    notify.success('toast.bookingUpdated')
    return
  }
  try {
    await updateBookingStatus(id, status)
    notify.success('toast.bookingUpdated')
    loadBookings()
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  }
}

/** Deleting a booking is irreversible, so it goes through a real dialog that
    can name the customer and slot being removed. */
const pendingDelete = ref(null)
const confirmOpen = ref(false)

const deleteMessage = computed(() => {
  const bk = pendingDelete.value
  if (!bk) return ''
  const service = SERVICE_LABELS[bk.service] || bk.service
  return `${bk.name} — ${service}, ${bk.time} ngày ${formatDate(bk.date)}. `
    + 'Khách không nhận được thông báo tự động khi xoá.'
})

function askRemove(booking) {
  pendingDelete.value = booking
  confirmOpen.value = true
}

async function removeBooking(id) {
  if (usingMock.value) {
    db.remove('bookings', id)
    loadFromMock()
    notify.success('toast.bookingDeleted')
    return
  }
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
