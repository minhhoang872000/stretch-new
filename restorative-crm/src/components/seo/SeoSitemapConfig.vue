<template>
  <div class="card p-5 lg:p-6 h-full flex flex-col">
    <h3 class="font-bold text-sm text-on-surface mb-5">Sitemap Configuration</h3>
    <div class="space-y-4 flex-1 flex flex-col">
      <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-outlined text-primary text-xl shrink-0">account_tree</span>
          <div class="min-w-0">
            <p class="text-sm font-bold text-on-surface truncate">Sitemap.xml</p>
            <p class="text-[11px] text-on-surface-variant truncate">https://restorativecrm.com/sitemap.xml</p>
          </div>
        </div>
        <span class="material-symbols-outlined text-emerald-600 shrink-0 text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      </div>

      <div class="flex items-center justify-between px-1">
        <span class="text-sm text-on-surface">Auto-generate Sitemap</span>
        <button @click="autoGenerate = !autoGenerate" class="w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors" :class="autoGenerate ? 'bg-primary' : 'bg-outline-variant/30'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-all" :class="autoGenerate ? 'ml-auto' : 'ml-0'"></div>
        </button>
      </div>

      <div class="flex items-center justify-between px-1">
        <span class="text-sm text-on-surface">Ping Google on Publish</span>
        <button @click="pingGoogle = !pingGoogle" class="w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors" :class="pingGoogle ? 'bg-primary' : 'bg-outline-variant/30'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-all" :class="pingGoogle ? 'ml-auto' : 'ml-0'"></div>
        </button>
      </div>

      <div class="pt-3 mt-auto">
        <button @click="regenerate" class="btn-outline w-full">
          Regenerate Sitemap Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const autoGenerate = ref(true)
const pingGoogle = ref(true)

const regenerate = () => {
  alert('Sitemap regenerated successfully!')
}
</script>
