<template>
  <div class="bg-surface-container-low/50 backdrop-blur rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4 ghost-border">
    <div class="flex-1 w-full min-w-[200px] sm:min-w-[300px] relative">
      <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
      <input
        class="w-full bg-surface-container-lowest border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
        placeholder="Filter by title or keyword..."
        type="text"
      />
    </div>
    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <select class="bg-surface-container-lowest border-none rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20">
        <option>All Categories</option>
        <option>Physical Health</option>
        <option>Mental Wellness</option>
        <option>Recovery Tech</option>
      </select>
      <select class="bg-surface-container-lowest border-none rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20">
        <option>Status: All</option>
        <option>Published</option>
        <option>Draft</option>
        <option>Archived</option>
      </select>
      <button class="bg-surface-container-highest text-on-surface-variant w-12 h-12 rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors">
        <span class="material-symbols-outlined">tune</span>
      </button>
    </div>
  </div>
</template>
