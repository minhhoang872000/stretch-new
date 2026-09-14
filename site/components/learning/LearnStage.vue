<script setup lang="ts">
/**
 * One lesson: the stage, the tabs beside it, and the prev/next footer.
 *
 * The three lesson types share this frame instead of having three layouts — a
 * learner moving from a video to a quiz should only see the middle change.
 */
import type { ProgramDetail, SyllabusItem } from '~/composables/useProgramDetail'

const props = defineProps<{
  detail: ProgramDetail
  moduleIndex: number
  itemIndex: number
  item: SyllabusItem
  done: boolean
  note: string
  hasPrev: boolean
  hasNext: boolean
  /** Seconds to start a video lesson at, from the saved playhead. */
  resumeAt?: number
}>()

const emit = defineEmits<{
  'toggle-done': []
  /** Watched far enough — tick the lesson, but do not navigate. */
  watched: []
  /** Playhead moved: seconds watched, total seconds. */
  progress: [number, number]
  prev: []
  next: []
  'update:note': [string]
  'video-pending': []
}>()

const { t } = useI18n()
const { reading, checklist, quiz } = useLessonContent()
const { mount, destroy, currentTime, duration, percent: watched, ended } = useYoutubePlayer()

/**
 * Which video this is, counted among the course's video lessons — the same
 * ordinal the server and the console use to address a file. Derived, never
 * stored: inserting a video mid-course renumbers everything after it, and this
 * recomputes instead of going stale.
 */
const videoOrdinal = computed(() => {
  let ordinal = 0
  for (const [mi, mod] of props.detail.modules.entries()) {
    for (const [ii, it] of mod.items.entries()) {
      if (mi === props.moduleIndex && ii === props.itemIndex) return ordinal
      if (it.type === 'video') ordinal += 1
    }
  }
  return 0
})

/** Only used if the lookup endpoint cannot be reached. */
const inlineYoutubeId = computed(() => parseYoutubeId(props.item.youtube))

type VideoSource =
  | { kind: 'youtube'; id: string; demo?: boolean }
  | { kind: 'r2'; url: string; expiresAt?: string }
  | { kind: 'none' }

/**
 * Where the bytes come from is decided server-side (see server/api/lessons/video):
 * an instructor's upload in R2 if there is one, a YouTube id otherwise. The
 * client asks only when the learner presses play, so a lesson page costs nothing
 * until it is actually watched.
 */
const source = ref<VideoSource | null>(null)
const loadingSource = ref(false)
const sourceError = ref(false)

const playing = ref(false)
const host = ref<HTMLElement | null>(null)
const fileEl = ref<HTMLVideoElement | null>(null)

/** A lesson has a video if either path can produce one. */
const hasVideo = computed(() => {
  if (source.value) return source.value.kind !== 'none'
  return !!inlineYoutubeId.value
})

const isDemoFootage = computed(() =>
  source.value?.kind === 'youtube' ? !!source.value.demo : !!props.item.youtubeDemo,
)

async function resolveSource(): Promise<VideoSource> {
  if (source.value) return source.value
  loadingSource.value = true
  sourceError.value = false
  try {
    const res = await $fetch<VideoSource>('/api/lessons/video', {
      query: { slug: props.detail.program.slug, ordinal: videoOrdinal.value },
    })
    source.value = res
    return res
  } catch {
    // Endpoint unreachable (or not signed in): fall back to whatever the
    // syllabus itself carries rather than blocking the lesson entirely.
    sourceError.value = true
    const fallback: VideoSource = inlineYoutubeId.value
      ? { kind: 'youtube', id: inlineYoutubeId.value, demo: props.item.youtubeDemo }
      : { kind: 'none' }
    source.value = fallback
    return fallback
  } finally {
    loadingSource.value = false
  }
}

/**
 * An R2 lesson carries nothing in the syllabus itself, so before the first
 * play `hasVideo` would read false and the frame would claim "no video yet"
 * about a lesson that has one. Ask the server up front for those; YouTube
 * lessons already answer locally and stay lazy.
 */
async function probeSource() {
  if (props.item.type !== 'video' || inlineYoutubeId.value || source.value) return
  await resolveSource()
  // A failed probe must not pin the lesson to "none" — leave it unresolved so
  // pressing play asks again (the learner may have signed in since).
  if (sourceError.value) {
    source.value = null
    sourceError.value = false
  }
}

onMounted(probeSource)

/**
 * Give YouTube a throwaway child, not the container.
 *
 * The IFrame API *replaces* the element it is handed. If that element is one
 * Vue rendered, Vue's vnode now points at a node that is no longer in the DOM,
 * and the next patch in this area throws
 * "insertBefore … not a child of this node". Creating the target in JS means the
 * node YouTube destroys is one Vue never knew about.
 */
async function mountYoutube(videoId: string) {
  const container = host.value
  if (!container) return
  container.replaceChildren()
  const target = document.createElement('div')
  container.appendChild(target)
  await mount(target, videoId, props.resumeAt ?? 0)
}

/** Destroy the player and hand the container back to Vue empty. */
function teardownPlayer() {
  destroy()
  host.value?.replaceChildren()
}

async function play() {
  // A probed signed URL may have expired while the poster sat open — mint a
  // fresh one rather than handing <video> a link R2 will refuse.
  if (
    source.value?.kind === 'r2' &&
    source.value.expiresAt &&
    Date.parse(source.value.expiresAt) <= Date.now() + 5000
  ) {
    source.value = null
  }
  const resolved = await resolveSource()

  if (resolved.kind === 'none') {
    emit('video-pending')
    return
  }

  playing.value = true
  // The host element only exists once `playing` flips, so wait for it.
  await nextTick()

  if (resolved.kind === 'youtube') {
    await mountYoutube(resolved.id)
    return
  }

  // R2: a plain <video> streaming from a signed URL. Range requests are served
  // by R2 itself, so seeking works without anything in front of it.
  const el = fileEl.value
  if (!el) return
  if (props.resumeAt) el.currentTime = props.resumeAt
  await el.play().catch(() => {
    /* Autoplay blocked — the controls are right there. */
  })
}

// ── Progress, from whichever player is mounted ────────────────────────
const fileTime = ref(0)
const fileDuration = ref(0)
const fileEnded = ref(false)

const isFile = computed(() => source.value?.kind === 'r2')

const playTime = computed(() => (isFile.value ? fileTime.value : currentTime.value))
const playDuration = computed(() => (isFile.value ? fileDuration.value : duration.value))
const playPercent = computed(() =>
  isFile.value
    ? fileDuration.value > 0
      ? Math.min(100, Math.round((fileTime.value / fileDuration.value) * 100))
      : 0
    : watched.value,
)
const playEnded = computed(() => (isFile.value ? fileEnded.value : ended.value))

function onFileTime() {
  const el = fileEl.value
  if (!el) return
  fileTime.value = el.currentTime
  if (el.duration && Number.isFinite(el.duration)) fileDuration.value = el.duration
}

/** Report the playhead upward so the page can remember it. */
watch(playTime, (t) => {
  if (playDuration.value > 0) emit('progress', t, playDuration.value)
})

/**
 * Tick the lesson off near the end rather than at the very end: the last stretch
 * of a lesson video is summary and sign-off. Emitted once — `done` guards the
 * repeat, and the page's own mark-done is idempotent anyway.
 */
watch([playPercent, playEnded], () => {
  if (props.done) return
  if (playEnded.value || playPercent.value >= WATCHED_THRESHOLD) emit('watched')
})

/** 754 → "12:34". Minutes past an hour keep counting: no lesson is that long. */
function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

type Tab = 'lesson' | 'notes' | 'files'
const tab = ref<Tab>('lesson')

const mod = computed(() => props.detail.modules[props.moduleIndex])
const paragraphs = computed(() => reading(props.detail, props.moduleIndex, props.item))
const files = computed(() => checklist(props.detail, props.moduleIndex))
const questions = computed(() => quiz(props.detail, props.moduleIndex))

/** Moving to another lesson should land you on its content, not on the notes
    tab you happened to leave open — and never on the previous lesson's video. */
watch(() => [props.moduleIndex, props.itemIndex], () => {
  tab.value = 'lesson'
  // Tear the player down BEFORE `playing` flips: once it is false the container
  // is unmounted, and destroying an iframe whose parent Vue has already removed
  // is what leaves the DOM and the vnode tree out of step.
  teardownPlayer()
  playing.value = false
  // The next lesson has its own source (and its own signed URL, which the
  // previous one's would not be valid for).
  source.value = null
  sourceError.value = false
  fileTime.value = 0
  fileDuration.value = 0
  fileEnded.value = false
  probeSource()
})
</script>

<template>
  <div class="stage">
    <!-- ══ Media / body ══ -->
    <div v-if="item.type === 'video'" class="video">
      <!-- Watching a file from R2: a plain player over a signed URL.
           `key` on both branches: switching between them must REPLACE the
           element, never patch a <div> into a <video> — see mountYoutube(). -->
      <video
        v-if="playing && source?.kind === 'r2'"
        key="stage-file"
        ref="fileEl"
        :src="source.url"
        class="video__frame"
        controls
        controlsList="nodownload"
        playsinline
        preload="metadata"
        @timeupdate="onFileTime"
        @loadedmetadata="onFileTime"
        @ended="fileEnded = true"
      />

      <!-- Watching YouTube: this div is only a CONTAINER. The IFrame API is
           handed a child element created in JS, never this one — Vue owns this
           node and must stay the only thing that mutates it. -->
      <div v-else-if="playing" key="stage-yt" ref="host" class="video__frame" />

      <!-- Not watching yet: poster + play. Same frame either way. -->
      <template v-else>
        <NuxtImg
          :src="detail.program.image"
          :alt="item.title"
          class="video__bg"
          format="webp"
          sizes="(max-width: 1023px) 100vw, 760px"
          loading="eager"
        />

        <button
          type="button"
          class="video__play"
          :class="{ 'video__play--off': !hasVideo }"
          :disabled="loadingSource"
          :aria-label="hasVideo ? t('learning.learn.play') : t('learning.learn.video_pending')"
          @click="play"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="8 5 19 12 8 19" />
          </svg>
        </button>

        <span class="video__len">{{ t('learning.course.minutes', { n: item.minutes }) }}</span>
        <span v-if="!hasVideo && !loadingSource" class="video__flag">{{ t('learning.learn.video_pending') }}</span>
        <span v-else-if="resumeAt" class="video__resume">
          {{ t('learning.learn.resume_at', { time: clock(resumeAt) }) }}
        </span>
      </template>
    </div>

    <!-- ══ Watch progress ══ -->
    <div v-if="item.type === 'video' && hasVideo && playing" class="watch">
      <span class="watch__track">
        <span class="watch__fill" :style="{ width: `${playPercent}%` }" />
        <span class="watch__mark" :style="{ left: `${WATCHED_THRESHOLD}%` }" />
      </span>
      <span class="watch__text">
        <template v-if="done">{{ t('learning.learn.watch_done') }}</template>
        <template v-else>
          {{ t('learning.learn.watch_progress', { percent: playPercent, at: clock(playTime), of: clock(playDuration) }) }}
          <span class="watch__hint">{{ t('learning.learn.watch_auto', { percent: WATCHED_THRESHOLD }) }}</span>
        </template>
      </span>
    </div>

    <!-- Borrowed footage must say so, watched or not. -->
    <p v-if="item.type === 'video' && isDemoFootage" class="video__demo">
      {{ t('learning.learn.video_demo') }}
    </p>

    <!-- ══ Lesson head ══ -->
    <div class="head">
      <p class="head__mod">
        {{ t('learning.course.module_n', { n: moduleIndex + 1 }) }} · {{ mod?.title }}
      </p>
      <h1 class="head__title">{{ item.title }}</h1>
      <p class="head__meta">
        <span class="tagpill" :class="`tagpill--${item.type}`">{{ t(`learning.learn.type_${item.type}`) }}</span>
        <span>{{ t('learning.course.minutes', { n: item.minutes }) }}</span>
        <span v-if="item.free" class="freepill">{{ t('learning.course.preview') }}</span>
      </p>
    </div>

    <!-- ══ Tabs ══ -->
    <div class="tabs">
      <button type="button" :class="{ 'tabs--on': tab === 'lesson' }" @click="tab = 'lesson'">
        {{ t('learning.learn.tab_lesson') }}
      </button>
      <button type="button" :class="{ 'tabs--on': tab === 'notes' }" @click="tab = 'notes'">
        {{ t('learning.learn.tab_notes') }}<span v-if="note" class="tabs__dot" />
      </button>
      <button type="button" :class="{ 'tabs--on': tab === 'files' }" @click="tab = 'files'">
        {{ t('learning.learn.tab_files') }}
      </button>
    </div>

    <!-- ── Tab: lesson ── -->
    <div v-if="tab === 'lesson'" class="body">
      <LearnQuiz
        v-if="item.type === 'quiz'"
        :questions="questions"
        @passed="emit('toggle-done')"
      />

      <template v-else>
        <p v-for="para in paragraphs" :key="para" class="para">{{ para }}</p>
      </template>
    </div>

    <!-- ── Tab: notes ── -->
    <div v-else-if="tab === 'notes'" class="body">
      <label class="notes">
        <span class="notes__label">{{ t('learning.learn.notes_label') }}</span>
        <textarea
          :value="note"
          class="notes__area"
          rows="8"
          :placeholder="t('learning.learn.notes_ph')"
          @input="emit('update:note', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
      <p class="notes__hint">{{ t('learning.learn.notes_hint') }}</p>
    </div>

    <!-- ── Tab: files ── -->
    <div v-else class="body">
      <p class="files__title">{{ t('learning.learn.files_title') }}</p>
      <ul class="files">
        <li v-for="line in files" :key="line">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <polyline points="9 12 11 14 15.5 9.5" />
          </svg>
          {{ line }}
        </li>
      </ul>
      <p class="notes__hint">{{ t('learning.learn.files_hint') }}</p>
    </div>

    <!-- ══ Ask a person ══ -->
    <!-- Outside the tabs on purpose: being stuck is not a tab you go looking
         for, so the way to a human stays visible whichever one is open. -->
    <LearnMentorship
      :program-slug="detail.program.slug"
      :lesson-key="`${moduleIndex}-${itemIndex}`"
      :lesson-title="item.title"
    />

    <!-- ══ Footer nav ══ -->
    <div class="nav">
      <button type="button" class="nav__side" :disabled="!hasPrev" @click="emit('prev')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 6 9 12 15 18" />
        </svg>
        {{ t('learning.learn.prev') }}
      </button>

      <button type="button" class="nav__done" :class="{ 'nav__done--on': done }" @click="emit('toggle-done')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="5 12.5 9.5 17 19 7" />
        </svg>
        {{ done ? t('learning.learn.marked_done') : t('learning.learn.mark_done') }}
      </button>

      <button type="button" class="nav__side nav__side--next" :disabled="!hasNext" @click="emit('next')">
        {{ t('learning.learn.next') }}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
}

/* ══ Video ══ */
.video {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: #071a2e;
}

.video__bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.42;
}

/* The placeholder, and the iframe YouTube swaps in for it, both fill the frame.
   `:deep` is required for the iframe: it is created outside Vue's renderer, so
   it never gets this component's scoped attribute. */
.video__frame,
.video :deep(iframe) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/* A file from R2 keeps its own aspect ratio inside the frame; the letterbox is
   black so a portrait phone recording does not glow white down both sides. */
video.video__frame {
  object-fit: contain;
  background: #000;
}

.video__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  padding-left: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.93);
  color: var(--color-navy);
  transition: transform 0.2s ease, background 0.2s ease;
}
.video__play:hover {
  transform: translate(-50%, -50%) scale(1.06);
  background: white;
}

/* No video on this lesson yet — the button stays, muted, and explains itself. */
.video__play--off {
  background: rgba(255, 255, 255, 0.42);
  color: rgba(11, 42, 74, 0.65);
}
.video__play--off:hover {
  background: rgba(255, 255, 255, 0.6);
}

.video__len,
.video__flag {
  position: absolute;
  bottom: 0.6rem;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  background: rgba(7, 26, 46, 0.82);
  backdrop-filter: blur(3px);
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 700;
  color: white;
}
.video__len {
  right: 0.6rem;
}
.video__flag {
  left: 0.6rem;
  background: rgba(244, 122, 31, 0.9);
}

.video__resume {
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  background: rgba(7, 26, 46, 0.82);
  backdrop-filter: blur(3px);
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 700;
  color: white;
}

/* ══ Watch progress ══ */
.watch {
  margin-top: 0.5rem;
}

.watch__track {
  position: relative;
  display: block;
  height: 4px;
  border-radius: 99px;
  background: #e2e9f0;
  overflow: hidden;
}

.watch__fill {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--color-accent);
  transition: width 0.4s linear;
}

/* Where the lesson ticks itself off. */
.watch__mark {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 1.5px;
  background: var(--color-success);
  opacity: 0.75;
}

.watch__text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.3rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.watch__hint {
  opacity: 0.75;
}

.video__demo {
  margin-top: 0.4rem;
  font-size: 10.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  opacity: 0.9;
}

/* ══ Head ══ */
.head {
  margin-top: 1rem;
}

.head__mod {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-accent-dark);
}

.head__title {
  margin-top: 0.25rem;
  font-family: var(--font-heading);
  font-size: 19px;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-navy);
}

.head__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.tagpill,
.freepill {
  display: inline-flex;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.tagpill--video {
  background: #e3edf9;
  color: var(--color-navy-light);
}
.tagpill--reading {
  background: #fff1e3;
  color: var(--color-accent-dark);
}
.tagpill--quiz {
  background: var(--color-success-container);
  color: #15803d;
}
.freepill {
  background: var(--color-success-container);
  color: #15803d;
}

/* ══ Tabs ══ */
.tabs {
  display: flex;
  gap: 0.2rem;
  margin-top: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.tabs button {
  position: relative;
  padding: 0.5rem 0.7rem;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.tabs button:hover {
  color: var(--color-navy);
}
.tabs--on {
  color: var(--color-navy) !important;
  border-bottom-color: var(--color-accent);
}

.tabs__dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-left: 0.25rem;
  border-radius: 50%;
  background: var(--color-accent);
  vertical-align: middle;
}

/* ══ Body ══ */
.body {
  padding: 1rem 0 0.4rem;
}

.para {
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-secondary);
}
.para + .para {
  margin-top: 0.7rem;
}

/* ── Notes ── */
.notes {
  display: block;
}

.notes__label {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.notes__area {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--color-text-primary);
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.notes__area:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.13);
}

.notes__hint {
  margin-top: 0.5rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  opacity: 0.85;
}

/* ── Files ── */
.files__title {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
  color: var(--color-navy);
}

.files {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.6rem;
}

.files li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.files svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-navy-light);
}

/* ══ Footer nav ══ */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
}

.nav__side {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.42rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.nav__side:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.nav__side:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav__done {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  background: var(--color-navy);
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: white;
  transition: background 0.2s ease;
}
.nav__done:hover {
  background: var(--color-navy-light);
}
.nav__done--on {
  background: var(--color-success);
}

@media (min-width: 640px) {
  .head__title {
    font-size: 22px;
  }
  .body {
    padding-top: 1.15rem;
  }
}
</style>
