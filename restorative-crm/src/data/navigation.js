/**
 * Console information architecture.
 *
 * Thirty-odd screens do not fit in one flat list, so the sidebar is grouped by
 * the part of the business each screen belongs to — the same split the site
 * itself has (học viện / bán hàng / trị liệu / nội dung / khách / hệ thống).
 * `badge` names a counter in the mock DB store; the sidebar renders it only
 * when the count is above zero, so a quiet area stays quiet.
 */

export const navGroups = [
  {
    id: 'overview',
    label: '',
    items: [
      { path: '/dashboard', icon: 'space_dashboard', label: 'Tổng quan' },
    ],
  },
  {
    id: 'academy',
    label: 'Học viện',
    items: [
      { path: '/academy/programs', icon: 'school', label: 'Chương trình', badge: 'programsDraft' },
      { path: '/academy/sessions', icon: 'event_upcoming', label: 'Lịch khai giảng', badge: 'sessionsToday' },
      { path: '/academy/enrolments', icon: 'how_to_reg', label: 'Ghi danh' },
      { path: '/academy/learners', icon: 'groups', label: 'Học viên' },
      { path: '/academy/certificates', icon: 'workspace_premium', label: 'Chứng nhận' },
      { path: '/academy/reviews', icon: 'reviews', label: 'Đánh giá', badge: 'reviewsPending' },
      { path: '/academy/instructors', icon: 'co_present', label: 'Giảng viên' },
      { path: '/academy/mentorship', icon: 'connect_without_contact', label: 'Buổi 1-1', badge: 'mentorshipPending' },
      { path: '/academy/videos', icon: 'movie', label: 'Video bài học', badge: 'videosMissing' },
      { path: '/academy/insights', icon: 'insights', label: 'Phân tích học tập' },
    ],
  },
  {
    id: 'sales',
    label: 'Bán hàng',
    items: [
      { path: '/sales/orders', icon: 'receipt_long', label: 'Đơn hàng', badge: 'ordersPending' },
      { path: '/sales/payments', icon: 'account_balance', label: 'Thanh toán' },
      { path: '/sales/coupons', icon: 'sell', label: 'Mã giảm giá' },
    ],
  },
  {
    id: 'therapy',
    label: 'Trị liệu',
    items: [
      { path: '/bookings', icon: 'event_available', label: 'Lịch hẹn', badge: 'bookingsPending' },
      { path: '/calendar', icon: 'calendar_month', label: 'Lịch tuần' },
      { path: '/availability', icon: 'schedule', label: 'Khung giờ' },
    ],
  },
  {
    id: 'content',
    label: 'Nội dung',
    items: [
      { path: '/blog', icon: 'article', label: 'Bài viết' },
      { path: '/categories', icon: 'category', label: 'Danh mục' },
      { path: '/pages', icon: 'description', label: 'Trang tĩnh' },
      { path: '/faq', icon: 'help_center', label: 'FAQ' },
      { path: '/media', icon: 'photo_library', label: 'Thư viện ảnh' },
      { path: '/seo', icon: 'travel_explore', label: 'SEO' },
    ],
  },
  {
    id: 'crm',
    label: 'Khách hàng',
    items: [
      { path: '/leads', icon: 'person_search', label: 'Khách tiềm năng' },
      { path: '/enquiries', icon: 'contact_mail', label: 'Yêu cầu doanh nghiệp', badge: 'enquiriesNew' },
      { path: '/funnel', icon: 'filter_alt', label: 'Phễu chuyển đổi' },
    ],
  },
  {
    id: 'analytics',
    label: 'Phân tích',
    items: [
      { path: '/google-analytics', icon: 'analytics', label: 'Google Analytics' },
      { path: '/search-console', icon: 'manage_search', label: 'Search Console' },
    ],
  },
  {
    id: 'system',
    label: 'Hệ thống',
    items: [
      { path: '/users', icon: 'manage_accounts', label: 'Người dùng & quyền' },
      { path: '/audit', icon: 'history', label: 'Nhật ký thao tác' },
    ],
  },
]

/** Flat list for the command palette and breadcrumb lookups. */
export const navIndex = navGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label || 'Tổng quan' })),
)

/** "Tạo mới" menu in the top bar — the five things created most often. */
export const quickCreate = [
  { label: 'Lịch hẹn', icon: 'event_available', to: '/bookings?new=1' },
  { label: 'Chương trình', icon: 'school', to: '/academy/programs?new=1' },
  { label: 'Buổi khai giảng', icon: 'event_upcoming', to: '/academy/sessions?new=1' },
  { label: 'Mã giảm giá', icon: 'sell', to: '/sales/coupons?new=1' },
  { label: 'Bài viết', icon: 'article', to: '/blog?new=1' },
]

/** Palette entries that are actions rather than destinations. */
export const paletteActions = [
  { id: 'new-booking', label: 'Tạo lịch hẹn mới', icon: 'event_available', to: '/bookings?new=1', group: 'Tác vụ' },
  { id: 'new-program', label: 'Tạo chương trình mới', icon: 'school', to: '/academy/programs?new=1', group: 'Tác vụ' },
  { id: 'pending-orders', label: 'Đơn chờ thanh toán', icon: 'receipt_long', to: '/sales/orders?status=pending', group: 'Tác vụ' },
  { id: 'pending-reviews', label: 'Đánh giá chờ duyệt', icon: 'reviews', to: '/academy/reviews?status=pending', group: 'Tác vụ' },
  { id: 'missing-videos', label: 'Bài học thiếu video', icon: 'movie', to: '/academy/videos?status=missing', group: 'Tác vụ' },
]
