import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBookings } from '@/services/api.js'

// Local YYYY-MM-DD key used to match bookings to calendar cells across views.
export function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function transformBooking(booking) {
  const dateObj = new Date(booking.date)
  const dateValue = dateObj.getDate()
  const [hours, minutes] = booking.time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const displayTime = `${booking.time} - ${booking.service.substring(0, 6)}...`

  const statusColors = {
    'pending': { color: 'bg-tertiary-fixed/30', textColor: 'text-tertiary', border: 'border-tertiary/20' },
    'confirmed': { color: 'bg-primary-fixed/30', textColor: 'text-primary-fixed-variant', border: 'border-primary/20' },
    'completed': { color: 'bg-primary', textColor: 'text-on-primary', border: 'border-transparent' },
    'cancelled': { color: 'bg-error/20', textColor: 'text-error', border: 'border-error/20' },
  }

  const colors = statusColors[booking.status] || statusColors.pending

  return {
    id: booking.id,
    patientName: booking.name,
    service: booking.service,
    provider: booking.practitioner || 'N/A',
    duration: '60 Min',
    dateValue,
    dateKey: dayKey(dateObj),
    time: booking.time,
    displayTime,
    dateStr: `${dayKey(dateObj)} ${hour12}:${minutes} ${ampm}`,
    phone: booking.phone,
    email: booking.email,
    notes: booking.note || '',
    status: booking.status,
    patientId: `ID: ${booking.id}`,
    ...colors,
  }
}

export const useCalendarStore = defineStore('calendar', () => {
  const bookings = ref([])
  const currentDate = ref(new Date())
  const selectedDate = ref(new Date())   // full Date of the currently selected day
  const selectedAppointment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Active calendar view: 'month' | 'week' | 'day'
  const view = ref('month')

  // Service filter (empty string = "All")
  const filterService = ref('')

  // Unique, sorted service list derived from the loaded bookings.
  const services = computed(() =>
    [...new Set(bookings.value.map(b => b.service).filter(Boolean))].sort()
  )

  // Bookings after applying the service filter.
  const visibleBookings = computed(() =>
    bookings.value.filter(b => !filterService.value || b.service === filterService.value)
  )

  const upcomingBookings = computed(() =>
    visibleBookings.value.filter(b => b.status === 'confirmed' || b.status === 'pending')
  )

  // Bookings grouped by YYYY-MM-DD key.
  const bookingsByDate = computed(() => {
    const map = {}
    visibleBookings.value.forEach(b => {
      if (!map[b.dateKey]) map[b.dateKey] = []
      map[b.dateKey].push(b)
    })
    return map
  })

  // The seven dates (Sun…Sat) of the week containing currentDate.
  const weekDates = computed(() => {
    const start = new Date(currentDate.value)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  })

  // Bookings for a given date (sorted by time), used by week/day views.
  function bookingsForDate(date) {
    return (bookingsByDate.value[dayKey(date)] || [])
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  async function loadBookings(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchBookings(filters)
      bookings.value = data.bookings.map(transformBooking)
      if (bookings.value.length > 0 && !selectedAppointment.value) {
        selectedAppointment.value = bookings.value[0]
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load bookings:', err)
    } finally {
      loading.value = false
    }
  }

  function setView(v) {
    view.value = v
  }

  // Step the calendar back/forward by one unit of the active view.
  function step(dir) {
    const d = new Date(currentDate.value)
    if (view.value === 'month') d.setMonth(d.getMonth() + dir)
    else if (view.value === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    currentDate.value = d
    if (view.value !== 'month') selectedDate.value = d
  }
  const prev = () => step(-1)
  const next = () => step(1)

  function selectAppointment(appointment) {
    selectedAppointment.value = appointment
  }

  function selectDate(date) {
    const d = new Date(date)
    selectedDate.value = d
    const dayBookings = bookingsByDate.value[dayKey(d)]
    if (dayBookings && dayBookings.length > 0) {
      selectedAppointment.value = dayBookings[0]
    }
  }

  return {
    bookings, currentDate, selectedDate, selectedAppointment,
    upcomingBookings, bookingsByDate, loading, error,
    view, filterService, services, visibleBookings, weekDates,
    loadBookings, setView, prev, next, selectAppointment, selectDate, bookingsForDate,
  }
})
