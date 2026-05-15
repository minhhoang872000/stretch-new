<script setup lang="ts">
defineProps<{
  date: string
  time: string
  serviceId: string
}>()

const localePath = useLocalePath()
</script>

<template>
  <div class="max-w-2xl mx-auto text-center py-20 animate-fade-in">
    <div class="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 animate-scale-in shadow-lg shadow-accent/20">
      <span class="material-symbols-outlined !text-4xl text-white" style="font-variation-settings: 'FILL' 0">
        check
      </span>
    </div>

    <h2 class="font-heading text-3xl font-bold text-navy mb-4">
      {{ $t('booking.successTitle') }}
    </h2>

    <p class="text-text-secondary mb-2">
      {{ $t('booking.successDesc') }}
    </p>

    <div class="inline-block px-6 py-3 bg-off-white rounded-2xl mb-12 border border-border">
      <p class="text-navy font-bold text-sm">
        {{ date }} {{ $t('booking.at') }} {{ time }}
      </p>
      <p class="text-text-secondary text-xs mt-1">
        {{ $t('booking.successEmail') }}
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <NuxtLink :to="localePath('/')" class="btn-navy">
        <span class="material-symbols-outlined !text-xl">home</span>
        {{ $t('booking.home') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/booking')" class="btn-outline">
        <span class="material-symbols-outlined !text-xl">add</span>
        {{ $t('booking.bookAnother') }}
      </NuxtLink>
    </div>
  </div>
</template>
