/**
 * Dịch vụ / chuyên viên / khung giờ / lịch hẹn (mock).
 *
 * Mirrors site/server/utils/db.ts (MockProduct, MockPractitioner, MockBooking)
 * and the availability endpoint the booking flow calls, so the console can
 * manage the same fields the site renders — bilingual copy included, because
 * the site publishes both /en and /vi.
 */

import { rng, pick, int, weighted, shiftDate, shiftStamp, NAMES, email, phone, initials, slug } from './_util.js'

const rand = rng(551903)

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

export const serviceCategoriesMock = [
  { key: 'individual', label: 'Cá nhân' },
  { key: 'business', label: 'Doanh nghiệp' },
  { key: 'recovery', label: 'Phục hồi' },
]

const SERVICE_SEED = [
  {
    nameVi: 'Stretch trị liệu 1:1 — 60 phút',
    nameEn: 'One-on-one assisted stretch — 60 min',
    category: 'individual', price: 850000, duration: 60,
    shortVi: 'Buổi kéo giãn có kỹ thuật viên hỗ trợ, phù hợp người ngồi nhiều.',
    shortEn: 'Therapist-assisted stretching for desk-bound bodies.',
    tags: ['cổ vai', 'hông', 'văn phòng'], available: true,
  },
  {
    nameVi: 'Stretch trị liệu 1:1 — 90 phút',
    nameEn: 'One-on-one assisted stretch — 90 min',
    category: 'individual', price: 1190000, duration: 90,
    shortVi: 'Bản dài hơn, xử lý được cả chi dưới trong cùng buổi.',
    shortEn: 'Longer session covering the lower body in the same visit.',
    tags: ['toàn thân'], available: true,
  },
  {
    nameVi: 'Đánh giá vận động lần đầu',
    nameEn: 'Initial movement assessment',
    category: 'individual', price: 450000, duration: 45,
    shortVi: 'Bộ test 12 mục kèm phiếu kết quả và kế hoạch 4 tuần.',
    shortEn: 'A 12-item test set with a written plan for the next four weeks.',
    tags: ['đánh giá'], available: true,
  },
  {
    nameVi: 'Phục hồi sau chạy bộ',
    nameEn: 'Post-run recovery',
    category: 'recovery', price: 690000, duration: 60,
    shortVi: 'Dành cho runner sau race, tập trung bắp chân và háng.',
    shortEn: 'For runners after a race — calves and hips first.',
    tags: ['thể thao', 'runner'], available: true,
  },
  {
    nameVi: 'Gói doanh nghiệp — buổi tại công ty',
    nameEn: 'Corporate on-site session',
    category: 'business', price: 6500000, duration: 120,
    shortVi: 'Một kỹ thuật viên và một HLV tới công ty, tối đa 20 người.',
    shortEn: 'A therapist and a coach on site, up to twenty people.',
    tags: ['doanh nghiệp', 'on-site'], available: true,
  },
  {
    nameVi: 'Gói doanh nghiệp — chuỗi 8 tuần',
    nameEn: 'Corporate 8-week programme',
    category: 'business', price: 42000000, duration: 120,
    shortVi: 'Lịch cố định hàng tuần kèm báo cáo cuối chương trình.',
    shortEn: 'A weekly slot plus a closing report for HR.',
    tags: ['doanh nghiệp', 'dài hạn'], available: true,
  },
  {
    nameVi: 'Sự kiện phục hồi tại giải chạy',
    nameEn: 'Recovery booth at a race',
    category: 'recovery', price: 18500000, duration: 300,
    shortVi: 'Booth phục hồi cho ban tổ chức giải, 4 kỹ thuật viên.',
    shortEn: 'A recovery booth for race organisers, four therapists.',
    tags: ['sự kiện'], available: false,
  },
  {
    nameVi: 'Buổi kèm cặp cho HLV',
    nameEn: 'Coach mentoring session',
    category: 'individual', price: 950000, duration: 75,
    shortVi: 'Dành cho HLV đã học xong khoá 40 giờ, sửa tay trực tiếp.',
    shortEn: 'For graduates of the 40-hour course — hands-on correction.',
    tags: ['nội bộ', 'HLV'], available: true,
  },
]

export const services = SERVICE_SEED.map((s, i) => ({
  id: `srv-${String(i + 1).padStart(3, '0')}`,
  slug: slug(s.nameEn),
  nameVi: s.nameVi,
  nameEn: s.nameEn,
  shortDescriptionVi: s.shortVi,
  shortDescriptionEn: s.shortEn,
  descriptionVi: `<p>${s.shortVi}</p><ul><li>Kỹ thuật viên đánh giá nhanh trước khi vào buổi</li><li>Ghi chú lại vùng cần theo dõi cho buổi sau</li></ul>`,
  category: s.category,
  price: s.price,
  currency: 'VND',
  durationMinutes: s.duration,
  coverImage: `https://picsum.photos/seed/${slug(s.nameEn)}/640/400`,
  tags: s.tags,
  available: s.available,
  bookings30d: s.available ? int(rand, 4, 63) : 0,
  status: s.available ? 'published' : 'hidden',
  updatedAt: shiftStamp(-int(rand, 1, 70), int(rand, 8, 19), int(rand, 0, 59)),
  seo: {
    title: `${s.nameVi} — Stretch.vn`,
    description: s.shortVi,
  },
}))

export const practitioners = [
  {
    id: 'prc-01', name: 'Lê Thị Quỳnh Như', role: 'Kỹ thuật viên trưởng',
    email: 'nhu.le@stretch.vn', phone: '086 903 1174',
    specialties: ['Cổ vai', 'Cột sống'], services: ['srv-001', 'srv-002', 'srv-003'],
    studio: 'Quận 1', weeklyHours: 32, rating: 4.9, sessions30d: 58, status: 'active',
    bio: 'Bảy năm làm trị liệu vận động, phụ trách ca khó của studio Quận 1.',
  },
  {
    id: 'prc-02', name: 'Phạm Hữu Nghĩa', role: 'HLV phục hồi',
    email: 'nghia.pham@stretch.vn', phone: '097 240 5518',
    specialties: ['Thể thao', 'Chi dưới'], services: ['srv-004', 'srv-002'],
    studio: 'Thảo Điền', weeklyHours: 28, rating: 4.7, sessions30d: 41, status: 'active',
    bio: 'Làm nhiều với runner và người chơi golf.',
  },
  {
    id: 'prc-03', name: 'Đinh Thu Ngân', role: 'Kỹ thuật viên',
    email: 'ngan.dinh@stretch.vn', phone: '070 553 8412',
    specialties: ['Hông', 'Chậu'], services: ['srv-001', 'srv-003'],
    studio: 'Quận 1', weeklyHours: 24, rating: 4.6, sessions30d: 36, status: 'active',
    bio: 'Chuyển từ yoga sang trị liệu, mạnh phần vận động chức năng.',
  },
  {
    id: 'prc-04', name: 'Hoàng Vũ Khang', role: 'Kỹ thuật viên',
    email: 'khang.hoang@stretch.vn', phone: '039 118 7605',
    specialties: ['Doanh nghiệp'], services: ['srv-005', 'srv-006'],
    studio: 'Hà Nội', weeklyHours: 30, rating: 4.5, sessions30d: 22, status: 'active',
    bio: 'Phụ trách các buổi on-site cho khách doanh nghiệp phía Bắc.',
  },
  {
    id: 'prc-05', name: 'Trương Bảo Hân', role: 'Kỹ thuật viên (thử việc)',
    email: 'han.truong@stretch.vn', phone: '032 447 9130',
    specialties: ['Cổ vai'], services: ['srv-001'],
    studio: 'Thảo Điền', weeklyHours: 16, rating: 4.2, sessions30d: 9, status: 'trial',
    bio: 'Đang trong hai tháng thử việc, chỉ nhận ca cơ bản.',
  },
]

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

/** Working hours per practitioner per weekday, plus explicit blocks. */
export const availability = practitioners.flatMap((p, pi) =>
  WEEKDAYS.map((day, di) => {
    const off = (pi + di) % 7 === 6 || (p.status === 'trial' && di > 3)
    return {
      id: `avl-${p.id}-${di}`,
      practitionerId: p.id,
      practitionerName: p.name,
      weekday: di,
      weekdayLabel: day,
      studio: p.studio,
      open: !off,
      from: off ? '' : di === 5 ? '08:00' : '09:00',
      to: off ? '' : di === 5 ? '15:00' : '18:30',
      slotMinutes: 30,
      capacityPerSlot: 1,
    }
  }),
)

export const timeOff = [
  {
    id: 'off-01', practitionerId: 'prc-01', practitionerName: 'Lê Thị Quỳnh Như',
    from: shiftDate(6), to: shiftDate(9), reason: 'Dạy workshop tại Hà Nội', status: 'approved',
  },
  {
    id: 'off-02', practitionerId: 'prc-03', practitionerName: 'Đinh Thu Ngân',
    from: shiftDate(-2), to: shiftDate(-2), reason: 'Nghỉ ốm', status: 'approved',
  },
  {
    id: 'off-03', practitionerId: 'prc-02', practitionerName: 'Phạm Hữu Nghĩa',
    from: shiftDate(14), to: shiftDate(21), reason: 'Nghỉ phép năm', status: 'pending',
  },
]

/**
 * Service codes exactly as the website posts them (see src/constants/booking.js).
 * Keeping the mock on the real wire format means the bookings list decodes mock
 * rows with the same helpers it uses for API rows — no second code path.
 */
const SERVICE_CODES = {
  individual: ['pain', 'stiffness', 'not_sure'],
  recovery: ['recovery'],
  business: ['wellness', 'education'],
}

const NOTE_TEXTS = [
  '', '', 'Đau vai phải khi nâng tay quá đầu.', 'Khách xin đổi sang buổi tối nếu được.',
  'Đã tập yoga 2 năm, cần đánh giá trước.', 'Chuẩn bị chạy giải HCMC Marathon.',
]

/** Lịch hẹn — same shape the site's POST /api/bookings sends. */
export const bookings = Array.from({ length: 26 }, (_, i) => {
  const name = NAMES[(i * 3 + 5) % NAMES.length]
  const service = pick(rand, services.filter((s) => s.available))
  const practitioner = pick(rand, practitioners)
  const offset = int(rand, -12, 18)
  const status = offset < 0
    ? weighted(rand, [['completed', 7], ['cancelled', 2]])
    : weighted(rand, [['confirmed', 6], ['pending', 4], ['cancelled', 1]])
  const isBusiness = service.category === 'business'
  const text = pick(rand, NOTE_TEXTS)

  // The website appends a marker line to the note; the console parses it back.
  const markers = isBusiness
    ? [
      `Participants: ${int(rand, 12, 60)}`,
      `Setting: ${pick(rand, ['indoor', 'outdoor'])}`,
      `Address: ${pick(rand, ['Toà Bitexco, Q1', 'KCN Tân Bình', 'Đường Nguyễn Văn Cừ, Q5', 'Toà Keangnam, Hà Nội'])}`,
      'Role: Trưởng phòng nhân sự',
    ]
    : [
      `Location: ${pick(rand, ['clinic', 'home', 'consult'])}`,
      `Contact: ${pick(rand, ['call', 'zalo', 'email'])}`,
    ]

  return {
    id: `bkg-${String(i + 1).padStart(4, '0')}`,
    code: `BK-${8400 + i * 7}`,
    name,
    initials: initials(name),
    phone: phone(rand),
    email: email(rand, name),
    serviceId: service.id,
    /** Wire code — decode with SERVICE_LABELS. */
    service: pick(rand, SERVICE_CODES[service.category] || ['not_sure']),
    /** Human label of the studio's own service catalogue. */
    serviceName: service.nameVi,
    practitionerId: practitioner.id,
    practitioner: practitioner.name,
    studio: practitioner.studio,
    date: shiftDate(offset),
    time: pick(rand, ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30']),
    type: isBusiness ? 'business' : 'personal',
    status,
    price: service.price,
    source: pick(rand, ['Website', 'Website', 'Zalo', 'Điện thoại', 'Giới thiệu']),
    note: [text, markers.join(' | ')].filter(Boolean).join('\n'),
    createdAt: shiftStamp(offset - int(rand, 1, 9), int(rand, 8, 22), int(rand, 0, 59)),
  }
}).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
