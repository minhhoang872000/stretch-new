<script setup lang="ts">
/**
 * Course / workshop detail.
 *
 * One page serves both shapes in the catalogue, switched on `detail.scheduled`:
 * a self-paced course shows a syllabus and enrols, a scheduled workshop shows an
 * agenda, a place and remaining seats, and books. Splitting them into two routes
 * would duplicate the hero, the instructor, the reviews and the FAQ — everything
 * except the middle section.
 *
 * An unknown slug throws a real 404 instead of rendering an empty page: these
 * URLs are in the sitemap, and a soft 404 is worse for indexing than a hard one.
 */
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const detailFromApi = await useProgramDetailFor(computed(() => String(route.params.slug)))
const { formatPrice } = useLearningCatalog()
const { loggedIn } = useHubSession()
const { open: openAuth } = useAuthModal()
const { notify } = useNotification()
const { active, completed } = useMyLearning()
const config = useRuntimeConfig()

const slug = computed(() => String(route.params.slug))
const detail = detailFromApi

if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found', fatal: true })
}

/** Non-null past the guard above — keeps the template free of `detail!`. */
const d = computed(() => detail.value!)

const enrolment = computed(() => active.value.find((e) => e.slug === slug.value) ?? null)
const finished = computed(() => completed.value.find((e) => e.slug === slug.value) ?? null)

const openFaq = ref<number | null>(0)
const toggleFaq = (i: number) => (openFaq.value = openFaq.value === i ? null : i)

const learnPath = computed(() => localePath(`/learning-hub/learn/${slug.value}`))

/**
 * A free self-paced course needs no checkout — signing in is the whole gate, so
 * it opens the player. Anything paid goes to the checkout page, which creates a
 * bank-transfer order and shows the VietQR code. A free scheduled workshop is
 * the one shape with no flow yet, so it still says so plainly.
 */
function enroll() {
  if (!loggedIn.value) {
    openAuth('register')
    return
  }
  if (d.value.program.price > 0) {
    navigateTo(localePath(`/learning-hub/checkout/${slug.value}`))
    return
  }
  if (!d.value.scheduled) {
    navigateTo(learnPath.value)
    return
  }
  notify(t('learning.course.enroll_pending'), 'info', 5000)
}

/**
 * Already enrolled: straight into the player, at the lesson they stopped on.
 * A finished course, or a scheduled one with no lessons, has nothing to play —
 * those go to the account, where the certificate lives.
 */
function resume() {
  const noPlayer = d.value.scheduled || Boolean(finished.value)
  navigateTo(noPlayer ? localePath('/learning-hub/my-courses') : learnPath.value)
}

const shareOpen = ref(false)
const shareUrl = computed(() => `${config.public.siteUrl}${route.path}`)

/**
 * Native share sheet where the browser has one (phones — it already lists
 * Zalo, Messenger and the rest); our own sheet with the URL sharers otherwise.
 */
async function share() {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: d.value.program.title, url: shareUrl.value })
      return
    } catch (err: any) {
      // Dismissed the OS sheet: that is a completed interaction, not a cue to
      // open a second one. Anything else falls through to our sheet.
      if (err?.name === 'AbortError') return
    }
  }
  shareOpen.value = true
}

useSeo({
  title: `${d.value.program.title} — ${t('learning.brand')}`,
  description: d.value.subtitle,
  image: d.value.program.image,
  type: 'product',
})

// JSON-LD so the course can win a rich result (rating + price) on search.
useSchemaOrg([
  {
    '@type': 'Course',
    name: d.value.program.title,
    description: d.value.subtitle,
    inLanguage: 'vi-VN',
    provider: { '@type': 'Organization', name: 'Stretch Academy' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: d.value.rating.avg,
      reviewCount: d.value.rating.count,
      bestRating: 5,
    },
    offers: {
      '@type': 'Offer',
      price: d.value.program.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
    },
  },
])

onMounted(() => {
  trackPageView()
})
</script>

<template>
  <div class="bg-off-white min-h-screen flex flex-col">
    <LearningHeader />

    <main class="flex-1 pb-16 lg:pb-0">
      <LearningCourseHero :detail="d" />

      <div class="section-container">
        <div class="layout">
          <!-- ══ Content ══ -->
          <div class="col">
            <!-- ── Skills ── -->
            <section class="card">
              <h2 class="card__title">{{ t('learning.course.skills_title') }}</h2>
              <ul class="skills">
                <li v-for="skill in d.skills" :key="skill" class="skill">{{ skill }}</li>
              </ul>
            </section>

            <!-- ── About + outcomes ── -->
            <section class="card">
              <h2 class="card__title">{{ t('learning.course.about_title') }}</h2>
              <p v-for="para in d.description" :key="para" class="prose">{{ para }}</p>

              <p class="sub-title">{{ t('learning.course.outcomes_title') }}</p>
              <ul class="outcomes">
                <li v-for="line in d.outcomes" :key="line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="5 12.5 9.5 17 19 7" />
                  </svg>
                  {{ line }}
                </li>
              </ul>
            </section>

            <!-- ── Syllabus / agenda ── -->
            <LearningCourseSyllabus :detail="d" />

            <!-- ── Certificate ── -->
            <section class="cert">
              <div class="cert__paper">
                <span class="cert__brand">{{ t('learning.brand') }}</span>
                <span class="cert__label">{{ t('learning.course.cert_paper_label') }}</span>
                <span class="cert__name">{{ d.program.title }}</span>
                <span class="cert__sign">{{ d.instructor.name }}</span>
              </div>

              <div class="min-w-0">
                <h2 class="card__title">{{ t('learning.course.cert_title') }}</h2>
                <p class="prose">{{ t('learning.course.cert_sub') }}</p>
                <p class="cert__note">{{ t('learning.course.cert_note') }}</p>
              </div>
            </section>

            <!-- ── Instructor ── -->
            <section class="card">
              <h2 class="card__title">{{ t('learning.course.instructor_title') }}</h2>
              <div class="tutor">
                <span class="tutor__avatar">{{ d.instructor.initials }}</span>
                <div class="min-w-0">
                  <p class="tutor__name">{{ d.instructor.name }}</p>
                  <p class="tutor__role">{{ d.instructor.role }}</p>
                  <p class="tutor__stats">
                    {{ t('learning.course.instructor_courses', { count: d.instructor.courses }) }}
                    ·
                    {{ t('learning.course.instructor_learners', { count: d.instructor.learners.toLocaleString('vi-VN') }) }}
                  </p>
                  <p class="prose">{{ d.instructor.bio }}</p>
                </div>
              </div>
            </section>

            <!-- ── Reviews ── -->
            <LearningCourseReviews :detail="d" />

            <!-- ── FAQ ── -->
            <section class="card">
              <h2 class="card__title">{{ t('learning.course.faq_title') }}</h2>
              <div class="faq">
                <div v-for="(item, i) in d.faq" :key="item.q" class="qa" :class="{ 'qa--open': openFaq === i }">
                  <button type="button" class="qa__q" :aria-expanded="openFaq === i" @click="toggleFaq(i)">
                    <span>{{ item.q }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9.5 12 15.5 18 9.5" />
                    </svg>
                  </button>
                  <p v-show="openFaq === i" class="qa__a">{{ item.a }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- ══ Side panel ══ -->
          <aside class="side">
            <LearningCoursePanel
              :detail="d"
              :active="enrolment"
              :completed="finished"
              @enroll="enroll"
              @resume="resume"
              @share="share"
            />

            <LearningShareSheet
              v-model:open="shareOpen"
              :url="shareUrl"
              :title="d.program.title"
            />
          </aside>
        </div>

        <!-- ── Related ── -->
        <section v-if="d.related.length" class="related">
          <div class="related__head">
            <div class="min-w-0">
              <h2 class="card__title">{{ t('learning.course.related_title') }}</h2>
              <p class="card__sub">{{ t('learning.course.related_sub') }}</p>
            </div>
            <NuxtLink :to="localePath('/learning-hub/programs')" class="related__all">
              {{ t('learning.course.see_all') }} →
            </NuxtLink>
          </div>

          <div class="related__grid">
            <LearningCatalogCard v-for="item in d.related" :key="item.slug" :program="item" />
          </div>
        </section>
      </div>
    </main>

    <LearningFooter />

    <!-- ── Mobile action bar: the side panel is far below the fold on a phone ── -->
    <div class="bar lg:hidden">
      <div class="bar__price">
        <span class="bar__amount" :class="{ 'bar__amount--free': d.program.price === 0 }">
          {{ formatPrice(d.program.price) }}
        </span>
        <span v-if="d.scheduled" class="bar__when">{{ d.program.date }} · {{ d.program.location }}</span>
        <span v-else class="bar__when">{{ t('learning.catalog.lessons', { count: d.program.lessons ?? 0 }) }}</span>
      </div>

      <button v-if="enrolment || finished" type="button" class="bar__cta" @click="resume">
        {{ enrolment ? t('learning.my.continue') : t('learning.my.certificate') }}
      </button>
      <button v-else type="button" class="bar__cta" @click="enroll">
        {{ d.scheduled
          ? t('learning.course.cta_book')
          : d.program.price === 0 ? t('learning.course.cta_free') : t('learning.course.cta_enroll') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  padding: 1.1rem 0 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 0;
}

.side {
  min-width: 0;
}

/* ── Shared card ── */
.card {
  padding: 1rem 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}

.card__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-navy);
}

.card__sub {
  margin-top: 0.25rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.prose {
  margin-top: 0.6rem;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.sub-title {
  margin-top: 1rem;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ── Skills ── */
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.7rem;
}

.skill {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  background: var(--color-off-white);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-navy);
}

/* ── Outcomes ── */
.outcomes {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.outcomes li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-primary);
}

.outcomes svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-success);
}

/* ── Certificate ── */
.cert {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f4f8fc 100%);
}

.cert__paper {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex-shrink: 0;
  width: 100%;
  max-width: 250px;
  aspect-ratio: 4 / 3;
  padding: 0.8rem;
  border: 1px solid #dbe5ef;
  border-radius: 10px;
  background: white;
  box-shadow: 0 14px 30px -22px rgba(11, 42, 74, 0.55);
}

.cert__brand {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.cert__label {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.cert__name {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: auto;
  font-family: var(--font-heading);
  font-size: 13px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--color-navy);
}

.cert__sign {
  padding-top: 0.35rem;
  border-top: 1px solid var(--color-border);
  font-size: 10px;
  font-style: italic;
  color: var(--color-text-secondary);
}

.cert__note {
  margin-top: 0.6rem;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  opacity: 0.85;
}

/* ── Instructor ── */
.tutor {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.tutor__avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-navy);
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: white;
}

.tutor__name {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
}

.tutor__role {
  margin-top: 0.1rem;
  font-size: 11.5px;
  color: var(--color-accent-dark);
}

.tutor__stats {
  margin-top: 0.3rem;
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ── FAQ ── */
.faq {
  margin-top: 0.7rem;
  border-top: 1px solid var(--color-border);
}

.qa {
  border-bottom: 1px solid var(--color-border);
}

.qa__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 0;
  text-align: left;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
}
.qa__q svg {
  flex-shrink: 0;
  color: var(--color-navy-light);
  transition: transform 0.22s ease;
}
.qa--open .qa__q svg {
  transform: rotate(180deg);
}

.qa__a {
  padding: 0 0 0.8rem;
  font-size: 12px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

/* ── Related ── */
.related {
  padding: 1.4rem 0 1.6rem;
}

.related__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.8rem;
}

.related__all {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.related__all:hover {
  color: var(--color-accent);
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.9rem;
}

/* ── Mobile action bar ── */
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  box-shadow: 0 -8px 24px -18px rgba(11, 42, 74, 0.6);
}

.bar__price {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bar__amount {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 800;
  color: var(--color-navy);
}
.bar__amount--free {
  color: var(--color-success);
}

.bar__when {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.bar__cta {
  flex-shrink: 0;
  padding: 0.55rem 1.1rem;
  border-radius: 9px;
  background: var(--color-accent);
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: white;
  transition: background 0.2s ease;
}
.bar__cta:hover {
  background: var(--color-accent-dark);
}

/* ── Desktop ── */
@media (min-width: 640px) {
  .card,
  .cert {
    padding: 1.15rem 1.2rem;
  }
  .cert {
    flex-direction: row;
    align-items: center;
    gap: 1.4rem;
  }
  .cert__paper {
    width: 230px;
  }
  .outcomes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 1rem;
  }
  .related__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 1.25rem;
    padding-top: 1.3rem;
  }
  .side {
    position: sticky;
    top: 1rem;
    align-self: start;
  }
  .related__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .bar {
    display: none;
  }
}
</style>
