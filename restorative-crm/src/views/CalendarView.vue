<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header Controls -->
    <CalendarHeader />

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 min-h-[600px]">
      <!-- Calendar (Month / Week / Day) -->
      <div class="xl:col-span-8 h-full">
        <CalendarGrid v-if="store.view === 'month'" />
        <CalendarWeek v-else-if="store.view === 'week'" />
        <CalendarDay v-else />
      </div>

      <!-- Details Sidebar -->
      <div class="xl:col-span-4 flex flex-col gap-5">
        <AppointmentDetails class="flex-1" />
        <DailyProductivity />
      </div>
    </div>

    <!-- Add Booking Modal -->
    <ActionModal
      v-model:isOpen="isModalOpen"
      :title="$t('calendar.newBooking')"
      :submitLabel="$t('calendar.newBooking')"
      @submit="handleNewBooking"
    >
      <div class="space-y-4">
        <!-- Booking Type -->
        <div>
          <label class="label-xs mb-1.5 block">{{ vi ? 'Loại đặt lịch' : 'Booking type' }}</label>
          <div class="flex items-center bg-surface-container-low rounded-full p-1">
            <button type="button" @click="form.type = 'personal'"
              class="flex-1 text-xs font-bold py-2 rounded-full transition-all"
              :class="form.type === 'personal' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'">
              {{ vi ? 'Cá nhân' : 'Personal' }}
            </button>
            <button type="button" @click="form.type = 'business'"
              class="flex-1 text-xs font-bold py-2 rounded-full transition-all"
              :class="form.type === 'business' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'">
              {{ vi ? 'Doanh nghiệp' : 'Business' }}
            </button>
          </div>
        </div>

        <!-- Contact -->
        <div>
          <label class="label-xs mb-1.5 block">{{ vi ? 'Họ và tên' : 'Full name' }} *</label>
          <input v-model="form.name" type="text" class="input-field" :placeholder="vi ? 'Nhập họ và tên' : 'Enter full name'" />
        </div>
        <div v-if="form.type === 'business'">
          <label class="label-xs mb-1.5 block">{{ vi ? 'Chức vụ / Vị trí' : 'Role / Position' }}</label>
          <input v-model="form.role" type="text" class="input-field" :placeholder="vi ? 'Ví dụ: Trưởng phòng Nhân sự' : 'e.g. HR Manager'" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label-xs mb-1.5 block">{{ vi ? 'SĐT / Zalo' : 'Phone / Zalo' }} *</label>
            <input v-model="form.phone" type="tel" class="input-field" :placeholder="vi ? 'Nhập số điện thoại' : 'Enter phone'" />
          </div>
          <div>
            <label class="label-xs mb-1.5 block">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="you@example.com" />
          </div>
        </div>

        <!-- Service / Plan -->
        <div>
          <label class="label-xs mb-1.5 block">
            {{ form.type === 'business' ? (vi ? 'Gói giải pháp' : 'Service plan') : (vi ? 'Dịch vụ' : 'Service') }} *
          </label>
          <select v-model="form.service" class="input-field">
            <option v-for="opt in serviceOptions" :key="opt.value" :value="opt.value">{{ vi ? opt.vi : opt.en }}</option>
          </select>
        </div>

        <!-- Personal: location -->
        <div v-if="form.type === 'personal'">
          <label class="label-xs mb-1.5 block">{{ vi ? 'Địa điểm' : 'Location' }}</label>
          <select v-model="form.location" class="input-field">
            <option v-for="opt in personalLocations" :key="opt.value" :value="opt.value">{{ vi ? opt.vi : opt.en }}</option>
          </select>
        </div>

        <!-- Business: participants + setting + address -->
        <template v-else>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label-xs mb-1.5 block">{{ vi ? 'Số người tham gia' : 'Participants' }}</label>
              <input v-model="form.participants" type="number" min="1" class="input-field" :placeholder="vi ? 'Ví dụ: 50' : 'e.g. 50'" />
            </div>
            <div>
              <label class="label-xs mb-1.5 block">{{ vi ? 'Môi trường' : 'Setting' }}</label>
              <select v-model="form.setting" class="input-field">
                <option value="indoor">{{ vi ? 'Trong nhà' : 'Indoor' }}</option>
                <option value="outdoor">{{ vi ? 'Ngoài trời' : 'Outdoor' }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label-xs mb-1.5 block">{{ vi ? 'Địa điểm' : 'Location' }}</label>
            <input v-model="form.address" type="text" class="input-field" :placeholder="vi ? 'Nhập địa chỉ hoặc thành phố' : 'Enter address or city'" />
          </div>
        </template>

        <!-- Date & Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label-xs mb-1.5 block">{{ vi ? 'Ngày' : 'Date' }} *</label>
            <input v-model="form.date" type="date" class="input-field" />
          </div>
          <div>
            <label class="label-xs mb-1.5 block">{{ vi ? 'Giờ' : 'Time' }}</label>
            <select v-model="form.time" class="input-field">
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- Note -->
        <div>
          <label class="label-xs mb-1.5 block">{{ vi ? 'Ghi chú (tùy chọn)' : 'Notes (optional)' }}</label>
          <textarea v-model="form.note" rows="2" class="input-field resize-none"
            :placeholder="vi ? 'Chia sẻ thêm về tình trạng hoặc yêu cầu...' : 'Share more about the condition or request...'"></textarea>
        </div>

        <p v-if="formError" class="text-error text-xs flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">error</span>{{ formError }}
        </p>
      </div>
    </ActionModal>
  </main>
</template>

<script setup>
import { ref, computed, reactive, onMounted, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import CalendarWeek from '@/components/calendar/CalendarWeek.vue'
import CalendarDay from '@/components/calendar/CalendarDay.vue'
import AppointmentDetails from '@/components/calendar/AppointmentDetails.vue'
import DailyProductivity from '@/components/calendar/DailyProductivity.vue'
import ActionModal from '@/components/ui/ActionModal.vue'
import { useCalendarStore, dayKey } from '@/stores/calendar.js'
import { formatDate } from '@/utils/date.js'

const store = useCalendarStore()
const { locale } = useI18n()
const vi = computed(() => locale.value === 'vi')
const isModalOpen = ref(false)
const formError = ref('')

onMounted(() => {
  store.loadBookings()
})

// ─── Booking-form option lists (mirrors the landing-page flows) ──────────────
const personalIssues = [
  { value: 'recovery', vi: 'Phục hồi sau vận động', en: 'Post-workout Recovery' },
  { value: 'pain', vi: 'Đau nhức / chấn thương', en: 'Aches / Injuries' },
  { value: 'stiffness', vi: 'Căng cứng kéo dài', en: 'Prolonged Stiffness' },
  { value: 'not_sure', vi: 'Không chắc chắn', en: 'Not sure' },
]
const businessPlans = [
  { value: 'recovery', vi: 'Phục hồi sự kiện', en: 'Event Recovery' },
  { value: 'wellness', vi: 'Sức khỏe doanh nghiệp', en: 'Corporate Wellness' },
  { value: 'education', vi: 'Giáo dục & Đào tạo', en: 'Education & Training' },
  { value: 'not_sure', vi: 'Chưa chắc chắn', en: 'Not sure' },
]
const personalLocations = [
  { value: 'home', vi: 'Tại nhà riêng', en: 'At Home' },
  { value: 'clinic', vi: 'Tại cơ sở của Stretch', en: 'At Clinic' },
  { value: 'consult', vi: 'Tư vấn thêm', en: 'More Advice' },
]
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const serviceOptions = computed(() => (form.type === 'business' ? businessPlans : personalIssues))

function blankForm() {
  return {
    type: 'personal',
    name: '',
    role: '',
    phone: '',
    email: '',
    service: 'recovery',
    location: 'home',
    participants: '',
    setting: 'indoor',
    address: '',
    date: formatDate(new Date()),
    time: '09:00',
    note: '',
  }
}
const form = reactive(blankForm())

const openModal = () => {
  Object.assign(form, blankForm())
  formError.value = ''
  isModalOpen.value = true
}
// Provide openModal so CalendarHeader can use it
provide('openBookingModal', openModal)

function serviceLabel() {
  const opt = serviceOptions.value.find(o => o.value === form.service)
  return opt ? (vi.value ? opt.vi : opt.en) : form.service
}

// Append the structured extras into the note, like the landing-page flows do.
function buildNote() {
  const parts = []
  if (form.note) parts.push(form.note)
  if (form.type === 'personal') {
    const loc = personalLocations.find(l => l.value === form.location)
    if (loc) parts.push(vi.value ? loc.vi : loc.en)
  } else {
    if (form.participants) parts.push(`${vi.value ? 'Số người' : 'Participants'}: ${form.participants}`)
    if (form.address) parts.push(form.address)
    parts.push(form.setting === 'outdoor' ? (vi.value ? 'Ngoài trời' : 'Outdoor') : (vi.value ? 'Trong nhà' : 'Indoor'))
    if (form.role) parts.push(form.role)
  }
  return parts.join(' | ')
}

const handleNewBooking = () => {
  formError.value = ''
  if (!form.name.trim() || !form.phone.trim() || !form.date) {
    formError.value = vi.value ? 'Vui lòng nhập họ tên, SĐT và ngày.' : 'Please enter name, phone and date.'
    return
  }

  const picked = new Date(form.date + 'T00:00:00')
  const svc = serviceLabel()

  store.bookings.push({
    id: Date.now(),
    patientName: form.name.trim(),
    patientId: 'ID: ' + Math.floor(Math.random() * 90000 + 10000),
    service: svc,
    provider: form.type === 'business' ? (vi.value ? 'Doanh nghiệp' : 'Business') : 'N/A',
    duration: '60 Min',
    dateValue: picked.getDate(),
    dateKey: dayKey(picked),
    time: form.time,
    displayTime: `${form.time} - ${svc.substring(0, 6)}…`,
    dateStr: `${formatDate(picked)} ${form.time}`,
    phone: form.phone.trim(),
    email: form.email.trim(),
    notes: buildNote(),
    status: 'pending',
    color: 'bg-tertiary-fixed/30',
    textColor: 'text-tertiary',
    border: 'border-tertiary/20',
  })

  store.selectDate(picked)
  isModalOpen.value = false
}
</script>
