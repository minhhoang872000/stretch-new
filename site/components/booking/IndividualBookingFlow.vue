<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import BookingStepHeader from '~/components/booking/BookingStepHeader.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import CustomCheckbox from '~/components/CustomCheckbox.vue'

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { t, locale } = useI18n()
const { trackFormSource } = useTracking()
const { submit, loading: apiLoading, success: apiSuccess, error: apiError } = useBooking()
const localePath = useLocalePath()
const currentStep = ref(1)
const isSubmitting = ref(false)
const showSuccess = ref(false)

const stepLabels = computed(() => [
  locale.value === 'vi' ? 'Dịch vụ' : 'Service',
  locale.value === 'vi' ? 'Thời gian & Địa điểm' : 'Time & Location',
  locale.value === 'vi' ? 'Thông tin liên hệ' : 'Contact Info'
])

// Form State
const form = ref({
  issue: '',
  location: '',
  date: null as Date | null,
  time: '',
  fullName: '',
  phone: '',
  email: '',
  contactPref: 'zalo',
  note: '',
  consent: false
})

// Validation Rules
const rules = computed(() => ({
  fullName: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập họ và tên' : 'Please enter your full name', 
      required
    ), 
    minLength: minLength(2) 
  },
  phone: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập số điện thoại' : 'Please enter your phone number', 
      required
    ),
    valid: helpers.withMessage(
      locale.value === 'vi' ? 'Số điện thoại không hợp lệ' : 'Invalid phone number', 
      (value: string) => /^[0-9+ ]{10,15}$/.test(value)
    )
  },
  consent: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng đồng ý với điều khoản' : 'Please agree to the terms', 
      (val: boolean) => val === true
    ) 
  },
  date: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng chọn ngày' : 'Please select a date', 
      required
    ) 
  },
  time: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng chọn giờ' : 'Please select a time', 
      required
    ) 
  },
  email: { 
    email: helpers.withMessage(
      locale.value === 'vi' ? 'Email không hợp lệ' : 'Invalid email address', 
      email
    ) 
  }
}))

const v$ = useVuelidate(rules, form)

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

function formatDate(date: Date | null) {
  if (!date) return ''
  return date.toLocaleDateString('vi-VN')
}

const issues = computed(() => [
  { id: 'recovery', icon: 'exercise', title: t('booking_v2.individual.issue_recovery'), desc: t('booking_v2.individual.issue_recovery_desc') },
  { id: 'pain', icon: 'personal_injury', title: t('booking_v2.individual.issue_pain'), desc: t('booking_v2.individual.issue_pain_desc') },
  { id: 'stiffness', icon: 'self_improvement', title: t('booking_v2.individual.issue_stiffness'), desc: t('booking_v2.individual.issue_stiffness_desc') },
  { id: 'not_sure', icon: 'help', title: t('booking_v2.individual.issue_not_sure'), desc: t('booking_v2.individual.issue_not_sure_desc') },
])

const locations = computed(() => [
  { id: 'home', icon: 'home', title: t('booking_v2.individual.loc_home'), desc: t('booking_v2.individual.loc_home_desc') },
  { id: 'clinic', icon: 'apartment', title: t('booking_v2.individual.loc_clinic'), desc: t('booking_v2.individual.loc_clinic_desc') },
  { id: 'consult', icon: 'chat', title: t('booking_v2.individual.loc_consult'), desc: t('booking_v2.individual.loc_consult_desc') },
])

async function nextStep() {
  if (currentStep.value === 1) {
    // Step 1: chỉ block nút nếu chưa chọn issue, không cần validation message
    if (!form.value.issue) return
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } else if (currentStep.value === 2) {
    // Step 2: touch từng field rồi kiểm tra lỗi
    v$.value.date.$touch()
    v$.value.time.$touch()
    if (v$.value.date.$error || v$.value.time.$error) return
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } else if (currentStep.value === 3) {
    // Step 3: touch từng field rồi kiểm tra lỗi
    // KHÔNG dùng v$.$validate() vì nó validate toàn bộ form (kể cả step 1,2)
    // và sẽ return false nếu bất kỳ field nào chưa được touch trước đó
    v$.value.fullName.$touch()
    v$.value.phone.$touch()
    v$.value.email.$touch()
    v$.value.consent.$touch()
    if (
      v$.value.fullName.$error ||
      v$.value.phone.$error ||
      v$.value.email.$error ||
      v$.value.consent.$error
    ) return
    submitBooking()
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    emit('back')
  }
}

async function submitBooking() {
  isSubmitting.value = true

  // Track form submission for lead attribution
  trackFormSource('booking-individual-v2', form.value.issue)

  // Format date
  const dateStr = form.value.date
    ? new Date(form.value.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  // Build note with extra info
  const extraInfo = [
    form.value.location ? `Location: ${form.value.location}` : '',
    form.value.contactPref ? `Contact: ${form.value.contactPref}` : '',
  ].filter(Boolean).join(' | ')
  const fullNote = [form.value.note, extraInfo].filter(Boolean).join('\n')

  await submit({
    service: form.value.issue,
    practitioner: null,
    date: dateStr,
    time: form.value.time || '09:00',
    name: form.value.fullName,
    phone: form.value.phone,
    email: form.value.email || '',
    note: fullNote || '',
  })

  isSubmitting.value = false

  if (apiError.value) {
    return
  }

  showSuccess.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="section-container pt-12 pb-24">
    <!-- Success View -->
    <div v-if="showSuccess" class="max-w-xl mx-auto animate-fade-in text-center">
      <div class="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-8 success-icon-anim">
        <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 class="text-h2 text-navy mb-4">{{ t('booking_v2.success.thanks') }}</h2>
      <p class="text-text-secondary mb-8">{{ t('booking_v2.success.contact_soon') }}</p>
      
      <div class="card p-8 text-left mb-8">
        <h4 class="font-bold text-navy mb-6 border-b pb-4">{{ t('booking_v2.success.summary_title') }}</h4>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-text-secondary text-sm">{{ t('booking_v2.success.summary_issue') }}</span>
            <span class="font-semibold text-navy">{{ issues.find(i => i.id === form.issue)?.title }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-secondary text-sm">{{ t('booking_v2.success.summary_loc') }}</span>
            <span class="font-semibold text-navy">{{ locations.find(l => l.id === form.location)?.title }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-secondary text-sm">{{ t('booking_v2.success.summary_time') }}</span>
            <span class="font-semibold text-navy">{{ formatDate(form.date) }} – {{ form.time }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-secondary text-sm">{{ t('booking_v2.success.summary_contact') }}</span>
            <span class="font-semibold text-navy">{{ form.fullName }} – {{ form.phone }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <a href="https://zalo.me/4237229823551208502" target="_blank" class="btn-navy justify-center gap-3">
          <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" class="w-5 h-5" format="webp" />
          {{ t('booking_v2.success.chat_zalo') }}
        </a>
        <button class="btn-outline justify-center gap-3">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {{ t('booking_v2.success.call_stretch') }}
        </button>
        <NuxtLink :to="localePath('/')" class="text-accent font-bold mt-4 block hover:underline">
          {{ t('booking_v2.success.back_home') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Multi-step Form -->
    <div v-else class="max-w-5xl mx-auto">
      <BookingStepHeader :current-step="currentStep" :total-steps="3" :step-labels="stepLabels" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Main Form Area -->
        <div class="lg:col-span-8">
          <Transition name="page" mode="out-in">
            <!-- Step 1: Issues -->
            <div v-if="currentStep === 1" key="step1" class="animate-fade-in">
              <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.individual.step1_title') }}</h2>
              <p class="text-text-secondary mb-10">{{ t('booking_v2.individual.step1_subtitle') }}</p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  v-for="item in issues" 
                  :key="item.id"
                  @click="form.issue = item.id"
                  class="card p-6 flex flex-col items-start gap-4 cursor-pointer transition-all duration-300 relative group"
                  :class="form.issue === item.id ? 'border-accent ring-1 ring-accent bg-accent/[0.02]' : 'hover:border-navy/20'"
                >
                  <div class="w-12 h-12 rounded-xl bg-off-white text-navy flex items-center justify-center flex-shrink-0 transition-colors"
                       :class="form.issue === item.id ? 'bg-accent/10 text-accent' : 'group-hover:bg-navy group-hover:text-white'">
                    <svg v-if="item.id === 'recovery'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="18" cy="5" r="1" />
                      <path d="M4 14h6v-3L6 8.5M16 11V8h-3v3M12 15v5M16 16v4" />
                    </svg>
                    <svg v-else-if="item.id === 'pain'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" transform="rotate(-45 12 12)" />
                      <path d="M10 8.5l5.5 5.5" />
                      <path d="M8.5 10l5.5 5.5" />
                    </svg>
                    <svg v-else-if="item.id === 'stiffness'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                    </svg>
                    <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-navy mb-1">{{ item.title }}</h4>
                    <p class="text-xs text-text-secondary leading-relaxed">{{ item.desc }}</p>
                  </div>
                  <div v-if="form.issue === item.id" class="absolute top-4 right-4 text-accent">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Location & Time -->
            <div v-else-if="currentStep === 2" key="step2" class="animate-fade-in">
              <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.individual.step2_title') }}</h2>
              <p class="text-text-secondary mb-10">{{ t('booking_v2.individual.step2_subtitle') }}</p>

              <div class="space-y-8">
                <!-- Location Selection -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    v-for="item in locations" 
                    :key="item.id"
                    @click="form.location = item.id"
                    class="card p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 relative group"
                    :class="form.location === item.id ? 'border-accent ring-1 ring-accent bg-accent/[0.02]' : 'hover:border-navy/20'"
                  >
                    <div class="w-12 h-12 rounded-xl bg-off-white text-navy flex items-center justify-center mb-3 transition-colors flex-shrink-0"
                         :class="form.location === item.id ? 'bg-accent/10 text-accent' : 'group-hover:bg-navy group-hover:text-white'">
                      <svg v-if="item.id === 'home'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <svg v-else-if="item.id === 'clinic'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
                        <line x1="9" y1="22" x2="9" y2="16" />
                        <line x1="15" y1="22" x2="15" y2="16" />
                        <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6z" />
                      </svg>
                      <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h4 class="font-bold text-navy text-sm mb-1">{{ item.title }}</h4>
                    <p class="text-[10px] text-text-secondary">{{ item.desc }}</p>
                    <div v-if="form.location === item.id" class="absolute top-2 right-2 text-accent">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Date & Time Picker using PrimeVue -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.date_label') }}</label>
                    <Calendar 
                      v-model="form.date" 
                      dateFormat="dd/mm/yy" 
                      :minDate="new Date()"
                      showIcon 
                      fluid
                      :class="{ 'p-invalid': v$.date.$error }"
                    />
                    <span v-if="v$.date.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.date.$errors[0].$message }}</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.time_label') }}</label>
                    <CustomSelect 
                      v-model="form.time" 
                      :options="timeSlots" 
                      :placeholder="locale === 'vi' ? 'Chọn giờ' : 'Choose time'"
                      :error="v$.time.$error"
                    />
                    <span v-if="v$.time.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.time.$errors[0].$message }}</span>
                  </div>
                </div>

                <!-- Add Note -->
                <div>
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider mb-3">{{ t('booking_v2.individual.note_optional') }}</label>
                  <Textarea 
                    v-model="form.note" 
                    rows="10" 
                    autoResize
                    fluid
                    :placeholder="t('booking_v2.individual.note_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Contact Info -->
            <div v-else-if="currentStep === 3" key="step3" class="animate-fade-in">
              <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.individual.step3_title') }}</h2>
              <p class="text-text-secondary mb-10">{{ t('booking_v2.individual.step3_subtitle') }}</p>

              <div class="space-y-6">
                <div class="flex flex-col gap-2">
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.full_name') }}</label>
                  <InputText v-model="form.fullName" :class="{'p-invalid': v$.fullName.$error}" :placeholder="locale === 'vi' ? 'Nhập họ và tên' : 'Enter full name'" fluid />
                  <span v-if="v$.fullName.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.fullName.$errors[0].$message }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.phone_zalo') }}</label>
                  <InputText v-model="form.phone" :class="{'p-invalid': v$.phone.$error}" :placeholder="locale === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'" fluid />
                  <span v-if="v$.phone.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.phone.$errors[0].$message }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.email_optional') }}</label>
                  <InputText v-model="form.email" :class="{'p-invalid': v$.email.$error}" placeholder="you@example.com" fluid />
                  <span v-if="v$.email.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.email.$errors[0].$message }}</span>
                </div>

                <!-- Contact Preference -->
                <div>
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider mb-3">{{ t('booking_v2.individual.contact_pref') }}</label>
                  <div class="flex flex-wrap gap-8">
                    <div 
                      v-for="pref in [
                        { id: 'call', label: t('booking_v2.individual.pref_call') },
                        { id: 'zalo', label: t('booking_v2.individual.pref_zalo') },
                        { id: 'email', label: t('booking_v2.individual.pref_email') }
                      ]" 
                      :key="pref.id"
                      class="flex items-center gap-3 cursor-pointer group"
                      @click="form.contactPref = pref.id"
                    >
                      <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                           :class="form.contactPref === pref.id ? 'border-accent bg-accent' : 'border-border group-hover:border-navy-soft'">
                        <div v-if="form.contactPref === pref.id" class="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <span class="text-sm font-medium transition-colors" :class="form.contactPref === pref.id ? 'text-navy' : 'text-text-secondary group-hover:text-navy'">
                        {{ pref.label }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Privacy Consent -->
                <div class="pt-4">
                  <CustomCheckbox 
                    v-model="form.consent" 
                    :label="t('booking_v2.individual.privacy_consent')"
                    :error="v$.consent.$error"
                  />
                  <span v-if="v$.consent.$error" class="text-[10px] text-red-500 font-bold mt-2 block uppercase">{{ v$.consent.$errors[0].$message }}</span>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Navigation Buttons -->
          <!--
            QUAN TRỌNG: Không đặt điều kiện step 2 và 3 vào :disabled
            Lý do: nếu disabled thì @click không được gọi → nextStep() không chạy
            → $touch() không được gọi → error message không hiện ra
            Chỉ disable ở step 1 (chưa chọn issue) vì step 1 không có error message
          -->
          <div class="flex items-center gap-4 mt-12 pt-8 border-t">
            <button 
              @click="prevStep"
              class="btn-outline px-10"
            >
              {{ t('booking_v2.common.back') }}
            </button>
            <button 
              @click="nextStep"
              class="btn-navy flex-1 justify-center py-4"
              :disabled="isSubmitting || (currentStep === 1 && !form.issue)"
            >
              <template v-if="isSubmitting">
                <span class="animate-spin mr-2">⟳</span>
                {{ t('booking.processing') }}
              </template>
              <template v-else>
                {{ currentStep === 3 ? t('booking_v2.individual.confirm_booking') : t('booking_v2.common.next') }}
              </template>
            </button>
          </div>
        </div>

        <!-- Sidebar Summary -->
        <div class="lg:col-span-4">
          <div class="sticky top-32">
            <div class="card p-6 bg-off-white/50 border-dashed">
              <h4 class="font-bold text-navy mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h8M8 18h5" />
                </svg>
                {{ locale === 'vi' ? 'Chi tiết đặt lịch' : 'Booking Details' }}
              </h4>
              <div class="space-y-6">
                <div v-if="form.issue" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{{ locale === 'vi' ? 'Dịch vụ' : 'Service' }}</p>
                  <p class="text-sm font-bold text-navy">{{ issues.find(i => i.id === form.issue)?.title }}</p>
                </div>
                <div v-if="form.location" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{{ locale === 'vi' ? 'Địa điểm' : 'Location' }}</p>
                  <p class="text-sm font-bold text-navy">{{ locations.find(l => l.id === form.location)?.title }}</p>
                </div>
                <div v-if="form.date || form.time" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{{ locale === 'vi' ? 'Thời gian' : 'Time' }}</p>
                  <p class="text-sm font-bold text-navy">
                    {{ formatDate(form.date) }} <span v-if="form.date && form.time">@</span> {{ form.time }}
                  </p>
                </div>
              </div>

              <div v-if="!form.issue" class="py-8 text-center animate-pulse flex flex-col items-center text-text-secondary/30">
                <svg class="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p class="text-xs text-[#475569]/80 font-medium leading-relaxed px-4">{{ locale === 'vi' ? 'Chưa chọn gói — hãy bấm vào gói dịch vụ bên trên' : 'No plan selected — tap a service package above' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-icon-anim {
  animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

/* ── PrimeVue Overrides for Premium Look ── */

/*
 * IMPORTANT: PrimeVue uses `.p-inputtext` for BOTH standalone InputText
 * AND the inner <input> inside Calendar/Dropdown. We must style them differently:
 *  - Standalone .p-inputtext → full pill styling (border, bg, height)
 *  - .p-calendar .p-inputtext → transparent, no border (wrapper has the border)
 *  - .p-dropdown .p-dropdown-label → transparent, no border (wrapper has the border)
 */

/* ── Standalone InputText & Textarea ── */
:deep(.p-inputtext) {
  width: 100% !important;
  height: 3.5rem !important;
  padding: 0 1.5rem !important;
  border-radius: 12px !important;
  background-color: var(--color-off-white) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-navy) !important;
  font-family: var(--font-body) !important;
  font-size: 1rem !important;
  transition: all 0.2s ease !important;
  box-shadow: none !important;
}
:deep(.p-inputtext:hover) {
  border-color: var(--color-navy-soft) !important;
}
:deep(.p-inputtext:focus) {
  border-color: var(--color-navy) !important;
  box-shadow: 0 0 0 3px rgba(11, 42, 74, 0.08) !important;
  background-color: white !important;
}

:deep(.p-textarea) {
  height: auto !important;
  min-height: 100px !important;
  padding: 1rem 1.5rem !important;
  border-radius: 16px !important;
  line-height: 1.6 !important;
}

/* ── Calendar wrapper ── */
:deep(.p-calendar) {
  width: 100% !important;
  height: 3.5rem !important;
  border-radius: 12px !important;
  background-color: var(--color-off-white) !important;
  border: 1px solid var(--color-border) !important;
  font-family: var(--font-body) !important;
  transition: all 0.2s ease !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
}
:deep(.p-calendar:hover) {
  border-color: var(--color-navy-soft) !important;
}
:deep(.p-calendar:focus-within) {
  border-color: var(--color-navy) !important;
  box-shadow: 0 0 0 3px rgba(11, 42, 74, 0.08) !important;
  background-color: white !important;
}
/* Inner input INSIDE Calendar → strip its own border/bg */
:deep(.p-calendar .p-inputtext) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  height: 100% !important;
  flex: 1 !important;
}
:deep(.p-calendar .p-inputtext:hover),
:deep(.p-calendar .p-inputtext:focus) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
/* Calendar button trigger (showIcon mode) */
:deep(.p-datepicker-trigger),
:deep(.p-calendar-button) {
  background: transparent !important;
  border: none !important;
  color: var(--color-navy) !important;
  padding: 0 0.75rem !important;
  cursor: pointer !important;
}

/* ── Dropdown wrapper ── */
:deep(.p-dropdown) {
  width: 100% !important;
  height: 3.5rem !important;
  border-radius: 12px !important;
  background-color: var(--color-off-white) !important;
  border: 1px solid var(--color-border) !important;
  font-family: var(--font-body) !important;
  transition: all 0.2s ease !important;
  box-shadow: none !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}
:deep(.p-dropdown:hover) {
  border-color: var(--color-navy-soft) !important;
}
:deep(.p-dropdown:focus-within) {
  border-color: var(--color-navy) !important;
  box-shadow: 0 0 0 3px rgba(11, 42, 74, 0.08) !important;
  background-color: white !important;
}
:deep(.p-dropdown-label) {
  padding: 0 1.5rem !important;
  color: var(--color-navy) !important;
  font-size: 1rem !important;
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  background: transparent !important;
}
:deep(.p-dropdown-trigger) {
  color: var(--color-navy) !important;
  padding-right: 1rem !important;
}

/* ── Checkbox & Radio ── */
:deep(.p-checkbox),
:deep(.p-radiobutton) {
  width: 20px !important;
  height: 20px !important;
  display: inline-flex !important;
  flex-shrink: 0 !important;
}
:deep(.p-checkbox-box),
:deep(.p-radiobutton-box) {
  width: 20px !important;
  height: 20px !important;
  border-radius: 4px !important;
  border: 1.5px solid var(--color-border) !important;
  background: white !important;
  transition: all 0.2s !important;
}
:deep(.p-radiobutton-box) {
  border-radius: 50% !important;
}
:deep(.p-checkbox-box.p-highlight),
:deep(.p-radiobutton-box.p-highlight) {
  background: var(--color-accent) !important;
  border-color: var(--color-accent) !important;
}
:deep(.p-checkbox-icon) {
  color: white !important;
  font-size: 10px !important;
}
</style>