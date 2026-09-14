/**
 * Khách tiềm năng: yêu cầu doanh nghiệp + phễu chuyển đổi.
 *
 * The site fires CTA / form-source / page-view events through
 * site/composables/useTracking.ts. `funnel` below is what those events look
 * like once rolled up; `enquiries` is the business-page form the sales side
 * actually works from.
 */

import { rng, pick, int, weighted, shiftStamp, shiftDate, phone, slugName } from './_util.js'

const rand = rng(884012)

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'quoted', label: 'Đã báo giá' },
  { value: 'won', label: 'Chốt' },
  { value: 'lost', label: 'Không theo' },
]

const COMPANIES = [
  { name: 'Kỹ thuật Tân Hoà Phát', size: '180 nhân sự', field: 'Sản xuất' },
  { name: 'Ngân hàng Phương Đông — CN Bình Thạnh', size: '64 nhân sự', field: 'Tài chính' },
  { name: 'Studio Hoa Sen Yoga', size: '12 nhân sự', field: 'Thể thao' },
  { name: 'Công ty Phần mềm Vạn Xuân', size: '240 nhân sự', field: 'Công nghệ' },
  { name: 'Trường Quốc tế An Khánh', size: '95 nhân sự', field: 'Giáo dục' },
  { name: 'Logistics Bến Nghé', size: '310 nhân sự', field: 'Vận tải' },
  { name: 'Nha khoa Thanh Tâm', size: '28 nhân sự', field: 'Y tế' },
  { name: 'Giải chạy Sài Gòn Riverside', size: 'Ban tổ chức', field: 'Sự kiện' },
  { name: 'Nội thất Mộc An', size: '52 nhân sự', field: 'Bán lẻ' },
  { name: 'Trung tâm Anh ngữ Bright Path', size: '76 nhân sự', field: 'Giáo dục' },
  { name: 'Dược phẩm Hải Đăng', size: '145 nhân sự', field: 'Dược' },
  { name: 'Khách sạn Bến Thành Riverside', size: '210 nhân sự', field: 'Khách sạn' },
]

const CONTACTS = [
  'Nguyễn Thanh Hằng — HR Manager', 'Trần Đình Khoa — Trưởng phòng hành chính',
  'Lê Bảo Trân — Chủ studio', 'Phạm Quốc Hưng — People Ops',
  'Đỗ Thuý Vy — Phó hiệu trưởng', 'Vũ Mạnh Đức — Giám đốc vận hành',
  'Bùi Kim Thoa — Quản lý phòng khám', 'Hoàng Nhật Trung — Trưởng ban tổ chức',
  'Ngô Diễm My — HR Executive', 'Trịnh Anh Tú — Học vụ',
  'Lâm Hải Yến — Trưởng phòng nhân sự', 'Cao Đăng Khôi — F&B Manager',
]

const NEEDS = [
  'Muốn tổ chức buổi on-site cho khối văn phòng, ưu tiên chiều thứ 6.',
  'Cần chuỗi 8 tuần cho nhóm 30 người, hỏi báo giá theo quý.',
  'Nhân viên ngồi máy nhiều, đau cổ vai — hỏi gói khám sàng lọc trước.',
  'Muốn đặt booth phục hồi cho giải chạy tháng 11.',
  'Hỏi chương trình đào tạo nội bộ cho 4 HLV của trung tâm.',
  'Cần buổi demo 45 phút cho ban lãnh đạo trước khi ký hợp đồng năm.',
  'Ngân sách phúc lợi còn dư, cần triển khai trước cuối quý.',
  'Hỏi kèm cả gói đánh giá vận động cho nhân viên kho.',
]

export const enquiries = COMPANIES.map((c, i) => {
  const status = weighted(rand, [['new', 3], ['contacted', 3], ['quoted', 2], ['won', 2], ['lost', 1]])
  const created = -int(rand, 0, 54)
  return {
    id: `enq-${String(i + 1).padStart(3, '0')}`,
    company: c.name,
    companySize: c.size,
    industry: c.field,
    contact: CONTACTS[i],
    email: `${slugName(CONTACTS[i].split('—')[0])}@${slugName(c.name).slice(0, 12)}.vn`,
    phone: phone(rand),
    interest: pick(rand, ['Buổi on-site', 'Chuỗi 8 tuần', 'Sự kiện phục hồi', 'Đào tạo nội bộ']),
    need: NEEDS[i % NEEDS.length],
    headcount: int(rand, 12, 240),
    budget: pick(rand, [null, 18000000, 42000000, 65000000, 12000000]),
    source: pick(rand, ['Trang doanh nghiệp', 'Trang doanh nghiệp', 'Google Ads', 'Giới thiệu', 'LinkedIn']),
    status,
    // A "new" enquiry is by definition one nobody has picked up yet — giving it
    // an owner would contradict the queue the sales side works from.
    owner: status === 'new' ? '' : pick(rand, ['Minh Hoàng', 'Thu Hà']),
    createdAt: shiftStamp(created, int(rand, 8, 18), int(rand, 0, 59)),
    nextFollowUp: status === 'won' || status === 'lost' ? null : shiftDate(int(rand, 0, 9)),
    lastNote: status === 'lost'
      ? 'Đã chọn nhà cung cấp khác vì cần cả gói khám sức khoẻ tổng quát.'
      : status === 'won'
        ? 'Ký hợp đồng chuỗi 8 tuần, bắt đầu đầu tháng sau.'
        : 'Đang chờ phòng nhân sự chốt lịch nội bộ.',
  }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

/** Phễu: rollup của tracking events từ site. */
export const funnel = [
  { step: 'Xem trang', count: 18420, note: 'page_view trên toàn site' },
  { step: 'Bấm CTA', count: 3164, note: 'cta_click — đặt lịch, ghi danh, báo giá' },
  { step: 'Mở form', count: 1287, note: 'form_source ghi nhận' },
  { step: 'Gửi form', count: 428, note: 'booking + enquiry + ghi danh' },
  { step: 'Thành khách', count: 163, note: 'booking đã xác nhận hoặc đơn đã thu' },
]

export const ctaBreakdown = [
  { name: 'Đặt lịch — hero trang chủ', clicks: 962, submits: 148, source: '/' },
  { name: 'Ghi danh — trang chương trình', clicks: 741, submits: 96, source: '/learning-hub/programs' },
  { name: 'Nhận báo giá — trang doanh nghiệp', clicks: 512, submits: 61, source: '/business' },
  { name: 'Học thử miễn phí', clicks: 486, submits: 187, source: '/learning-hub' },
  { name: 'Đặt lịch — sticky mobile', clicks: 291, submits: 34, source: 'toàn site' },
  { name: 'Xem lịch khai giảng', clicks: 172, submits: 22, source: '/learning-hub/schedule' },
]
