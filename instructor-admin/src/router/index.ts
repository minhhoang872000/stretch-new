import { createRouter, createWebHistory } from 'vue-router'
import { session } from '~/services/session'

/**
 * Every route is lazy — the console is one bundle per screen, so opening the
 * dashboard does not pull the syllabus builder or the analytics charts with it.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('~/views/LoginView.vue'),
      meta: { public: true, title: 'Đăng nhập' },
    },
    {
      path: '/',
      component: () => import('~/layouts/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('~/views/DashboardView.vue'),
          meta: { title: 'Tổng quan' },
        },
        {
          path: 'courses',
          name: 'courses',
          component: () => import('~/views/CoursesView.vue'),
          meta: { title: 'Chương trình' },
        },
        {
          path: 'courses/:id',
          name: 'course-edit',
          component: () => import('~/views/CourseEditView.vue'),
          meta: { title: 'Sửa chương trình' },
        },
        {
          path: 'media',
          name: 'media',
          component: () => import('~/views/MediaView.vue'),
          meta: { title: 'Video' },
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('~/views/SessionsView.vue'),
          meta: { title: 'Lịch đào tạo' },
        },
        {
          path: 'learners',
          name: 'learners',
          component: () => import('~/views/LearnersView.vue'),
          meta: { title: 'Học viên' },
        },
        {
          path: 'learners/:id',
          name: 'learner-detail',
          component: () => import('~/views/LearnerDetailView.vue'),
          meta: { title: 'Chi tiết học viên' },
        },
        {
          path: 'certificates',
          name: 'certificates',
          component: () => import('~/views/CertificatesView.vue'),
          meta: { title: 'Chứng nhận' },
        },
        {
          path: 'reviews',
          name: 'reviews',
          component: () => import('~/views/ReviewsView.vue'),
          meta: { title: 'Đánh giá' },
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('~/views/AnalyticsView.vue'),
          meta: { title: 'Phân tích học tập' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.public && !session.isSignedIn.value) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  if (to.name === 'login' && session.isSignedIn.value) return { name: 'dashboard' }
  return true
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? ''
  document.title = title ? `${title} · Stretch Academy` : 'Stretch Academy'
})
