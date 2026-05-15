<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Back -->
    <router-link to="/leads" class="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-6 font-semibold">
      <span class="material-symbols-outlined text-lg">arrow_back</span>
      Back to Leads
    </router-link>

    <div v-if="store.loading" class="p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <template v-else-if="store.leadDetail">
      <!-- Lead Header -->
      <div class="bg-surface-container-low rounded-2xl p-6 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Lead Detail</span>
            <h1 class="text-xl font-headline font-bold text-on-surface break-all">{{ store.leadDetail.events[0]?.session_id }}</h1>
          </div>
          <div class="flex gap-3 flex-wrap">
            <span v-if="store.leadDetail.events[0]?.utm_source" class="badge-primary">{{ store.leadDetail.events[0].utm_source }}</span>
            <span v-if="store.leadDetail.events[0]?.utm_campaign" class="badge-secondary">{{ store.leadDetail.events[0].utm_campaign }}</span>
            <span v-if="store.leadDetail.events[0]?.device_type" class="badge-outline">{{ store.leadDetail.events[0].device_type }}</span>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div class="bg-surface rounded-xl p-4">
            <p class="text-xs text-on-surface-variant uppercase tracking-wider">Events</p>
            <p class="text-2xl font-bold text-on-surface mt-1">{{ store.leadDetail.events.length }}</p>
          </div>
          <div class="bg-surface rounded-xl p-4">
            <p class="text-xs text-on-surface-variant uppercase tracking-wider">Referrer</p>
            <p class="text-sm font-semibold text-on-surface mt-1 truncate">{{ store.leadDetail.events[0]?.referrer || '(direct)' }}</p>
          </div>
          <div class="bg-surface rounded-xl p-4">
            <p class="text-xs text-on-surface-variant uppercase tracking-wider">First Seen</p>
            <p class="text-sm font-semibold text-on-surface mt-1">{{ formatTime(store.leadDetail.events[0]?.created_at) }}</p>
          </div>
          <div class="bg-surface rounded-xl p-4">
            <p class="text-xs text-on-surface-variant uppercase tracking-wider">Has Booking</p>
            <p class="text-2xl font-bold mt-1" :class="store.leadDetail.booking ? 'text-primary' : 'text-on-surface-variant'">
              {{ store.leadDetail.booking ? '✓' : '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Booking Info (if exists) -->
      <div v-if="store.leadDetail.booking" class="bg-surface-container-low rounded-2xl p-6 mb-6 border-l-4 border-primary">
        <h3 class="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">event_available</span>
          Linked Booking
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-on-surface-variant">Status:</span> <span class="font-semibold ml-1">{{ store.leadDetail.booking.status }}</span></div>
          <div><span class="text-on-surface-variant">Service:</span> <span class="font-semibold ml-1">{{ store.leadDetail.booking.service }}</span></div>
          <div><span class="text-on-surface-variant">Date:</span> <span class="font-semibold ml-1">{{ store.leadDetail.booking.date }}</span></div>
          <div><span class="text-on-surface-variant">Customer:</span> <span class="font-semibold ml-1">{{ store.leadDetail.booking.name }}</span></div>
        </div>
      </div>

      <!-- Event Timeline -->
      <div class="bg-surface-container-low rounded-2xl p-6">
        <h3 class="font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">timeline</span>
          Event Timeline
        </h3>
        <div class="relative pl-8 border-l-2 border-outline-variant/30 space-y-6">
          <div v-for="event in store.leadDetail.events" :key="event.id" class="relative">
            <!-- Dot -->
            <div class="absolute -left-[calc(2rem+5px)] top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                 :class="getDotColor(event)"></div>
            <!-- Card -->
            <div class="bg-surface rounded-xl p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-on-surface text-sm">{{ getEventLabel(event) }}</p>
                  <p class="text-xs text-on-surface-variant mt-1">
                    <span v-if="event.page_source">Page: {{ event.page_source }}</span>
                    <span v-if="event.cta_clicked"> • CTA: {{ event.cta_clicked }}</span>
                    <span v-if="event.form_source"> • Form: {{ event.form_source }}</span>
                    <span v-if="event.service_interest"> • Service: {{ event.service_interest }}</span>
                  </p>
                </div>
                <span class="text-xs text-on-surface-variant whitespace-nowrap">{{ formatTime(event.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="p-12 text-center text-on-surface-variant">Lead not found.</div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLeadsStore } from '@/stores/leads.js'

const route = useRoute()
const store = useLeadsStore()

function getEventLabel(event) {
  if (event.cta_clicked) return `CTA Clicked: ${event.cta_clicked}`
  if (event.form_source) return `Form Submitted: ${event.form_source}`
  if (event.page_source) return `Page View: ${event.page_source}`
  return 'Event'
}

function getDotColor(event) {
  if (event.form_source) return 'bg-primary'
  if (event.cta_clicked) return 'bg-tertiary'
  return 'bg-secondary'
}

function formatTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  const sessionId = route.params.sessionId
  if (sessionId) store.loadLeadDetail(sessionId)
})
</script>
