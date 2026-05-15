<template>
  <div class="card p-5 lg:p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
    <div class="relative z-10">
      <span class="label-xs bg-primary-fixed/30 px-3 py-1 rounded-full inline-block">{{ $t('seo.health') }}</span>
      <h2 class="text-xl lg:text-2xl font-extrabold text-on-surface mt-3 tracking-tight">
        {{ $t('seo.visibilityHealthy') }} <span class="text-primary">{{ $t('seo.healthy') }}</span>
      </h2>
      <p class="text-on-surface-variant mt-1.5 max-w-md text-sm leading-relaxed">
        {{ $t('seo.healthDescription') }}
      </p>
    </div>
    <div class="flex flex-wrap gap-3 mt-6 relative z-10">
      <button class="btn-primary flex items-center gap-2">
        <span class="material-symbols-outlined text-lg">refresh</span>
        {{ $t('seo.recrawl') }}
      </button>
      <button class="btn-secondary">
        {{ $t('seo.viewReport') }}
      </button>
    </div>
    <!-- Decorative Element -->
    <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl"></div>
  </div>
</template>
