<template>
  <section class="bg-white border-y border-border-default">
    <div class="section-container py-8 lg:py-10">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-border-default">
        <!-- Metric 1 -->
        <div class="flex items-center gap-4 lg:pr-8">
          <div class="w-12 h-12 rounded-xl bg-off-white border border-border-default flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-heading font-bold text-navy">{{ $t('trust_bar.hours_count') }}</p>
            <p class="text-sm text-text-secondary">{{ $t('trust_bar.hours_label') }}</p>
          </div>
        </div>

        <!-- Metric 2 -->
        <div class="flex items-center gap-4 lg:px-8">
          <div class="w-12 h-12 rounded-xl bg-off-white border border-border-default flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-heading font-bold text-navy">{{ $t('trust_bar.events_count') }}</p>
            <p class="text-sm text-text-secondary">{{ $t('trust_bar.events_label') }}</p>
          </div>
        </div>

        <!-- Metric 3 -->
        <div class="flex items-center gap-4 lg:px-8">
          <div class="w-12 h-12 rounded-xl bg-off-white border border-border-default flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-heading font-bold text-navy">{{ $t('trust_bar.partners_count') }}</p>
            <p class="text-sm text-text-secondary">{{ $t('trust_bar.partners_label') }}</p>
          </div>
        </div>

        <!-- Powered by Monaco -->
        <div class="flex items-center gap-4 lg:pl-8">
          <div class="text-right lg:text-left">
            <p class="text-[10px] text-text-secondary font-medium uppercase tracking-wider mb-1">{{ $t('trust_bar.powered_by') }}</p>
            <div class="flex items-center gap-3">
              <img src="~/assets/image/monaco.jpeg" alt="Monaco Healthcare" class="h-10 w-auto object-contain" />
              <span class="text-lg font-heading font-bold text-navy tracking-tight block leading-tight">Monaco Healthcare</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
