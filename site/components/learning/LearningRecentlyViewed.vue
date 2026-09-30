<script setup lang="ts">
/**
 * "Xem gần đây" — programme pages this browser opened. The list lives in
 * localStorage, so the section only exists after mount (wrap it in
 * <ClientOnly> on prerendered or cached pages).
 *
 * `bare` drops the full-width band, for use inside a page's own container.
 */
const props = withDefaults(defineProps<{ exclude?: string[]; limit?: number; bare?: boolean }>(), {
  exclude: () => [],
  limit: 4,
  bare: false,
})
const { t } = useI18n()
const { items, clear } = useRecentlyViewed()
const list = items(props.exclude, props.limit)
</script>

<template>
  <LearningProgramStrip
    v-if="bare"
    :title="t('learning.recent.title')"
    :items="list"
    :action="t('learning.recent.clear')"
    @action="clear"
  />
  <section v-else-if="list.length" class="py-6 lg:py-8 bg-off-white">
    <div class="section-container">
      <LearningProgramStrip
        :title="t('learning.recent.title')"
        :sub="t('learning.recent.sub')"
        :items="list"
        :action="t('learning.recent.clear')"
        @action="clear"
      />
    </div>
  </section>
</template>
