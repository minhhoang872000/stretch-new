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
    <div class="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 animate-scale-in shadow-lg shadow-accent/20 text-white">
      <svg class="w-10 h-10 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
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
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        {{ $t('booking.home') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/booking')" class="btn-outline">
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ $t('booking.bookAnother') }}
      </NuxtLink>
    </div>
  </div>
</template>
