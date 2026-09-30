<script setup lang="ts">
/**
 * "Giới thiệu bạn bè" — the learner's personal referral link.
 *
 * The code is created on first view (GET /api/me/referral). A friend who opens
 * the link has the code remembered (plugins/00.auth-flag.client.ts): signing up
 * stamps them with this referrer, and checkout pre-applies the discount. When
 * their first order is paid, the hourly job mints this learner a reward code
 * and emails it — the rewards listed here.
 */
interface Referral {
  code: string
  refereePercent: number
  rewardPercent: number
  joined: number
  rewards: { code: string; percent: number; endsAt: string | null; usable: boolean }[]
}

const { t } = useI18n()
const config = useRuntimeConfig()
const { notify } = useNotification()
const { loggedIn, whenReady } = useHubSession()

const data = ref<Referral | null>(null)
const failed = ref(false)

const link = computed(() =>
  data.value ? `${String(config.public.siteUrl || 'https://stretch.vn').replace(/\/$/, '')}/vi/learning-hub?ref=${data.value.code}` : '',
)

onMounted(async () => {
  await whenReady()
  if (!loggedIn.value) return
  try {
    data.value = await $fetch<Referral>('/api/me/referral')
  } catch {
    failed.value = true
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(link.value)
    notify(t('learning.referral.copied'), 'success', 2500)
  } catch {
    notify(link.value, 'info', 6000)
  }
}

async function share() {
  const text = t('learning.referral.share_text', { percent: data.value?.refereePercent ?? 0 })
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Stretch Learning Hub', text, url: link.value })
      return
    } catch (err: any) {
      if (err?.name === 'AbortError') return
    }
  }
  copy()
}

function day(value: string | null) {
  const [y, m, d] = String(value || '').slice(0, 10).split('-')
  return y && m && d ? `${d}/${m}/${y}` : ''
}
</script>

<template>
  <section v-if="loggedIn && !failed" id="referral" class="ref">
    <div class="ref__head">
      <span class="ref__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8v13M3 12h18" />
          <path d="M12 8S10.5 3 7.5 3a2.5 2.5 0 0 0 0 5H12zM12 8s1.5-5 4.5-5a2.5 2.5 0 0 1 0 5H12z" />
        </svg>
      </span>
      <div class="min-w-0">
        <h2 class="ref__title">{{ t('learning.referral.title') }}</h2>
        <p class="ref__sub">
          {{ data ? t('learning.referral.sub', { referee: data.refereePercent, reward: data.rewardPercent }) : t('learning.referral.loading') }}
        </p>
      </div>
    </div>

    <div v-if="data" class="ref__body">
      <label class="ref__label" for="ref-link">{{ t('learning.referral.link') }}</label>
      <div class="ref__row">
        <input id="ref-link" class="ref__input" :value="link" readonly @focus="($event.target as HTMLInputElement).select()" />
        <button type="button" class="ref__btn ref__btn--primary" @click="copy">{{ t('learning.referral.copy') }}</button>
        <button type="button" class="ref__btn" @click="share">{{ t('learning.referral.share') }}</button>
      </div>
      <p class="ref__meta">
        {{ t('learning.referral.code') }}: <strong>{{ data.code }}</strong>
        <span v-if="data.joined"> · {{ t('learning.referral.joined', { n: data.joined }) }}</span>
      </p>

      <div v-if="data.rewards.length" class="ref__rewards">
        <p class="ref__label">{{ t('learning.referral.rewards') }}</p>
        <ul>
          <li v-for="r in data.rewards" :key="r.code" class="ref__reward" :class="{ 'ref__reward--used': !r.usable }">
            <code>{{ r.code }}</code>
            <span>{{ r.usable ? t('learning.referral.reward_item', { percent: r.percent, date: day(r.endsAt) }) : t('learning.referral.used') }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="ref__skeleton" />
  </section>
</template>

<style scoped>
.ref {
  padding: 1.1rem 1.1rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background:
    radial-gradient(circle at 100% 0%, rgba(244, 122, 31, 0.09), transparent 40%),
    white;
}
.ref__head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.ref__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(244, 122, 31, 0.12);
  color: var(--color-accent);
}
.ref__title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-navy);
}
.ref__sub {
  margin-top: 0.2rem;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.ref__body {
  margin-top: 0.9rem;
}
.ref__label {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.ref__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.ref__input {
  flex: 1 1 220px;
  min-width: 0;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-off-white);
  font-size: 12.5px;
  color: var(--color-navy);
}
.ref__btn {
  padding: 0.55rem 0.95rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: border-color 0.2s ease, background 0.2s ease;
}
.ref__btn:hover {
  border-color: var(--color-navy);
}
.ref__btn--primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}
.ref__btn--primary:hover {
  border-color: var(--color-accent-dark);
  background: var(--color-accent-dark);
}
.ref__meta {
  margin-top: 0.55rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.ref__meta strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--color-navy);
}
.ref__rewards {
  margin-top: 0.9rem;
}
.ref__rewards ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.ref__reward {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem;
  border: 1.5px dashed var(--color-accent);
  border-radius: 10px;
  font-size: 12px;
  color: var(--color-navy);
}
.ref__reward code {
  font-weight: 800;
  color: var(--color-accent-dark);
}
.ref__reward--used {
  border-color: var(--color-border);
  opacity: 0.6;
}
.ref__skeleton {
  height: 72px;
  margin-top: 0.9rem;
  border-radius: 10px;
  background: linear-gradient(90deg, #eef2f6 25%, #f6f8fa 50%, #eef2f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
