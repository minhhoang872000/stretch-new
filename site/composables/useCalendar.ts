interface CalendarDay {
  date: string // YYYY-MM-DD
  label: number // day of month
  disabled: boolean
  isToday: boolean
  isCurrentMonth: boolean
}

export function useCalendar() {
  const currentDate = ref(new Date())

  const currentYear = computed(() => currentDate.value.getFullYear())
  const currentMonth = computed(() => currentDate.value.getMonth())

  const currentMonthLabel = computed(() => {
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December',
    ]
    return `${months[currentMonth.value]} ${currentYear.value}`
  })

  const calendarDays = computed<CalendarDay[]>(() => {
    const year = currentYear.value
    const month = currentMonth.value
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const days: CalendarDay[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i
      const d = new Date(year, month - 1, dayNum)
      days.push({
        date: formatDate(d),
        label: dayNum,
        disabled: true,
        isToday: false,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day)
      const isPast = d < today
      days.push({
        date: formatDate(d),
        label: day,
        disabled: isPast,
        isToday: d.getTime() === today.getTime(),
        isCurrentMonth: true,
      })
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({
        date: formatDate(d),
        label: i,
        disabled: true,
        isToday: false,
        isCurrentMonth: false,
      })
    }

    return days
  })

  function prevMonth() {
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() - 1)
    currentDate.value = d
  }

  function nextMonth() {
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() + 1)
    currentDate.value = d
  }

  function formatDate(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    currentDate,
    currentYear,
    currentMonth,
    currentMonthLabel,
    calendarDays,
    prevMonth,
    nextMonth,
    formatDate,
  }
}
