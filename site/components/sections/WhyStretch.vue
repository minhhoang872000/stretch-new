<template>
  <section class="py-16 md:py-24 bg-white relative">
    <div class="section-container relative">
      <!-- Outer Card Container matching Where We Work for perfect homepage consistency -->
      <div class="bg-[#FCFDFE] border border-slate-200/80 rounded-[20px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden">
        
        <div class="relative z-10">
          <!-- Top Row: grid on desktop, flex-col on mobile -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
            
            <!-- Left Side: Copy -->
            <div class="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-8">
              <span class="text-xs font-heading font-extrabold text-[#F9531E] uppercase tracking-widest mb-3">
                {{ $t('why_stretch.eyebrow') }}
              </span>
              <h2 class="text-2xl md:text-[34px] font-heading font-extrabold text-[#0B2A4A] leading-tight mb-4 tracking-tight">
                {{ $t('why_stretch.titleLine1') }}<br>
                {{ $t('why_stretch.titleLine2') }}
              </h2>
              <p class="text-[14px] md:text-[15px] text-[#475569] leading-relaxed max-w-[540px]">
                {{ $t('why_stretch.desc') }}
              </p>
            </div>

            <!-- Right Side: Powered by Monaco Block -->
            <div class="lg:col-span-5 bg-[#F8FAFC] border border-slate-200/40 rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.005)] relative overflow-hidden group">
              <!-- Content left -->
              <div class="flex-1 pr-4">
                <span class="text-[10px] text-[#475569]/80 font-extrabold uppercase tracking-widest block mb-2">
                  {{ $t('why_stretch.powered_by') }}
                </span>
                <h3 class="text-2xl md:text-[28px] font-heading font-extrabold text-[#0B2A4A] tracking-tight mb-3">
                  {{ $t('why_stretch.monaco') || 'Monaco' }}
                </h3>
                <p class="text-[12.5px] leading-relaxed text-[#475569]">
                  {{ $t('why_stretch.monaco_desc') }}
                </p>
              </div>

              <!-- Monaco Logo from Project -->
              <img 
                src="~/assets/image/monaco.jpeg" 
                alt="Monaco Healthcare" 
                class="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/20"
              />
            </div>

          </div>

          <!-- Bottom Row: 4-card grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <!-- Card 1: Not a spa -->
            <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.005)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 flex flex-col">
              <div class="w-10 h-10 rounded-full bg-[#EEF2F6]/80 flex items-center justify-center mb-5 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h4 class="text-base font-heading font-extrabold text-[#0B2A4A] mb-2.5">
                {{ $t('why_stretch.not_spa_title') }}
              </h4>
              <p class="text-[13px] md:text-[13.5px] text-[#475569] leading-relaxed flex-1">
                {{ $t('why_stretch.not_spa_desc') }}
              </p>
            </div>

            <!-- Card 2: Not a clinic -->
            <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.005)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 flex flex-col">
              <div class="w-10 h-10 rounded-full bg-[#EEF2F6]/80 flex items-center justify-center mb-5 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h4 class="text-base font-heading font-extrabold text-[#0B2A4A] mb-2.5">
                {{ $t('why_stretch.not_clinic_title') }}
              </h4>
              <p class="text-[13px] md:text-[13.5px] text-[#475569] leading-relaxed flex-1">
                {{ $t('why_stretch.not_clinic_desc') }}
              </p>
            </div>

            <!-- Card 3: Not a gym -->
            <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.005)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 flex flex-col">
              <div class="w-10 h-10 rounded-full bg-[#EEF2F6]/80 flex items-center justify-center mb-5 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h4 class="text-base font-heading font-extrabold text-[#0B2A4A] mb-2.5">
                {{ $t('why_stretch.not_gym_title') }}
              </h4>
              <p class="text-[13px] md:text-[13.5px] text-[#475569] leading-relaxed flex-1">
                {{ $t('why_stretch.not_gym_desc') }}
              </p>
            </div>

            <!-- Card 4 (Highlighted): Structured Recovery System -->
            <div class="bg-white border-2 border-[#F9531E] rounded-2xl p-6 shadow-[0_8px_25px_rgba(249,83,30,0.04)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(249,83,30,0.08)] hover:-translate-y-0.5 flex flex-col relative overflow-hidden group">
              <!-- Tiny glowing corner decoration for extra elite feel -->
              <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#F9531E]/10 to-transparent pointer-events-none" />
              
              <div class="w-10 h-10 rounded-full bg-[#F9531E] flex items-center justify-center mb-5 flex-shrink-0 shadow-[0_4px_12px_rgba(249,83,30,0.2)] transition-transform duration-300 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h4 class="text-base font-heading font-extrabold text-[#0B2A4A] mb-2.5">
                {{ $t('why_stretch.system_title') }}
              </h4>
              <p class="text-[13px] md:text-[13.5px] text-[#475569] leading-relaxed flex-1">
                {{ $t('why_stretch.system_desc') }}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  </section>
</template>
