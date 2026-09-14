/**
 * Hệ thống: người dùng console, quyền, nhật ký, cài đặt.
 *
 * Note the split the site does not have yet: these are *console* accounts
 * (staff), separate from the learner accounts in learning.js. The site's own
 * sign-in is still the demo pair in site/composables/useHubSession.ts.
 */

import { shiftStamp, shiftDate } from './_util.js'

export const ROLES = [
  {
    value: 'owner', label: 'Chủ sở hữu',
    description: 'Toàn quyền, kể cả cài đặt thanh toán và xoá dữ liệu.',
    scopes: ['*'],
  },
  {
    value: 'manager', label: 'Quản lý',
    description: 'Vận hành hằng ngày: lịch hẹn, học viện, nội dung, đơn hàng.',
    scopes: ['booking:*', 'academy:*', 'content:*', 'sales:read', 'sales:write', 'crm:*'],
  },
  {
    value: 'instructor', label: 'Giảng viên',
    description: 'Chỉ chương trình mình phụ trách, học viên và đánh giá của chương trình đó.',
    scopes: ['academy:own', 'academy:learners:read', 'academy:reviews:reply'],
  },
  {
    value: 'therapist', label: 'Kỹ thuật viên',
    description: 'Xem lịch hẹn của mình, cập nhật trạng thái buổi trị liệu.',
    scopes: ['booking:own', 'booking:status'],
  },
  {
    value: 'editor', label: 'Biên tập',
    description: 'Bài viết, trang tĩnh, FAQ, thư viện ảnh, SEO.',
    scopes: ['content:*', 'seo:*'],
  },
  {
    value: 'viewer', label: 'Chỉ xem',
    description: 'Xem báo cáo, không sửa được gì.',
    scopes: ['*:read'],
  },
]

export const users = [
  {
    id: 'usr-01', name: 'Minh Hoàng', email: 'hoang@dtsmart.vn', role: 'owner',
    status: 'active', twoFactor: true, studio: 'Tất cả',
    lastLoginAt: shiftStamp(0, 8, 12), createdAt: '2024-11-02',
  },
  {
    id: 'usr-02', name: 'Thu Hà', email: 'ha.nguyen@stretch.vn', role: 'manager',
    status: 'active', twoFactor: true, studio: 'Quận 1',
    lastLoginAt: shiftStamp(0, 7, 41), createdAt: '2025-02-18',
  },
  {
    id: 'usr-03', name: 'Trần Bảo Duy', email: 'duy.tran@stretch.vn', role: 'instructor',
    status: 'active', twoFactor: false, studio: 'Quận 1',
    lastLoginAt: shiftStamp(-1, 21, 6), createdAt: '2025-03-14',
  },
  {
    id: 'usr-04', name: 'Lê Thị Quỳnh Như', email: 'nhu.le@stretch.vn', role: 'therapist',
    status: 'active', twoFactor: false, studio: 'Quận 1',
    lastLoginAt: shiftStamp(-2, 18, 55), createdAt: '2025-05-02',
  },
  {
    id: 'usr-05', name: 'Ngô Diễm My', email: 'my.ngo@stretch.vn', role: 'editor',
    status: 'active', twoFactor: false, studio: 'Tất cả',
    lastLoginAt: shiftStamp(-4, 10, 33), createdAt: '2025-09-21',
  },
  {
    id: 'usr-06', name: 'Hoàng Vũ Khang', email: 'khang.hoang@stretch.vn', role: 'therapist',
    status: 'invited', twoFactor: false, studio: 'Hà Nội',
    lastLoginAt: null, createdAt: shiftDate(-3),
  },
  {
    id: 'usr-07', name: 'Đặng Minh Quân', email: 'quan.dang@stretch.vn', role: 'viewer',
    status: 'suspended', twoFactor: false, studio: 'Thảo Điền',
    lastLoginAt: shiftStamp(-46, 15, 2), createdAt: '2026-04-18',
  },
]

const AUDIT_SEED = [
  ['usr-02', 'Thu Hà', 'booking.confirm', 'Xác nhận lịch hẹn BK-8442', -0, 9, 12],
  ['usr-03', 'Trần Bảo Duy', 'program.update', 'Sửa syllabus "Giải phẫu ứng dụng cho Stretching"', -0, 8, 47],
  ['usr-01', 'Minh Hoàng', 'coupon.create', 'Tạo mã HLV40H-EARLY (12 suất)', -1, 17, 24],
  ['usr-02', 'Thu Hà', 'order.mark_paid', 'Đánh dấu đã thu SO-26091 — chuyển khoản VCB', -1, 16, 8],
  ['usr-05', 'Ngô Diễm My', 'post.publish', 'Xuất bản bài "Giãn cơ sau ngày dài ngồi máy"', -1, 11, 39],
  ['usr-03', 'Trần Bảo Duy', 'review.reply', 'Trả lời đánh giá 3 sao ở khoá đánh giá vận động', -2, 20, 15],
  ['usr-02', 'Thu Hà', 'session.reschedule', 'Đổi lịch workshop háng-chậu sang 12/09', -2, 14, 2],
  ['usr-01', 'Minh Hoàng', 'user.invite', 'Mời khang.hoang@stretch.vn với quyền Kỹ thuật viên', -3, 10, 30],
  ['usr-04', 'Lê Thị Quỳnh Như', 'booking.complete', 'Hoàn thành buổi BK-8419', -3, 19, 48],
  ['usr-05', 'Ngô Diễm My', 'media.upload', 'Tải lên 6 ảnh cho trang doanh nghiệp', -4, 13, 21],
  ['usr-02', 'Thu Hà', 'certificate.issue', 'Cấp chứng nhận SA-2026-1077', -5, 9, 5],
  ['usr-01', 'Minh Hoàng', 'settings.update', 'Đổi email nhận thông báo đặt lịch', -6, 8, 58],
  ['usr-02', 'Thu Hà', 'enrolment.manual', 'Ghi danh tay cho Phạm Ngọc Trâm vào khoá HLV 40 giờ', -7, 15, 12],
  ['usr-03', 'Trần Bảo Duy', 'video.attach', 'Gắn video bài 7 khoá giải phẫu vai cổ', -8, 22, 3],
  ['usr-01', 'Minh Hoàng', 'certificate.revoke', 'Thu hồi chứng nhận SA-2026-1230 (hoàn tiền)', -9, 11, 44],
  ['usr-05', 'Ngô Diễm My', 'faq.update', 'Sửa FAQ về chính sách hoàn tiền', -11, 14, 27],
  ['usr-02', 'Thu Hà', 'enquiry.status', 'Chuyển Logistics Bến Nghé sang Đã báo giá', -12, 10, 16],
  ['usr-01', 'Minh Hoàng', 'user.suspend', 'Tạm ngưng tài khoản quan.dang@stretch.vn', -13, 16, 39],
  ['usr-04', 'Lê Thị Quỳnh Như', 'availability.update', 'Đóng khung giờ thứ 7 tuần này', -15, 9, 2],
  ['usr-02', 'Thu Hà', 'order.refund', 'Hoàn tiền SO-26026 và thu hồi quyền học', -18, 13, 51],
]

export const auditLog = AUDIT_SEED.map(([userId, user, action, detail, day, h, m], i) => ({
  id: `log-${String(i + 1).padStart(4, '0')}`,
  userId,
  user,
  action,
  area: action.split('.')[0],
  detail,
  ip: `14.161.${20 + (i % 60)}.${11 + i * 3}`,
  at: shiftStamp(day, h, m),
}))

export const settings = {
  general: {
    brandName: 'Stretch.vn',
    supportEmail: 'hello@stretch.vn',
    supportPhone: '028 7300 4488',
    timezone: 'Asia/Ho_Chi_Minh',
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
  },
  booking: {
    slotMinutes: 30,
    leadTimeHours: 4,
    maxAdvanceDays: 45,
    autoConfirm: false,
    notifyEmails: ['hello@stretch.vn', 'ha.nguyen@stretch.vn'],
  },
  academy: {
    passScore: 70,
    watchedThreshold: 90,
    certificatePrefix: 'SA',
    videoProvider: 'youtube',
    signedPlayback: false,
  },
  payments: {
    currency: 'VND',
    methods: ['transfer', 'vnpay', 'momo', 'cash'],
    bankAccount: 'Vietcombank — 0071 0004 88221 — CT TNHH Stretch Việt Nam',
    manualConfirm: true,
  },
  integrations: [
    { key: 'emailjs', label: 'EmailJS (thông báo đặt lịch)', status: 'connected', note: 'Đang gửi từ client — nên chuyển về server.' },
    { key: 'ga4', label: 'Google Analytics 4', status: 'connected', note: 'Property 402883119.' },
    { key: 'gsc', label: 'Google Search Console', status: 'connected', note: 'Đã xác minh cả hai bản vi/en.' },
    { key: 'tracking-api', label: 'Lead tracking API', status: 'connected', note: 'lead-tracker-api trên VPS.' },
    { key: 'vnpay', label: 'VNPay', status: 'not_connected', note: 'Chưa có merchant, đơn hàng đang xác nhận tay.' },
    { key: 'cf-stream', label: 'Cloudflare Stream', status: 'not_connected', note: 'Cần nếu muốn chống share link video.' },
  ],
}
