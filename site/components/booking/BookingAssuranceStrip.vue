<template>
  <div class="w-full bg-off-white py-16 border-t border-border">
    <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div
        v-for="item in items"
        :key="item.icon"
        class="flex items-center gap-6"
      >
        <div class="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-navy shadow-sm">
          <span class="material-symbols-outlined !text-3xl" style="font-variation-settings: 'FILL' 0">{{ item.icon }}</span>
        </div>
        <div>
          <h4 class="font-heading font-bold text-base text-navy">{{ item.title }}</h4>
          <p class="text-text-secondary text-sm">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const items = computed(() => [
  {
    icon: 'verified_user',
    title: t('assurance.secureTitle'),
    description: t('assurance.secureDesc'),
  },
  {
    icon: 'medical_services',
    title: t('assurance.expertTitle'),
    description: t('assurance.expertDesc'),
  },
  {
    icon: 'bolt',
    title: t('assurance.rapidTitle'),
    description: t('assurance.rapidDesc'),
  },
])
</script>
