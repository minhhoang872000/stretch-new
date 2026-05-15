<template>
  <section class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(25,28,28,0.04)] border border-outline-variant/10">
    <div class="flex items-center gap-3 mb-6">
      <span class="material-symbols-outlined text-primary">groups</span>
      <h3 class="text-lg font-bold">Target Audience</h3>
    </div>
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-xs font-medium">
          Athletes <button class="material-symbols-outlined text-[14px] hover:text-error transition-colors">close</button>
        </span>
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-xs font-medium">
          Post-Op Patients <button class="material-symbols-outlined text-[14px] hover:text-error transition-colors">close</button>
        </span>
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-xs font-medium">
          Injury Recovery <button class="material-symbols-outlined text-[14px] hover:text-error transition-colors">close</button>
        </span>
      </div>
      <div class="relative">
        <input class="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 text-xs pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow" placeholder="Add tag..." type="text" />
        <button class="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors flex items-center justify-center">
          <span class="material-symbols-outlined text-lg">add_circle</span>
        </button>
      </div>
    </div>
  </section>
</template>
