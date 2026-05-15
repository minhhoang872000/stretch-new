<template>
  <section class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(25,28,28,0.04)] border border-outline-variant/10">
    <div class="flex items-center gap-3 mb-6">
      <span class="material-symbols-outlined text-primary">info</span>
      <h3 class="text-lg font-bold">Basic Information</h3>
    </div>
    <div class="grid grid-cols-1 gap-6">
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Service Name</label>
        <input class="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all py-3 px-4" type="text" value="Premium Post-Traumatic Recovery" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
          <select class="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all py-3 px-4">
            <option>Physiotherapy</option>
            <option selected>Rehabilitation</option>
            <option>Consultation</option>
            <option>Mental Wellness</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Display Order</label>
          <input class="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all py-3 px-4" type="number" value="1" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Short Description</label>
        <textarea class="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all py-3 px-4" rows="3">A clinical-grade recovery program designed for patients recovering from severe physical trauma and sports-related injuries.</textarea>
      </div>
    </div>
  </section>
</template>
