<template>
  <section class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(25,28,28,0.04)] border border-outline-variant/10">
    <div class="flex items-center gap-3 mb-6">
      <span class="material-symbols-outlined text-primary">description</span>
      <h3 class="text-lg font-bold">Service Details</h3>
    </div>
    <div class="border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col h-full min-h-[350px]">
      <div class="bg-surface-container-low px-4 py-2 border-b border-outline-variant/20 flex flex-wrap gap-2 sm:gap-4 items-center">
        <button class="p-1 hover:text-primary transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-lg">format_bold</span></button>
        <button class="p-1 hover:text-primary transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-lg">format_italic</span></button>
        <button class="p-1 hover:text-primary transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-lg">format_list_bulleted</span></button>
        <div class="w-[1px] h-4 bg-outline-variant/30 my-auto mx-1"></div>
        <button class="p-1 hover:text-primary transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-lg">link</span></button>
      </div>
      <div class="p-6 flex-1 bg-white text-sm leading-relaxed text-on-surface-variant focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/10 transition-shadow">
        <p class="mb-4">Our Premium Post-Traumatic Recovery program is designed by world-class orthopedic surgeons and physiotherapists.</p>
        <p class="mb-4">We utilize a combination of:</p>
        <ul class="list-disc ml-5 space-y-2">
          <li>Targeted Neuromuscular Stimulation</li>
          <li>Hydrotherapy Sessions in our controlled environment</li>
          <li>Personalized Mobility Re-education</li>
        </ul>
        <p class="mt-4 opacity-50 italic">Type here to continue editing the service content...</p>
      </div>
    </div>
  </section>
</template>
