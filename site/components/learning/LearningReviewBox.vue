<script setup lang="ts">
/**
 * Star rating + text, shown in the player once the course is finished.
 *
 * Only a learner whose enrolment is `completed` may write (the API checks);
 * the review lands `pending` and shows on the course page after someone
 * approves it in the console's Reviews screen. Writing again edits the one
 * review and sends it back for approval.
 */
const props = defineProps<{ slug: string; ready: boolean }>()

interface OwnReview {
  id: string
  rating: number
  text: string
  status: string
  reply: string
}

const { t, tm, rt } = useI18n()
const { notify } = useNotification()

const loaded = ref(false)
const canReview = ref(false)
const review = ref<OwnReview | null>(null)
const editing = ref(true)

const rating = ref(0)
const hover = ref(0)
const text = ref('')
const sending = ref(false)

const labels = computed(() => (tm('learning.review.labels') as unknown[]).map((l: any) => rt(l)))
const shown = computed(() => hover.value || rating.value)

async function load() {
  if (loaded.value || !props.ready) return
  try {
    const res = await $fetch<{ canReview: boolean; review: OwnReview | null }>(`/api/me/reviews/${encodeURIComponent(props.slug)}`)
    canReview.value = res.canReview
    review.value = res.review
    if (res.review) {
      rating.value = res.review.rating
      text.value = res.review.text
      editing.value = false
    }
    loaded.value = true
  } catch {
    // No box beats a broken one.
  }
}

watch(() => props.ready, load)
onMounted(load)

async function submit() {
  if (!rating.value) {
    notify(t('learning.review.need_rating'), 'info')
    return
  }
  sending.value = true
  try {
    const res = await $fetch<{ review: OwnReview }>(`/api/me/reviews/${encodeURIComponent(props.slug)}`, {
      method: 'POST',
      body: { rating: rating.value, text: text.value },
    })
    review.value = res.review
    editing.value = false
    notify(t('learning.review.thanks'), 'success')
  } catch {
    notify(t('learning.review.error'), 'error')
  } finally {
    sending.value = false
  }
}

const statusText = computed(() => {
  if (!review.value) return ''
  if (review.value.status === 'approved') return t('learning.review.approved')
  if (review.value.status === 'pending') return t('learning.review.pending')
  return t('learning.review.hidden')
})
</script>

<template>
  <section v-if="loaded && canReview" class="rv">
    <p class="rv__title">{{ t('learning.review.title') }}</p>
    <p class="rv__sub">{{ t('learning.review.sub') }}</p>

    <!-- Already written: show it, with a way back into the form. -->
    <div v-if="review && !editing" class="rv__done">
      <div class="rv__stars rv__stars--static" :aria-label="t('learning.review.star_aria', { n: review.rating })">
        <svg v-for="n in 5" :key="n" width="18" height="18" viewBox="0 0 24 24" :class="n <= review.rating ? 'on' : ''"><path d="M12 2.5l2.95 6.1 6.55.95-4.75 4.6 1.12 6.55L12 17.6l-5.87 3.1 1.12-6.55L2.5 9.55l6.55-.95z" /></svg>
      </div>
      <p v-if="review.text" class="rv__text">“{{ review.text }}”</p>
      <p class="rv__status" :class="`rv__status--${review.status}`">{{ statusText }}</p>
      <div v-if="review.reply" class="rv__reply">
        <span>{{ t('learning.review.reply') }}</span>
        <p>{{ review.reply }}</p>
      </div>
      <button type="button" class="rv__edit" @click="editing = true">{{ t('learning.review.edit') }}</button>
    </div>

    <form v-else class="rv__form" @submit.prevent="submit">
      <div class="rv__rate">
        <div class="rv__stars" role="radiogroup" @mouseleave="hover = 0">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            role="radio"
            :aria-checked="rating === n"
            :aria-label="t('learning.review.star_aria', { n })"
            @mouseenter="hover = n"
            @click="rating = n"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" :class="n <= shown ? 'on' : ''"><path d="M12 2.5l2.95 6.1 6.55.95-4.75 4.6 1.12 6.55L12 17.6l-5.87 3.1 1.12-6.55L2.5 9.55l6.55-.95z" /></svg>
          </button>
        </div>
        <span v-if="shown" class="rv__label">{{ labels[shown - 1] }}</span>
      </div>
      <textarea v-model="text" class="rv__input" rows="3" maxlength="3000" :placeholder="t('learning.review.placeholder')" />
      <button type="submit" class="rv__btn" :disabled="sending">
        {{ sending ? t('learning.review.sending') : review ? t('learning.review.update') : t('learning.review.submit') }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.rv {
  margin-bottom: 1rem;
  padding: 1rem 1rem 1.05rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}
.rv__title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  color: var(--color-navy);
}
.rv__sub {
  margin-top: 0.2rem;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.rv__form {
  margin-top: 0.75rem;
}
.rv__rate {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.rv__stars {
  display: inline-flex;
  gap: 0.15rem;
}
.rv__stars button {
  padding: 2px;
  border-radius: 6px;
  transition: transform 0.15s ease;
}
.rv__stars button:hover {
  transform: scale(1.12);
}
.rv__stars svg {
  fill: #e2e8f0;
  transition: fill 0.15s ease;
}
.rv__stars svg.on {
  fill: #f5a623;
}
.rv__label {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-accent-dark);
}
.rv__input {
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.65rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
}
.rv__input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.rv__btn {
  margin-top: 0.55rem;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
}
.rv__btn:hover:not(:disabled) {
  background: var(--color-accent-dark);
}
.rv__btn:disabled {
  opacity: 0.7;
}
.rv__done {
  margin-top: 0.7rem;
}
.rv__text {
  margin-top: 0.4rem;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-navy);
}
.rv__status {
  margin-top: 0.5rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.rv__status--approved {
  color: #15803d;
}
.rv__reply {
  margin-top: 0.6rem;
  padding: 0.55rem 0.7rem;
  border-left: 3px solid var(--color-accent);
  border-radius: 0 8px 8px 0;
  background: var(--color-off-white);
  font-size: 12px;
  color: var(--color-navy);
}
.rv__reply span {
  display: block;
  margin-bottom: 0.15rem;
  font-weight: 800;
}
.rv__edit {
  margin-top: 0.5rem;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.rv__edit:hover {
  color: var(--color-accent);
}
</style>
