<template>
  <div class="flex flex-col min-h-[calc(100vh-5rem)]">
    <ServiceEditHeader />

    <main class="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
      <!-- Section 1: Basic Info (Bento Style) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServiceBasicInfo class="md:col-span-2" />
        <ServiceVisibility />
      </div>

      <!-- Section 2: Images -->
      <ServiceImagery />

      <!-- Section 3: Detailed Description & Target Audience (Asymmetric Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ServiceDetails class="lg:col-span-2" />
        <div class="space-y-8">
          <ServiceTargetAudience />
          <ServiceSeoSettings />
        </div>
      </div>
    </main>

    <ServiceEditFooter />
  </div>
</template>

<script setup>
import ServiceEditHeader from '@/components/services/edit/ServiceEditHeader.vue'
import ServiceBasicInfo from '@/components/services/edit/ServiceBasicInfo.vue'
import ServiceVisibility from '@/components/services/edit/ServiceVisibility.vue'
import ServiceImagery from '@/components/services/edit/ServiceImagery.vue'
import ServiceDetails from '@/components/services/edit/ServiceDetails.vue'
import ServiceTargetAudience from '@/components/services/edit/ServiceTargetAudience.vue'
import ServiceSeoSettings from '@/components/services/edit/ServiceSeoSettings.vue'
import ServiceEditFooter from '@/components/services/edit/ServiceEditFooter.vue'
</script>
