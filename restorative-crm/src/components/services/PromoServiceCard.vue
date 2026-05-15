<template>
  <div class="group bg-primary text-on-primary rounded-3xl p-8 shadow-lg shadow-primary/10 flex flex-col justify-between relative overflow-hidden border border-primary-container">
    <!-- Texture Overlay -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <svg height="100%" preserveaspectratio="none" viewbox="0 0 100 100" width="100%">
        <defs>
          <pattern height="20" id="dots" patternunits="userSpaceOnUse" width="20">
            <circle cx="2" cy="2" fill="currentColor" r="1"></circle>
          </pattern>
        </defs>
        <rect fill="url(#dots)" height="100%" width="100%"></rect>
      </svg>
    </div>
    <div class="relative">
      <span class="bg-on-primary/20 text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
        {{ promo.badge }}
      </span>
      <h3 class="text-3xl font-headline font-extrabold leading-tight mb-4">
        {{ promo.title }}
      </h3>
      <p class="text-on-primary-container/80 text-sm mb-6">
        {{ promo.description }}
      </p>
    </div>
    <div class="relative flex items-center justify-between mt-auto">
      <div>
        <span class="text-xs uppercase tracking-widest opacity-60">{{ promo.startingAtLabel }}</span>
        <p class="text-2xl font-bold font-headline">{{ promo.price }}</p>
      </div>
      <button class="w-12 h-12 flex-shrink-0 bg-on-primary text-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
        <span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useServicesStore } from '@/stores/services.js'
import { storeToRefs } from 'pinia'

const store = useServicesStore()
const { promo } = storeToRefs(store)
</script>
