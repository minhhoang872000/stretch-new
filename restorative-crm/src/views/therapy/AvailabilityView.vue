<template>
  <main class="page">
    <PageHeader
      eyebrow="Trị liệu"
      title="Khung giờ"
      subtitle="Giờ làm theo thứ trong tuần của từng chuyên viên. Đây là thứ quyết định khách thấy slot nào trống ở trang đặt lịch."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="applyTemplate">
          <span class="material-symbols-outlined text-lg">bolt</span>
          Áp mẫu giờ chuẩn
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Slot mỗi tuần" :value="stats.slots" icon="grid_view" tone="accent" hint="Theo cấu hình hiện tại" />
      <StatTile label="Giờ mở cửa" :value="stats.hours" icon="schedule" tone="ok" />
      <StatTile label="Ngày đóng" :value="stats.closed" icon="event_busy" tone="neutral" />
      <StatTile
        label="Độ dài slot"
        :value="`${db.settings.booking.slotMinutes}′`"
        icon="timer"
        tone="info"
        hint="Sửa ở phần Quy tắc đặt lịch bên dưới"
      />
    </div>

    <div class="panel px-3 py-2.5 mb-3 flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2">
        <span class="text-xs font-bold text-ink-2">Chuyên viên</span>
        <select v-model="selectedId" class="select w-52">
          <option value="all">Tất cả</option>
          <option v-for="p in practitioners" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <p class="meta ml-auto">
        Bấm vào ô để mở hoặc đóng ngày, sửa giờ ngay trong ô.
      </p>
    </div>

    <!-- Grid: practitioner × weekday ------------------------------------- -->
    <div class="panel overflow-x-auto">
      <table class="tbl">
        <thead>
          <tr>
            <th class="w-44">Chuyên viên</th>
            <th v-for="day in WEEKDAYS" :key="day" class="text-center">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in visible" :key="p.id">
            <td>
              <p class="font-bold text-ink truncate">{{ p.name }}</p>
              <p class="meta">{{ p.studio }} · {{ p.weeklyHours }}h/tuần</p>
            </td>
            <td v-for="(day, di) in WEEKDAYS" :key="day" class="!p-1.5 align-top">
              <div
                class="rounded-md border p-1.5 min-h-[4.25rem] transition-colors"
                :class="slotOf(p.id, di)?.open
                  ? 'border-ok-line bg-ok-soft/60'
                  : 'border-line bg-panel-2'"
              >
                <template v-if="slotOf(p.id, di)?.open">
                  <input
                    :value="slotOf(p.id, di).from"
                    type="time"
                    class="input h-7 px-1.5 text-xs num w-full"
                    :aria-label="`Giờ mở ${day} của ${p.name}`"
                    @change="update(p.id, di, { from: $event.target.value })"
                  />
                  <input
                    :value="slotOf(p.id, di).to"
                    type="time"
                    class="input h-7 px-1.5 text-xs num w-full mt-1"
                    :aria-label="`Giờ đóng ${day} của ${p.name}`"
                    @change="update(p.id, di, { to: $event.target.value })"
                  />
                  <button
                    type="button"
                    class="text-2xs font-bold text-ink-3 hover:text-danger mt-1 w-full text-center"
                    @click="toggle(p.id, di)"
                  >đóng ngày</button>
                </template>
                <button
                  v-else
                  type="button"
                  class="w-full h-full min-h-[3.5rem] flex flex-col items-center justify-center gap-0.5 text-ink-4 hover:text-accent transition-colors"
                  :aria-label="`Mở ${day} cho ${p.name}`"
                  @click="toggle(p.id, di)"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  <span class="text-2xs font-bold">nghỉ</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Booking rules ----------------------------------------------------- -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <SectionCard title="Quy tắc đặt lịch" hint="Áp cho toàn bộ form đặt lịch trên site">
        <div class="space-y-3.5">
          <FormRow label="Độ dài mỗi slot (phút)">
            <template #default="{ id }">
              <input
                :id="id"
                :value="db.settings.booking.slotMinutes"
                type="number"
                min="15"
                step="15"
                class="input num"
                @change="saveRule('slotMinutes', Number($event.target.value))"
              />
            </template>
          </FormRow>
          <FormRow label="Đặt trước tối thiểu (giờ)" hint="Khách không đặt được slot quá sát giờ.">
            <template #default="{ id }">
              <input
                :id="id"
                :value="db.settings.booking.leadTimeHours"
                type="number"
                min="0"
                class="input num"
                @change="saveRule('leadTimeHours', Number($event.target.value))"
              />
            </template>
          </FormRow>
          <FormRow label="Mở lịch trước bao nhiêu ngày">
            <template #default="{ id }">
              <input
                :id="id"
                :value="db.settings.booking.maxAdvanceDays"
                type="number"
                min="1"
                class="input num"
                @change="saveRule('maxAdvanceDays', Number($event.target.value))"
              />
            </template>
          </FormRow>
          <ToggleSwitch
            :model-value="db.settings.booking.autoConfirm"
            label="Tự xác nhận lịch khách đặt"
            state-text
            @update:model-value="saveRule('autoConfirm', $event)"
          />
          <p class="field-hint">
            Đang tắt: mọi lịch vào hàng chờ để người thật xác nhận. Bật lên thì khách nhận email xác nhận ngay.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Lịch nghỉ đang có hiệu lực" flush>
        <ul v-if="db.list('timeOff').length" class="divide-y divide-line-soft">
          <li v-for="row in db.list('timeOff')" :key="row.id" class="px-3.5 py-2.5 flex items-center gap-3">
            <span class="material-symbols-outlined text-lg text-warn shrink-0">event_busy</span>
            <div class="min-w-0 flex-1">
              <p class="text-[0.8125rem] font-bold text-ink truncate">{{ row.practitionerName }}</p>
              <p class="meta">{{ date(row.from) }} → {{ date(row.to) }} · {{ row.reason }}</p>
            </div>
          </li>
        </ul>
        <EmptyState v-else icon="beach_access" title="Không ai đang nghỉ" />
      </SectionCard>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMockDb } from '@/stores/db.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import FormRow from '@/components/ui/FormRow.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { date } from '@/utils/format.js'

/**
 * Availability is a grid, not a list: the question an admin actually asks is
 * "who covers Saturday?", and only a practitioner × weekday matrix answers it
 * at a glance.
 */
const db = useMockDb()
const notify = useNotify()

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const selectedId = ref('all')
const practitioners = computed(() => db.list('practitioners'))
const visible = computed(() =>
  selectedId.value === 'all'
    ? practitioners.value
    : practitioners.value.filter((p) => p.id === selectedId.value),
)

const slots = computed(() => db.list('availability'))
const slotOf = (practitionerId, weekday) =>
  slots.value.find((s) => s.practitionerId === practitionerId && s.weekday === weekday)

const stats = computed(() => {
  const open = slots.value.filter((s) => s.open)
  const minutes = open.reduce((sum, s) => {
    if (!s.from || !s.to) return sum
    const [fh, fm] = s.from.split(':').map(Number)
    const [th, tm] = s.to.split(':').map(Number)
    return sum + Math.max(0, th * 60 + tm - (fh * 60 + fm))
  }, 0)
  const slotMinutes = db.settings.booking.slotMinutes || 30
  return {
    slots: Math.round(minutes / slotMinutes),
    hours: Math.round(minutes / 60),
    closed: slots.value.filter((s) => !s.open).length,
  }
})

function update(practitionerId, weekday, changes) {
  const slot = slotOf(practitionerId, weekday)
  if (!slot) return
  db.patch('availability', slot.id, changes)
}

function toggle(practitionerId, weekday) {
  const slot = slotOf(practitionerId, weekday)
  if (!slot) return
  const opening = !slot.open
  db.patch('availability', slot.id, {
    open: opening,
    from: opening ? slot.from || '09:00' : '',
    to: opening ? slot.to || '18:30' : '',
  })
}

/** The shift most studios actually run — beats filling 35 cells by hand. */
function applyTemplate() {
  const targets = visible.value
  for (const p of targets) {
    for (let di = 0; di < 7; di += 1) {
      const slot = slotOf(p.id, di)
      if (!slot) continue
      const open = di < 6
      db.patch('availability', slot.id, {
        open,
        from: open ? (di === 5 ? '08:00' : '09:00') : '',
        to: open ? (di === 5 ? '15:00' : '18:30') : '',
      })
    }
  }
  notify.success(
    targets.length === 1
      ? `Đã áp mẫu giờ cho ${targets[0].name}.`
      : `Đã áp mẫu giờ cho ${targets.length} chuyên viên.`,
  )
}

function saveRule(key, value) {
  db.saveSettings('booking', { [key]: value })
  notify.success('Đã lưu quy tắc đặt lịch.')
}
</script>
