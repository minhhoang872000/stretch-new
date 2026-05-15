<script setup lang="ts">
const props = defineProps<{
  serviceId: string
  practitionerId: string | null
  date: string
  time: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { submit, loading, success, error } = useBooking()
const { trackFormSource } = useTracking()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  note: '',
})

const formErrors = reactive({
  firstName: '',
  phone: '',
})

const { t } = useI18n()

function validate(): boolean {
  let valid = true
  formErrors.firstName = ''
  formErrors.phone = ''

  if (!form.firstName.trim()) {
    formErrors.firstName = t('booking.errorName')
    valid = false
  }
  if (!form.phone.trim() || form.phone.length < 9) {
    formErrors.phone = t('booking.errorPhone')
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  // Track form submission for lead attribution
  trackFormSource('booking-individual', props.serviceId)

  await submit({
    service: props.serviceId,
    practitioner: props.practitionerId,
    date: props.date,
    time: props.time,
    name: `${form.firstName} ${form.lastName}`.trim(),
    phone: form.phone,
    email: form.email || undefined,
    note: form.note || undefined,
  })
}

const formattedDate = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date)
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <!-- Success State -->
  <BookingConfirmModal
    v-if="success"
    :date="formattedDate"
    :time="time"
    :service-id="serviceId"
  />

  <!-- Form -->
  <section v-else class="max-w-xl mx-auto bg-white rounded-3xl p-8 lg:p-12 shadow-card border border-border">
    <!-- Header -->
    <div class="text-center mb-10">
      <span class="badge-orange mb-3 inline-flex">
        {{ $t('bookingSection.step3') }}
      </span>
      <h2 class="text-2xl font-heading font-bold text-navy mt-1">{{ $t('booking.yourInfo') }}</h2>
    </div>

    <!-- Booking Summary -->
    <div class="mb-8 p-4 bg-off-white rounded-2xl flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm font-bold text-navy">
      <span class="flex items-center gap-2">
        <span class="material-symbols-outlined text-accent text-lg">event</span>
        {{ formattedDate }}
      </span>
      <span class="flex items-center gap-2">
        <span class="material-symbols-outlined text-accent text-lg">schedule</span>
        {{ time }}
      </span>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mb-6 p-4 bg-error-container text-error rounded-2xl text-xs font-bold flex items-center gap-3 border border-error/20"
    >
      <span class="material-symbols-outlined text-base">error</span>
      {{ error }}
    </div>

    <!-- Form Fields -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            v-model="form.firstName"
            type="text"
            :placeholder="$t('booking.firstName')"
            class="input-pill !text-sm"
            :class="formErrors.firstName ? 'border-error ring-1 ring-error/20' : ''"
          />
          <p v-if="formErrors.firstName" class="mt-1.5 text-[11px] text-error pl-4 font-bold uppercase tracking-wider">{{ formErrors.firstName }}</p>
        </div>
        <input
          v-model="form.lastName"
          type="text"
          :placeholder="$t('booking.lastName')"
          class="input-pill !text-sm"
        />
      </div>

      <input
        v-model="form.email"
        type="email"
        :placeholder="$t('booking.email')"
        class="input-pill !text-sm"
      />

      <div>
        <input
          v-model="form.phone"
          type="tel"
          :placeholder="$t('booking.phone')"
          class="input-pill !text-sm"
          :class="formErrors.phone ? 'border-error ring-1 ring-error/20' : ''"
        />
        <p v-if="formErrors.phone" class="mt-1.5 text-[11px] text-error pl-4 font-bold uppercase tracking-wider">{{ formErrors.phone }}</p>
      </div>

      <textarea
        v-model="form.note"
        :placeholder="$t('booking.note')"
        rows="3"
        class="input-pill !text-sm !rounded-2xl !py-4 resize-none"
      />

      <div class="pt-6 space-y-4">
        <button
          type="submit"
          class="w-full py-4 bg-navy text-white font-heading font-bold text-sm uppercase tracking-widest rounded-2xl
                 hover:bg-navy-soft transition-all
                 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center justify-center gap-3">
            <span class="material-symbols-outlined animate-spin !text-lg">progress_activity</span>
            {{ $t('booking.processing') }}
          </span>
          <span v-else>{{ $t('booking.confirmSession') }}</span>
        </button>

        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 text-text-secondary hover:text-navy transition-colors font-bold text-xs uppercase tracking-widest py-2"
          @click="emit('back')"
        >
          <span class="material-symbols-outlined !text-base">arrow_back</span>
          {{ $t('booking.backToSchedule') }}
        </button>
      </div>
    </form>
  </section>
</template>
