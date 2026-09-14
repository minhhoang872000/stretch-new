<script setup lang="ts">
/**
 * The buy / continue panel — sticky beside the content on desktop.
 *
 * It has three states, decided by the learner's own enrolments rather than by a
 * prop the page has to remember to pass: already enrolled → continue where they
 * stopped, already finished → the certificate, otherwise → enrol.
 */
import type { ProgramDetail } from '~/composables/useProgramDetail'
import type { ActiveEnrolment, CompletedEnrolment } from '~/composables/useMyLearning'

const props = defineProps<{
  detail: ProgramDetail
  active: ActiveEnrolment | null
  completed: CompletedEnrolment | null
}>()

const emit = defineEmits<{ enroll: []; resume: []; share: [] }>()

const { t } = useI18n()
const { formatPrice } = useLearningCatalog()
const { toggle, isSaved } = useSavedPrograms()

const slug = computed(() => props.detail.program.slug)

/** Seats only mean something while a scheduled date is still ahead. */
const showSeats = computed(() => props.detail.scheduled && props.detail.seatsLeft <= 6)
</script>

<template>
  <div class="panel">
    <!-- ── Price ── -->
    <div class="panel__price">
      <span class="panel__amount" :class="{ 'panel__amount--free': detail.program.price === 0 }">
        {{ formatPrice(detail.program.price) }}
      </span>
      <span v-if="detail.program.price > 0" class="panel__once">{{ t('learning.course.price_once') }}</span>
    </div>

    <p v-if="showSeats" class="panel__seats">
      {{ t('learning.course.seats_left', { count: detail.seatsLeft }) }}
    </p>

    <!-- ══ Enrolled: continue ══ -->
    <template v-if="active">
      <div class="prog">
        <div class="prog__row">
          <span class="prog__label">{{ t('learning.my.lesson_progress', { current: active.lesson, total: active.lessons }) }}</span>
          <span class="prog__pct">{{ active.percent }}%</span>
        </div>
        <span class="prog__track"><span class="prog__fill" :style="{ width: `${active.percent}%` }" /></span>
        <p class="prog__next">{{ t('learning.my.next_up') }} {{ active.nextLesson }}</p>
      </div>

      <button type="button" class="panel__cta" @click="emit('resume')">
        {{ t('learning.my.continue') }}
      </button>
    </template>

    <!-- ══ Finished: certificate ══ -->
    <template v-else-if="completed">
      <p class="done">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="8.5 12.2 11 14.7 15.6 9.6" />
        </svg>
        {{ t('learning.course.done_on', { date: completed.completedAt }) }}
      </p>
      <button type="button" class="panel__cta" @click="emit('resume')">
        {{ t('learning.my.certificate') }}
      </button>
    </template>

    <!-- ══ Not enrolled ══ -->
    <template v-else>
      <button type="button" class="panel__cta" @click="emit('enroll')">
        {{ detail.scheduled
          ? t('learning.course.cta_book')
          : detail.program.price === 0 ? t('learning.course.cta_free') : t('learning.course.cta_enroll') }}
      </button>
      <p class="panel__note">
        {{ detail.scheduled ? t('learning.course.note_book') : t('learning.course.note_refund') }}
      </p>
    </template>

    <!-- ── Secondary actions ── -->
    <div class="panel__acts">
      <button type="button" class="act" :class="{ 'act--on': isSaved(slug) }" @click="toggle(slug)">
        <svg width="14" height="14" viewBox="0 0 24 24" :fill="isSaved(slug) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
        </svg>
        {{ isSaved(slug) ? t('learning.course.saved') : t('learning.catalog.save') }}
      </button>

      <button type="button" class="act" @click="emit('share')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="19" r="2.6" />
          <line x1="8.3" y1="10.8" x2="15.7" y2="6.2" />
          <line x1="8.3" y1="13.2" x2="15.7" y2="17.8" />
        </svg>
        {{ t('learning.course.share') }}
      </button>
    </div>

    <!-- ── What is included ── -->
    <div class="panel__incl">
      <p class="panel__incl-title">{{ t('learning.course.includes_title') }}</p>
      <ul>
        <li v-for="line in detail.includes" :key="line">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="5 12.5 9.5 17 19 7" />
          </svg>
          {{ line }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.panel {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
  box-shadow: 0 18px 40px -30px rgba(11, 42, 74, 0.5);
}

/* ── Price ── */
.panel__price {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.panel__amount {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-navy);
}
.panel__amount--free {
  color: var(--color-success);
}

.panel__once {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.panel__seats {
  margin-top: 0.45rem;
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  background: #fff4e8;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-accent-dark);
}

/* ── CTA ── */
.panel__cta {
  display: block;
  width: 100%;
  margin-top: 0.85rem;
  padding: 0.65rem 1rem;
  border-radius: 9px;
  background: var(--color-accent);
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 800;
  color: white;
  transition: background 0.2s ease, transform 0.15s ease;
}
.panel__cta:hover {
  background: var(--color-accent-dark);
}
.panel__cta:active {
  transform: translateY(1px);
}

.panel__note {
  margin-top: 0.5rem;
  font-size: 10.5px;
  line-height: 1.5;
  text-align: center;
  color: var(--color-text-secondary);
}

/* ── Progress (enrolled) ── */
.prog {
  margin-top: 0.85rem;
  padding: 0.6rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-off-white);
}

.prog__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.prog__label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.prog__pct {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-navy);
}

.prog__track {
  display: block;
  height: 5px;
  margin-top: 0.35rem;
  border-radius: 99px;
  background: #dde5ee;
  overflow: hidden;
}

.prog__fill {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--color-accent);
}

.prog__next {
  margin-top: 0.4rem;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-navy);
}

/* ── Completed ── */
.done {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.8rem;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  background: var(--color-success-container);
  font-size: 11.5px;
  font-weight: 600;
  color: #15803d;
}

/* ── Secondary actions ── */
.panel__acts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
  margin-top: 0.7rem;
}

.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.42rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-navy);
  transition: all 0.2s ease;
}
.act:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.act--on {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ── Includes ── */
.panel__incl {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
}

.panel__incl-title {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.panel__incl ul {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.panel__incl li {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.panel__incl svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--color-success);
}
</style>
