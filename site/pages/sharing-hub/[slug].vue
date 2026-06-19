<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();

// Re-create this page per slug. Without a key, navigating between two articles
// (e.g. tapping a "related" card) REUSES the component, so setup (with its data
// fetch + 404 guard) never re-runs — the template would then briefly render
// against null data and crash to a white screen. Keying by path forces a fresh
// mount so the data is always awaited before render.
//
// pageTransition is disabled here on purpose: the global 'out-in' page
// transition + a changing page key race on the same DOM nodes during
// navigation and throw "Failed to execute 'insertBefore'… not a child of this
// node", which blanks the page on mobile. No animation is worth that crash.
definePageMeta({
  key: (route) => route.path,
  pageTransition: false,
  layoutTransition: false,
})

const slug = computed(() => route.params.slug as string);
const activeSection = ref('');

// ── Fetch the post + related cards + categories in ONE parallel round-trip ──
const { getArticleData } = useBlogClient()

const { data: articleData, error } = await useAsyncData(
  () => `hub-article-${slug.value}`,
  () => getArticleData(slug.value),
  { default: () => ({ article: null, related: [] }) },
)
const activeArticle = computed(() => articleData.value?.article ?? null)

// A transient backend failure (timeout / 5xx) must NOT masquerade as a 404:
// returning 503 tells Google "try again later" so a live article isn't dropped
// from the index. Only a clean response with no matching post is a real 404.
if (error.value) {
  throw createError({ statusCode: 503, statusMessage: 'Temporarily unavailable', fatal: true })
}
if (!activeArticle.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

useSeo({
  title: `${activeArticle.value.title} — Stretch.vn`,
  description: activeArticle.value.excerpt,
  image: activeArticle.value.image,
  type: 'article',
  article: {
    author: activeArticle.value.author,
    publishedTime: activeArticle.value.createdAt,
    modifiedTime: activeArticle.value.updatedAt,
    tags: activeArticle.value.tags,
  },
});

// JSON-LD structured data (BlogPosting) → Google rich results.
useSchemaOrg([
  defineArticle({
    '@type': 'BlogPosting',
    headline: activeArticle.value.title,
    description: activeArticle.value.excerpt,
    image: activeArticle.value.image || undefined,
    datePublished: activeArticle.value.createdAt || undefined,
    dateModified: activeArticle.value.updatedAt || activeArticle.value.createdAt || undefined,
    author: { '@type': 'Organization', name: activeArticle.value.author || 'Stretch Team' },
    keywords: (activeArticle.value.tags || []).join(', ') || undefined,
  }),
]);

// Render the CKEditor HTML and derive a Table of Contents from its <h2> headings.
const processed = computed(() => {
  const raw = (activeArticle.value as any)?.html || ''
  const toc: { id: string; title: string }[] = []
  let i = 0
  const html = raw.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m: string, attrs: string, inner: string) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim()
    i += 1
    const id = `sec-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)}`
    toc.push({ id, title: text })
    return `<h2 id="${id}"${attrs}>${inner}</h2>`
  })
  return { html, toc }
})

// Category Badge Color
function getCategoryColor(key: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    articles: {
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      text: 'text-blue-700',
    },
    company_updates: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      text: 'text-emerald-700',
    },
    team_stories: {
      bg: 'bg-orange-50 text-orange-700 border-orange-100',
      text: 'text-orange-700',
    },
    events: {
      bg: 'bg-red-50 text-red-700 border-red-100',
      text: 'text-red-700',
    },
  };
  return (
    colors[key] || {
      bg: 'bg-gray-50 text-gray-700 border-gray-100',
      text: 'text-gray-700',
    }
  );
}

// Hardcoded categories in sidebar
const categories = computed(() => [
  { key: 'articles', label: t('sharing_hub.categories.articles') },
  {
    key: 'company_updates',
    label: t('sharing_hub.categories.company_updates'),
  },
  { key: 'team_stories', label: t('sharing_hub.categories.team_stories') },
  { key: 'events', label: t('sharing_hub.categories.events') },
]);

// Tags derived from current post
const tags = computed(() => activeArticle.value?.tags ?? ['Recovery', 'Movement', 'Performance', 'Mobility', 'Rehabilitation'])

// Related posts: 3 other published posts (same category first, then others),
// drawn from the small summary pool fetched alongside the article above.
const relatedPosts = computed(() => {
  const others = (articleData.value?.related ?? []).filter((p: any) => p.slug !== slug.value)
  const sameCat = others.filter((p: any) => p.categoryKey === activeArticle.value?.categoryKey)
  const diffCat = others.filter((p: any) => p.categoryKey !== activeArticle.value?.categoryKey)
  return [...sameCat, ...diffCat].slice(0, 3).map((p: any) => ({
    category: p.category,
    categoryKey: p.categoryKey,
    title: p.title,
    desc: p.excerpt,
    image: p.image,
    slug: p.slug,
    date: p.date,
    readTime: p.readTime,
  }))
});

// Table of Contents Smooth Scrolling offset controller
const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const headerOffset = 100; // room for the floating header
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
    activeSection.value = id;
  }
};

// Table of Contents intersection observer to track active section with zero forced reflow overhead
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const observerOptions = {
    root: null,
    rootMargin: '-140px 0px -60% 0px', // matches our top trigger offset (140px)
    threshold: 0,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id;
      }
    });
  }, observerOptions);

  processed.value.toc.forEach((section) => {
    const el = document.getElementById(section.id);
    if (el) {
      observer?.observe(el);
    }
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
<template>
  <div class="blog-detail-page bg-off-white min-h-screen flex flex-col">
    <TheHeader />

    <!-- Hero Section with solid white background -->
    <div class="bg-white border-b border-[#E6ECF2] py-8 lg:py-12">
      <div class="section-container">
        <!-- Back Navigation Link inside the white hero -->
        <NuxtLink
          :to="localePath('/sharing-hub')"
          class="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-navy hover:text-accent transition-colors mb-5 group"
        >
          <span
            class="text-accent text-sm font-bold transition-transform duration-200 group-hover:-translate-x-0.5"
            >&larr;</span
          >
          <span>{{ t('sharing_hub.detail.back_to_hub') }}</span>
        </NuxtLink>

        <!-- 2-Column Grid -->
        <div
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          <!-- Left Column: Title, Excerpt, Meta -->
          <div class="lg:col-span-7 flex flex-col items-start">
            <span
              class="text-accent font-heading text-xs font-bold tracking-wider uppercase mb-3 block"
            >
              {{ activeArticle.category }}
            </span>

            <h1
              class="text-3xl sm:text-4xl lg:text-[40px] font-heading font-bold text-navy leading-[1.2] mb-5 tracking-tight"
            >
              {{ activeArticle.title }}
            </h1>

            <p
              class="text-text-secondary text-sm lg:text-base leading-relaxed mb-6 font-sans"
            >
              {{ activeArticle.excerpt }}
            </p>

            <!-- Meta Details Row -->
            <div
              class="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-secondary w-full"
            >
              <span class="inline-flex items-center gap-1.5 text-text-secondary/70">
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{{ activeArticle.date }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 text-text-secondary/70">
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{{ t('sharing_hub.detail.by') }} {{ activeArticle.author }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 text-text-secondary/70">
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{{ activeArticle.readTime }}</span>
              </span>
            </div>
          </div>

          <!-- Right Column: Hero Image (No card frame/border/white margin) -->
          <div class="lg:col-span-5">
            <div
              class="rounded-2xl overflow-hidden shadow-card aspect-[4/3] w-full"
            >
              <NuxtImg
                :src="activeArticle.image"
                :alt="activeArticle.title"
                class="w-full h-full object-cover"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container with off-white background -->
    <main class="py-10 lg:py-12 flex-1">
      <div class="section-container">
        <!-- 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Article Content Body -->
          <div
            class="lg:col-span-8 bg-white border border-border rounded-2xl p-6 lg:p-10 shadow-card"
          >
            <!-- Article body: CKEditor HTML rendered via v-html -->
            <div class="article-html font-sans text-text-primary" v-html="processed.html"></div>

            <!-- In-Article CTA Banner (CTA BLOCK matching design) -->
            <div
              class="mt-10 border border-[#FFEADA] bg-[#FFF9F5] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
            >
              <div class="flex items-center gap-4 text-left">
                <div
                  class="w-14 h-14 rounded-full bg-[#0B2A4A] flex items-center justify-center text-white flex-shrink-0"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-white"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path
                      d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h2
                    class="font-heading text-base md:text-lg font-bold text-navy leading-snug"
                  >
                    Ready to recover better?
                  </h2>
                  <p class="text-text-secondary text-sm mt-1 font-sans">
                    Book a session with our specialists and feel the difference.
                  </p>
                </div>
              </div>
              <NuxtLink
                :to="localePath('/booking')"
                class="bg-[#FF5C00] hover:bg-[#E05200] text-white rounded-xl py-3 px-6 font-heading font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm shrink-0"
              >
                <span>Book a Session &rarr;</span>
              </NuxtLink>
            </div>

            <!-- Author Bio Box (AUTHOR BOX matching design) -->
            <div
              class="mt-8 border border-[#E6ECF2] bg-white rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
            >
              <div class="flex items-center gap-4 text-left">
                <div
                  class="w-14 h-14 rounded-full bg-[#0B2A4A] flex items-center justify-center text-white flex-shrink-0 p-1"
                >
                  <span
                    class="text-[9px] font-heading font-extrabold tracking-tighter text-white uppercase select-none"
                    >STRETCH.</span
                  >
                </div>
                <div>
                  <h2
                    class="font-heading text-base md:text-lg font-bold text-navy leading-snug"
                  >
                    By Stretch Team
                  </h2>
                  <p
                    class="text-text-secondary text-sm leading-relaxed mt-1 font-sans"
                  >
                    Our team of movement specialists and therapists is dedicated
                    to helping people move, recover, and live better every day.
                  </p>
                </div>
              </div>

              <!-- Social Follow Icons -->
              <div
                class="flex flex-col items-center md:items-start gap-2 shrink-0"
              >
                <span
                  class="text-xs font-heading font-bold uppercase tracking-wider text-navy"
                  >Follow us</span
                >
                <div class="flex items-center gap-2">
                  <a
                    href="https://www.facebook.com/stretchvn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-11 h-11 rounded-full bg-[#0B2A4A] hover:bg-accent text-white flex items-center justify-center transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/stretch.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-11 h-11 rounded-full bg-[#0B2A4A] hover:bg-accent text-white flex items-center justify-center transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@Stretchvn"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-11 h-11 rounded-full bg-[#0B2A4A] hover:bg-accent text-white flex items-center justify-center transition-colors duration-200"
                    aria-label="YouTube"
                  >
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path
                        d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://stretch.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-11 h-11 rounded-full bg-[#0B2A4A] hover:bg-accent text-white flex items-center justify-center transition-colors duration-200"
                    aria-label="Website"
                  >
                    <svg
                      class="w-5 h-5 fill-none stroke-current"
                      stroke-width="2.5"
                      viewBox="0 0 24 24"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Sidebar Column (SIDEBAR matching design) -->
          <div class="lg:col-span-4 space-y-6 sticky top-24 self-start">
            <!-- Widget 1: Table of Contents (ON THIS PAGE) -->
            <div
              class="bg-white border border-border rounded-2xl p-5 shadow-card"
            >
              <h2
                class="font-heading text-xs font-bold text-navy uppercase tracking-wider border-b border-border pb-3 mb-4 flex items-center gap-2"
              >
                <span class="w-1.5 h-3 bg-accent rounded-full"></span>
                {{ t('sharing_hub.detail.on_this_page') }}
              </h2>
              <ul
                class="space-y-2 text-xs font-heading font-semibold text-text-secondary"
              >
                <li
                  v-for="sec in processed.toc"
                  :key="sec.id"
                  @click="scrollToSection(sec.id)"
                  class="flex items-center gap-2.5 py-1.5 cursor-pointer transition-colors hover:text-accent"
                  :class="
                    activeSection === sec.id
                      ? 'text-accent border-l-2 border-accent pl-2 -ml-2'
                      : ''
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                    :class="
                      activeSection === sec.id ? 'bg-accent' : 'bg-transparent'
                    "
                  ></span>
                  {{ sec.title }}
                </li>
                <li v-if="processed.toc.length === 0" class="text-text-secondary/50 py-1.5">—</li>
              </ul>
            </div>

            <!-- Widget 2: Categories -->
            <div
              class="bg-white border border-border rounded-2xl p-5 shadow-card"
            >
              <h2
                class="font-heading text-xs font-bold text-navy uppercase tracking-wider border-b border-border pb-3 mb-4"
              >
                {{ t('sharing_hub.detail.categories') }}
              </h2>
              <div
                class="flex flex-col gap-2 font-heading font-semibold text-xs text-navy-soft"
              >
                <NuxtLink
                  v-for="cat in categories"
                  :key="cat.key"
                  :to="
                    localePath({
                      path: '/sharing-hub',
                      query: { category: cat.key },
                    })
                  "
                  class="py-2 px-3 rounded-lg border border-border hover:border-accent hover:text-accent transition-all duration-200 flex justify-between items-center group/cat bg-off-white/50 hover:bg-white"
                >
                  <span>{{ cat.label }}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    class="transform group-hover/cat:translate-x-1 transition-transform duration-200"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </NuxtLink>
              </div>
            </div>

            <!-- Widget 3: Tags -->
            <div
              class="bg-white border border-border rounded-2xl p-5 shadow-card"
            >
              <h2
                class="font-heading text-xs font-bold text-navy uppercase tracking-wider border-b border-border pb-3 mb-4"
              >
                {{ t('sharing_hub.detail.tags') }}
              </h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in tags"
                  :key="tag"
                  class="py-1 px-3 rounded-full border border-border text-[10px] font-semibold text-navy-soft hover:border-accent hover:text-accent transition-colors bg-off-white/40 cursor-pointer"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Widget 4: Booking Session CTA -->
            <div
              class="bg-[#F8F9FA] border border-[#E6ECF2] rounded-2xl p-6 shadow-card flex flex-col justify-between group"
            >
              <div class="mb-5">
                <h2
                  class="font-heading text-lg lg:text-xl font-bold text-navy leading-snug mb-3"
                >
                  {{ t('sharing_hub.detail.sidebar_cta_title') }}
                </h2>
                <p
                  class="text-text-secondary text-sm leading-relaxed font-sans"
                >
                  {{ t('sharing_hub.detail.sidebar_cta_desc') }}
                </p>
              </div>

              <NuxtLink
                :to="localePath('/booking')"
                class="w-full bg-[#FF5C00] hover:bg-[#E05200] text-white rounded-xl py-3.5 px-5 font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
              >
                <span
                  >{{ t('sharing_hub.detail.sidebar_cta_btn') }} &rarr;</span
                >
              </NuxtLink>
            </div>

            <!-- Widget 5: Explore Business Solution CTA -->
            <div
              class="bg-[#F8F9FA] border border-[#E6ECF2] rounded-2xl p-6 shadow-card flex flex-col group"
            >
              <div
                class="rounded-xl overflow-hidden aspect-[16/10] w-full mb-5 border border-[#E6ECF2]"
              >
                <NuxtImg
                  src="/business_solution_sidebar.png"
                  alt="Business Solutions"
                  class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  format="webp"
                />
              </div>
              <div class="flex flex-col justify-between flex-1">
                <div>
                  <h2
                    class="font-heading text-lg font-bold text-navy leading-snug mb-3"
                  >
                    {{ t('sharing_hub.detail.sidebar_business_title') }}
                  </h2>
                  <p
                    class="text-text-secondary text-sm leading-relaxed font-sans mb-5"
                  >
                    {{ t('sharing_hub.detail.sidebar_business_desc') }}
                  </p>
                </div>

                <NuxtLink
                  :to="localePath('/business')"
                  class="inline-flex items-center gap-1.5 font-heading text-sm font-bold text-[#FF5C00] hover:text-[#E05200] transition-colors mt-auto group/link"
                >
                  <span
                    >{{
                      t('sharing_hub.detail.sidebar_business_btn')
                    }}
                    &rarr;</span
                  >
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- RELATED POSTS FOOTER (RELATED POSTS matching design) -->
        <div class="mt-14 lg:mt-20 border-t border-border pt-10">
          <div class="flex items-center justify-between mb-8">
            <h2 class="font-heading text-lg lg:text-xl font-bold text-navy">
              {{ t('sharing_hub.detail.related_posts') }}
            </h2>
            <NuxtLink
              :to="localePath('/sharing-hub')"
              class="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-accent hover:text-accent-dark transition-colors group/all"
            >
              {{ t('sharing_hub.detail.view_all_articles') }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                class="transform group-hover/all:translate-x-1 transition-transform duration-200"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </NuxtLink>
          </div>

          <!-- 3 Related Article Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="(post, idx) in relatedPosts"
              :key="idx"
              :to="localePath('/sharing-hub/' + post.slug)"
              class="group cursor-pointer block"
            >
              <div
                class="rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col"
              >
                <div class="aspect-[16/10] overflow-hidden">
                  <NuxtImg
                    :src="post.image"
                    :alt="post.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    format="webp"
                  />
                </div>

                <div class="p-4 flex flex-col flex-1">
                  <span
                    class="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2.5 border transition-all duration-300"
                    :class="getCategoryColor(post.categoryKey).bg"
                  >
                    {{ post.category }}
                  </span>

                  <h3
                    class="font-heading text-xs lg:text-sm font-bold text-navy group-hover:text-accent transition-colors leading-snug mb-1.5 line-clamp-2"
                  >
                    {{ post.title }}
                  </h3>

                  <p
                    class="text-text-secondary text-[11px] leading-relaxed mb-3 flex-1 line-clamp-2"
                  >
                    {{ post.desc }}
                  </p>

                  <div
                    class="flex items-center justify-between text-[10px] text-text-secondary border-t border-border/50 pt-2.5 mt-auto"
                  >
                    <span>{{ post.date }}</span>
                    <span>{{ post.readTime }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.blog-detail-page {
  font-family: var(--font-body);
  /* Entrance animation. Nuxt's global 'out-in' pageTransition is disabled on
     this page (see definePageMeta) because it races with the per-slug `key`
     and crashes. We replay the same fade-up here on mount instead — the `key`
     forces a fresh mount per article, so this fires on every navigation while
     staying fully decoupled from Vue's transition machinery. */
  animation: blogDetailEnter 0.3s ease both;
}

@keyframes blogDetailEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .blog-detail-page {
    animation: none;
  }
}

.scroll-mt-24 {
  scroll-margin-top: 6rem;
}

/* ── Article body: style the CKEditor HTML injected via v-html ── */
.article-html :deep(h2) {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-navy);
  line-height: 1.3;
  border-bottom: 1px solid var(--color-border, #e6ecf2);
  padding-bottom: 0.75rem;
  margin: 2rem 0 1rem;
  scroll-margin-top: 6rem;
}
.article-html :deep(h2:first-child) { margin-top: 0; }
.article-html :deep(h3) {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-navy);
  margin: 1.5rem 0 0.75rem;
}
.article-html :deep(p) {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--color-text-primary, #1f2937);
  margin: 0 0 1.1rem;
}
.article-html :deep(ul),
.article-html :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.4rem;
}
.article-html :deep(ul) { list-style: disc; }
.article-html :deep(ol) { list-style: decimal; }
.article-html :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.7;
  font-size: 0.95rem;
}
.article-html :deep(a) {
  color: var(--color-accent, #f47a1f);
  text-decoration: underline;
  font-weight: 600;
}
.article-html :deep(strong) { font-weight: 700; color: var(--color-navy); }
.article-html :deep(em) { font-style: italic; }
.article-html :deep(blockquote) {
  background: var(--color-off-white, #f8f8f6);
  border-left: 4px solid var(--color-accent, #f47a1f);
  border-radius: 0 0.75rem 0.75rem 0;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  font-family: var(--font-heading);
  font-style: italic;
  font-weight: 600;
  color: var(--color-navy);
}
.article-html :deep(blockquote p) { margin: 0; }
.article-html :deep(img) {
  border-radius: 0.75rem;
  /* !important beats inline styles like style="max-width:1152px" that come from
     images pasted out of Google results — otherwise they overflow the column. */
  max-width: 100% !important;
  height: auto !important;
  margin: 1.5rem 0;
  border: 1px solid var(--color-border, #e6ecf2);
}

/* ── CKEditor figures: cap any inline pixel/percent width to the column ── */
/* Resized images come through as <figure class="image image_resized" style="width:1200px">
   with an inner <img style="width:100%">. Without this the figure keeps its inline
   width and overflows the article column, breaking the layout. */
.article-html :deep(figure) {
  max-width: 100% !important;
  height: auto;
  margin: 1.5rem 0;
}
.article-html :deep(figure img) {
  margin: 0;
  display: block;
}
.article-html :deep(figure.image) {
  display: table;
}
.article-html :deep(figcaption) {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
  text-align: center;
  padding: 0.5rem 0.25rem 0;
  font-style: italic;
}
/* Inline / centered image styles */
.article-html :deep(.image-style-align-center) { margin-left: auto; margin-right: auto; }
.article-html :deep(.image-style-align-left) { float: left; margin-right: 1.25rem; max-width: 50%; }
.article-html :deep(.image-style-align-right) { float: right; margin-left: 1.25rem; max-width: 50%; }
.article-html :deep(.image-inline) { max-width: 100%; }

/* ── Tables: scroll horizontally instead of stretching the page ── */
.article-html :deep(.table),
.article-html :deep(figure.table) { overflow-x: auto; max-width: 100%; }
.article-html :deep(table) {
  max-width: 100%;
  border-collapse: collapse;
}

/* ── Media embeds (iframes/video) stay responsive ── */
.article-html :deep(iframe),
.article-html :deep(video) { max-width: 100%; }
.article-html :deep(.media) { max-width: 100%; }

/* ── Code blocks wrap / scroll instead of overflowing ── */
.article-html :deep(pre) { max-width: 100%; overflow-x: auto; }

.article-html :deep(h2 + p),
.article-html :deep(h3 + p) { margin-top: 0; }
</style>
