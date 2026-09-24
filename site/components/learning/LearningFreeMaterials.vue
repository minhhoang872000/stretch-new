<script setup lang="ts">
/**
 * "Tài liệu miễn phí" on the Learning Hub home.
 *
 * Every file an instructor uploaded to a free lesson, or to any lesson of a
 * free course (see /api/materials/free). Each card downloads the file and names
 * the lesson it belongs to, linking back to it.
 *
 * /learning-hub is PRERENDERED, so the build-time list is refreshed once on
 * hydration — a file uploaded after the deploy still shows up, and an API blip
 * never replaces a good list with an empty one.
 */
interface FreeMaterial {
  name: string
  url: string
  size: number
  mime: string
  programSlug: string
  programTitle: string
  lessonTitle: string
  lessonKey: string
}

const MAX = 6

const { t } = useI18n()
const localePath = useLocalePath()

const fetchList = () => $fetch<{ materials: FreeMaterial[] }>('/api/materials/free')
const { data, status } = await useAsyncData('hub-free-materials', fetchList, {
  default: () => ({ materials: [] as FreeMaterial[] }),
  lazy: import.meta.client,
})

onMounted(async () => {
  if (status.value === 'pending' || status.value === 'idle') return
  try {
    const fresh = await fetchList()
    if (fresh.materials.length || !data.value?.materials.length) data.value = fresh
  } catch {
    // Keep the build-time list.
  }
})

const items = computed(() => (data.value?.materials ?? []).slice(0, MAX))
const isLoading = computed(() => status.value === 'pending' && !items.value.length)

function ext(name: string) {
  const e = name.split('.').pop() || ''
  return e.length <= 4 ? e.toUpperCase() : 'FILE'
}
function size(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
function lessonLink(m: FreeMaterial) {
  return localePath(`/learning-hub/learn/${m.programSlug}?lesson=${m.lessonKey}`)
}
</script>

<template>
  <section class="py-6 lg:py-8 bg-white">
    <div class="section-container">
      <div class="hub-section-head">
        <h2 class="hub-section-title">{{ t('learning.materials.title') }}</h2>
      </div>
      <p class="mat-sub">{{ t('learning.materials.subtitle') }}</p>

      <div v-if="isLoading" class="mat-grid">
        <div v-for="n in 3" :key="n" class="mat-card animate-pulse">
          <div class="mat-card__ext bg-gray-200" />
          <div class="flex-1">
            <div class="h-3.5 w-3/4 bg-gray-200 rounded mb-2" />
            <div class="h-2.5 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <ul v-else-if="items.length" class="mat-grid">
        <li v-for="m in items" :key="m.url" class="mat-card">
          <span class="mat-card__ext">{{ ext(m.name) }}</span>
          <div class="mat-card__body">
            <p class="mat-card__name">{{ m.name }}</p>
            <NuxtLink :to="lessonLink(m)" class="mat-card__from">
              {{ m.lessonTitle || m.programTitle }}<template v-if="m.lessonTitle"> · {{ m.programTitle }}</template>
            </NuxtLink>
          </div>
          <a :href="m.url" target="_blank" rel="noopener" class="mat-card__dl" :aria-label="`${t('learning.materials.download')} ${m.name}`">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <polyline points="7 10 12 15 17 10" />
              <path d="M5 21h14" />
            </svg>
            <span class="mat-card__dl-text">{{ t('learning.materials.download') }}</span>
            <span v-if="size(m.size)" class="mat-card__size">{{ size(m.size) }}</span>
          </a>
        </li>
      </ul>

      <p v-else class="mat-empty">{{ t('learning.materials.empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
/* Same heading as the other hub sections (their styles are scoped too). */
.hub-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}
.hub-section-title {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-navy);
}
.mat-sub {
  margin-top: -0.35rem;
  margin-bottom: 1rem;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.mat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 768px) {
  .mat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1100px) {
  .mat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.mat-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.mat-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px -14px rgba(11, 42, 74, 0.3);
}
.mat-card__ext {
  flex-shrink: 0;
  width: 44px;
  height: 52px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-navy);
  color: white;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.mat-card__body {
  flex: 1;
  min-width: 0;
}
.mat-card__name {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mat-card__from {
  display: block;
  margin-top: 0.2rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}
.mat-card__from:hover {
  color: var(--color-accent);
}
.mat-card__dl {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.6rem;
  border-radius: 10px;
  color: var(--color-accent);
  transition: background 0.2s ease;
}
.mat-card__dl:hover {
  background: var(--color-off-white);
}
.mat-card__dl-text {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
}
.mat-card__size {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.mat-empty {
  padding: 1.25rem;
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
