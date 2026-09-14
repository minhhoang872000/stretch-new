<script setup lang="ts">
/**
 * End-of-part quiz. Answer, submit, see which ones were wrong, retry.
 *
 * Grading happens here rather than on submit-to-server because the questions
 * themselves are generated client-side (see `useLessonContent`) — when real
 * questions arrive with a real answer key, only `check()` moves.
 */
import type { QuizQuestion } from '~/composables/useLessonContent'

const props = defineProps<{ questions: QuizQuestion[] }>()
const emit = defineEmits<{ passed: [] }>()

const { t } = useI18n()

const picked = ref<(number | null)[]>(props.questions.map(() => null))
const submitted = ref(false)

// A different lesson means a different quiz — never carry answers across.
watch(() => props.questions, (list) => {
  picked.value = list.map(() => null)
  submitted.value = false
})

const answered = computed(() => picked.value.every((p) => p !== null))
const score = computed(() => props.questions.reduce(
  (sum, q, i) => sum + (picked.value[i] === q.answer ? 1 : 0), 0,
))
const allRight = computed(() => score.value === props.questions.length)

function choose(qi: number, oi: number) {
  if (submitted.value) return
  const next = [...picked.value]
  next[qi] = oi
  picked.value = next
}

function check() {
  if (!answered.value) return
  submitted.value = true
  // Marking the lesson complete is the page's business; it only needs to know
  // the learner got everything right.
  if (allRight.value) emit('passed')
}

function retry() {
  picked.value = props.questions.map(() => null)
  submitted.value = false
}
</script>

<template>
  <div class="quiz">
    <div v-for="(q, qi) in questions" :key="q.question" class="q">
      <p class="q__text">
        <span class="q__n">{{ qi + 1 }}</span>
        {{ q.question }}
      </p>

      <div class="q__opts">
        <button
          v-for="(option, oi) in q.options"
          :key="option"
          type="button"
          class="opt"
          :class="{
            'opt--picked': picked[qi] === oi && !submitted,
            'opt--right': submitted && oi === q.answer,
            'opt--wrong': submitted && picked[qi] === oi && oi !== q.answer,
          }"
          :disabled="submitted"
          @click="choose(qi, oi)"
        >
          <span class="opt__mark">{{ ['A', 'B', 'C', 'D'][oi] }}</span>
          <span class="opt__text">{{ option }}</span>
        </button>
      </div>
    </div>

    <!-- ── Result / actions ── -->
    <div class="foot">
      <p v-if="submitted" class="result" :class="allRight ? 'result--pass' : 'result--fail'">
        {{ allRight
          ? t('learning.learn.quiz_pass', { score, total: questions.length })
          : t('learning.learn.quiz_fail', { score, total: questions.length }) }}
      </p>
      <p v-else class="hint">{{ t('learning.learn.quiz_hint') }}</p>

      <button v-if="!submitted" type="button" class="btn" :disabled="!answered" @click="check">
        {{ t('learning.learn.quiz_submit') }}
      </button>
      <button v-else-if="!allRight" type="button" class="btn" @click="retry">
        {{ t('learning.learn.quiz_retry') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.q__text {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-family: var(--font-heading);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 700;
  color: var(--color-navy);
}

.q__n {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--color-navy);
  font-size: 9.5px;
  font-weight: 800;
  color: white;
}

.q__opts {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.opt {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: white;
  text-align: left;
  transition: all 0.18s ease;
}
.opt:hover:not(:disabled) {
  border-color: var(--color-accent);
}

.opt__mark {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 5px;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 800;
  color: var(--color-navy);
}

.opt__text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.opt--picked {
  border-color: var(--color-accent);
  background: #fff8f2;
}
.opt--picked .opt__mark {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.opt--right {
  border-color: var(--color-success);
  background: var(--color-success-container);
}
.opt--right .opt__mark {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.opt--wrong {
  border-color: var(--color-error);
  background: var(--color-error-container);
}
.opt--wrong .opt__mark {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

/* ── Foot ── */
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-border);
}

.hint {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.result {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
}
.result--pass {
  color: #15803d;
}
.result--fail {
  color: #b91c1c;
}

.btn {
  flex-shrink: 0;
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  background: var(--color-navy);
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 800;
  color: white;
  transition: background 0.2s ease, opacity 0.2s ease;
}
.btn:hover:not(:disabled) {
  background: var(--color-navy-light);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
