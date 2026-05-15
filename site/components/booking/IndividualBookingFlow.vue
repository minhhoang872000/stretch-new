<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import BookingStepHeader from '~/components/booking/BookingStepHeader.vue'
import CustomSelect from '~/components/CustomSelect.vue'
import CustomCheckbox from '~/components/CustomCheckbox.vue'

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { t } = useI18n()
const { trackFormSource } = useTracking()
const { submit, loading: apiLoading, success: apiSuccess, error: apiError } = useBooking()
const localePath = useLocalePath()
const currentStep = ref(1)
const isSubmitting = ref(false)
const showSuccess = ref(false)

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
const rules = {
  fullName: { required: helpers.withMessage('Vui lòng nhập họ và tên', required), minLength: minLength(2) },
  phone: { 
    required: helpers.withMessage('Vui lòng nhập số điện thoại', required),
    valid: helpers.withMessage('Số điện thoại không hợp lệ', (value: string) => /^[0-9+ ]{10,15}$/.test(value))
  },
  consent: { required: helpers.withMessage('Vui lòng đồng ý với điều khoản', (val: boolean) => val === true) },
  date: { required: helpers.withMessage('Vui lòng chọn ngày', required) },
  time: { required: helpers.withMessage('Vui lòng chọn giờ', required) },
  email: { email: helpers.withMessage('Email không hợp lệ', email) }
}

const v$ = useVuelidate(rules, form)

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

function formatDate(date: Date | null) {
  if (!date) return ''
  return date.toLocaleDateString('vi-VN')
}

const issues = [
  { id: 'recovery', icon: 'exercise', title: t('booking_v2.individual.issue_recovery'), desc: t('booking_v2.individual.issue_recovery_desc') },
  { id: 'pain', icon: 'personal_injury', title: t('booking_v2.individual.issue_pain'), desc: t('booking_v2.individual.issue_pain_desc') },
  { id: 'stiffness', icon: 'self_improvement', title: t('booking_v2.individual.issue_stiffness'), desc: t('booking_v2.individual.issue_stiffness_desc') },
  { id: 'not_sure', icon: 'help', title: t('booking_v2.individual.issue_not_sure'), desc: t('booking_v2.individual.issue_not_sure_desc') },
]

const locations = [
  { id: 'home', icon: 'home', title: t('booking_v2.individual.loc_home'), desc: t('booking_v2.individual.loc_home_desc') },
  { id: 'clinic', icon: 'apartment', title: t('booking_v2.individual.loc_clinic'), desc: t('booking_v2.individual.loc_clinic_desc') },
  { id: 'consult', icon: 'chat', title: t('booking_v2.individual.loc_consult'), desc: t('booking_v2.individual.loc_consult_desc') },
]

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
        <span class="material-symbols-outlined !text-5xl">check_circle</span>
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
        <button class="btn-navy justify-center gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" class="w-5 h-5" />
          {{ t('booking_v2.success.chat_zalo') }}
        </button>
        <button class="btn-outline justify-center gap-3">
          <span class="material-symbols-outlined">call</span>
          {{ t('booking_v2.success.call_stretch') }}
        </button>
        <NuxtLink :to="localePath('/')" class="text-accent font-bold mt-4 block hover:underline">
          {{ t('booking_v2.success.back_home') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Multi-step Form -->
    <div v-else class="max-w-5xl mx-auto">
      <BookingStepHeader :current-step="currentStep" :total-steps="3" />

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
                  <div class="w-12 h-12 rounded-xl bg-off-white text-navy flex items-center justify-center transition-colors"
                       :class="form.issue === item.id ? 'bg-accent/10 text-accent' : 'group-hover:bg-navy group-hover:text-white'">
                    <span class="material-symbols-outlined">{{ item.icon }}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-navy mb-1">{{ item.title }}</h4>
                    <p class="text-xs text-text-secondary leading-relaxed">{{ item.desc }}</p>
                  </div>
                  <div v-if="form.issue === item.id" class="absolute top-4 right-4 text-accent">
                    <span class="material-symbols-outlined">check_circle</span>
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
                    <div class="w-12 h-12 rounded-xl bg-off-white text-navy flex items-center justify-center mb-3 transition-colors"
                         :class="form.location === item.id ? 'bg-accent/10 text-accent' : 'group-hover:bg-navy group-hover:text-white'">
                      <span class="material-symbols-outlined">{{ item.icon }}</span>
                    </div>
                    <h4 class="font-bold text-navy text-sm mb-1">{{ item.title }}</h4>
                    <p class="text-[10px] text-text-secondary">{{ item.desc }}</p>
                    <div v-if="form.location === item.id" class="absolute top-2 right-2 text-accent">
                      <span class="material-symbols-outlined !text-lg">check_circle</span>
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
                      placeholder="Chọn giờ"
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
                  <InputText v-model="form.fullName" :class="{'p-invalid': v$.fullName.$error}" placeholder="Nhập họ và tên" fluid />
                  <span v-if="v$.fullName.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.fullName.$errors[0].$message }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.individual.phone_zalo') }}</label>
                  <InputText v-model="form.phone" :class="{'p-invalid': v$.phone.$error}" placeholder="Nhập số điện thoại" fluid />
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
                <span class="material-symbols-outlined !text-xl">event_note</span>
                Chi tiết đặt lịch
              </h4>
              <div class="space-y-6">
                <div v-if="form.issue" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Dịch vụ</p>
                  <p class="text-sm font-bold text-navy">{{ issues.find(i => i.id === form.issue)?.title }}</p>
                </div>
                <div v-if="form.location" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Địa điểm</p>
                  <p class="text-sm font-bold text-navy">{{ locations.find(l => l.id === form.location)?.title }}</p>
                </div>
                <div v-if="form.date || form.time" class="animate-fade-in">
                  <p class="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Thời gian</p>
                  <p class="text-sm font-bold text-navy">
                    {{ formatDate(form.date) }} <span v-if="form.date && form.time">@</span> {{ form.time }}
                  </p>
                </div>
              </div>

              <div v-if="!form.issue" class="py-8 text-center">
                <span class="material-symbols-outlined text-text-secondary/30 !text-5xl mb-2">pending</span>
                <p class="text-xs text-text-secondary italic">Thông tin sẽ hiển thị khi bạn chọn</p>
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