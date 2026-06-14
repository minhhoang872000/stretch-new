import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
  { path: '/bookings', name: 'Bookings', component: () => import('@/views/BookingsView.vue') },
  { path: '/bookings/:id', name: 'BookingDetail', component: () => import('@/views/BookingDetailView.vue') },
  { path: '/categories', name: 'Categories', component: () => import('@/views/CategoriesView.vue') },
  { path: '/calendar', name: 'Calendar', component: () => import('@/views/CalendarView.vue') },
  { path: '/blog', name: 'Blog', component: () => import('@/views/BlogView.vue') },
  { path: '/blog/:slug', name: 'BlogDetail', component: () => import('@/views/BlogDetailView.vue') },
  { path: '/google-analytics', name: 'GoogleAnalytics', component: () => import('@/views/GoogleAnalyticsView.vue') },
  { path: '/leads', name: 'Leads', component: () => import('@/views/LeadsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Start progress bar
  import('@/stores/loading.js').then(({ useLoadingStore }) => {
    const loading = useLoadingStore()
    loading.routerStart()
  })

  if (to.name !== 'Login' && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

router.afterEach(() => {
  import('@/stores/loading.js').then(({ useLoadingStore }) => {
    const loading = useLoadingStore()
    loading.routerFinish()
  })
})

export default router
