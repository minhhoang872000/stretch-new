<script setup lang="ts">
const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  (e: 'selectPractitioner', id: string): void
  (e: 'confirmDatetime', date: string, time: string): void
  (e: 'back'): void
}>()

// Calendar
const { currentMonthLabel, calendarDays, prevMonth, nextMonth } = useCalendar()

const selectedPractitioner = ref<string | null>('any') // Default to any
const selectedDate = ref('')
const selectedTime = ref('')

// Mock available time slots since API is not needed yet
const slots = computed(() => {
  if (!selectedDate.value) return []
  return [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', 
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', 
    '04:00 PM', '04:30 PM'
  ]
})
const loadingSlots = ref(false)

watch(selectedDate, () => {
  selectedTime.value = ''
})

function confirmStep() {
  if (!selectedDate.value || !selectedTime.value) return
  emit('confirmDatetime', selectedDate.value, selectedTime.value)
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
</script>

<template>
  <section class="max-w-xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-10">
      <span class="badge-navy mb-4 inline-flex uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded-full bg-navy/5 text-navy">
        {{ $t('bookingSection.step2') }}
      </span>
      <h2 class="text-2xl font-heading font-bold text-navy mt-2">{{ $t('bookingSection.step2Title') }}</h2>
    </div>

    <!-- Right Column: Calendar + Time Slots -->
    <div class="bg-white rounded-[40px] p-8 lg:p-10 border border-border shadow-card overflow-hidden">
      <!-- Calendar Header -->
      <div class="flex justify-between items-center mb-8">
        <h3 class="font-heading text-lg font-bold text-navy">{{ currentMonthLabel }}</h3>
        <div class="flex gap-2">
          <button
            class="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-off-white transition-colors"
            @click="prevMonth"
          >
            <span class="material-symbols-outlined !text-xl">chevron_left</span>
          </button>
          <button
            class="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-off-white transition-colors"
            @click="nextMonth"
          >
            <span class="material-symbols-outlined !text-xl">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Week Days Header -->
      <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-text-secondary/50 mb-4">
        <span v-for="d in weekDays" :key="d">{{ d }}</span>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1 text-center">
        <button
          v-for="day in calendarDays"
          :key="day.date"
          class="aspect-square flex items-center justify-center rounded-2xl text-sm transition-all duration-200"
          :class="{
            'opacity-10 cursor-not-allowed': day.disabled,
            'bg-navy text-white font-bold shadow-md': selectedDate === day.date && !day.disabled,
            'hover:bg-off-white hover:text-navy': !day.disabled && selectedDate !== day.date,
            'text-text-secondary/40': !day.isCurrentMonth && !day.disabled,
            'text-navy font-medium': day.isCurrentMonth && !day.disabled && selectedDate !== day.date
          }"
          :disabled="day.disabled"
          @click="selectedDate = day.date"
        >
          {{ day.label }}
        </button>
      </div>

      <!-- Time Slots -->
      <div v-if="selectedDate" class="mt-10 pt-10 border-t border-border">
        <h4 class="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Available Times</h4>
        <div v-if="loadingSlots" class="grid grid-cols-3 gap-3">
          <div v-for="i in 6" :key="i" class="h-10 bg-off-white animate-pulse rounded-full" />
        </div>

        <div v-else-if="slots && (slots as string[]).length > 0" class="grid grid-cols-3 gap-3">
          <button
            v-for="slot in (slots as string[])"
            :key="slot"
            class="py-2.5 rounded-full font-bold text-xs transition-all border"
            :class="selectedTime === slot
              ? 'bg-accent border-accent text-white shadow-sm'
              : 'border-border text-navy hover:border-navy hover:bg-navy/5'"
            @click="selectedTime = slot"
          >
            {{ slot }}
          </button>
        </div>

        <p v-else class="text-sm text-text-secondary py-4 text-center bg-off-white rounded-2xl">
          {{ $t('booking.noSlots') }}
        </p>
      </div>

      <!-- Continue Button -->
      <button
        class="mt-8 w-full py-4 bg-navy text-white font-heading font-bold text-sm uppercase tracking-widest rounded-2xl
               hover:bg-navy-soft transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!selectedDate || !selectedTime"
        @click="confirmStep"
      >
        {{ $t('booking.continue') }}
      </button>

      <!-- Back Button -->
      <button
        class="flex items-center justify-center gap-2 text-text-secondary hover:text-navy transition-colors font-bold text-xs uppercase tracking-widest mt-6 w-full"
        @click="emit('back')"
      >
        <span class="material-symbols-outlined !text-base">arrow_back</span>
        {{ $t('booking.backToServices') }}
      </button>
    </div>
  </section>
</template>
