<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();

// Retrieve slug from route params
const slug = computed(() => route.params.slug as string);

// Active section for Table of Contents
const activeSection = ref('');

// Structured data for articles, with "what-is-sport-recovery" matching the mockup exactly
const activeArticle = computed(() => {
  const currentSlug = slug.value || 'what-is-sport-recovery';

  // Article Database
  const articles: Record<string, any> = {
    'what-is-sport-recovery': {
      title: t('sharing_hub.detail.what_is_sport_recovery.title'),
      excerpt: t('sharing_hub.detail.what_is_sport_recovery.excerpt'),
      category: t('sharing_hub.featured_posts.f1_category'),
      categoryKey: 'articles',
      date: 'May 10, 2025',
      author: 'Stretch Team',
      readTime: '6 min read',
      image: '/business_solution_sidebar.png',
      sections: [
        {
          id: 'what-is-sport-recovery',
          title: t('sharing_hub.detail.what_is_sport_recovery.intro.title'),
          type: 'intro',
          text: t('sharing_hub.detail.what_is_sport_recovery.intro.text'),
          quote: t('sharing_hub.detail.what_is_sport_recovery.intro.quote'),
        },
        {
          id: 'why-it-matters',
          title: t('sharing_hub.detail.what_is_sport_recovery.why.title'),
          type: 'why',
          text: t('sharing_hub.detail.what_is_sport_recovery.why.text'),
          bullets: [
            t('sharing_hub.detail.what_is_sport_recovery.why.b1'),
            t('sharing_hub.detail.what_is_sport_recovery.why.b2'),
            t('sharing_hub.detail.what_is_sport_recovery.why.b3'),
            t('sharing_hub.detail.what_is_sport_recovery.why.b4'),
          ],
          image: '/homepage-hero.webp',
        },
        {
          id: 'key-components',
          title: t(
            'sharing_hub.detail.what_is_sport_recovery.components.title',
          ),
          type: 'components',
          items: [
            {
              title: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c1.title',
              ),
              desc: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c1.desc',
              ),
              icon: 'movement',
            },
            {
              title: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c2.title',
              ),
              desc: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c2.desc',
              ),
              icon: 'soft_tissue',
            },
            {
              title: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c3.title',
              ),
              desc: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c3.desc',
              ),
              icon: 'modalities',
            },
            {
              title: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c4.title',
              ),
              desc: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c4.desc',
              ),
              icon: 'hydration',
            },
            {
              title: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c5.title',
              ),
              desc: t(
                'sharing_hub.detail.what_is_sport_recovery.components.c5.desc',
              ),
              icon: 'sleep',
            },
          ],
        },
        {
          id: 'who-can-benefit',
          title: t('sharing_hub.detail.what_is_sport_recovery.who.title'),
          type: 'text',
          text: t('sharing_hub.detail.what_is_sport_recovery.who.text'),
        },
        {
          id: 'how-to-get-started',
          title: t('sharing_hub.detail.what_is_sport_recovery.start.title'),
          type: 'text',
          text: t('sharing_hub.detail.what_is_sport_recovery.start.text'),
        },
        {
          id: 'key-takeaways',
          title: t('sharing_hub.detail.what_is_sport_recovery.takeaways.title'),
          type: 'text',
          text: t('sharing_hub.detail.what_is_sport_recovery.takeaways.text'),
        },
      ],
    },
    // Generic dynamic articles so that ALL other cards function cleanly
    'foam-rolling-101': {
      title: 'Foam Rolling 101: Simple Habits for Better Recovery',
      excerpt:
        'How this accessible tool can reduce tension and support your daily performance.',
      category: t('sharing_hub.categories.articles'),
      categoryKey: 'articles',
      date: 'May 8, 2025',
      author: 'Stretch Team',
      readTime: '5 min read',
      image: '/recovery-who.png',
      sections: [
        {
          id: 'what-is-foam-rolling',
          title: 'What is Foam Rolling?',
          type: 'text',
          text: 'Foam rolling is a self-myofascial release (SMR) technique. It can help relieve muscle tightness, soreness, and inflammation, and increase your joint range of motion.',
        },
        {
          id: 'how-it-helps',
          title: 'How Foam Rolling Helps Your Recovery',
          type: 'text',
          text: 'By applying targeted pressure to specific points on your body, you are able to aid in the recovery of muscles and assist in returning them to normal function. Normal function means your muscles are elastic, healthy, and ready to perform.',
        },
        {
          id: 'getting-started',
          title: 'Getting Started with Foam Rolling',
          type: 'text',
          text: 'Start slow and apply light pressure. When you find a trigger point or tight knot, hold the pressure there for 20 to 30 seconds to allow the tissue to release. Keep breathing and maintain regular sessions for the best results.',
        },
      ],
    },
  };

  // Fallback to "what-is-sport-recovery" if slug is not matched
  return (
    articles[currentSlug] || {
      ...articles['what-is-sport-recovery'],
      title: currentSlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }
  );
});

// Set page SEO based on article metadata
useSeo({
  title: `${activeArticle.value.title} — Stretch.vn`,
  description: activeArticle.value.excerpt,
  type: 'article',
});

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

// Hardcoded tags in sidebar
const tags = [
  'Recovery',
  'Movement',
  'Performance',
  'Mobility',
  'Rehabilitation',
];

// Related Articles (3 cards at the footer)
const relatedPosts = computed(() => [
  {
    category: t('sharing_hub.posts.p5_category'),
    categoryKey: 'articles',
    title: t('sharing_hub.posts.p5_title'),
    desc: t('sharing_hub.posts.p5_desc'),
    image: '/runner-who.png',
    slug: 'hip-mobility-key',
    date: 'Apr 30, 2025',
    readTime: '6 min read',
  },
  {
    category: t('sharing_hub.featured_posts.f3_category'),
    categoryKey: 'team_stories',
    title: t('sharing_hub.featured_posts.f3_title'),
    desc: t('sharing_hub.featured_posts.f3_desc'),
    image: '/individual-hero.webp',
    slug: 'meet-huy-team-story',
    date: 'May 2, 2025',
    readTime: '5 min read',
  },
  {
    category: t('sharing_hub.posts.p8_category'),
    categoryKey: 'events',
    title: t('sharing_hub.posts.p8_title'),
    desc: t('sharing_hub.posts.p8_desc'),
    image: '/warm-up.webp',
    slug: 'sunrise-stretch-sala',
    date: 'Apr 22, 2025',
    readTime: '4 min read',
  },
]);

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

  activeArticle.value.sections.forEach((section: any) => {
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
            <div class="prose max-w-none">
              <div
                v-for="sec in activeArticle.sections"
                :key="sec.id"
                :id="sec.id"
                class="mb-8 lg:mb-10 last:mb-0 scroll-mt-24"
              >
                <!-- Section Headings -->
                <h2
                  class="font-heading text-lg lg:text-xl font-bold text-navy border-b border-border pb-3 mb-4"
                >
                  {{ sec.title }}
                </h2>

                <!-- Type: Intro Section -->
                <div
                  v-if="sec.type === 'intro'"
                  class="font-sans text-sm leading-relaxed text-text-primary"
                >
                  <p class="mb-5">{{ sec.text }}</p>

                  <!-- Quote block matching design -->
                  <div
                    class="bg-off-white border-l-4 border-accent rounded-r-xl p-5 my-6 relative overflow-hidden flex flex-col justify-center"
                  >
                    <span
                      class="absolute right-4 bottom-2 text-6xl text-accent/10 font-serif leading-none select-none"
                      >”</span
                    >
                    <p
                      class="italic text-navy font-heading font-semibold text-sm lg:text-base text-center leading-relaxed"
                    >
                      " {{ sec.quote }} "
                    </p>
                  </div>
                </div>

                <!-- Type: Why Section (Includes list & side image matching mockup) -->
                <div
                  v-else-if="sec.type === 'why'"
                  class="grid grid-cols-1 md:grid-cols-12 gap-6 font-sans text-sm text-text-primary"
                >
                  <div class="md:col-span-7 flex flex-col justify-center">
                    <p class="mb-4">{{ sec.text }}</p>
                    <ul class="space-y-3 pl-0 list-none">
                      <li
                        v-for="(bullet, bIdx) in sec.bullets"
                        :key="bIdx"
                        class="flex items-start gap-3 text-text-primary"
                      >
                        <svg class="text-accent w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span class="leading-relaxed">{{ bullet }}</span>
                      </li>
                    </ul>
                  </div>
                  <!-- Side Image Inside Content -->
                  <div class="md:col-span-5">
                    <div
                      class="rounded-xl overflow-hidden border border-border aspect-[4/3]"
                    >
                      <NuxtImg
                        :src="sec.image"
                        alt="Why it matters"
                        class="w-full h-full object-cover"
                        format="webp"
                      />
                    </div>
                  </div>
                </div>

                <!-- Type: Components Grid Section -->
                <div v-else-if="sec.type === 'components'" class="font-sans">
                  <!-- Custom Flex Grid of 5 components matching design exactly -->
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6"
                  >
                    <div
                      v-for="(item, cIdx) in sec.items"
                      :key="cIdx"
                      class="flex flex-col items-center text-center bg-off-white border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-card hover:border-accent-light"
                    >
                      <!-- Custom Premium SVGs for component categories -->
                      <div
                        class="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center text-navy mb-3"
                      >
                        <svg
                          v-if="item.icon === 'movement'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="w-6 h-6"
                        >
                          <!-- Curved flexibility arrow -->
                          <path
                            d="M12 2a10 10 0 0 1 10 10c0 2.2-.7 4.2-2 5.9l-2-2"
                            stroke-linecap="round"
                          />
                          <path
                            d="M12 22A10 10 0 0 1 2 12C2 9.8 2.7 7.8 4 6.1l2 2"
                            stroke-linecap="round"
                          />
                          <polyline
                            points="20 14 20 20 14 20"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <polyline
                            points="4 10 4 4 10 4"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>

                        <svg
                          v-else-if="item.icon === 'soft_tissue'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="w-6 h-6"
                        >
                          <!-- Massage hands / wellness waves -->
                          <path d="M4 10h16M4 14h16" stroke-linecap="round" />
                          <path
                            d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"
                            stroke-linecap="round"
                          />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>

                        <svg
                          v-else-if="item.icon === 'modalities'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="w-6 h-6"
                        >
                          <!-- Pulse waves / tool support -->
                          <path
                            d="M2 10s3-3 5-3 5 6 7 6 5-3 7-3l1 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M2 14s3-3 5-3 5 6 7 6 5-3 7-3l1 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>

                        <svg
                          v-else-if="item.icon === 'hydration'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="w-6 h-6"
                        >
                          <!-- Water droplet -->
                          <path
                            d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>

                        <svg
                          v-else-if="item.icon === 'sleep'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="w-6 h-6"
                        >
                          <!-- Crescent Moon / rest -->
                          <path
                            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>

                      <h3
                        class="font-heading text-xs font-bold text-navy mb-1 leading-snug"
                      >
                        {{ item.title }}
                      </h3>

                      <p class="text-[10px] text-text-secondary leading-normal">
                        {{ item.desc }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Type: Text/Generic Section -->
                <div
                  v-else
                  class="font-sans text-sm leading-relaxed text-text-primary"
                >
                  <p>{{ sec.text }}</p>
                </div>
              </div>
            </div>

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
                  v-for="sec in activeArticle.sections"
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
}

.scroll-mt-24 {
  scroll-margin-top: 6rem;
}

/* Custom list items inside rich text */
.prose ul {
  list-style: none;
  padding-left: 0;
}

.prose li {
  margin-bottom: 0.5rem;
}
</style>
