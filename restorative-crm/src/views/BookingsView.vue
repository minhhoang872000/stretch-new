<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
      <div>
        <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Booking Management</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">All Bookings</h1>
        <p class="text-on-surface-variant mt-1.5 text-sm">{{ total }} bookings — manage, confirm, track.</p>
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
      <Dropdown
        v-model="filterStatus"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="All Status"
        class="p-dropdown-sm text-sm w-44 bg-surface border-outline-variant/20 rounded-lg"
        @change="applyFilters"
      />

      <Calendar
        v-model="filterDate"
        dateFormat="yy-mm-dd"
        dataType="string"
        showIcon
        placeholder="Select Date"
        class="p-calendar-sm text-sm w-44 bg-surface border-outline-variant/20 rounded-lg"
        @date-select="applyFilters"
        @clear-click="applyFilters"
        showButtonBar
      />

      <button @click="resetFilters" class="text-xs text-on-surface-variant hover:text-primary font-semibold ml-auto flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">filter_alt_off</span> Clear
      </button>
      <button @click="loadBookings" class="text-xs text-primary font-semibold flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">refresh</span> Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <!-- Table -->
    <div v-else class="bg-surface-container-low rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-outline-variant/20 text-left">
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Customer</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Contact</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Service</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Date / Time</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant">Status</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Lead</th>
            <th class="p-4 font-semibold text-xs uppercase tracking-wider text-on-surface-variant w-10"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bk in bookings" :key="bk.id" class="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors group">
            <td class="p-4">
              <p class="font-semibold text-on-surface">{{ bk.name }}</p>
              <p v-if="bk.note" class="text-xs text-on-surface-variant mt-0.5 truncate max-w-[160px]">{{ bk.note }}</p>
            </td>
            <td class="p-4 hidden md:table-cell">
              <p class="text-xs text-on-surface">{{ bk.phone }}</p>
              <p v-if="bk.email" class="text-xs text-on-surface-variant">{{ bk.email }}</p>
            </td>
            <td class="p-4">
              <span class="text-xs font-mono text-on-surface-variant">{{ bk.service }}</span>
            </td>
            <td class="p-4">
              <p class="text-xs font-semibold text-on-surface">{{ bk.date }}</p>
              <p class="text-xs text-on-surface-variant">{{ bk.time }}</p>
            </td>
            <td class="p-4">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="statusClass(bk.status)">{{ bk.status }}</span>
            </td>
            <td class="p-4 hidden lg:table-cell">
              <router-link v-if="bk.session_id" :to="`/leads/${bk.session_id}`" class="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">person_search</span> Lead
              </router-link>
              <span v-else class="text-on-surface-variant/40 text-xs">—</span>
            </td>
            <td class="p-4">
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <select @change="(e) => updateStatus(bk.id, e.target.value)" class="text-[11px] rounded-lg border border-outline-variant/20 px-1.5 py-1 bg-surface">
                  <option value="">↻</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirm</option>
                  <option value="completed">Complete</option>
                  <option value="cancelled">Cancel</option>
                </select>
                <button @click="removeBooking(bk.id)" class="text-error/50 hover:text-error p-1" title="Delete">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!bookings.length">
            <td colspan="7" class="p-16 text-center">
              <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">event_busy</span>
              </div>
              <p class="text-on-surface-variant font-semibold">No bookings yet</p>
              <p class="text-xs text-on-surface-variant/60 mt-1">Bookings from your website will appear here.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchBookings, updateBookingStatus, deleteBooking } from '@/services/api.js'

const bookings = ref([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const filterDate = ref('')

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const stats = computed(() => [
  { label: 'Total', value: total.value, color: 'text-on-surface' },
  { label: 'Pending', value: bookings.value.filter(b => b.status === 'pending').length, color: 'text-yellow-600' },
  { label: 'Confirmed', value: bookings.value.filter(b => b.status === 'confirmed').length, color: 'text-blue-600' },
  { label: 'Completed', value: bookings.value.filter(b => b.status === 'completed').length, color: 'text-green-600' },
])

function statusClass(status) {
  return {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
    completed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-400 border border-red-200 line-through',
  }[status] || ''
}

async function loadBookings() {
  loading.value = true
  try {
    const data = await fetchBookings({ status: filterStatus.value, date: filterDate.value })
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
    loadBookings()
  } catch (e) {
    console.error(e)
  }
}

async function removeBooking(id) {
  if (!confirm('Delete this booking?')) return
  try {
    await deleteBooking(id)
    loadBookings()
  } catch (e) {
    console.error(e)
  }
}

function applyFilters() { loadBookings() }
function resetFilters() {
  filterStatus.value = ''
  filterDate.value = ''
  loadBookings()
}

onMounted(() => loadBookings())
</script>
