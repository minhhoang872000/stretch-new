<template>
  <div class="card p-5 lg:p-6 h-full flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
      <div>
        <h3 class="font-bold text-sm text-on-surface">Default OG Image</h3>
        <p class="text-xs text-on-surface-variant mt-0.5">Used when a page has no specific social preview image.</p>
      </div>
      <button class="text-primary font-bold text-xs px-3 py-1.5 hover:bg-teal-50 rounded-full transition-colors shrink-0">Replace</button>
    </div>
    <div class="relative group rounded-xl overflow-hidden aspect-video bg-surface-container-low mt-auto w-full">
      <img class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjUBaSWgANZVKcbmdpnKpezCj9peF1McD_p_COrJRVQYkQadZ55hwTH_H9irYcv5WKrt0AqmSGiDumzC5DjXU9bDkSdncL1Br8gB8SCyqpmm89vkNh4JWqaDoAJO_1sI0LJJHTlyZ4KvM2WW7LWamDkKmLwavqpQ2Ir-8Awbi4KOd8JEwCTa2O7vfaDgzUTC5PewHWwCfFTQrA0P3wg1IPRUg75f2o5SCITWOx1Wfd_Hb3P4zmGmWsY5C3KwS65gcMugnHcCGjuFE" />
      <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-white text-3xl">visibility</span>
      </div>
    </div>
  </div>
</template>
