<template>
  <span class="chip" :class="cls">
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotCls" aria-hidden="true" />
    <span v-else-if="icon" class="material-symbols-outlined text-[0.9rem]" aria-hidden="true">{{ icon }}</span>
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

/**
 * One status vocabulary for the whole console.
 *
 * Colour alone never carries the meaning — the label is always spelled out, so
 * the same pill works for a colour-blind reader and in a printed report.
 */
const MAP = {
  // shared
  active: ['ok', 'Đang hoạt động'],
  inactive: ['neutral', 'Không hoạt động'],
  idle: ['neutral', 'Ít hoạt động'],
  blocked: ['danger', 'Đã chặn'],
  suspended: ['danger', 'Tạm ngưng'],
  invited: ['info', 'Đã mời'],
  trial: ['warn', 'Thử việc'],
  onboarding: ['info', 'Đang kèm cặp'],

  // publishing
  published: ['ok', 'Đang bán'],
  draft: ['warn', 'Nháp'],
  archived: ['neutral', 'Lưu trữ'],
  hidden: ['neutral', 'Đang ẩn'],

  // bookings
  pending: ['warn', 'Chờ xác nhận'],
  confirmed: ['info', 'Đã xác nhận'],
  completed: ['ok', 'Hoàn thành'],
  cancelled: ['danger', 'Đã huỷ'],

  // orders / payments
  paid: ['ok', 'Đã thu'],
  refunded: ['danger', 'Đã hoàn'],
  settled: ['ok', 'Đã về'],
  exhausted: ['neutral', 'Hết suất'],
  expired: ['neutral', 'Hết hạn'],

  // enrolments
  revoked: ['danger', 'Đã thu hồi'],

  // reviews
  approved: ['ok', 'Đã duyệt'],

  // sessions
  upcoming: ['info', 'Sắp diễn ra'],
  today: ['accent', 'Hôm nay'],
  done: ['neutral', 'Đã xong'],
  open: ['ok', 'Còn chỗ'],
  few: ['warn', 'Còn ít chỗ'],
  full: ['danger', 'Kín chỗ'],

  // media / i18n
  ready: ['ok', 'Đã gắn'],
  missing: ['danger', 'Thiếu video'],
  ok: ['ok', 'Đủ hai ngôn ngữ'],
  missing_en: ['warn', 'Thiếu bản EN'],
  missing_vi: ['warn', 'Thiếu bản VI'],

  // enquiries
  new: ['accent', 'Mới'],
  contacted: ['info', 'Đã liên hệ'],
  quoted: ['warn', 'Đã báo giá'],
  won: ['ok', 'Chốt'],
  lost: ['neutral', 'Không theo'],

  // integrations
  connected: ['ok', 'Đã kết nối'],
  not_connected: ['neutral', 'Chưa kết nối'],
  valid: ['ok', 'Còn hiệu lực'],
}

const TONE_CLASS = {
  neutral: '',
  accent: 'chip-accent',
  ok: 'chip-ok',
  warn: 'chip-warn',
  danger: 'chip-danger',
  info: 'chip-info',
}

const DOT_CLASS = {
  neutral: 'bg-ink-4',
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
}

const props = defineProps({
  status: { type: String, required: true },
  /** Override the label when a domain calls the same state something else. */
  label: { type: String, default: '' },
  tone: { type: String, default: '' },
  icon: { type: String, default: '' },
  dot: { type: Boolean, default: false },
})

const entry = computed(() => MAP[props.status] || ['neutral', props.status])
const tone = computed(() => props.tone || entry.value[0])
const text = computed(() => props.label || entry.value[1])
const cls = computed(() => TONE_CLASS[tone.value] ?? '')
const dotCls = computed(() => DOT_CLASS[tone.value] || DOT_CLASS.neutral)
</script>
