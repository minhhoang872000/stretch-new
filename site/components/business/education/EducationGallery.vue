<template>
  <section class="py-6 bg-[#F9FAFB] px-6 md:px-10 overflow-hidden">
    <div class="max-w-[1340px] mx-auto">
      
      <!-- Multi-image layout: Horizontal Scroll on Mobile, 5-Column Grid on Desktop -->
      <div class="flex lg:grid lg:grid-cols-5 items-stretch gap-3 xl:gap-4 w-full overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar scroll-smooth">
        
        <!-- Image 1 -->
        <div class="w-[220px] sm:w-[260px] lg:w-auto shrink-0 aspect-[1.5] rounded-[16px] overflow-hidden border border-navy/5 shadow-sm group">
          <img 
            src="/education-gallery-1.png" 
            alt="Stretch.vn Training - Instructor and student checking tablet" 
            class="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <!-- Image 2 -->
        <div class="w-[220px] sm:w-[260px] lg:w-auto shrink-0 aspect-[1.5] rounded-[16px] overflow-hidden border border-navy/5 shadow-sm group">
          <img 
            src="/education-gallery-2.png" 
            alt="Stretch.vn Training - Manual shoulder stretching technique" 
            class="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <!-- Image 3 -->
        <div class="w-[220px] sm:w-[260px] lg:w-auto shrink-0 aspect-[1.5] rounded-[16px] overflow-hidden border border-navy/5 shadow-sm group">
          <img 
            src="/education-gallery-3.png" 
            alt="Stretch.vn Training - Movement assessment class lecture" 
            class="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <!-- Image 4 -->
        <div class="w-[220px] sm:w-[260px] lg:w-auto shrink-0 aspect-[1.5] rounded-[16px] overflow-hidden border border-navy/5 shadow-sm group">
          <img 
            src="/education-gallery-4.png" 
            alt="Stretch.vn Training - Practice of manual leg stretching" 
            class="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <!-- Image 5 -->
        <div class="w-[220px] sm:w-[260px] lg:w-auto shrink-0 aspect-[1.5] rounded-[16px] overflow-hidden border border-navy/5 shadow-sm group">
          <img 
            src="/education-gallery-5.png" 
            alt="Stretch.vn Training - Outdoor manual stretching practice" 
            class="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

      </div>
      
    </div>
  </section>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
