<template>
  <footer class="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-outline-variant/10 shadow-[0_-10px_30px_rgba(25,28,28,0.03)] z-20">
    <div class="w-full sm:w-auto">
      <button class="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
        Cancel Changes
      </button>
    </div>
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
      <button class="w-full sm:w-auto px-8 py-2.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-bold text-sm hover:opacity-90 transition-all text-center">
        Save Draft
      </button>
      <button class="w-full sm:w-auto px-10 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-center">
        Save & Publish
      </button>
    </div>
  </footer>
</template>
