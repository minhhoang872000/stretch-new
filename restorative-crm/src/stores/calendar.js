import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBookings } from '@/services/api.js'

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
    time: booking.time,
    displayTime,
    dateStr: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${hour12}:${minutes} ${ampm}`,
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
  const selectedDate = ref(new Date().getDate())
  const selectedAppointment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const upcomingBookings = computed(() => {
    return bookings.value.filter(b => b.status === 'confirmed' || b.status === 'pending')
  })

  const bookingsByDate = computed(() => {
    const map = {}
    bookings.value.forEach(b => {
      const key = b.dateValue
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  })

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

  function selectAppointment(appointment) {
    selectedAppointment.value = appointment
  }

  function selectDate(dateValue) {
    selectedDate.value = dateValue
    const dayBookings = bookingsByDate.value[dateValue]
    if (dayBookings && dayBookings.length > 0) {
      selectedAppointment.value = dayBookings[0]
    }
  }

  return { 
    bookings, currentDate, selectedDate, selectedAppointment, 
    upcomingBookings, bookingsByDate, loading, error,
    loadBookings, selectAppointment, selectDate
  }
})
