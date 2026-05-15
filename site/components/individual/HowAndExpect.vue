<script setup lang="ts">
const { t } = useI18n()

const howItems = computed(() => [
  { icon: 'visibility', label: t('individual_page.how_supports.item1') },
  { icon: 'support', label: t('individual_page.how_supports.item2') },
  { icon: 'speed', label: t('individual_page.how_supports.item3') },
])

const expectItems = computed(() => [
  { icon: 'assignment', label: t('individual_page.what_to_expect.item1') },
  { icon: 'medical_services', label: t('individual_page.what_to_expect.item2') },
  { icon: 'menu_book', label: t('individual_page.what_to_expect.item3') },
])
</script>

<template>
  <section class="py-16 lg:py-20 bg-off-white">
    <div class="section-container">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- How Stretch Supports You -->
        <div class="card p-8 lg:p-10">
          <h3 class="text-xl font-heading font-bold text-navy mb-2">{{ $t('individual_page.how_supports.title') }}</h3>
          <p class="text-sm text-text-secondary mb-8">{{ $t('individual_page.how_supports.line') }}</p>
          <div class="flex flex-wrap gap-8">
            <div v-for="item in howItems" :key="item.label" class="flex flex-col items-center text-center gap-3 flex-1 min-w-[100px]">
              <div class="w-14 h-14 rounded-2xl bg-off-white border border-border-default flex items-center justify-center">
                <span class="material-symbols-outlined text-navy text-2xl">{{ item.icon }}</span>
              </div>
              <span class="text-xs font-heading font-semibold text-navy leading-tight">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <!-- What To Expect -->
        <div class="card p-8 lg:p-10">
          <h3 class="text-xl font-heading font-bold text-navy mb-8">{{ $t('individual_page.what_to_expect.title') }}</h3>
          <div class="flex flex-wrap gap-8">
            <div v-for="item in expectItems" :key="item.label" class="flex flex-col items-center text-center gap-3 flex-1 min-w-[100px]">
              <div class="w-14 h-14 rounded-2xl bg-off-white border border-border-default flex items-center justify-center">
                <span class="material-symbols-outlined text-accent text-2xl">{{ item.icon }}</span>
              </div>
              <span class="text-xs font-heading font-semibold text-navy leading-tight">{{ item.label }}</span>
            </div>
          </div>
          <p class="text-xs text-text-secondary text-center mt-6 pt-4 border-t border-border-default">{{ $t('individual_page.what_to_expect.duration') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
