<template>
  <section class="py-20 lg:py-28 bg-white">
    <div class="section-container">
      <!-- Top: 2 columns -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Left: Why Stretch copy -->
        <div class="card p-8 lg:p-10">
          <div class="inline-flex items-center gap-2 mb-5">
            <div class="w-2 h-2 rounded-full bg-accent" />
            <span class="text-[11px] font-heading font-bold text-accent uppercase tracking-widest">{{ $t('why_stretch.eyebrow') }}</span>
          </div>
          <h2 class="text-h2 font-heading text-navy mb-5 leading-tight">
            {{ $t('why_stretch.titleLine1') }}<br>
            {{ $t('why_stretch.titleLine2') }}
          </h2>
          <p class="text-body text-text-secondary leading-relaxed">
            {{ $t('why_stretch.desc') }}
          </p>
        </div>

        <!-- Right: Monaco block with image -->
        <div class="card p-8 lg:p-10 bg-off-white overflow-hidden">
          <div class="flex flex-col lg:flex-row gap-6 items-start">
            <div class="flex-1">
              <p class="text-[10px] text-text-secondary font-medium uppercase tracking-wider mb-3">{{ $t('why_stretch.powered_by') }}</p>
              <div class="flex items-center gap-3 mb-4">
                <img src="~/assets/image/monaco.jpeg" alt="Monaco Healthcare" class="h-10 w-auto object-contain" />
                <span class="text-2xl font-heading font-bold text-navy tracking-tight">Monaco Healthcare</span>
              </div>
              <p class="text-body text-text-secondary leading-relaxed">
                {{ $t('why_stretch.monaco_desc') }}
              </p>
            </div>
            <div class="w-full lg:w-[180px] flex-shrink-0 rounded-2xl overflow-hidden">
              <img
                src="~/assets/image/monaco.jpeg"
                alt="Monaco Healthcare team"
                class="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: 4-card grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Not a spa -->
        <div class="card p-6 lg:p-7">
          <div class="w-10 h-10 rounded-xl bg-off-white border border-border-default flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7C8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h4 class="text-base font-heading font-semibold text-navy mb-2">{{ $t('why_stretch.not_spa_title') }}</h4>
          <p class="text-sm text-text-secondary leading-relaxed">
            {{ $t('why_stretch.not_spa_desc') }}
          </p>
        </div>

        <!-- Not a clinic -->
        <div class="card p-6 lg:p-7">
          <div class="w-10 h-10 rounded-xl bg-off-white border border-border-default flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7C8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h4 class="text-base font-heading font-semibold text-navy mb-2">{{ $t('why_stretch.not_clinic_title') }}</h4>
          <p class="text-sm text-text-secondary leading-relaxed">
            {{ $t('why_stretch.not_clinic_desc') }}
          </p>
        </div>

        <!-- Not a gym -->
        <div class="card p-6 lg:p-7">
          <div class="w-10 h-10 rounded-xl bg-off-white border border-border-default flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7C8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h4 class="text-base font-heading font-semibold text-navy mb-2">{{ $t('why_stretch.not_gym_title') }}</h4>
          <p class="text-sm text-text-secondary leading-relaxed">
            {{ $t('why_stretch.not_gym_desc') }}
          </p>
        </div>

        <!-- A structured recovery system ✓ (navy card) -->
        <div class="bg-navy rounded-2xl p-6 lg:p-7 border border-navy text-white">
          <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F47A1F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h4 class="text-base font-heading font-semibold text-white mb-2">{{ $t('why_stretch.system_title') }}</h4>
          <p class="text-sm text-white/70 leading-relaxed">
            {{ $t('why_stretch.system_desc') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
