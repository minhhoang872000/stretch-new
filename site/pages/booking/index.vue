<script setup lang="ts">
import BookingLanding from '~/components/booking/BookingLanding.vue'

// The two flows carry PrimeVue (its components and a 230 KB theme stylesheet).
// Imported statically they were part of this page's chunk, and Nuxt prefetches
// a page's chunk wherever a link to it is on screen — the "Đặt lịch" button in
// the header — so every page of the site downloaded PrimeVue. As async
// components they load only here, and only once this page is open.
const loadIndividualFlow = () => import('~/components/booking/IndividualBookingFlow.vue')
const loadBusinessFlow = () => import('~/components/booking/BusinessBookingFlow.vue')
const IndividualBookingFlow = defineAsyncComponent(loadIndividualFlow)
const BusinessBookingFlow = defineAsyncComponent(loadBusinessFlow)

const { t } = useI18n()

useSeo({
  title: t('seo.booking_title'),
  description: t('seo.booking_desc'),
  type: 'website',
})

const route = useRoute()
const bookingFlow = ref<'none' | 'individual' | 'business'>('none')
const currentStep = ref(1)

// Pre-select flow if needed (e.g. from query params)
onMounted(() => {
  // Fetch both flows as soon as the landing is up, so choosing one is instant.
  loadIndividualFlow()
  loadBusinessFlow()
  if (route.query.type === 'business') {
    bookingFlow.value = 'business'
  } else if (route.query.type === 'individual') {
    bookingFlow.value = 'individual'
  }
})

function selectFlow(flow: 'individual' | 'business') {
  bookingFlow.value = flow
  currentStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetFlow() {
  bookingFlow.value = 'none'
  currentStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="bg-background min-h-screen">
    <TheHeader />

    <main class="min-h-[80vh]">
      <Transition name="page" mode="out-in">
        <!-- Step 0: Landing / Selection -->
        <BookingLanding 
          v-if="bookingFlow === 'none'" 
          key="landing"
          @select-flow="selectFlow" 
        />

        <!-- Individual Flow -->
        <IndividualBookingFlow 
          v-else-if="bookingFlow === 'individual'" 
          key="individual"
          @back="resetFlow"
        />

        <!-- Business Flow -->
        <BusinessBookingFlow 
          v-else-if="bookingFlow === 'business'" 
          key="business"
          @back="resetFlow"
        />
      </Transition>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
