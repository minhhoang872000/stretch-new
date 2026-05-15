<template>
  <section class="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between h-full">
    <div>
      <div class="flex items-center gap-3 mb-6">
        <span class="material-symbols-outlined text-tertiary">stars</span>
        <h3 class="text-lg font-bold">Visibility & Status</h3>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-white/50 rounded-lg outline outline-1 outline-outline-variant/15">
          <span class="text-sm font-medium">Service Status</span>
          <div class="relative inline-flex items-center cursor-pointer">
            <input checked class="sr-only peer" type="checkbox" />
            <div class="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </div>
        <div class="space-y-3 pt-4">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input checked class="w-5 h-5 rounded border-0 bg-white text-primary focus:ring-primary/20" type="checkbox" />
            <span class="text-sm group-hover:text-primary transition-colors">Featured Service</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input class="w-5 h-5 rounded border-0 bg-white text-primary focus:ring-primary/20" type="checkbox" />
            <span class="text-sm group-hover:text-primary transition-colors">New Release Badge</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input class="w-5 h-5 rounded border-0 bg-white text-primary focus:ring-primary/20" type="checkbox" />
            <span class="text-sm group-hover:text-primary transition-colors">Active Promotion</span>
          </label>
        </div>
      </div>
    </div>
    <div class="mt-8 p-4 bg-tertiary-fixed rounded-lg border-l-4 border-tertiary">
      <p class="text-xs text-on-tertiary-fixed-variant leading-relaxed">
        <strong class="block mb-1">Clinic Tip:</strong>
        Featured services receive 30% more clinical engagement on the public portal.
      </p>
    </div>
  </section>
</template>
