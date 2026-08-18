<script setup lang="ts">
const { t } = useI18n()

const values = ['v1', 'v2', 'v3', 'v4']
</script>

<template>
  <section class="value-bar">
    <div class="section-container grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 py-4">
      <div v-for="(key, i) in values" :key="key" class="flex items-start gap-2.5">
        <span class="value-icon">
          <svg v-if="i === 0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3 8-8" />
            <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
          </svg>
          <svg v-else-if="i === 1" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          <svg v-else-if="i === 2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="0.7" fill="currentColor" />
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
        </span>
        <div class="min-w-0">
          <p class="value-title">{{ t(`learning.values.${key}_title`) }}</p>
          <p class="value-desc">{{ t(`learning.values.${key}_desc`) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.value-bar {
  background: var(--color-off-white);
  border-top: 1px solid var(--color-border);
}

.value-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-navy);
}

.value-title {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.3;
}

.value-desc {
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
</style>
