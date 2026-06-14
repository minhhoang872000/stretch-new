import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('@/views/BookingsView.vue')
  },
  {
    path: '/bookings/:id',
    name: 'BookingDetail',
    component: () => import('@/views/BookingDetailView.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/CalendarView.vue')
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/views/BlogView.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('@/views/BlogDetailView.vue')
  },
  // Tạm thời ẩn trang Services
  // {
  //   path: '/services',
  //   name: 'Services',
  //   component: () => import('@/views/ServicesView.vue')
  // },
  // {
  //   path: '/services/edit',
  //   name: 'EditService',
  //   component: () => import('@/views/EditServiceView.vue')
  // },
  {
    path: '/google-analytics',
    name: 'GoogleAnalytics',
    component: () => import('@/views/GoogleAnalyticsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.name !== 'Login' && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

