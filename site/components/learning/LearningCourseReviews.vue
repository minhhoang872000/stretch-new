<script setup lang="ts">
/**
 * Learner reviews — the score summary with its star distribution, then the
 * individual reviews.
 *
 * Reviewers show as initials, not photos: a stock portrait next to a review is
 * a claim about a person who does not exist.
 */
import type { ProgramDetail } from '~/composables/useProgramDetail'

const props = defineProps<{ detail: ProgramDetail }>()

const { t } = useI18n()

/** 5★ first, matching the order of `rating.distribution`. */
const bars = computed(() => props.detail.rating.distribution.map((percent, i) => ({
  stars: 5 - i,
  percent,
})))
</script>

<template>
  <section id="reviews" class="card">
    <h2 class="card__title">{{ t('learning.course.reviews_title') }}</h2>

    <div class="summary">
      <div class="score">
        <p class="score__num">{{ detail.rating.avg }}</p>
        <div class="score__stars" aria-hidden="true">
          <svg v-for="i in 5" :key="i" width="14" height="14" viewBox="0 0 24 24" :fill="i <= Math.round(detail.rating.avg) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6">
            <polygon points="12 3 14.9 9.2 21.5 10 16.7 14.7 18 21.2 12 18 6 21.2 7.3 14.7 2.5 10 9.1 9.2" />
          </svg>
        </div>
        <p class="score__count">{{ t('learning.course.rating_count', { count: detail.rating.count }) }}</p>
      </div>

      <ul class="bars">
        <li v-for="bar in bars" :key="bar.stars" class="bar">
          <span class="bar__label">{{ bar.stars }} ★</span>
          <span class="bar__track">
            <span class="bar__fill" :style="{ width: `${bar.percent}%` }" />
          </span>
          <span class="bar__pct">{{ bar.percent }}%</span>
        </li>
      </ul>
    </div>

    <ul class="list">
      <li v-for="review in detail.reviews" :key="review.name + review.date" class="review">
        <span class="review__avatar">{{ review.initials }}</span>

        <div class="min-w-0">
          <div class="review__head">
            <span class="review__name">{{ review.name }}</span>
            <span class="review__stars" aria-hidden="true">
              <svg v-for="i in 5" :key="i" width="11" height="11" viewBox="0 0 24 24" :fill="i <= review.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
                <polygon points="12 3 14.9 9.2 21.5 10 16.7 14.7 18 21.2 12 18 6 21.2 7.3 14.7 2.5 10 9.1 9.2" />
              </svg>
            </span>
            <span class="review__date">{{ review.date }}</span>
          </div>
          <p class="review__text">{{ review.text }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
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
  color: var(--color-navy);
  letter-spacing: -0.01em;
}

/* ── Summary ── */
.summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.9rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.score {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.score__num {
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-navy);
}

.score__stars {
  display: flex;
  gap: 1px;
  color: #f0a52a;
}

.score__count {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bar__label {
  width: 30px;
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.bar__track {
  flex: 1;
  height: 6px;
  border-radius: 99px;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.bar__fill {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: #f0a52a;
}

.bar__pct {
  width: 30px;
  flex-shrink: 0;
  text-align: right;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

/* ── Reviews ── */
.list {
  display: flex;
  flex-direction: column;
}

.review {
  display: flex;
  gap: 0.65rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.review:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-off-white);
  border: 1px solid var(--color-border);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  color: var(--color-navy-light);
}

.review__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.review__name {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
}

.review__stars {
  display: inline-flex;
  gap: 1px;
  color: #f0a52a;
}

.review__date {
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.review__text {
  margin-top: 0.3rem;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

@media (min-width: 640px) {
  .card {
    padding: 1.15rem 1.2rem;
  }
  .summary {
    flex-direction: row;
    align-items: center;
    gap: 1.8rem;
  }
  .score {
    flex-direction: column;
    gap: 0.2rem;
    width: 110px;
    flex-shrink: 0;
    text-align: center;
  }
}
</style>
