<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Buổi 1-1"
      subtitle="Học viên đặt lịch ngay trong trang học. Duyệt một yêu cầu là buổi học được ghi thẳng vào Google Calendar của học viện."
    >
      <template #actions>
        <button type="button" class="btn-outline btn-sm" :disabled="store.loading" @click="reload">
          <span class="material-symbols-outlined text-lg">refresh</span>
          Tải lại
        </button>
      </template>
    </PageHeader>

    <!-- Demo session: nothing here can work without a real API token. -->
    <div v-if="store.offline" class="panel px-3.5 py-3 mb-4 flex flex-wrap items-start gap-3">
      <span class="material-symbols-outlined text-xl text-warn shrink-0">cloud_off</span>
      <div class="min-w-0">
        <p class="text-[0.8125rem] font-bold text-ink">Đang dùng phiên đăng nhập demo</p>
        <p class="meta mt-0.5">
          Màn hình này đọc dữ liệu thật từ API. Anh/chị đăng nhập bằng tài khoản quản trị thật để xem
          và duyệt các yêu cầu 1-1.
        </p>
      </div>
    </div>

    <!-- Integration state: says plainly whether accepting will reach Google. -->
    <div
      v-else-if="!store.calendarConnected || store.needsManualLink"
      class="panel px-3.5 py-3 mb-4 flex flex-wrap items-start gap-3"
    >
      <span class="material-symbols-outlined text-xl shrink-0" :class="store.calendarConnected ? 'text-info' : 'text-warn'">
        {{ store.calendarConnected ? 'videocam_off' : 'event_busy' }}
      </span>
      <div class="min-w-0">
        <template v-if="!store.calendarConnected">
          <p class="text-[0.8125rem] font-bold text-ink">Chưa nối Google Calendar</p>
          <p class="meta mt-0.5">
            Duyệt vẫn được nhưng buổi học chưa lên lịch. Cần bật Calendar API trong Google Cloud và
            chia sẻ lịch <span class="font-bold text-ink-2">{{ integrationCalendar }}</span> cho email
            service account với quyền “Thay đổi sự kiện”.
          </p>
        </template>
        <template v-else>
          <p class="text-[0.8125rem] font-bold text-ink">Lịch đã nối, nhưng chưa tạo được link Meet</p>
          <p class="meta mt-0.5">
            Tài khoản chưa bật uỷ quyền toàn miền (chỉ có trên Google Workspace), nên khi duyệt
            anh/chị dán link họp vào ô bên cạnh — link đó sẽ hiện cho học viên.
          </p>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Chờ duyệt" :value="stats.pending" icon="pending_actions" :tone="stats.pending ? 'warn' : 'neutral'" hint="Học viên đang đợi" />
      <StatTile label="Đã xác nhận" :value="stats.accepted" icon="event_available" tone="ok" />
      <StatTile label="Đã hoàn thành" :value="stats.completed" icon="task_alt" tone="info" />
      <StatTile label="Giờ mở mỗi tuần" :value="stats.openHours" unit="giờ" icon="schedule" tone="accent" />
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 mb-4 border-b border-line">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        class="px-3.5 py-2 text-[0.8125rem] font-bold border-b-2 -mb-px transition-colors"
        :class="tab === t.id ? 'border-primary text-primary' : 'border-transparent text-ink-2 hover:text-ink'"
        @click="switchTab(t.id)"
      >
        {{ t.label }}
        <span v-if="t.id === 'requests' && stats.pending" class="ms-1 text-warn">({{ stats.pending }})</span>
      </button>
    </div>

    <!-- ══ Tab: requests ══ -->
    <template v-if="tab === 'requests'">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <select v-model="statusFilter" class="select w-44" aria-label="Lọc theo trạng thái" @change="reload">
          <option value="all">Mọi trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="accepted">Đã xác nhận</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="declined">Đã từ chối</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      <p v-if="store.loading" class="meta py-8 text-center">Đang tải…</p>

      <EmptyState
        v-else-if="!store.sessions.length"
        icon="connect_without_contact"
        title="Chưa có yêu cầu nào"
        hint="Khi học viên bấm “Đặt buổi 1-1” trong trang học, yêu cầu sẽ xuất hiện ở đây."
      />

      <div v-else class="flex flex-col gap-2.5">
        <article v-for="s in store.sessions" :key="s.id" class="panel p-3.5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <StatusPill :status="s.status" :label="STATUS_LABEL[s.status]" :tone="STATUS_TONE[s.status]" dot />
                <span class="text-[0.9375rem] font-bold text-ink">{{ s.learnerName }}</span>
                <a :href="`mailto:${s.learnerEmail}`" class="meta hover:underline">{{ s.learnerEmail }}</a>
              </div>

              <p class="mt-1.5 text-[0.8125rem] font-bold text-ink-2">
                <span class="material-symbols-outlined text-base align-[-3px]">event</span>
                {{ dayLong(s.date) }} · {{ s.time }}–{{ endTime(s.time, s.durationMinutes) }}
              </p>

              <p v-if="s.lessonTitle" class="meta mt-0.5">
                Bài học: <span class="font-bold text-ink-2">{{ s.lessonTitle }}</span>
                <span v-if="s.programSlug"> · {{ s.programSlug }}</span>
              </p>

              <p v-if="s.topic" class="mt-2 text-[0.8125rem] text-ink-2 whitespace-pre-line">{{ s.topic }}</p>

              <p v-if="s.declineReason" class="mt-2 text-[0.8125rem] text-danger">
                Lý do từ chối: {{ s.declineReason }}
              </p>

              <div v-if="s.status === 'accepted'" class="mt-2 flex flex-wrap items-center gap-3">
                <a v-if="s.meetUrl" :href="s.meetUrl" target="_blank" rel="noopener" class="text-[0.8125rem] font-bold text-primary hover:underline">
                  <span class="material-symbols-outlined text-base align-[-3px]">videocam</span>
                  Link buổi học
                </a>
                <span v-else class="meta">Chưa có link họp — học viên đang chờ.</span>
                <a v-if="s.googleHtmlLink" :href="s.googleHtmlLink" target="_blank" rel="noopener" class="meta hover:underline">
                  Xem trên Google Calendar
                </a>
              </div>
            </div>

            <!-- Actions depend on where the request is in its life. -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <template v-if="s.status === 'pending'">
                <input
                  v-model="meetDraft[s.id]"
                  type="url"
                  class="input-field w-52 text-[0.8125rem]"
                  placeholder="Dán link họp (không bắt buộc)"
                  :aria-label="`Link họp cho buổi của ${s.learnerName}`"
                />
                <button type="button" class="btn-primary btn-sm" :disabled="store.savingId === s.id" @click="onAccept(s)">
                  <span class="material-symbols-outlined text-lg">check</span>
                  Duyệt
                </button>
                <button type="button" class="btn-outline btn-sm" :disabled="store.savingId === s.id" @click="askDecline(s)">
                  Từ chối
                </button>
              </template>

              <template v-else-if="s.status === 'accepted'">
                <button type="button" class="btn-outline btn-sm" :disabled="store.savingId === s.id" @click="onComplete(s)">
                  Đã học xong
                </button>
                <button type="button" class="btn-outline btn-sm" :disabled="store.savingId === s.id" @click="askCancel(s)">
                  Huỷ buổi
                </button>
              </template>

              <button
                v-else
                type="button"
                class="btn-ghost btn-sm btn-icon"
                aria-label="Xoá yêu cầu"
                :disabled="store.savingId === s.id"
                @click="askDelete(s)"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </template>

    <!-- ══ Tab: calendar ══ -->
    <template v-else-if="tab === 'calendar'">
      <SectionCard
        title="Lịch từ Google Calendar"
        :hint="`Đọc trực tiếp từ ${integrationCalendar} — kể cả sự kiện nhập tay, không chỉ buổi 1-1.`"
        flush
      >
        <p v-if="store.loadingCalendar" class="meta py-8 text-center">Đang đọc lịch…</p>

        <EmptyState
          v-else-if="!store.events.length"
          icon="calendar_month"
          title="Không có sự kiện nào"
          :hint="store.calendarConnected ? 'Khoảng thời gian này chưa có gì trên lịch.' : 'Chưa nối Google Calendar.'"
        />

        <ul v-else class="divide-y divide-line">
          <li v-for="e in store.events" :key="e.id" class="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
            <div class="w-32 shrink-0">
              <p class="text-[0.8125rem] font-bold text-ink">{{ eventDay(e) }}</p>
              <p class="meta">{{ eventTime(e) }}</p>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[0.8125rem] font-bold text-ink truncate">{{ e.summary }}</p>
              <p v-if="e.attendees.length" class="meta truncate">{{ e.attendees.join(', ') }}</p>
            </div>
            <a v-if="e.meetUrl" :href="e.meetUrl" target="_blank" rel="noopener" class="meta font-bold text-primary hover:underline shrink-0">
              Meet
            </a>
            <a v-if="e.htmlLink" :href="e.htmlLink" target="_blank" rel="noopener" class="meta hover:underline shrink-0">
              Mở
            </a>
          </li>
        </ul>
      </SectionCard>
    </template>

    <!-- ══ Tab: opening hours ══ -->
    <template v-else>
      <SectionCard
        title="Khung giờ mở cho buổi 1-1"
        hint="Học viên chỉ thấy các giờ trong khung này, và chỉ những giờ mà Google Calendar đang trống."
      >
        <div class="flex flex-col gap-2">
          <div
            v-for="row in hoursDraft"
            :key="row.weekday"
            class="flex flex-wrap items-center gap-3 py-1.5"
          >
            <span class="w-24 text-[0.8125rem] font-bold text-ink">{{ WEEKDAY_LABEL[row.weekday] }}</span>
            <ToggleSwitch v-model="row.active" state-text on-text="Mở" off-text="Nghỉ" />
            <div class="flex items-center gap-2" :class="{ 'opacity-40 pointer-events-none': !row.active }">
              <input v-model="row.start_time" type="time" step="900" class="input-field w-28" :aria-label="`Giờ bắt đầu ${WEEKDAY_LABEL[row.weekday]}`" />
              <span class="meta">đến</span>
              <input v-model="row.end_time" type="time" step="900" class="input-field w-28" :aria-label="`Giờ kết thúc ${WEEKDAY_LABEL[row.weekday]}`" />
            </div>
            <span v-if="row.active && !validRow(row)" class="meta text-danger">Giờ kết thúc phải sau giờ bắt đầu</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-4">
          <button type="button" class="btn-primary btn-sm" :disabled="savingHours || !hoursValid" @click="onSaveHours">
            {{ savingHours ? 'Đang lưu…' : 'Lưu khung giờ' }}
          </button>
          <span class="meta">Mỗi buổi {{ slotMinutes }} phút · đặt trước tối đa {{ bookAheadDays }} ngày.</span>
        </div>
      </SectionCard>
    </template>

    <ConfirmDialog
      v-model:open="confirm.open"
      :title="confirm.title"
      :message="confirm.message"
      :confirm-label="confirm.label"
      :danger="confirm.danger"
      icon="help"
      @confirm="confirm.run"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useMentorshipStore } from '@/stores/mentorship.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const store = useMentorshipStore()
const notify = useNotify()

const TABS = [
  { id: 'requests', label: 'Yêu cầu' },
  { id: 'calendar', label: 'Lịch' },
  { id: 'hours', label: 'Giờ mở' },
]

const WEEKDAY_LABEL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
// Monday first: the week the academy actually plans in.
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  accepted: 'Đã xác nhận',
  completed: 'Đã hoàn thành',
  declined: 'Đã từ chối',
  cancelled: 'Đã huỷ',
}
const STATUS_TONE = {
  pending: 'warn',
  accepted: 'ok',
  completed: 'info',
  declined: 'danger',
  cancelled: 'neutral',
}

const tab = ref('requests')
const statusFilter = ref('all')
const meetDraft = reactive({})
const hoursDraft = ref([])
const savingHours = ref(false)

const confirm = reactive({
  open: false,
  title: '',
  message: '',
  label: 'Đồng ý',
  danger: false,
  run: () => {},
})

const integrationCalendar = computed(() => store.integration?.calendarId || 'admin@stretch.vn')
const slotMinutes = computed(() => store.integration?.slotMinutes || 30)
const bookAheadDays = computed(() => store.integration?.bookAheadDays || 14)

const stats = computed(() => {
  const by = (s) => store.sessions.filter((x) => x.status === s).length
  const minutes = hoursDraft.value
    .filter((h) => h.active && validRow(h))
    .reduce((sum, h) => sum + (toMinutes(h.end_time) - toMinutes(h.start_time)), 0)
  return {
    pending: by('pending'),
    accepted: by('accepted'),
    completed: by('completed'),
    openHours: Math.round((minutes / 60) * 10) / 10,
  }
})

const hoursValid = computed(() => hoursDraft.value.every((h) => !h.active || validRow(h)))

// ── Formatting ───────────────────────────────────────────────────
// Parsed from the string so the browser's timezone cannot shift a date.

function parts(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }
}

function dayLong(iso) {
  const { y, m, d, weekday } = parts(iso)
  return `${WEEKDAY_LABEL[weekday]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

const toMinutes = (t) => {
  const [h = 0, m = 0] = String(t).split(':').map(Number)
  return h * 60 + m
}

function endTime(time, minutes) {
  const total = toMinutes(time) + (minutes || 30)
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function validRow(row) {
  return toMinutes(row.end_time) > toMinutes(row.start_time)
}

/** Google returns either a dateTime or an all-day date. */
function eventDay(e) {
  const iso = String(e.start || '').slice(0, 10)
  if (!iso) return '—'
  const { m, d, weekday } = parts(iso)
  return `${WEEKDAY_LABEL[weekday].replace('Thứ ', 'T')} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

function eventTime(e) {
  if (e.allDay) return 'Cả ngày'
  const hhmm = (v) => String(v || '').slice(11, 16)
  return `${hhmm(e.start)}–${hhmm(e.end)}`
}

// ── Actions ──────────────────────────────────────────────────────

async function reload() {
  await store.load(statusFilter.value === 'all' ? {} : { status: statusFilter.value })
}

function switchTab(id) {
  tab.value = id
  if (id === 'calendar' && !store.events.length) store.loadCalendar()
  if (id === 'hours' && !hoursDraft.value.length) syncHours()
}

/** Seven rows always, so a day with no window is still editable. */
function buildHoursDraft() {
  const byDay = new Map(store.hours.map((h) => [h.weekday, h]))
  hoursDraft.value = WEEKDAY_ORDER.map((weekday) => {
    const existing = byDay.get(weekday)
    return {
      weekday,
      start_time: existing?.startTime || '14:00',
      end_time: existing?.endTime || '17:00',
      active: existing?.active ?? false,
    }
  })
}

async function syncHours() {
  await store.loadHours()
  buildHoursDraft()
}

async function onSaveHours() {
  savingHours.value = true
  try {
    await store.saveHours(hoursDraft.value)
    buildHoursDraft()
    notify.success('Đã lưu khung giờ.')
  } catch (err) {
    notify.error(err.message || 'Không lưu được khung giờ.')
  } finally {
    savingHours.value = false
  }
}

async function onAccept(s) {
  try {
    const res = await store.accept(s.id, (meetDraft[s.id] || '').trim())
    delete meetDraft[s.id]
    // A warning means it IS scheduled but something needs a human — say which.
    if (res?.warning) notify.warn(res.warning)
    else notify.success('Đã duyệt và thêm vào Google Calendar.')
  } catch (err) {
    notify.error(err.message || 'Không duyệt được yêu cầu.')
  }
}

function askDecline(s) {
  Object.assign(confirm, {
    open: true,
    title: 'Từ chối yêu cầu?',
    message: `Học viên ${s.learnerName} sẽ thấy yêu cầu bị từ chối và khung giờ được mở lại cho người khác.`,
    label: 'Từ chối',
    danger: true,
    run: async () => {
      try {
        await store.decline(s.id)
        notify.success('Đã từ chối yêu cầu.')
      } catch (err) {
        notify.error(err.message || 'Không từ chối được yêu cầu.')
      }
    },
  })
}

function askCancel(s) {
  Object.assign(confirm, {
    open: true,
    title: 'Huỷ buổi học đã xác nhận?',
    message: `Sự kiện ngày ${dayLong(s.date)} sẽ bị gỡ khỏi Google Calendar.`,
    label: 'Huỷ buổi',
    danger: true,
    run: async () => {
      try {
        await store.cancel(s.id)
        notify.success('Đã huỷ buổi học và gỡ khỏi lịch.')
      } catch (err) {
        notify.error(err.message || 'Không huỷ được buổi học.')
      }
    },
  })
}

function askDelete(s) {
  Object.assign(confirm, {
    open: true,
    title: 'Xoá yêu cầu khỏi danh sách?',
    message: 'Thao tác này không khôi phục được.',
    label: 'Xoá',
    danger: true,
    run: async () => {
      try {
        await store.remove(s.id)
        notify.success('Đã xoá yêu cầu.')
      } catch (err) {
        notify.error(err.message || 'Không xoá được yêu cầu.')
      }
    },
  })
}

onMounted(async () => {
  await reload()
  // Hours feed the "giờ mở mỗi tuần" tile, so they load even on the first tab.
  await syncHours()
})
</script>
