/**
 * Nội dung site: trang tĩnh, FAQ, chuỗi i18n.
 *
 * The site keeps these in files — content/pages/about.md, content/faq/index.md
 * and i18n/locales/{en,vi}.json — so anything edited here is a stand-in for the
 * file the console will eventually write.
 */

import { shiftStamp, shiftDate } from './_util.js'

export const pages = [
  {
    id: 'pg-01', path: '/', titleVi: 'Trang chủ', titleEn: 'Home',
    section: 'Marketing', status: 'published', locales: ['vi', 'en'],
    updatedAt: shiftStamp(-4, 15, 12), updatedBy: 'Minh Hoàng',
    blocks: 9, words: 640,
    seoTitle: 'Stretch.vn — Trị liệu vận động và học viện',
    seoDescription: 'Buổi kéo giãn có kỹ thuật viên hỗ trợ, khoá học cho HLV và chương trình cho doanh nghiệp.',
    note: '',
  },
  {
    id: 'pg-02', path: '/individual', titleVi: 'Dành cho cá nhân', titleEn: 'For individuals',
    section: 'Marketing', status: 'published', locales: ['vi', 'en'],
    updatedAt: shiftStamp(-11, 10, 41), updatedBy: 'Minh Hoàng',
    blocks: 7, words: 520,
    seoTitle: 'Stretch cá nhân 1:1 — Stretch.vn',
    seoDescription: 'Buổi 60 hoặc 90 phút, có đánh giá vận động trước khi vào liệu trình.',
    note: '',
  },
  {
    id: 'pg-03', path: '/business', titleVi: 'Dành cho doanh nghiệp', titleEn: 'For business',
    section: 'Marketing', status: 'published', locales: ['vi', 'en'],
    updatedAt: shiftStamp(-6, 9, 8), updatedBy: 'Thu Hà',
    blocks: 11, words: 880,
    seoTitle: 'Chương trình sức khoẻ cho doanh nghiệp — Stretch.vn',
    seoDescription: 'Buổi on-site, chuỗi 8 tuần và booth phục hồi cho sự kiện.',
    note: 'Ba trang con (corporate-wellness, education-training, recovery-event) dùng chung layout này.',
  },
  {
    id: 'pg-04', path: '/booking', titleVi: 'Đặt lịch', titleEn: 'Booking',
    section: 'Chuyển đổi', status: 'published', locales: ['vi', 'en'],
    updatedAt: shiftStamp(-2, 17, 33), updatedBy: 'Minh Hoàng',
    blocks: 4, words: 210,
    seoTitle: 'Đặt lịch — Stretch.vn',
    seoDescription: 'Chọn dịch vụ, chọn giờ, xác nhận trong vòng một buổi làm việc.',
    note: 'Form gửi qua EmailJS ở client — cần chuyển về server.',
  },
  {
    id: 'pg-05', path: '/learning-hub', titleVi: 'Học viện', titleEn: 'Learning hub',
    section: 'Học viện', status: 'published', locales: ['vi', 'en'],
    updatedAt: shiftStamp(-1, 11, 52), updatedBy: 'Bảo Duy',
    blocks: 8, words: 470,
    seoTitle: 'Học viện Stretch — khoá học cho HLV và kỹ thuật viên',
    seoDescription: 'Khoá đầy đủ, mini course và workshop thực hành tại studio.',
    note: '',
  },
  {
    id: 'pg-06', path: '/about', titleVi: 'Về Stretch', titleEn: 'About',
    section: 'Marketing', status: 'draft', locales: ['vi'],
    updatedAt: shiftStamp(-27, 14, 5), updatedBy: 'Thu Hà',
    blocks: 5, words: 360,
    seoTitle: 'Về Stretch.vn',
    seoDescription: 'Đội ngũ, ba studio và cách bọn mình làm việc.',
    note: 'Bản tiếng Anh chưa dịch — trang đang để nháp.',
  },
]

export const faqs = [
  {
    id: 'faq-01', group: 'Buổi trị liệu',
    questionVi: 'Buổi đầu tiên diễn ra thế nào?',
    answerVi: 'Kỹ thuật viên hỏi bệnh sử vận động khoảng 10 phút, chạy vài test ngắn rồi mới vào buổi kéo giãn.',
    questionEn: 'What happens in the first session?',
    answerEn: 'Ten minutes of movement history, a few short tests, then the stretch work itself.',
    status: 'published', order: 1, updatedAt: shiftStamp(-9, 9, 21),
  },
  {
    id: 'faq-02', group: 'Buổi trị liệu',
    questionVi: 'Cần mang theo gì?',
    answerVi: 'Quần áo co giãn là đủ. Studio có khăn và nước.',
    questionEn: 'What should I bring?',
    answerEn: 'Stretchy clothes. Towels and water are provided.',
    status: 'published', order: 2, updatedAt: shiftStamp(-30, 16, 4),
  },
  {
    id: 'faq-03', group: 'Buổi trị liệu',
    questionVi: 'Đang đau cấp thì có nên đến không?',
    answerVi: 'Không. Nếu đang đau cấp hoặc mới chấn thương dưới 72 giờ, bạn nên gặp bác sĩ trước.',
    questionEn: 'Can I come with acute pain?',
    answerEn: 'No. With acute pain or an injury under 72 hours old, see a doctor first.',
    status: 'published', order: 3, updatedAt: shiftStamp(-30, 16, 9),
  },
  {
    id: 'faq-04', group: 'Học viện',
    questionVi: 'Khoá học có cấp chứng nhận không?',
    answerVi: 'Các khoá đầy đủ và workshop có thi thì cấp chứng nhận kèm mã tra cứu. Mini course thì không.',
    questionEn: 'Do courses come with a certificate?',
    answerEn: 'Full courses and assessed workshops do, with a verifiable code. Mini courses do not.',
    status: 'published', order: 4, updatedAt: shiftStamp(-5, 10, 47),
  },
  {
    id: 'faq-05', group: 'Học viện',
    questionVi: 'Quyền xem video có hết hạn không?',
    answerVi: 'Không hết hạn khi tài khoản còn hoạt động.',
    questionEn: 'Does video access expire?',
    answerEn: 'No, as long as the account stays active.',
    status: 'published', order: 5, updatedAt: shiftStamp(-5, 10, 49),
  },
  {
    id: 'faq-06', group: 'Học viện',
    questionVi: 'Học online có được sửa tay không?',
    answerVi: 'Khoá online không có sửa tay. Muốn được chỉnh trực tiếp thì cần một workshop tại studio.',
    questionEn: 'Do online courses include hands-on correction?',
    answerEn: 'No. Hands-on correction only happens at a studio workshop.',
    status: 'draft', order: 6, updatedAt: shiftStamp(-1, 18, 2),
  },
  {
    id: 'faq-07', group: 'Thanh toán',
    questionVi: 'Có thể chuyển khoản không?',
    answerVi: 'Được. Chuyển khoản xong nhớ ghi mã đơn để bên mình đối chiếu nhanh.',
    questionEn: 'Can I pay by bank transfer?',
    answerEn: 'Yes. Put the order code in the transfer note so we can match it quickly.',
    status: 'published', order: 7, updatedAt: shiftStamp(-16, 13, 30),
  },
  {
    id: 'faq-08', group: 'Thanh toán',
    questionVi: 'Chính sách hoàn tiền ra sao?',
    answerVi: 'Hoàn 100% trong 7 ngày đầu nếu chưa học quá 20% khoá.',
    questionEn: 'What is the refund policy?',
    answerEn: 'Full refund within seven days if under 20% of the course has been watched.',
    status: 'published', order: 8, updatedAt: shiftStamp(-16, 13, 34),
  },
  {
    id: 'faq-09', group: 'Doanh nghiệp',
    questionVi: 'Buổi on-site cần chuẩn bị mặt bằng thế nào?',
    answerVi: 'Một phòng khoảng 25m², sàn phẳng, có thể dựng hai bàn trị liệu.',
    questionEn: 'What space does an on-site session need?',
    answerEn: 'A room of about 25m² with flat flooring for two treatment tables.',
    status: 'published', order: 9, updatedAt: shiftStamp(-22, 11, 15),
  },
  {
    id: 'faq-10', group: 'Doanh nghiệp',
    questionVi: 'Có báo cáo sau chương trình không?',
    answerVi: 'Chuỗi 8 tuần có báo cáo tổng hợp cho phòng nhân sự, không nêu tên cá nhân.',
    questionEn: 'Is there a closing report?',
    answerEn: 'The eight-week programme includes an anonymised summary for HR.',
    status: 'published', order: 10, updatedAt: shiftStamp(-22, 11, 19),
  },
]

/** Chuỗi i18n — mirrors the keys in site/i18n/locales/{vi,en}.json. */
export const translations = [
  { id: 'tr-01', key: 'nav.learning_hub', vi: 'Học viện', en: 'Learning hub', namespace: 'nav', status: 'ok' },
  { id: 'tr-02', key: 'nav.booking', vi: 'Đặt lịch', en: 'Booking', namespace: 'nav', status: 'ok' },
  { id: 'tr-03', key: 'nav.business', vi: 'Doanh nghiệp', en: 'For business', namespace: 'nav', status: 'ok' },
  { id: 'tr-04', key: 'learning.catalog.filter_kind', vi: 'Loại chương trình', en: 'Programme type', namespace: 'learning', status: 'ok' },
  { id: 'tr-05', key: 'learning.catalog.empty', vi: 'Không có chương trình khớp bộ lọc.', en: 'No programme matches these filters.', namespace: 'learning', status: 'ok' },
  { id: 'tr-06', key: 'learning.course.cta_enroll', vi: 'Ghi danh', en: 'Enrol', namespace: 'learning', status: 'ok' },
  { id: 'tr-07', key: 'learning.course.cta_free', vi: 'Học miễn phí', en: 'Start free', namespace: 'learning', status: 'ok' },
  { id: 'tr-08', key: 'learning.course.enroll_pending', vi: 'Bọn mình sẽ liên hệ để hoàn tất ghi danh.', en: 'We will contact you to finish enrolling.', namespace: 'learning', status: 'ok' },
  { id: 'tr-09', key: 'learning.my.continue', vi: 'Học tiếp', en: 'Continue', namespace: 'learning', status: 'ok' },
  { id: 'tr-10', key: 'learning.my.certificate', vi: 'Xem chứng nhận', en: 'View certificate', namespace: 'learning', status: 'ok' },
  { id: 'tr-11', key: 'learning.schedule.seats_left', vi: 'Còn {count} chỗ', en: '{count} seats left', namespace: 'learning', status: 'ok' },
  { id: 'tr-12', key: 'learning.schedule.full', vi: 'Đã kín chỗ', en: 'Fully booked', namespace: 'learning', status: 'ok' },
  { id: 'tr-13', key: 'booking.form.name', vi: 'Họ và tên', en: 'Full name', namespace: 'booking', status: 'ok' },
  { id: 'tr-14', key: 'booking.form.phone', vi: 'Số điện thoại', en: 'Phone number', namespace: 'booking', status: 'ok' },
  { id: 'tr-15', key: 'booking.form.submit', vi: 'Gửi yêu cầu', en: 'Send request', namespace: 'booking', status: 'ok' },
  { id: 'tr-16', key: 'booking.confirm.title', vi: 'Đã nhận yêu cầu của bạn', en: 'We received your request', namespace: 'booking', status: 'ok' },
  { id: 'tr-17', key: 'business.hero.title', vi: 'Sức khoẻ vận động cho cả công ty', en: 'Movement health for the whole company', namespace: 'business', status: 'ok' },
  { id: 'tr-18', key: 'business.hero.cta', vi: 'Nhận báo giá', en: 'Request a quote', namespace: 'business', status: 'ok' },
  { id: 'tr-19', key: 'sharing.read_more', vi: 'Đọc tiếp', en: 'Read more', namespace: 'sharing', status: 'ok' },
  { id: 'tr-20', key: 'sharing.related', vi: 'Bài liên quan', en: 'Related posts', namespace: 'sharing', status: 'ok' },
  { id: 'tr-21', key: 'learning.course.hands_on', vi: 'Có sửa tay trực tiếp', en: '', namespace: 'learning', status: 'missing_en' },
  { id: 'tr-22', key: 'learning.certificate.verify', vi: '', en: 'Verify certificate', namespace: 'learning', status: 'missing_vi' },
  { id: 'tr-23', key: 'booking.form.studio', vi: 'Chọn studio', en: '', namespace: 'booking', status: 'missing_en' },
  { id: 'tr-24', key: 'common.retry', vi: 'Thử lại', en: 'Try again', namespace: 'common', status: 'ok' },
]

/** Media library — the shared image pool for blog, programmes and services. */
export const mediaAssets = Array.from({ length: 18 }, (_, i) => {
  const kinds = ['program', 'service', 'blog', 'instructor', 'studio']
  const kind = kinds[i % kinds.length]
  return {
    id: `med-${String(i + 1).padStart(3, '0')}`,
    name: `${kind}-${String(i + 1).padStart(2, '0')}.webp`,
    url: `https://picsum.photos/seed/stretch-${kind}-${i}/800/600`,
    thumb: `https://picsum.photos/seed/stretch-${kind}-${i}/240/180`,
    kind,
    width: 1600,
    height: 1200,
    sizeKb: 148 + i * 37,
    alt: kind === 'program' ? 'Học viên thực hành kéo giãn tại studio' : 'Ảnh minh hoạ nội dung Stretch',
    usedIn: i % 4 === 0 ? [] : [`/${kind}s`],
    uploadedAt: shiftDate(-(i * 6 + 3)),
    uploadedBy: i % 3 === 0 ? 'Thu Hà' : 'Minh Hoàng',
  }
})
