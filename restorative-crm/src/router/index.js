import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

/**
 * Every screen is lazy except the dashboard — opening the console should not
 * pull the syllabus builder, the calendar grid and the analytics charts along
 * with it. `meta.title` feeds the document title and the breadcrumb tail.
 */
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { title: 'Đăng nhập', public: true } },

  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { title: 'Tổng quan' } },

  // ── Học viện ──────────────────────────────────────────────────────────
  { path: '/academy/programs', name: 'Programs', component: () => import('@/views/academy/ProgramsView.vue'), meta: { title: 'Chương trình' } },
  { path: '/academy/programs/:id', name: 'ProgramEdit', component: () => import('@/views/academy/ProgramEditView.vue'), meta: { title: 'Sửa chương trình' } },
  { path: '/academy/sessions', name: 'Sessions', component: () => import('@/views/academy/SessionsView.vue'), meta: { title: 'Lịch khai giảng' } },
  { path: '/academy/enrolments', name: 'Enrolments', component: () => import('@/views/academy/EnrolmentsView.vue'), meta: { title: 'Ghi danh' } },
  { path: '/academy/learners', name: 'Learners', component: () => import('@/views/academy/LearnersView.vue'), meta: { title: 'Học viên' } },
  { path: '/academy/learners/:id', name: 'LearnerDetail', component: () => import('@/views/academy/LearnerDetailView.vue'), meta: { title: 'Chi tiết học viên' } },
  { path: '/academy/certificates', name: 'Certificates', component: () => import('@/views/academy/CertificatesView.vue'), meta: { title: 'Chứng nhận' } },
  { path: '/academy/reviews', name: 'Reviews', component: () => import('@/views/academy/ReviewsView.vue'), meta: { title: 'Đánh giá' } },
  { path: '/academy/instructors', name: 'Instructors', component: () => import('@/views/academy/InstructorsView.vue'), meta: { title: 'Giảng viên' } },
  { path: '/academy/mentorship', name: 'Mentorship', component: () => import('@/views/academy/MentorshipView.vue'), meta: { title: 'Buổi 1-1' } },
  { path: '/academy/videos', name: 'LessonVideos', component: () => import('@/views/academy/LessonVideosView.vue'), meta: { title: 'Video bài học' } },
  { path: '/academy/insights', name: 'LearningInsights', component: () => import('@/views/academy/LearningInsightsView.vue'), meta: { title: 'Phân tích học tập' } },

  // ── Bán hàng ──────────────────────────────────────────────────────────
  { path: '/sales/orders', name: 'Orders', component: () => import('@/views/sales/OrdersView.vue'), meta: { title: 'Đơn hàng' } },
  { path: '/sales/payments', name: 'Payments', component: () => import('@/views/sales/PaymentsView.vue'), meta: { title: 'Thanh toán' } },
  { path: '/sales/coupons', name: 'Coupons', component: () => import('@/views/sales/CouponsView.vue'), meta: { title: 'Mã giảm giá' } },

  // ── Trị liệu ──────────────────────────────────────────────────────────
  { path: '/bookings', name: 'Bookings', component: () => import('@/views/BookingsView.vue'), meta: { title: 'Lịch hẹn' } },
  { path: '/bookings/:id', name: 'BookingDetail', component: () => import('@/views/BookingDetailView.vue'), meta: { title: 'Chi tiết lịch hẹn' } },
  { path: '/calendar', name: 'Calendar', component: () => import('@/views/CalendarView.vue'), meta: { title: 'Lịch tuần' } },
  { path: '/availability', name: 'Availability', component: () => import('@/views/therapy/AvailabilityView.vue'), meta: { title: 'Khung giờ' } },

  // ── Nội dung ──────────────────────────────────────────────────────────
  { path: '/blog', name: 'Blog', component: () => import('@/views/BlogView.vue'), meta: { title: 'Bài viết' } },
  { path: '/blog/:slug', name: 'BlogDetail', component: () => import('@/views/BlogDetailView.vue'), meta: { title: 'Chi tiết bài viết' } },
  { path: '/categories', name: 'Categories', component: () => import('@/views/CategoriesView.vue'), meta: { title: 'Danh mục' } },
  { path: '/pages', name: 'Pages', component: () => import('@/views/content/PagesView.vue'), meta: { title: 'Trang tĩnh' } },
  { path: '/faq', name: 'Faq', component: () => import('@/views/content/FaqView.vue'), meta: { title: 'FAQ' } },
  { path: '/media', name: 'Media', component: () => import('@/views/MediaView.vue'), meta: { title: 'Thư viện ảnh' } },
  { path: '/seo', name: 'Seo', component: () => import('@/views/SeoSettingsView.vue'), meta: { title: 'SEO' } },

  // ── Khách hàng ────────────────────────────────────────────────────────
  { path: '/leads', name: 'Leads', component: () => import('@/views/LeadsView.vue'), meta: { title: 'Khách tiềm năng' } },
  { path: '/leads/:id', name: 'LeadDetail', component: () => import('@/views/LeadDetailView.vue'), meta: { title: 'Chi tiết khách' } },
  { path: '/enquiries', name: 'Enquiries', component: () => import('@/views/crm/EnquiriesView.vue'), meta: { title: 'Yêu cầu doanh nghiệp' } },
  { path: '/funnel', name: 'Funnel', component: () => import('@/views/crm/FunnelView.vue'), meta: { title: 'Phễu chuyển đổi' } },

  // ── Phân tích ─────────────────────────────────────────────────────────
  { path: '/google-analytics', name: 'GoogleAnalytics', component: () => import('@/views/GoogleAnalyticsView.vue'), meta: { title: 'Google Analytics' } },
  { path: '/search-console', name: 'SearchConsole', component: () => import('@/views/SearchConsoleView.vue'), meta: { title: 'Search Console' } },

  // ── Hệ thống ──────────────────────────────────────────────────────────
  { path: '/users', name: 'Users', component: () => import('@/views/system/UsersView.vue'), meta: { title: 'Người dùng & quyền' } },
  { path: '/audit', name: 'AuditLog', component: () => import('@/views/system/AuditLogView.vue'), meta: { title: 'Nhật ký thao tác' } },

  // A wrong URL gets a page that explains itself, not a silent redirect.
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFoundView.vue'), meta: { title: 'Không tìm thấy trang' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  import('@/stores/loading.js').then(({ useLoadingStore }) => {
    useLoadingStore().routerStart()
  })

  if (!to.meta.public && !authStore.isAuthenticated) next({ name: 'Login', query: { next: to.fullPath } })
  else if (to.name === 'Login' && authStore.isAuthenticated) next({ name: 'Dashboard' })
  else next()
})

router.afterEach((to) => {
  import('@/stores/loading.js').then(({ useLoadingStore }) => {
    useLoadingStore().routerFinish()
  })
  const title = to.meta?.title
  document.title = title ? `${title} · Stretch.vn` : 'Stretch.vn — Bảng điều khiển'
})

export default router
