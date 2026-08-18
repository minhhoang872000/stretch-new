<script setup lang="ts">
/**
 * Featured Sharing Hub posts inside the Learning Hub.
 * Reuses the same live blog source as /sharing-hub — a separate useAsyncData key
 * so it can fail independently without taking the rest of the hub down.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { getHubIndex } = useBlogClient()

const { data: hub, status } = await useAsyncData('learning-hub-posts', () => getHubIndex(), {
  default: () => ({ categories: [], posts: [] }),
  lazy: import.meta.client,
})

const posts = computed(() => ((hub.value?.posts ?? []) as any[]).slice(0, 2))
const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')

// This route is PRERENDERED, so the payload above is frozen at build time — a
// post published afterwards would never show up. Re-fetch once on hydration and
// only swap the list in if the call actually returned posts, so an API blip
// can't wipe out the build-time content.
onMounted(async () => {
  if (status.value === 'pending' || status.value === 'idle') return // client nav: already fetching
  const fresh = await getHubIndex()
  if (fresh.posts.length) hub.value = fresh as any
})
</script>

<template>
  <section class="py-6 lg:py-8 bg-white">
    <div class="section-container">
      <div class="hub-section-head">
        <h2 class="hub-section-title">{{ t('learning.articles.title') }}</h2>
        <NuxtLink :to="localePath('/sharing-hub')" class="hub-more">
          {{ t('learning.see_all') }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="grid grid-cols-2 gap-4 md:gap-6">
        <div v-for="n in 2" :key="n" class="article-row animate-pulse">
          <div class="article-row__thumb bg-gray-200"></div>
          <div class="flex-1 py-1">
            <div class="h-2.5 w-20 bg-gray-200 rounded mb-3"></div>
            <div class="h-3.5 w-full bg-gray-200 rounded mb-2"></div>
            <div class="h-3.5 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-else-if="posts.length" class="grid grid-cols-2 gap-4 md:gap-6">
        <NuxtLink
          v-for="post in posts"
          :key="post.slug"
          :to="localePath(`/sharing-hub/${post.slug}`)"
          class="article-row group"
        >
          <span class="article-row__thumb">
            <NuxtImg
              v-if="post.image"
              :src="post.image"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              format="webp"
              sizes="(max-width: 767px) 46vw, 180px"
            />
          </span>

          <span class="min-w-0 flex flex-col">
            <span class="flex items-center gap-2 mb-1.5">
              <span class="article-cat">{{ post.category }}</span>
              <span v-if="post.readTime" class="text-[10px] text-text-secondary/80">{{ post.readTime }}</span>
            </span>
            <span class="article-title">{{ post.title }}</span>
            <span class="article-desc">{{ post.excerpt }}</span>
            <span class="article-link">
              {{ t('learning.articles.read') }}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </span>
        </NuxtLink>
      </div>

      <!-- API unreachable / no posts yet -->
      <div v-else class="rounded-xl border border-border bg-off-white px-5 py-5 text-center">
        <p class="text-[12.5px] text-text-secondary">{{ t('learning.articles.empty') }}</p>
        <NuxtLink :to="localePath('/sharing-hub')" class="hub-more mt-2 inline-flex">
          {{ t('learning.articles.go_hub') }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.hub-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: color 0.2s ease;
}
.hub-more:hover {
  color: var(--color-accent);
}

/* ── Article rows: image + copy, no card chrome (as in the design) ── */
.article-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.article-row__thumb {
  display: block;
  flex-shrink: 0;
  width: 150px;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-off-white);
}

.article-cat {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.45rem;
  border-radius: 5px;
  background: rgba(244, 122, 31, 0.1);
  color: var(--color-accent);
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.article-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-heading);
  font-size: 13.5px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--color-navy);
  transition: color 0.2s ease;
}
.article-row:hover .article-title {
  color: var(--color-accent);
}

.article-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0.35rem;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.article-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.5rem;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: color 0.2s ease;
}
.article-row:hover .article-link {
  color: var(--color-accent);
}

/* ══ Mobile: two cards side by side, thumbnail stacked above the copy. The
   excerpt is dropped — at half the viewport width it would push the card past
   a comfortable height without adding much. ══ */
@media (max-width: 767px) {
  .article-row {
    flex-direction: column;
    gap: 0.65rem;
  }

  .article-row__thumb {
    width: 100%;
  }

  .article-cat {
    padding: 0;
    background: none;
  }

  .article-title {
    -webkit-line-clamp: 3;
    font-size: 13px;
  }

  .article-desc {
    display: none;
  }

  .article-link {
    padding-top: 0.55rem;
    color: var(--color-navy-light);
  }
}
</style>
