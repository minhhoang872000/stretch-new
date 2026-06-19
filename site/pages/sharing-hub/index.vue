<script setup lang="ts">
const { t, te } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

useSeo({
  title: "Stretch.vn — Sharing Hub",
  description:
    "Movement insights, recovery education, team stories, company updates, and event highlights — all in one place.",
  image: "/homepage-hero.webp",
  type: "website",
});

// Category filter state
const activeCategory = ref("all");

// Keyword search state
const searchQuery = ref("");

// Watch for category query parameter change
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory && typeof newCategory === "string") {
      activeCategory.value = newCategory;
    } else {
      activeCategory.value = "all";
    }
  },
  { immediate: true },
);

// Fixed high-quality webp images for the hero collage
const collageImages = [
  '/booking-hero.webp',
  '/homepage-hero.webp',
  '/stretch-zone.webp'
];

// ── Fetch categories + published posts in ONE parallel round-trip ────
// (single /categories call + one summary /blog call, no waterfall).
const { getHubIndex } = useBlogClient()

const { data: hub, status } = await useAsyncData('hub-index', () => getHubIndex(), {
  default: () => ({ categories: [], posts: [] }),
  // Block on the SERVER (SEO + direct loads get full HTML). On CLIENT navigation
  // fetch lazily so the page appears instantly and shows skeleton cards while
  // the posts stream in.
  lazy: import.meta.client,
})
const apiCategories = computed(() => hub.value?.categories ?? [])
const apiPosts = computed(() => hub.value?.posts ?? [])
// Skeleton while the lazy client fetch is still resolving. False on the blocking
// SSR pass (data is already present) and once the posts have loaded.
const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')

// Build the filter tabs. Keep i18n labels for built-in keys, fall back to
// the API-provided label for dynamically created categories.
const categories = computed(() => [
  { key: "all", label: t("sharing_hub.categories.all") },
  ...(apiCategories.value as any[]).map((c: any) => ({
    key: c.key,
    label: te(`sharing_hub.categories.${c.key}`)
      ? t(`sharing_hub.categories.${c.key}`)
      : c.label,
  })),
]);

// Map API post to template-compatible shape
function toCard(p: any, extra: Record<string, any> = {}) {
  return {
    category: p.category,
    categoryKey: p.categoryKey,
    title: p.title,
    desc: p.excerpt,
    image: p.image,
    slug: p.slug,
    tags: p.tags ?? [],
    date: p.date,
    readTime: p.readTime,
    ...extra,
  }
}

const FEATURED_SLUGS = ['what-is-sport-recovery', 'new-chapter-stretch', 'meet-huy-team-story', 'recovery-day-vn-runners']

const featuredPosts = computed(() => {
  const posts = apiPosts.value as any[]
  return FEATURED_SLUGS.map((slug, i) => {
    const p = posts.find((x: any) => x.slug === slug)
    return p ? toCard(p, { large: i === 0 }) : null
  }).filter(Boolean)
})

const allPosts = computed(() => {
  const posts = apiPosts.value as any[]
  return posts
    .filter((p: any) => !FEATURED_SLUGS.includes(p.slug))
    .map((p: any) => toCard(p))
})

// All available tags (derived from posts)
const allTags = computed(() => {
  const tagSet = new Set<string>();
  (apiPosts.value as any[]).forEach((p: any) => {
    if (p.tags) p.tags.forEach((tag: string) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
});

// Selected tags state
const selectedTags = ref<string[]>([]);

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag);
  if (idx === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(idx, 1);
  }
}

const filteredPosts = computed(() => {
  let posts = allPosts.value;
  if (activeCategory.value !== "all") {
    posts = posts.filter((p: any) => p.categoryKey === activeCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    posts = posts.filter(
      (p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  if (selectedTags.value.length > 0) {
    posts = posts.filter(
      (p: any) => p.tags && p.tags.some((tag: string) => selectedTags.value.includes(tag)),
    );
  }
  return posts;
});

// Category badge color mapping
function getCategoryColor(key: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    articles: { bg: "bg-blue-100", text: "text-blue-700" },
    company_updates: { bg: "bg-emerald-100", text: "text-emerald-700" },
    team_stories: { bg: "bg-orange-100", text: "text-orange-700" },
    events: { bg: "bg-red-100", text: "text-red-700" },
  };
  return colors[key] || { bg: "bg-gray-100", text: "text-gray-700" };
}

function getFeaturedCategoryColor(key: string) {
  const colors: Record<string, string> = {
    articles: "bg-[#1E40AF] text-white",
    company_updates: "bg-[#065F46] text-white",
    team_stories: "bg-[#1E3A8A] text-white",
    events: "bg-[#DC2626] text-white",
  };
  return colors[key] || "bg-navy text-white";
}

// Toggle this to false to make tags transparent (outline-style with indicator dot)
// Toggle to true to make tags have solid background colors
const tagsHaveBg = ref(false);

function getCategoryTagClass(key: string, isDarkBg: boolean = false) {
  if (tagsHaveBg.value) {
    const colors: Record<string, string> = {
      articles: "bg-navy-soft text-white border-transparent",
      company_updates: "bg-navy-soft text-white border-transparent",
      team_stories: "bg-navy-soft text-white border-transparent",
      events: "bg-accent text-white border-transparent",
    };
    return colors[key] || "bg-navy text-white border-transparent";
  } else {
    if (isDarkBg) {
      return "bg-transparent text-white border-white/30";
    } else {
      const colors: Record<string, string> = {
        articles: "bg-transparent text-navy-soft border-navy-soft/20",
        company_updates: "bg-transparent text-navy-soft border-navy-soft/20",
        team_stories: "bg-transparent text-navy-soft border-navy-soft/20",
        events: "bg-transparent text-accent border-accent/25",
      };
      return colors[key] || "bg-transparent text-navy border-navy/20";
    }
  }
}

function getCategoryTagDotClass(key: string, isDarkBg: boolean = false) {
  if (tagsHaveBg.value) {
    return "bg-white/80";
  } else {
    if (isDarkBg) {
      return "bg-white";
    } else {
      const colors: Record<string, string> = {
        articles: "bg-navy-soft",
        company_updates: "bg-navy-soft",
        team_stories: "bg-navy-soft",
        events: "bg-accent",
      };
      return colors[key] || "bg-navy";
    }
  }
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
              {{ t("sharing_hub.hero_title") }}
            </h1>
            <div class="hero-divider"></div>
            <p class="hero-subtitle">
              {{ t("sharing_hub.hero_subtitle") }}
            </p>
          </div>

          <!-- Right: Image Collage -->
          <div class="hero-collage">
            <div class="collage-grid">
              <!-- Left: tall image spanning full height -->
              <div class="collage-cell collage-cell--left">
                <NuxtImg :src="collageImages[0]" alt="Stretching session" format="webp" />
              </div>
              <!-- Right top -->
              <div class="collage-cell collage-cell--right-top">
                <NuxtImg :src="collageImages[1]" alt="Recovery therapy" format="webp" />
              </div>
              <!-- Right bottom -->
              <div class="collage-cell collage-cell--right-bottom">
                <NuxtImg :src="collageImages[2]" alt="Team collaboration" format="webp" />
              </div>
            </div>

            <!-- Circular Badge -->
            <!-- <div class="hero-badge-wrapper">
              <div class="hero-badge">
                <div class="hero-badge-inner">
                  <span class="badge-text">Move<br />Better</span>
                  <div class="badge-icon">
                    <span>S</span>
                  </div>
                  <span class="badge-text">Live<br />Better</span>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </section>

      <section class="py-10 lg:py-14">
        <div class="section-container">
          <!-- Section Header -->
          <div class="flex items-center gap-3 mb-8 w-full">
            <div class="w-[2px] h-6 bg-navy rounded-full"></div>
            <h2
              class="font-heading text-xl font-bold text-navy whitespace-nowrap"
            >
              {{ t("sharing_hub.featured") }}
            </h2>
            <div class="flex-1 h-[1px] bg-navy/10 ml-2"></div>
          </div>

          <!-- Featured Grid: 1 large + 3 small in a single row -->
          <div v-if="isLoading" class="featured-grid">
            <div class="featured-card-large rounded-2xl bg-gray-200 animate-pulse"></div>
            <div
              v-for="n in 3"
              :key="n"
              class="featured-card-small rounded-2xl bg-gray-200 animate-pulse"
            ></div>
          </div>
          <div v-else class="featured-grid">
            <!-- Large Featured Card -->
            <NuxtLink
              :to="localePath('/sharing-hub/' + featuredPosts[0].slug)"
              class="featured-card-large group cursor-pointer rounded-2xl overflow-hidden relative bg-navy block"
            >
              <NuxtImg
                :src="featuredPosts[0].image"
                :alt="featuredPosts[0].title"
                class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
              format="webp" />
              <div
                class="relative z-10 flex flex-col justify-end h-full p-6 lg:p-8"
              >
                <span
                  class="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 border transition-all duration-300"
                  :class="
                    getCategoryTagClass(featuredPosts[0].categoryKey, true)
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    :class="
                      getCategoryTagDotClass(featuredPosts[0].categoryKey, true)
                    "
                  ></span>
                  {{ featuredPosts[0].category }}
                </span>
                <h3
                  class="text-white font-heading text-xl lg:text-2xl font-bold leading-snug mb-2"
                >
                  {{ featuredPosts[0].title }}
                </h3>
                <p class="text-white/80 text-sm leading-relaxed mb-4 max-w-md">
                  {{ featuredPosts[0].desc }}
                </p>
                <span
                  class="text-white font-heading text-sm font-semibold inline-flex items-center gap-1.5 group/link hover:text-accent transition-colors"
                >
                  {{ t("sharing_hub.read_more") }}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transform group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              </div>
            </NuxtLink>

            <!-- 3 small featured cards (full background image like the large card) -->
            <NuxtLink
              v-for="(post, idx) in featuredPosts.slice(1)"
              :key="idx"
              :to="localePath('/sharing-hub/' + post.slug)"
              class="featured-card-small group cursor-pointer rounded-2xl overflow-hidden relative bg-navy block"
            >
              <NuxtImg
                :src="post.image"
                :alt="post.title"
                class="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500"
              format="webp" />
              <div
                class="relative z-10 flex flex-col justify-between h-full p-4 lg:p-5"
              >
                <span
                  class="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-300"
                  :class="getCategoryTagClass(post.categoryKey, true)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    :class="getCategoryTagDotClass(post.categoryKey, true)"
                  ></span>
                  {{ post.category }}
                </span>
                <div>
                  <h4
                    class="font-heading text-sm font-bold text-white leading-snug mb-1.5 line-clamp-2"
                  >
                    {{ post.title }}
                  </h4>
                  <p
                    class="text-white/75 text-xs leading-relaxed mb-3 line-clamp-2"
                  >
                    {{ post.desc }}
                  </p>
                  <span
                    class="text-white font-heading text-xs font-semibold inline-flex items-center gap-1.5 hover:text-accent transition-colors"
                  >
                    {{ t("sharing_hub.read_more") }}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="transform group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           CATEGORY FILTER + LATEST POSTS
           ═══════════════════════════════════════════ -->
      <section class="pb-10 lg:pb-14">
        <div class="section-container">
          <!-- Filter Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-6">
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

          <!-- Keyword Search -->
          <div class="flex justify-center mb-10">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('sharing_hub.search_placeholder')"
                class="search-input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tag Filter -->
          <div class="flex flex-wrap justify-center gap-2 mb-10">
            <button
              v-for="tag in allTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="tag-pill"
              :class="selectedTags.includes(tag) ? 'tag-pill--active' : ''"
            >
              <span class="tag-dot" :class="selectedTags.includes(tag) ? 'tag-dot--active' : ''"></span>
              {{ tag }}
            </button>
          </div>

          <!-- Section Header -->
          <div class="flex items-center gap-3 mb-8 w-full">
            <div class="w-[2px] h-6 bg-navy rounded-full"></div>
            <h2
              class="font-heading text-xl font-bold text-navy whitespace-nowrap"
            >
              {{ t("sharing_hub.latest_posts") }}
            </h2>
            <div class="flex-1 h-[1px] bg-navy/10 ml-2"></div>
          </div>

          <!-- Posts Grid -->
          <div
            v-if="isLoading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <div
              v-for="n in 8"
              :key="n"
              class="rounded-2xl overflow-hidden bg-white border border-border shadow-card animate-pulse"
            >
              <div class="aspect-[16/10] bg-gray-200"></div>
              <div class="p-4">
                <div class="h-3 w-16 bg-gray-200 rounded mb-2.5"></div>
                <div class="h-4 w-full bg-gray-200 rounded mb-1.5"></div>
                <div class="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div class="h-3 w-full bg-gray-100 rounded mb-1"></div>
                <div class="h-3 w-5/6 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <TransitionGroup name="post-card">
              <NuxtLink
                v-for="(post, idx) in filteredPosts"
                :key="post.title"
                :to="localePath('/sharing-hub/' + post.slug)"
                class="post-card group cursor-pointer block"
              >
                <div
                  class="rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col"
                >
                  <div class="aspect-[16/10] overflow-hidden">
                    <NuxtImg
                      :src="post.image"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    format="webp" />
                  </div>
                  <div class="p-4 flex flex-col flex-1">
                    <span
                      class="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2.5 border transition-all duration-300"
                      :class="getCategoryTagClass(post.categoryKey, false)"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                        :class="getCategoryTagDotClass(post.categoryKey, false)"
                      ></span>
                      {{ post.category }}
                    </span>
                    <h3
                      class="font-heading text-sm font-bold text-navy group-hover:text-accent transition-colors leading-snug mb-1.5 line-clamp-2"
                    >
                      {{ post.title }}
                    </h3>
                    <p
                      class="text-text-secondary text-xs leading-relaxed mb-3 flex-1 line-clamp-2"
                    >
                      {{ post.desc }}
                    </p>
                    <span
                      class="text-navy group-hover:text-accent font-heading text-xs font-semibold inline-flex items-center gap-1.5 transition-colors mt-auto"
                    >
                      {{ t("sharing_hub.read_more") }}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="transform group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </TransitionGroup>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           WHY WE SHARE SECTION
           ═══════════════════════════════════════════ -->
      <section class="py-10 lg:py-14 bg-white">
        <div class="section-container">
          <div
            class="bg-off-white rounded-3xl p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch"
          >
            <!-- Left Block: Header & Description -->
            <div
              class="flex flex-col sm:flex-row items-start gap-6 lg:w-[45%] flex-shrink-0"
            >
              <!-- Leftmost Circle Icon -->
              <div
                class="flex-shrink-0 w-24 h-24 rounded-full border border-navy flex items-center justify-center bg-transparent"
              >
                <svg viewBox="0 0 80 80" fill="none" class="w-16 h-16">
                  <!-- Heart -->
                  <path
                    d="M40 50c-1.5-1.5-7.5-7.2-10-9.7C26.5 36.8 25 33.8 25 30.5c0-4.5 3.5-8 8-8 3 0 5.5 2 7 4.2 1.5-2.2 4-4.2 7-4.2 4.5 0 8 3.5 8 8 0 3.3-1.5 6.3-5 9.8-2.5 2.5-8.5 8.2-10 9.7z"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />

                  <!-- Left Hand Palm & Fingers -->
                  <path
                    d="M36 60c-8 0-16-6-16-16 0-3 1-6 2.5-8.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M20 42c2-4 5-7.5 9-9.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M20 48c3-4 7-7 11.5-8"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M22 53c4-3.5 9-5 14-5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M33 58c1.5-2.5 3-3.5 5-3.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />

                  <!-- Right Hand Palm & Fingers -->
                  <path
                    d="M44 60c8 0 16-6 16-16 0-3-1-6-2.5-8.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M60 42c-2-4-5-7.5-9-9.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M60 48c-3-4-7-7-11.5-8"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M58 53c-4-3.5-9-5-14-5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    d="M47 58c-1.5-2.5-3-3.5-5-3.5"
                    stroke="#0B2A4A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    fill="none"
                  />

                  <!-- Small Pulse Circle inside Heart -->
                  <circle
                    cx="40"
                    cy="32"
                    r="5.5"
                    stroke="#0B2A4A"
                    stroke-width="1.8"
                    fill="none"
                  />
                  <!-- Accent Plus inside Pulse Circle -->
                  <path
                    d="M40 29.5v5M37.5 32h5"
                    stroke="#F47A1F"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />

                  <!-- Orange Wrist Cuffs -->
                  <line
                    x1="36"
                    y1="60"
                    x2="36"
                    y2="65"
                    stroke="#F47A1F"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <line
                    x1="44"
                    y1="60"
                    x2="44"
                    y2="65"
                    stroke="#F47A1F"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>

              <!-- Title and Description -->
              <div class="flex-1">
                <h2 class="font-heading text-2xl font-bold text-navy">
                  {{ t("sharing_hub.why_title") }}
                </h2>
                <div class="w-12 h-[3px] bg-accent mt-2.5 mb-4"></div>
                <p
                  class="text-text-secondary text-sm leading-relaxed font-sans"
                >
                  {{ t("sharing_hub.why_desc") }}
                </p>
              </div>
            </div>

            <!-- Right Block: 3 Feature Columns -->
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-0">
              <!-- Column 1 -->
              <div
                class="flex flex-col p-2 lg:pl-8 lg:border-l lg:border-navy/10"
              >
                <div class="text-navy mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3
                  class="font-heading text-sm font-bold text-navy leading-snug mb-2"
                >
                  {{ t("sharing_hub.why_f1_title") }}
                </h3>
                <p
                  class="text-text-secondary text-xs leading-relaxed font-sans"
                >
                  {{ t("sharing_hub.why_f1_desc") }}
                </p>
              </div>

              <!-- Column 2 -->
              <div
                class="flex flex-col p-2 lg:pl-8 lg:border-l lg:border-navy/10"
              >
                <div class="text-navy mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3
                  class="font-heading text-sm font-bold text-navy leading-snug mb-2"
                >
                  {{ t("sharing_hub.why_f2_title") }}
                </h3>
                <p
                  class="text-text-secondary text-xs leading-relaxed font-sans"
                >
                  {{ t("sharing_hub.why_f2_desc") }}
                </p>
              </div>

              <!-- Column 3 -->
              <div
                class="flex flex-col p-2 lg:pl-8 lg:border-l lg:border-navy/10"
              >
                <div class="text-navy mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <!-- Upward Trend Chart with Ascending Bars -->
                    <path d="M18 3h4v4" />
                    <path d="M10 14l12-12" />
                    <rect x="3" y="13" width="3" height="7" rx="0.5" />
                    <rect x="9" y="9" width="3" height="11" rx="0.5" />
                    <rect x="15" y="5" width="3" height="15" rx="0.5" />
                  </svg>
                </div>
                <h3
                  class="font-heading text-sm font-bold text-navy leading-snug mb-2"
                >
                  {{ t("sharing_hub.why_f3_title") }}
                </h3>
                <p
                  class="text-text-secondary text-xs leading-relaxed font-sans"
                >
                  {{ t("sharing_hub.why_f3_desc") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="cta-banner py-12 lg:py-16 w-full">
        <div class="section-container relative z-10">
          <div
            class="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10"
          >
            <div class="text-center lg:text-left">
              <h2
                class="text-white font-heading text-xl lg:text-2xl font-bold mb-2"
              >
                {{ t("sharing_hub.cta_title") }}
              </h2>
              <p class="text-white/70 text-sm">
                {{ t("sharing_hub.cta_subtitle") }}
              </p>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
              <NuxtLink
                :to="localePath('/individual')"
                class="cta-btn cta-btn--outline"
              >
                {{ t("sharing_hub.cta_explore") }}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 12l4-4-4-4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </NuxtLink>
              <NuxtLink
                :to="localePath('/booking')"
                class="cta-btn cta-btn--accent"
              >
                {{ t("sharing_hub.cta_book") }}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 12l4-4-4-4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </NuxtLink>
              <a href="https://www.facebook.com/stretchvn/" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn--outline">
                {{ t("sharing_hub.cta_follow") }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                  />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
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
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .hero-wrapper {
    flex-direction: row;
    align-items: center;
    gap: 3rem;
    padding: 2rem 2rem;
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
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 36px;
  }
}

.hero-divider {
  width: 48px;
  height: 3px;
  background: var(--color-navy);
  border-radius: 2px;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  color: var(--color-text-secondary, #6b7280);
  font-size: 13px;
  line-height: 1.7;
  max-width: 380px;
}

@media (min-width: 1024px) {
  .hero-subtitle {
    font-size: 14px;
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
  aspect-ratio: 1.25 / 1;
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes badge-counter-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/* ── Featured Grid ── */
.featured-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .featured-grid {
    grid-template-columns: 3fr 1fr 1fr 1fr;
  }
}

.featured-grid .featured-card-large {
  min-height: 380px;
}

@media (min-width: 640px) {
  .featured-grid .featured-card-large {
    grid-column: span 2;
    min-height: 400px;
  }
}

@media (min-width: 1024px) {
  .featured-grid .featured-card-large {
    grid-column: span 1;
    min-height: 420px;
  }
}

.featured-grid .featured-card-small {
  min-height: 320px;
}

@media (min-width: 1024px) {
  .featured-grid .featured-card-small {
    min-height: 420px;
  }
}

/* ── Category Filter Tabs ── */
.category-tab {
  padding: 0.65rem 1.5rem;
  border-radius: 12px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy);
  background: white;
  border: 1.5px solid #e6ecf2;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.category-tab:hover {
  color: var(--color-navy);
  border-color: var(--color-navy-soft);
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(11, 42, 74, 0.05);
}

.category-tab--active {
  color: white !important;
  background: var(--color-navy) !important;
  border-color: var(--color-navy) !important;
  box-shadow: 0 4px 12px rgba(11, 42, 74, 0.15) !important;
}

.category-tab--active:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(11, 42, 74, 0.15) !important;
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

/* ── Why We Share Layout ── */
@media (max-width: 1023px) {
  .lg\:border-l {
    border-left: none !important;
  }
  .lg\:pl-8 {
    padding-left: 0.5rem !important;
  }
}

/* ── CTA Banner ── */
.cta-banner {
  background: linear-gradient(
    135deg,
    var(--color-navy) 0%,
    var(--color-navy-soft) 100%
  );
  position: relative;
  overflow: hidden;
}

.cta-banner::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(244, 122, 31, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
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

/* ── Search Input ── */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-secondary, #6b7280);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.5rem;
  border-radius: 12px;
  border: 1.5px solid #e6ecf2;
  background: white;
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--color-navy);
  outline: none;
  transition: all 0.25s ease;
}

.search-input::placeholder {
  color: var(--color-text-secondary, #9ca3af);
}

.search-input:focus {
  border-color: var(--color-navy-soft);
  box-shadow: 0 0 0 3px rgba(11, 42, 74, 0.06);
}

.search-clear {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--color-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: rgba(11, 42, 74, 0.06);
  color: var(--color-navy);
}

/* ── Tag Pills ── */
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  background: white;
  border: 1.5px solid #e6ecf2;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tag-pill:hover {
  border-color: var(--color-navy-soft);
  color: var(--color-navy);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(11, 42, 74, 0.06);
}

.tag-pill--active {
  color: white !important;
  background: var(--color-navy) !important;
  border-color: var(--color-navy) !important;
  box-shadow: 0 2px 8px rgba(11, 42, 74, 0.15) !important;
  transform: none !important;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-secondary, #9ca3af);
  transition: background 0.2s ease;
}

.tag-dot--active {
  background: var(--color-accent, #f47a1f);
}
</style>
