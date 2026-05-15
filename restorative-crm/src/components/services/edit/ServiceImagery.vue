<template>
  <section class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(25,28,28,0.04)] border border-outline-variant/10">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary">image</span>
        <h3 class="text-lg font-bold">Service Imagery</h3>
      </div>
      <span class="text-xs text-outline">Max 5MB per image. Recommended size 1200x800px</span>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Upload Placeholder -->
      <div class="lg:col-span-1 aspect-square bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group p-4 text-center">
        <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary mb-2 transition-colors">add_a_photo</span>
        <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Add Image</p>
      </div>
      <!-- Image Slots -->
      <div class="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-xl outline outline-1 outline-outline-variant/15 flex gap-4 items-center">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0">
            <img alt="Clinic Interior" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpcE0WJWHaKN_5e_2dohb6hB9MMmIg5jjikbF61E978Gz8l8h9NFbd3oY6g4xF8TUTJqXeRJqnUPhNtg1X1DEl4znGQ_iXFHwLQHgc78YMesD5MJfHNrtsIUD2E8ZMQsvIGGkHGZcUzxfMIf1Kydyy8GGh4SLf1RDFGRrxWi40-JVdSqYNSbkImHHaMEsDc4q3ZV3VJz4oz4RuQinWqTDEFWpz2k0sdR7t_kwXlJBrVQLaOYGRzCzUhkjxS7oNda5KY1a1ahqk-ak" />
          </div>
          <div class="flex-1 space-y-2 min-w-0">
            <input class="w-full text-xs bg-surface-container-low border-0 rounded-md py-2 px-3 focus:ring-1 focus:ring-primary/20" placeholder="Alt text..." type="text" value="Patient treatment room" />
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-primary font-bold truncate pr-2">Primary Image</span>
              <button class="text-error hover:opacity-70 flex-shrink-0"><span class="material-symbols-outlined text-sm">delete</span></button>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl outline outline-1 outline-outline-variant/15 flex gap-4 items-center opacity-80 hover:opacity-100 transition-opacity">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0">
            <img alt="Equipment" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo3TyMMDMnlB5J93xrG0FWoSCkdtyOQPWu5I39MLni8YHgIWlfbHsU5dFmt_JkavN-3EQfaVi_6aTFCSCtwbawBjhMVdQ2H0a_Usvf0m8BZeSKIXBzOUImKDfZHh0N_WP9SKA3IXEXfHDJbGmq9ZkcxhkJ2r0gxMUX9hImoyrULuILCLhW3xcGt_LUY_84lCYGpWjvvzb7A5MPwcNGRGagjJNI_eswp52PYVYWna3f0XhR76sa9Hss_l8-ZHcC2SuINmBOfVG49mE" />
          </div>
          <div class="flex-1 space-y-2 min-w-0">
            <input class="w-full text-xs bg-surface-container-low border-0 rounded-md py-2 px-3 focus:ring-1 focus:ring-primary/20" placeholder="Alt text..." type="text" value="High-tech recovery equipment" />
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-outline font-bold truncate pr-2">Thumbnail</span>
              <button class="text-error hover:opacity-70 flex-shrink-0"><span class="material-symbols-outlined text-sm">delete</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
