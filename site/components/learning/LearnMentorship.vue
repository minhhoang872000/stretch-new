<script setup lang="ts">
/**
 * "Đặt buổi 1-1" — the way out of being stuck on a lesson.
 *
 * Lives inside the player rather than on a contact page: the moment a learner
 * needs a person is the moment they are looking at the thing they do not
 * understand, and the request carries which lesson that was.
 *
 * Slots come from the server (opening hours minus what Google Calendar says is
 * busy), so nothing here decides what is free — it only renders it. Booking
 * requires a real Google session because an accepted session becomes a calendar
 * invitation, which needs an address; the hub's demo login has none.
 */

const props = defineProps<{
  programSlug: string
  lessonKey: string
  lessonTitle: string
}>()

const { t } = useI18n()
const { loggedIn } = useUserSession()
const { open: openAuth } = useAuthModal()
const { notify } = useNotification()

interface DayAvailability {
  date: string
  weekday: number
  slots: string[]
}

interface LearnerSession {
  id: string
  programSlug: string | null
  lessonKey: string | null
  lessonTitle: string | null
  topic: string | null
  date: string
  time: string
  durationMinutes: number
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
  meetUrl: string | null
  googleHtmlLink: string | null
  declineReason: string | null
  createdAt: string
}

const isOpen = ref(false)
const loadingSlots = ref(false)
const submitting = ref(false)
const days = ref<DayAvailability[]>([])
const slotMinutes = ref(30)
const pickedDate = ref('')
const pickedTime = ref('')
const topic = ref('')
const formError = ref('')

const mine = ref<LearnerSession[]>([])

/** The one the learner is waiting on, or about to attend. */
const active = computed(() =>
  mine.value.find((s) => s.status === 'pending' || s.status === 'accepted') ?? null,
)

const slotsForPicked = computed(
  () => days.value.find((d) => d.date === pickedDate.value)?.slots ?? [],
)

const canSubmit = computed(() => Boolean(pickedDate.value && pickedTime.value) && !submitting.value)

// ── Formatting ──────────────────────────────────────────────────────────────
// Built from the string, not from `new Date(iso)`: parsing a bare date gives a
// UTC midnight, which renders as the previous day for anyone west of Greenwich
// and, during SSR, can disagree with what the client then renders.

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function parts(iso: string) {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number)
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }
}

function dayShort(iso: string): string {
  const { m, d, weekday } = parts(iso)
  return `${WEEKDAYS[weekday]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

function dayLong(iso: string): string {
  const { y, m, d, weekday } = parts(iso)
  return `${WEEKDAYS[weekday]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

function endTime(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ── Data ────────────────────────────────────────────────────────────────────

async function loadMine() {
  if (!loggedIn.value) {
    mine.value = []
    return
  }
  try {
    const res = await $fetch<{ sessions: LearnerSession[] }>('/api/mentorship/mine')
    mine.value = res.sessions ?? []
  } catch {
    // Not being able to show an existing request is not worth an error banner;
    // the button stays and a duplicate is refused server-side anyway.
    mine.value = []
  }
}

async function loadSlots() {
  loadingSlots.value = true
  formError.value = ''
  try {
    const res = await $fetch<{ days: DayAvailability[]; slotMinutes: number }>(
      '/api/mentorship/availability',
    )
    days.value = res.days ?? []
    slotMinutes.value = res.slotMinutes || 30
    if (!days.value.some((d) => d.date === pickedDate.value)) {
      pickedDate.value = days.value[0]?.date ?? ''
      pickedTime.value = ''
    }
  } catch {
    days.value = []
    formError.value = t('learning.mentor.load_error')
  } finally {
    loadingSlots.value = false
  }
}

function openModal() {
  if (!loggedIn.value) {
    openAuth('login')
    return
  }
  isOpen.value = true
  topic.value = ''
  formError.value = ''
  loadSlots()
}

function closeModal() {
  isOpen.value = false
}

function pickDate(date: string) {
  pickedDate.value = date
  pickedTime.value = ''
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  formError.value = ''

  try {
    await $fetch('/api/mentorship', {
      method: 'POST',
      body: {
        program_slug: props.programSlug,
        lesson_key: props.lessonKey,
        lesson_title: props.lessonTitle,
        topic: topic.value.trim() || undefined,
        date: pickedDate.value,
        time: pickedTime.value,
      },
    })

    notify(t('learning.mentor.sent'), 'success')
    isOpen.value = false
    await loadMine()
  } catch (err: any) {
    // A taken slot is the common case — refresh so the grid stops offering it.
    formError.value =
      err?.data?.message || err?.statusMessage || t('learning.mentor.send_error')
    if (err?.statusCode === 409) await loadSlots()
  } finally {
    submitting.value = false
  }
}

// Only after hydration: this is per-learner and must not land in a cached page.
onMounted(loadMine)
watch(loggedIn, loadMine)

// A modal that stays open while the learner navigates to another lesson would
// submit against the wrong one.
watch(() => props.lessonKey, closeModal)

onBeforeUnmount(closeModal)
</script>

<template>
  <section class="mentor">
    <!-- ── Already has something in flight ── -->
    <template v-if="active">
      <div class="mentor__head">
        <span class="mentor__badge" :class="`mentor__badge--${active.status}`">
          {{ active.status === 'accepted' ? t('learning.mentor.st_accepted') : t('learning.mentor.st_pending') }}
        </span>
        <p class="mentor__when">
          {{ dayLong(active.date) }} · {{ active.time }}–{{ endTime(active.time, active.durationMinutes) }}
        </p>
      </div>

      <p v-if="active.status === 'pending'" class="mentor__note">
        {{ t('learning.mentor.pending_note') }}
      </p>
      <p v-else class="mentor__note">{{ t('learning.mentor.accepted_note') }}</p>

      <div v-if="active.status === 'accepted'" class="mentor__links">
        <a
          v-if="active.meetUrl"
          :href="active.meetUrl"
          target="_blank"
          rel="noopener"
          class="mentor__join"
        >
          {{ t('learning.mentor.join') }}
        </a>
        <a
          v-if="active.googleHtmlLink"
          :href="active.googleHtmlLink"
          target="_blank"
          rel="noopener"
          class="mentor__cal"
        >
          {{ t('learning.mentor.view_calendar') }}
        </a>
        <span v-if="!active.meetUrl" class="mentor__pendinglink">
          {{ t('learning.mentor.link_soon') }}
        </span>
      </div>
    </template>

    <!-- ── Nothing booked yet ── -->
    <template v-else>
      <div class="mentor__pitch">
        <h3 class="mentor__title">{{ t('learning.mentor.title') }}</h3>
        <p class="mentor__sub">{{ t('learning.mentor.subtitle') }}</p>
      </div>
      <button type="button" class="mentor__cta" @click="openModal">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 11h18" />
        </svg>
        {{ loggedIn ? t('learning.mentor.cta') : t('learning.mentor.cta_signin') }}
      </button>
    </template>

    <!-- ── Booking modal ── -->
    <!-- `ClientOnly` is load-bearing, not caution: Nuxt server-renders a
         teleport into `#teleports` while the client teleports into `body`, and
         the mismatched container throws when the player unmounts on navigation.
         Same wrapper AuthModal uses, for the same reason. -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isOpen" class="mdl" role="dialog" aria-modal="true" :aria-label="t('learning.mentor.title')">
          <div class="mdl__scrim" @click="closeModal" />

          <div class="mdl__panel">
            <header class="mdl__head">
              <div>
                <h3 class="mdl__title">{{ t('learning.mentor.modal_title') }}</h3>
                <p class="mdl__lesson">{{ lessonTitle }}</p>
              </div>
              <button type="button" class="mdl__x" :aria-label="t('learning.mentor.close')" @click="closeModal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div class="mdl__body">
              <p v-if="loadingSlots" class="mdl__state">{{ t('learning.mentor.loading') }}</p>

              <p v-else-if="!days.length" class="mdl__state">{{ t('learning.mentor.no_slots') }}</p>

              <template v-else>
                <p class="mdl__label">{{ t('learning.mentor.pick_day') }}</p>
                <div class="chips">
                  <button
                    v-for="d in days"
                    :key="d.date"
                    type="button"
                    class="chip"
                    :class="{ 'chip--on': d.date === pickedDate }"
                    @click="pickDate(d.date)"
                  >
                    {{ dayShort(d.date) }}
                    <span class="chip__n">{{ d.slots.length }}</span>
                  </button>
                </div>

                <p class="mdl__label">{{ t('learning.mentor.pick_time') }}</p>
                <div class="slots">
                  <button
                    v-for="s in slotsForPicked"
                    :key="s"
                    type="button"
                    class="slot"
                    :class="{ 'slot--on': s === pickedTime }"
                    @click="pickedTime = s"
                  >
                    {{ s }}
                  </button>
                </div>
                <p class="mdl__dur">{{ t('learning.mentor.duration', { n: slotMinutes }) }}</p>

                <label class="mdl__field">
                  <span class="mdl__label">{{ t('learning.mentor.topic_label') }}</span>
                  <textarea
                    v-model="topic"
                    rows="3"
                    class="mdl__area"
                    :placeholder="t('learning.mentor.topic_ph')"
                  />
                </label>
              </template>

              <p v-if="formError" class="mdl__err">{{ formError }}</p>
            </div>

            <footer class="mdl__foot">
              <button type="button" class="mdl__cancel" @click="closeModal">
                {{ t('learning.mentor.cancel') }}
              </button>
              <button type="button" class="mdl__send" :disabled="!canSubmit" @click="submit">
                {{ submitting ? t('learning.mentor.sending') : t('learning.mentor.send') }}
              </button>
            </footer>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </section>
</template>

<style scoped>
.mentor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 20px;
  margin-top: 26px;
  padding: 18px 20px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-off-white);
}

.mentor__pitch {
  flex: 1 1 260px;
}

.mentor__title {
  font-family: var(--font-heading);
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--color-navy);
}

.mentor__sub {
  margin-top: 3px;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.mentor__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--color-navy);
  color: white;
  font-size: 0.87rem;
  font-weight: 600;
  transition: background 0.18s ease;
}
.mentor__cta:hover {
  background: var(--color-navy-light);
}

/* ── Existing request ── */
.mentor__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  flex: 1 1 100%;
}

.mentor__badge {
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.mentor__badge--pending {
  background: var(--color-accent-light, #fdf2e2);
  color: var(--color-accent-dark);
}
.mentor__badge--accepted {
  background: var(--color-success-container);
  color: var(--color-success);
}

.mentor__when {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-navy);
}

.mentor__note {
  flex: 1 1 100%;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.mentor__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.mentor__join {
  padding: 9px 18px;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}
.mentor__join:hover {
  background: var(--color-accent-dark);
}

.mentor__cal {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--color-navy);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.mentor__pendinglink {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

/* ══ Modal ══ */
.mdl {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 18px;
}

.mdl__scrim {
  position: absolute;
  inset: 0;
  background: rgba(7, 26, 46, 0.55);
}

.mdl__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(520px, 100%);
  max-height: min(86vh, 720px);
  border-radius: 16px;
  background: white;
  overflow: hidden;
  box-shadow: 0 24px 60px -20px rgba(7, 26, 46, 0.5);
}

.mdl__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--color-border);
}

.mdl__title {
  font-family: var(--font-heading);
  font-size: 1.06rem;
  font-weight: 700;
  color: var(--color-navy);
}

.mdl__lesson {
  margin-top: 2px;
  font-size: 0.84rem;
  color: var(--color-text-secondary);
}

.mdl__x {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--color-text-secondary);
}
.mdl__x:hover {
  background: var(--color-off-white);
  color: var(--color-navy);
}

.mdl__body {
  padding: 16px 20px;
  overflow-y: auto;
}

.mdl__state {
  padding: 22px 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

.mdl__label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 18px;
}

.chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: white;
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--color-navy);
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.chip:hover {
  border-color: var(--color-navy);
}
.chip--on {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: white;
}

.chip__n {
  font-size: 0.7rem;
  opacity: 0.65;
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 7px;
  margin-bottom: 8px;
}

.slot {
  padding: 9px 4px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-navy);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.slot:hover {
  border-color: var(--color-accent);
}
.slot--on {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.mdl__dur {
  margin-bottom: 18px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.mdl__field {
  display: block;
}

.mdl__area {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font: inherit;
  font-size: 0.88rem;
  color: var(--color-navy);
  resize: vertical;
}
.mdl__area:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.mdl__err {
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  background: var(--color-error-container);
  color: var(--color-error);
  font-size: 0.83rem;
  line-height: 1.5;
}

.mdl__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-off-white);
}

.mdl__cancel {
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.mdl__cancel:hover {
  color: var(--color-navy);
}

.mdl__send {
  padding: 9px 20px;
  border-radius: 999px;
  background: var(--color-navy);
  color: white;
  font-size: 0.86rem;
  font-weight: 600;
  transition: background 0.18s ease, opacity 0.18s ease;
}
.mdl__send:hover:not(:disabled) {
  background: var(--color-navy-light);
}
.mdl__send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .mentor {
    flex-direction: column;
    align-items: stretch;
  }
  .mentor__cta {
    justify-content: center;
  }
}
</style>
