<template>
  <div class="flex min-h-screen bg-surface text-on-surface antialiased">
    <SideNav />
    <div class="flex-1 min-w-0 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">
      <TopBar />
      <div class="flex-1 overflow-x-hidden">
        <RouterView class="pt-16 lg:pt-20" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SideNav from '@/components/layout/SideNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
</script>
