import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  {
    path: '/leads',
    name: 'Leads',
    component: () => import('@/views/LeadsView.vue')
  },
  {
    path: '/leads/:sessionId',
    name: 'LeadDetail',
    component: () => import('@/views/LeadDetailView.vue')
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('@/views/BookingsView.vue')
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
    path: '/services',
    name: 'Services',
    component: () => import('@/views/ServicesView.vue')
  },
  {
    path: '/services/edit',
    name: 'EditService',
    component: () => import('@/views/EditServiceView.vue')
  },
  {
    path: '/seo-settings',
    name: 'SeoSettings',
    component: () => import('@/views/SeoSettingsView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
