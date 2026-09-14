<script setup lang="ts">
/**
 * The course player — what "Học" opens.
 *
 * Deliberately NOT wrapped in `LearningHeader`/`LearningFooter`: this is the one
 * page where the site chrome competes with the work. The outline replaces the
 * nav, and the only way back out is the explicit link at the top of it.
 *
 * The current lesson lives in `?lesson=<module>-<item>` so a lesson can be
 * linked, reloaded and walked back through with the browser's own Back button.
 * Progress lives in localStorage (see `useCourseProgress`), so it survives a
 * reload but stays on this device until the enrolment API exists.
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { trackPageView } = useTracking()
const detailFromApi = await useProgramDetailFor(computed(() => String(route.params.slug)))
const { loggedIn } = useHubSession()
const { open: openAuth } = useAuthModal()
const { notify } = useNotification()

const slug = computed(() => String(route.params.slug))
const detail = detailFromApi

if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found', fatal: true })
}

const d = computed(() => detail.value!)

const {
  isDone, markDone, toggleDone,
  setNote, noteFor,
  setPosition, resumeSeconds, flush,
  percent, reset,
} = useCourseProgress(slug.value)

/** The syllabus flattened once — the player walks this, not the nested tree. */
const lessons = computed(() => d.value.modules.flatMap((mod, mi) =>
  mod.items.map((item, ii) => ({ key: `${mi}-${ii}`, moduleIndex: mi, itemIndex: ii, item })),
))

/** A scheduled workshop has an agenda, not lessons — there is nothing to play. */
const playable = computed(() => lessons.value.length > 0)

const queryKey = computed(() => {
  const raw = String(route.query.lesson ?? '')
  return lessons.value.some((l) => l.key === raw) ? raw : ''
})

/**
 * Without `?lesson`, resume where they stopped: the first lesson they have not
 * ticked. Dropping them at lesson 1 of 45 every time would make the tick
 * pointless.
 */
const fallbackKey = computed(() => {
  const next = lessons.value.find((l) => !isDone(l.key))
  return next?.key ?? lessons.value[0]?.key ?? ''
})

const currentKey = computed(() => queryKey.value || fallbackKey.value)
const currentIndex = computed(() => lessons.value.findIndex((l) => l.key === currentKey.value))
const current = computed(() => lessons.value[currentIndex.value] ?? lessons.value[0])

const doneCount = computed(() => lessons.value.filter((l) => isDone(l.key)).length)
const progress = computed(() => percent(lessons.value.length))
const finished = computed(() => playable.value && doneCount.value === lessons.value.length)

const outlineOpen = ref(false)

function goToKey(key: string) {
  outlineOpen.value = false
  router.replace({ query: { ...route.query, lesson: key } })
}

function step(delta: number) {
  const next = lessons.value[currentIndex.value + delta]
  if (next) goToKey(next.key)
}

/** Ticking the last un-ticked lesson of a part should carry you onward, the way
    finishing a video does — but only forward, never past the end. */
function completeAndAdvance() {
  const key = current.value?.key
  if (!key) return
  if (isDone(key)) {
    toggleDone(key)
    return
  }
  markDone(key)
  if (currentIndex.value < lessons.value.length - 1) step(1)
}

/** Watched far enough — tick it, but leave the learner where they are. */
function markWatched() {
  const key = current.value?.key
  if (!key || isDone(key)) return
  markDone(key)
  notify(t('learning.learn.auto_done'), 'success')
}

/** The player reports the playhead twice a second; storage writes are throttled
    inside the composable. */
function trackPosition(seconds: number, total: number) {
  const key = current.value?.key
  if (key) setPosition(key, seconds, total)
}

function resetProgress() {
  reset()
  notify(t('learning.learn.reset_done'), 'info')
}

// Leaving the lesson (or the page) must not lose the last few seconds watched.
watch(currentKey, () => flush())
onBeforeUnmount(() => flush())

useSeo({
  // A learner's workspace has nothing to offer search, and the lesson list is
  // already public on the course page.
  title: `${t('learning.learn.title')} — ${d.value.program.title}`,
  description: d.value.subtitle,
  image: d.value.program.image,
  noIndex: true,
})

onMounted(() => {
  // Signed out there is no progress to keep — send them back to the course page
  // with the login open, exactly like /learning-hub/my-courses does.
  if (!loggedIn.value) {
    navigateTo(localePath(`/learning-hub/programs/${slug.value}`))
    openAuth('login')
    return
  }
  trackPageView()
})
</script>

<template>
  <div class="learn">
    <!-- ══ Mobile bar ══ -->
    <div class="bar lg:hidden">
      <button type="button" class="bar__btn" @click="outlineOpen = true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        {{ t('learning.learn.outline') }}
      </button>

      <span class="bar__prog">{{ progress }}%</span>
    </div>

    <div class="grid">
      <!-- ══ Outline ══ -->
      <div v-if="playable" class="sidewrap" :class="{ 'sidewrap--open': outlineOpen }">
        <LearnSidebar
          :detail="d"
          :current="currentKey"
          :is-done="isDone"
          :percent="progress"
          :done-count="doneCount"
          :total="lessons.length"
          @select="goToKey"
          @close="outlineOpen = false"
        />
      </div>

      <div v-if="outlineOpen" class="scrim lg:hidden" @click="outlineOpen = false" />

      <!-- ══ Lesson ══ -->
      <main class="main">
        <div class="main__inner">
          <!-- Scheduled programmes have no lessons to play -->
          <div v-if="!playable" class="notice">
            <p class="notice__title">{{ t('learning.learn.scheduled_title') }}</p>
            <p class="notice__sub">{{ t('learning.learn.scheduled_sub') }}</p>
            <div class="notice__acts">
              <NuxtLink :to="localePath(`/learning-hub/programs/${slug}`)" class="notice__btn">
                {{ t('learning.learn.back_to_course') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/learning-hub/schedule')" class="notice__link">
                {{ t('learning.schedule.page_title') }} →
              </NuxtLink>
            </div>
          </div>

          <template v-else-if="current">
            <!-- Course finished -->
            <div v-if="finished" class="award">
              <span class="award__tick">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="5 12.5 9.5 17 19 7" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="award__title">{{ t('learning.learn.finished_title') }}</p>
                <p class="award__sub">{{ t('learning.learn.finished_sub') }}</p>
              </div>
              <NuxtLink :to="localePath('/learning-hub/my-courses')" class="award__cta">
                {{ t('learning.learn.finished_cta') }}
              </NuxtLink>
            </div>

            <LearnStage
              :detail="d"
              :module-index="current.moduleIndex"
              :item-index="current.itemIndex"
              :item="current.item"
              :done="isDone(current.key)"
              :note="noteFor(current.key)"
              :resume-at="resumeSeconds(current.key)"
              :has-prev="currentIndex > 0"
              :has-next="currentIndex < lessons.length - 1"
              @toggle-done="completeAndAdvance"
              @watched="markWatched"
              @progress="trackPosition"
              @prev="step(-1)"
              @next="step(1)"
              @update:note="setNote(current.key, $event)"
              @video-pending="notify(t('learning.learn.video_note'), 'info', 5000)"
            />

            <p class="reset">
              {{ t('learning.learn.local_note') }}
              <button type="button" class="reset__btn" @click="resetProgress">
                {{ t('learning.learn.reset') }}
              </button>
            </p>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.learn {
  min-height: 100vh;
  background: var(--color-off-white);
}

/* ══ Mobile bar ══ */
.bar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.bar__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-navy);
}

.bar__prog {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
  color: var(--color-success);
}

/* ══ Layout ══ */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

/* Mobile: the outline slides in over the lesson. */
.sidewrap {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  width: 290px;
  max-width: 88vw;
  transform: translateX(-102%);
  transition: transform 0.26s ease;
  box-shadow: 0 0 40px -10px rgba(11, 42, 74, 0.4);
}
.sidewrap--open {
  transform: translateX(0);
}

.scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(7, 26, 46, 0.45);
}

.main {
  min-width: 0;
}

.main__inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 1rem 0.9rem 2.5rem;
}

/* ══ Notice (scheduled programmes) ══ */
.notice {
  padding: 2rem 1.2rem;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}

.notice__title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-navy);
}

.notice__sub {
  margin-top: 0.4rem;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.notice__acts {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1rem;
}

.notice__btn {
  padding: 0.45rem 1rem;
  border-radius: 8px;
  background: var(--color-navy);
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: white;
}
.notice__btn:hover {
  background: var(--color-navy-light);
}

.notice__link {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy-light);
}
.notice__link:hover {
  color: var(--color-accent);
}

/* ══ Finished banner ══ */
.award {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: var(--color-success-container);
}

.award__tick {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-success);
  color: white;
}

.award__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: #14532d;
}

.award__sub {
  font-size: 11.5px;
  color: #166534;
}

.award__cta {
  flex-shrink: 0;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  background: white;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  color: #15803d;
}
.award__cta:hover {
  background: #f0fdf4;
}

/* ══ Reset ══ */
.reset {
  margin-top: 1.2rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  opacity: 0.85;
}

.reset__btn {
  margin-left: 0.35rem;
  font-family: var(--font-heading);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-navy-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.reset__btn:hover {
  color: var(--color-accent);
}

/* ══ Desktop: fixed outline, scrolling lesson ══ */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 300px minmax(0, 1fr);
  }
  .sidewrap {
    position: sticky;
    top: 0;
    height: 100vh;
    width: auto;
    max-width: none;
    transform: none;
    box-shadow: none;
  }
  .main__inner {
    padding: 1.6rem 1.5rem 3rem;
  }
}
</style>
