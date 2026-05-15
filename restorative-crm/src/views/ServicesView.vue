<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Page Header & Filter Bar -->
    <section class="mb-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
        <div>
          <span class="label-xs mb-1 block">{{ $t('services.clinicalInventory') }}</span>
          <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">{{ $t('services.catalog') }}</h1>
          <p class="text-on-surface-variant mt-1.5 max-w-md text-sm">{{ $t('services.description') }}</p>
        </div>
        <RouterLink to="/services/edit" class="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
          <span class="material-symbols-outlined text-lg">add</span>
          <span>{{ $t('services.newService') }}</span>
        </RouterLink>
      </div>
      <!-- Filter Bar -->
      <ServiceFilterBar />
    </section>

    <!-- Service Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <ServiceCard 
        v-for="service in services" 
        :key="service.id" 
        :service="service" 
      />
      <PromoServiceCard />
    </div>

    <!-- Footer Stats -->
    <ServiceStats />
  </main>
</template>

<script setup>
import ServiceFilterBar from '@/components/services/ServiceFilterBar.vue'
import ServiceCard from '@/components/services/ServiceCard.vue'
import PromoServiceCard from '@/components/services/PromoServiceCard.vue'
import ServiceStats from '@/components/services/ServiceStats.vue'
import { useServicesStore } from '@/stores/services.js'
import { storeToRefs } from 'pinia'

const store = useServicesStore()
const { services } = storeToRefs(store)
</script>
