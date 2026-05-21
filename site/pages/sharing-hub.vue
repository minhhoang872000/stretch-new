<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeo({
  title: 'Stretch.vn — Sharing Hub',
  description: 'Movement insights, recovery education, team stories, company updates, and event highlights — all in one place.',
  type: 'website',
})

// Category filter state
const activeCategory = ref('all')

const categories = computed(() => [
  { key: 'all', label: t('sharing_hub.categories.all') },
  { key: 'articles', label: t('sharing_hub.categories.articles') },
  { key: 'company_updates', label: t('sharing_hub.categories.company_updates') },
  { key: 'team_stories', label: t('sharing_hub.categories.team_stories') },
  { key: 'events', label: t('sharing_hub.categories.events') },
])

// Featured posts data
const featuredPosts = computed(() => [
  {
    category: t('sharing_hub.featured_posts.f1_category'),
    categoryKey: 'articles',
    title: t('sharing_hub.featured_posts.f1_title'),
    desc: t('sharing_hub.featured_posts.f1_desc'),
    image: '/hero-physiotherapy.png',
    large: true,
  },
  {
    category: t('sharing_hub.featured_posts.f2_category'),
    categoryKey: 'company_updates',
    title: t('sharing_hub.featured_posts.f2_title'),
    desc: t('sharing_hub.featured_posts.f2_desc'),
    image: '/monaco-healthcare.png',
  },
  {
    category: t('sharing_hub.featured_posts.f3_category'),
    categoryKey: 'team_stories',
    title: t('sharing_hub.featured_posts.f3_title'),
    desc: t('sharing_hub.featured_posts.f3_desc'),
    image: '/individual-hero.png',
  },
  {
    category: t('sharing_hub.featured_posts.f4_category'),
    categoryKey: 'events',
    title: t('sharing_hub.featured_posts.f4_title'),
    desc: t('sharing_hub.featured_posts.f4_desc'),
    image: '/marathon.png',
  },
])

// Latest posts data
const allPosts = computed(() => [
  {
    category: t('sharing_hub.posts.p1_category'),
    categoryKey: 'articles',
    title: t('sharing_hub.posts.p1_title'),
    desc: t('sharing_hub.posts.p1_desc'),
    image: '/recovery-who.png',
  },
  {
    category: t('sharing_hub.posts.p2_category'),
    categoryKey: 'company_updates',
    title: t('sharing_hub.posts.p2_title'),
    desc: t('sharing_hub.posts.p2_desc'),
    image: '/education-workshop.png',
  },
  {
    category: t('sharing_hub.posts.p3_category'),
    categoryKey: 'team_stories',
    title: t('sharing_hub.posts.p3_title'),
    desc: t('sharing_hub.posts.p3_desc'),
    image: '/active-who.png',
  },
  {
    category: t('sharing_hub.posts.p4_category'),
    categoryKey: 'events',
    title: t('sharing_hub.posts.p4_title'),
    desc: t('sharing_hub.posts.p4_desc'),
    image: '/education-hero.png',
  },
  {
    category: t('sharing_hub.posts.p5_category'),
    categoryKey: 'articles',
    title: t('sharing_hub.posts.p5_title'),
    desc: t('sharing_hub.posts.p5_desc'),
    image: '/runner-who.png',
  },
  {
    category: t('sharing_hub.posts.p6_category'),
    categoryKey: 'company_updates',
    title: t('sharing_hub.posts.p6_title'),
    desc: t('sharing_hub.posts.p6_desc'),
    image: '/education-gallery-1.png',
  },
  {
    category: t('sharing_hub.posts.p7_category'),
    categoryKey: 'team_stories',
    title: t('sharing_hub.posts.p7_title'),
    desc: t('sharing_hub.posts.p7_desc'),
    image: '/athlete-who.png',
  },
  {
    category: t('sharing_hub.posts.p8_category'),
    categoryKey: 'events',
    title: t('sharing_hub.posts.p8_title'),
    desc: t('sharing_hub.posts.p8_desc'),
    image: '/event-warmup.png',
  },
])

const filteredPosts = computed(() => {
  if (activeCategory.value === 'all') return allPosts.value
  return allPosts.value.filter(p => p.categoryKey === activeCategory.value)
})

// Category badge color mapping
function getCategoryColor(key: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    articles: { bg: 'bg-orange-100', text: 'text-orange-700' },
    company_updates: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    team_stories: { bg: 'bg-blue-100', text: 'text-blue-700' },
    events: { bg: 'bg-amber-100', text: 'text-amber-800' },
  }
  return colors[key] || { bg: 'bg-gray-100', text: 'text-gray-700' }
}
</script>

<template>
  <div class="sharing-hub-page">
    <TheHeader />

    <main>
      <!-- ═══════════════════════════════════════════
           HERO SECTION
           ═══════════════════════════════════════════ -->
      <section class="hero-section">
        <div class="hero-wrapper">
          <!-- Left: Hero Text -->
          <div class="hero-text">
            <h1 class="hero-title">
              {{ t('sharing_hub.hero_title') }}
            </h1>
            <div class="hero-divider"></div>
            <p class="hero-subtitle">
              {{ t('sharing_hub.hero_subtitle') }}
            </p>
          </div>

          <!-- Right: Image Collage -->
          <div class="hero-collage">
            <div class="collage-grid">
              <!-- Left: tall image spanning full height -->
              <div class="collage-cell collage-cell--left">
                <img src="/education-gallery-2.png" alt="Stretching session" />
              </div>
              <!-- Right top -->
              <div class="collage-cell collage-cell--right-top">
                <img src="/education-gallery-3.png" alt="Recovery therapy" />
              </div>
              <!-- Right bottom -->
              <div class="collage-cell collage-cell--right-bottom">
                <img src="/education-gallery-5.png" alt="Team collaboration" />
              </div>
            </div>

            <!-- Circular Badge -->
            <div class="hero-badge-wrapper">
              <div class="hero-badge">
                <div class="hero-badge-inner">
                  <span class="badge-text">Move<br/>Better</span>
                  <div class="badge-icon">
                    <span>S</span>
                  </div>
                  <span class="badge-text">Live<br/>Better</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           FEATURED SECTION
           ═══════════════════════════════════════════ -->
      <section class="py-10 lg:py-14">
        <div class="section-container">
          <!-- Section Header -->
          <div class="flex items-center gap-3 mb-8">
            <div class="w-1 h-7 bg-navy rounded-full"></div>
            <h2 class="font-heading text-xl font-bold text-navy">{{ t('sharing_hub.featured') }}</h2>
          </div>

          <!-- Featured Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Large Featured Card (left) -->
            <div class="featured-card-large group cursor-pointer rounded-2xl overflow-hidden relative bg-navy">
              <img
                :src="featuredPosts[0].image"
                :alt="featuredPosts[0].title"
                class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
              />
              <div class="relative z-10 flex flex-col justify-end h-full p-6 lg:p-8 min-h-[380px] lg:min-h-[420px]">
                <span
                  class="inline-block self-start px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4"
                  :class="getCategoryColor(featuredPosts[0].categoryKey).bg + ' ' + getCategoryColor(featuredPosts[0].categoryKey).text"
                >
                  {{ featuredPosts[0].category }}
                </span>
                <h3 class="text-white font-heading text-xl lg:text-2xl font-bold leading-snug mb-2">
                  {{ featuredPosts[0].title }}
                </h3>
                <p class="text-white/80 text-sm leading-relaxed mb-4 max-w-md">
                  {{ featuredPosts[0].desc }}
                </p>
                <a href="#" class="text-accent font-heading text-sm font-semibold inline-flex items-center gap-1 group/link hover:gap-2 transition-all">
                  {{ t('sharing_hub.read_more') }}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </div>

            <!-- Right column: 3 stacked featured cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-5">
              <div
                v-for="(post, idx) in featuredPosts.slice(1)"
                :key="idx"
                class="featured-card-small group cursor-pointer rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div class="aspect-[4/3] overflow-hidden">
                  <img
                    :src="post.image"
                    :alt="post.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div class="p-4">
                  <span
                    class="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2.5"
                    :class="getCategoryColor(post.categoryKey).bg + ' ' + getCategoryColor(post.categoryKey).text"
                  >
                    {{ post.category }}
                  </span>
                  <h4 class="font-heading text-sm font-bold text-navy leading-snug mb-1.5 line-clamp-2">
                    {{ post.title }}
                  </h4>
                  <p class="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">
                    {{ post.desc }}
                  </p>
                  <a href="#" class="text-accent font-heading text-xs font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                    {{ t('sharing_hub.read_more') }}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           CATEGORY FILTER + LATEST POSTS
           ═══════════════════════════════════════════ -->
      <section class="pb-10 lg:pb-14">
        <div class="section-container">
          <!-- Filter Tabs -->
          <div class="flex justify-center mb-8">
            <div class="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-off-white rounded-2xl border border-border">
              <button
                v-for="cat in categories"
                :key="cat.key"
                @click="activeCategory = cat.key"
                class="category-tab"
                :class="activeCategory === cat.key ? 'category-tab--active' : ''"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Section Header -->
          <div class="flex items-center gap-3 mb-8">
            <div class="w-1 h-7 bg-navy rounded-full"></div>
            <h2 class="font-heading text-xl font-bold text-navy">{{ t('sharing_hub.latest_posts') }}</h2>
          </div>

          <!-- Posts Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <TransitionGroup name="post-card">
              <div
                v-for="(post, idx) in filteredPosts"
                :key="post.title"
                class="post-card group cursor-pointer"
              >
                <div class="rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                  <div class="aspect-[16/10] overflow-hidden">
                    <img
                      :src="post.image"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div class="p-4 flex flex-col flex-1">
                    <span
                      class="inline-block self-start px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2.5"
                      :class="getCategoryColor(post.categoryKey).bg + ' ' + getCategoryColor(post.categoryKey).text"
                    >
                      {{ post.category }}
                    </span>
                    <h4 class="font-heading text-sm font-bold text-navy leading-snug mb-1.5 line-clamp-2">
                      {{ post.title }}
                    </h4>
                    <p class="text-text-secondary text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
                      {{ post.desc }}
                    </p>
                    <a href="#" class="text-accent font-heading text-xs font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all mt-auto">
                      {{ t('sharing_hub.read_more') }}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           WHY WE SHARE SECTION
           ═══════════════════════════════════════════ -->
      <section class="py-10 lg:py-14 bg-off-white">
        <div class="section-container">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Left: Why we share card -->
            <div class="lg:col-span-5">
              <div class="bg-white rounded-2xl border border-border p-8 shadow-card">
                <div class="w-14 h-14 bg-navy/5 rounded-2xl flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-navy" stroke-width="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3 class="font-heading text-xl font-bold text-navy mb-3">{{ t('sharing_hub.why_title') }}</h3>
                <p class="text-text-secondary text-sm leading-relaxed">{{ t('sharing_hub.why_desc') }}</p>
              </div>
            </div>

            <!-- Right: 3 feature cards -->
            <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <!-- Feature 1 -->
              <div class="why-feature-card">
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-accent" stroke-width="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4 class="font-heading text-sm font-bold text-navy mb-1.5">{{ t('sharing_hub.why_f1_title') }}</h4>
                <p class="text-text-secondary text-xs leading-relaxed">{{ t('sharing_hub.why_f1_desc') }}</p>
              </div>

              <!-- Feature 2 -->
              <div class="why-feature-card">
                <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-blue-600" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4 class="font-heading text-sm font-bold text-navy mb-1.5">{{ t('sharing_hub.why_f2_title') }}</h4>
                <p class="text-text-secondary text-xs leading-relaxed">{{ t('sharing_hub.why_f2_desc') }}</p>
              </div>

              <!-- Feature 3 -->
              <div class="why-feature-card">
                <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-emerald-600" stroke-width="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4 class="font-heading text-sm font-bold text-navy mb-1.5">{{ t('sharing_hub.why_f3_title') }}</h4>
                <p class="text-text-secondary text-xs leading-relaxed">{{ t('sharing_hub.why_f3_desc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           CTA BANNER
           ═══════════════════════════════════════════ -->
      <section class="py-10 lg:py-14">
        <div class="section-container">
          <div class="cta-banner">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
              <div class="text-center lg:text-left">
                <h3 class="text-white font-heading text-xl lg:text-2xl font-bold mb-2">
                  {{ t('sharing_hub.cta_title') }}
                </h3>
                <p class="text-white/70 text-sm">
                  {{ t('sharing_hub.cta_subtitle') }}
                </p>
              </div>
              <div class="flex flex-wrap justify-center gap-3">
                <NuxtLink :to="localePath('/individual')" class="cta-btn cta-btn--outline">
                  {{ t('sharing_hub.cta_explore') }}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </NuxtLink>
                <NuxtLink :to="localePath('/booking')" class="cta-btn cta-btn--accent">
                  {{ t('sharing_hub.cta_book') }}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </NuxtLink>
                <a href="#" class="cta-btn cta-btn--outline">
                  {{ t('sharing_hub.cta_follow') }}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
/* ── Hero Section ── */
.hero-section {
  background: var(--color-off-white, #f8f8f6);
  overflow: hidden;
}

.hero-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

@media (min-width: 1024px) {
  .hero-wrapper {
    flex-direction: row;
    align-items: center;
    gap: 4rem;
    padding: 4rem 2rem;
  }
}

.hero-text {
  flex: 0 0 auto;
  max-width: 480px;
}

@media (min-width: 1024px) {
  .hero-text {
    flex: 0 0 38%;
    max-width: none;
  }
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 36px;
  line-height: 1.1;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 48px;
  }
}

.hero-divider {
  width: 56px;
  height: 4px;
  background: var(--color-navy);
  border-radius: 2px;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  color: var(--color-text-secondary, #6b7280);
  font-size: 15px;
  line-height: 1.7;
  max-width: 400px;
}

@media (min-width: 1024px) {
  .hero-subtitle {
    font-size: 16px;
  }
}

/* ── Collage Grid ── */
.hero-collage {
  flex: 1;
  position: relative;
  width: 100%;
  max-width: 600px;
}

@media (min-width: 1024px) {
  .hero-collage {
    max-width: none;
    flex: 0 0 55%;
  }
}

.collage-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
}

.collage-cell {
  overflow: hidden;
  border-radius: 16px;
}

.collage-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.collage-cell:hover img {
  transform: scale(1.05);
}

/* Left image spans both rows (tall) */
.collage-cell--left {
  grid-row: 1 / 3;
}

.collage-cell--right-top {
  grid-column: 2;
  grid-row: 1;
}

.collage-cell--right-bottom {
  grid-column: 2;
  grid-row: 2;
}

/* ── Badge ── */
.hero-badge-wrapper {
  position: absolute;
  /* Position at the intersection: right edge of left image, between the two right images */
  top: 50%;
  left: 53%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.hero-badge {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-navy);
  border: 2px dashed rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badge-spin 20s linear infinite;
  box-shadow: 0 8px 32px rgba(11, 42, 74, 0.3);
}

.hero-badge-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  animation: badge-counter-spin 20s linear infinite;
}

.badge-text {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-align: center;
}

.badge-icon {
  width: 30px;
  height: 30px;
  background: var(--color-accent, #f47a1f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px 0;
}

.badge-icon span {
  color: white;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 14px;
}

@keyframes badge-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes badge-counter-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

/* ── Category Filter Tabs ── */
.category-tab {
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-tab:hover {
  color: var(--color-navy);
  background: white;
}

.category-tab--active {
  color: var(--color-navy);
  background: white;
  border-color: var(--color-border);
  box-shadow: var(--shadow-card);
}

/* ── Post Card Transitions ── */
.post-card-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.post-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.post-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.post-card-move {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Why Feature Card ── */
.why-feature-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  transition: all 0.25s ease;
}

.why-feature-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

/* ── CTA Banner ── */
.cta-banner {
  background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-soft) 100%);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.cta-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 122, 31, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

@media (min-width: 1024px) {
  .cta-banner {
    padding: 3rem 3.5rem;
  }
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}

.cta-btn--outline {
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  background: transparent;
}

.cta-btn--outline:hover {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
}

.cta-btn--accent {
  color: white;
  background: var(--color-accent);
  border: 1.5px solid var(--color-accent);
}

.cta-btn--accent:hover {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
}
</style>
