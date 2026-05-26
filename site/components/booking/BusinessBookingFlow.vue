<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import BookingStepHeader from '~/components/booking/BookingStepHeader.vue'
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
  locale.value === 'vi' ? 'Gói giải pháp' : 'Service Plan',
  locale.value === 'vi' ? 'Chi tiết dự án' : 'Project Details',
  locale.value === 'vi' ? 'Thông tin liên hệ' : 'Contact Info'
])

// Form State
const form = ref({
  planType: '',
  participants: '',
  timeline: '',
  location: '',
  setting: 'indoor',
  note: '',
  fullName: '',
  role: '',
  phone: '',
  email: '',
  consent: false
})

// Validation Rules
const rules = computed(() => ({
  fullName: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập họ và tên' : 'Please enter your full name', 
      required
    ) 
  },
  phone: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập số điện thoại' : 'Please enter your phone number', 
      required
    ) 
  },
  email: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập email' : 'Please enter your email', 
      required
    ), 
    email: helpers.withMessage(
      locale.value === 'vi' ? 'Email không hợp lệ' : 'Invalid email address', 
      email
    ) 
  },
  consent: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng đồng ý với điều khoản' : 'Please agree to the terms', 
      (val: boolean) => val === true
    ) 
  },
  participants: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập số lượng khách' : 'Please enter the number of participants', 
      required
    ) 
  },
  timeline: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng chọn thời gian dự kiến' : 'Please select a timeline', 
      required
    ) 
  },
  location: { 
    required: helpers.withMessage(
      locale.value === 'vi' ? 'Vui lòng nhập địa điểm' : 'Please enter a location', 
      required
    ) 
  }
}))

const v$ = useVuelidate(rules, form)

function formatTimeline(val: any) {
  if (!val) return ''
  if (Array.isArray(val)) {
    const start = val[0] ? new Date(val[0]).toLocaleDateString('vi-VN') : ''
    const end = val[1] ? new Date(val[1]).toLocaleDateString('vi-VN') : ''
    return end ? `${start} - ${end}` : start
  }
  return new Date(val).toLocaleDateString('vi-VN')
}

const plans = computed(() => [
  { id: 'recovery', icon: 'stadium', title: t('booking_v2.business.plan_recovery'), desc: t('booking_v2.business.plan_recovery_desc') },
  { id: 'wellness', icon: 'spa', title: t('booking_v2.business.plan_wellness'), desc: t('booking_v2.business.plan_wellness_desc') },
  { id: 'education', icon: 'school', title: t('booking_v2.business.plan_education'), desc: t('booking_v2.business.plan_education_desc') },
  { id: 'not_sure', icon: 'help', title: t('booking_v2.business.plan_not_sure'), desc: t('booking_v2.business.plan_not_sure_desc') },
])

async function nextStep() {
  if (currentStep.value === 1) {
    // Step 1: chỉ block nút nếu chưa chọn plan, không cần validation message
    if (!form.value.planType) return
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } else if (currentStep.value === 2) {
    // Step 2: touch từng field rồi kiểm tra lỗi
    v$.value.participants.$touch()
    v$.value.timeline.$touch()
    v$.value.location.$touch()
    if (
      v$.value.participants.$error ||
      v$.value.timeline.$error ||
      v$.value.location.$error
    ) return
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
  trackFormSource('booking-business', form.value.planType)

  // Format timeline to date string
  let dateStr = new Date().toISOString().slice(0, 10)
  if (form.value.timeline) {
    if (Array.isArray(form.value.timeline)) {
      dateStr = form.value.timeline[0] ? new Date(form.value.timeline[0]).toISOString().slice(0, 10) : dateStr
    } else {
      dateStr = new Date(form.value.timeline).toISOString().slice(0, 10)
    }
  }

  // Build note with extra business info
  const extraInfo = [
    form.value.participants ? `${form.value.participants} participants` : '',
    form.value.location || '',
    form.value.setting ? `Setting: ${form.value.setting}` : '',
    form.value.role ? `Role: ${form.value.role}` : '',
  ].filter(Boolean).join(' | ')
  const fullNote = [form.value.note, extraInfo].filter(Boolean).join('\n')

  await submit({
    service: form.value.planType,
    practitioner: null,
    date: dateStr,
    time: '09:00',
    name: form.value.fullName,
    phone: form.value.phone,
    email: form.value.email || '',
    note: fullNote || '',
  })

  isSubmitting.value = false

  if (apiError.value) {
    // Keep user on form, error will show via apiError
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
      <h2 class="text-h2 text-navy mb-4">{{ t('booking_v2.success.all_set') }}</h2>
      <p class="text-text-secondary mb-8">{{ t('booking_v2.success.desc_business') }}</p>
      
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

      <div class="max-w-3xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-8">
            <Transition name="page" mode="out-in">
              <!-- Step 1: Planning -->
              <div v-if="currentStep === 1" key="step1" class="animate-fade-in">
                <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.business.step1_title') }}</h2>
                <p class="text-text-secondary mb-10">{{ t('booking_v2.business.step1_subtitle') }}</p>

                <div class="grid grid-cols-1 gap-4">
                  <div 
                    v-for="item in plans" 
                    :key="item.id"
                    @click="form.planType = item.id"
                    class="card p-5 flex items-center gap-6 cursor-pointer transition-all duration-300 relative group"
                    :class="form.planType === item.id ? 'border-accent ring-1 ring-accent bg-accent/[0.02]' : 'hover:border-navy/20'"
                  >
                    <div class="w-12 h-12 rounded-xl bg-off-white text-navy flex items-center justify-center flex-shrink-0 transition-colors"
                         :class="form.planType === item.id ? 'bg-accent/10 text-accent' : 'group-hover:bg-navy group-hover:text-white'">
                      <svg v-if="item.id === 'recovery'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <svg v-else-if="item.id === 'wellness'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M12 6a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6a6 6 0 0 0-6-6z" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      <svg v-else-if="item.id === 'education'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                      </svg>
                      <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-navy mb-0.5">{{ item.title }}</h4>
                      <p class="text-xs text-text-secondary leading-relaxed">{{ item.desc }}</p>
                    </div>
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                         :class="form.planType === item.id ? 'border-accent bg-accent text-white' : 'border-border'">
                      <svg v-if="form.planType === item.id" class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Project Details -->
              <div v-else-if="currentStep === 2" key="step2" class="animate-fade-in">
                <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.business.step2_title') }}</h2>
                <p class="text-text-secondary mb-10">{{ t('booking_v2.business.step2_subtitle') }}</p>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.participants') }}*</label>
                      <InputText v-model="form.participants" :class="{'p-invalid': v$.participants.$error}" :placeholder="locale === 'vi' ? 'Ví dụ: 50' : 'e.g. 50'" fluid />
                      <span v-if="v$.participants.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.participants.$errors[0].$message }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.timeline') }}*</label>
                      <Calendar 
                        v-model="form.timeline" 
                        selectionMode="range" 
                        :manualInput="false"
                        showIcon 
                        class="w-full"
                        :placeholder="locale === 'vi' ? 'Chọn ngày hoặc khoảng thời gian' : 'Select date or timeline'"
                        fluid 
                        :class="{ 'p-invalid': v$.timeline.$error }"
                      />
                      <span v-if="v$.timeline.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.timeline.$errors[0].$message }}</span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.location') }}*</label>
                    <InputText v-model="form.location" :class="{'p-invalid': v$.location.$error}" :placeholder="locale === 'vi' ? 'Nhập địa chỉ hoặc thành phố' : 'Enter address or city'" fluid />
                    <span v-if="v$.location.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.location.$errors[0].$message }}</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-navy uppercase tracking-wider mb-3">{{ t('booking_v2.business.setting') }}</label>
                    <div class="flex gap-8">
                      <div 
                        v-for="opt in [
                          { id: 'indoor', label: t('booking_v2.business.setting_indoor') },
                          { id: 'outdoor', label: t('booking_v2.business.setting_outdoor') }
                        ]" 
                        :key="opt.id"
                        class="flex items-center gap-2 cursor-pointer group"
                        @click="form.setting = opt.id"
                      >
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                             :class="form.setting === opt.id ? 'border-accent bg-accent' : 'border-border group-hover:border-navy-soft'">
                          <div v-if="form.setting === opt.id" class="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                        <span class="text-sm font-medium transition-colors" :class="form.setting === opt.id ? 'text-navy' : 'text-text-secondary group-hover:text-navy'">
                          {{ opt.label }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.anything_else') }}</label>
                    <Textarea 
                      v-model="form.note" 
                      rows="10" 
                      autoResize
                      fluid
                      :placeholder="locale === 'vi' ? 'Ví dụ: yêu cầu thiết lập đặc biệt, mục tiêu...' : 'e.g. special setup, goals, notes'"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 3: Contact Info -->
              <div v-else-if="currentStep === 3" key="step3" class="animate-fade-in">
                <h2 class="text-h2 text-navy mb-2">{{ t('booking_v2.business.step3_title') }}</h2>
                <p class="text-text-secondary mb-10">{{ t('booking_v2.business.step3_subtitle') }}</p>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.full_name') }}*</label>
                      <InputText v-model="form.fullName" :class="{'p-invalid': v$.fullName.$error}" :placeholder="locale === 'vi' ? 'Nhập họ và tên' : 'Enter full name'" fluid />
                      <span v-if="v$.fullName.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.fullName.$errors[0].$message }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.role') }}</label>
                      <InputText v-model="form.role" :placeholder="locale === 'vi' ? 'Ví dụ: Trưởng phòng Nhân sự' : 'e.g. HR Manager'" fluid />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.phone_zalo') }}*</label>
                      <InputText v-model="form.phone" :class="{'p-invalid': v$.phone.$error}" :placeholder="locale === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'" fluid />
                      <span v-if="v$.phone.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.phone.$errors[0].$message }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <label class="block text-xs font-bold text-navy uppercase tracking-wider">{{ t('booking_v2.business.email') }}*</label>
                      <InputText v-model="form.email" :class="{'p-invalid': v$.email.$error}" placeholder="you@example.com" fluid />
                      <span v-if="v$.email.$error" class="text-[10px] text-red-500 font-bold mt-1 uppercase">{{ v$.email.$errors[0].$message }}</span>
                    </div>
                  </div>

                  <div class="pt-4">
                    <CustomCheckbox 
                      v-model="form.consent" 
                      :label="t('booking_v2.business.consent')"
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
              Chỉ disable ở step 1 (chưa chọn plan) vì step 1 không có error message
            -->
            <div class="flex items-center gap-4 mt-12 pt-8 border-t">
              <button 
                @click="prevStep"
                class="btn-outline px-10"
              >
                {{ currentStep === 1 ? t('booking_v2.common.back') : 'Back' }}
              </button>
              <button 
                @click="nextStep"
                class="btn-navy flex-1 justify-center py-4"
                :disabled="isSubmitting || (currentStep === 1 && !form.planType)"
                :class="currentStep === 3 ? 'btn-orange border-accent' : ''"
              >
                <template v-if="isSubmitting">
                  <span class="animate-spin mr-2">⟳</span>
                  Processing...
                </template>
                <template v-else>
                  {{ currentStep === 3 ? t('booking_v2.business.send_request') : t('booking_v2.common.next') }}
                </template>
              </button>
            </div>
          </div>

          <!-- Sidebar Summary -->
          <div class="lg:col-span-4">
            <div class="sticky top-32 bg-white rounded-3xl border border-border p-8 shadow-sm overflow-hidden">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 class="font-bold text-navy uppercase tracking-widest text-xs">{{ t('booking_v2.business.summary_sidebar') }}</h3>
              </div>

              <div v-if="form.planType" class="space-y-6">
                <div class="flex flex-col gap-1.5">
                  <span class="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{{ t('booking_v2.business.summary_plan') }}</span>
                  <span class="text-sm font-bold text-navy">{{ plans.find(p => p.id === form.planType)?.title }}</span>
                </div>

                <div v-if="form.timeline" class="flex flex-col gap-1.5">
                  <span class="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{{ t('booking_v2.business.summary_timeline') }}</span>
                  <span class="text-sm font-medium text-navy">{{ formatTimeline(form.timeline) }}</span>
                </div>

                <div v-if="form.participants" class="flex flex-col gap-1.5">
                  <span class="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{{ t('booking_v2.business.summary_participants') }}</span>
                  <span class="text-sm font-medium text-navy">{{ form.participants }} {{ t('booking_v2.business.summary_people') }}</span>
                </div>

                <div v-if="form.location" class="flex flex-col gap-1.5">
                  <span class="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{{ t('booking_v2.business.summary_location') }}</span>
                  <span class="text-sm font-medium text-navy">{{ form.location }}</span>
                </div>
              </div>

              <div v-else class="py-12 text-center animate-pulse text-text-secondary/30 flex flex-col items-center">
                <svg class="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p class="text-xs text-[#475569]/80 font-medium leading-relaxed px-4">{{ t('booking_v2.business.summary_empty') }}</p>
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