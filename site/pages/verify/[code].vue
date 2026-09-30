<script setup lang="ts">
/**
 * A certificate, by its code — /verify/STR-2026-7KQ2MX.
 *
 * Two readers, one page. The learner prints it (the print stylesheet turns the
 * card into a landscape A4 page, so "Save as PDF" is the PDF download) and adds
 * it to LinkedIn. Whoever follows that LinkedIn link — an employer, a clinic —
 * lands on the same URL and sees at the top whether the certificate is valid,
 * revoked, or not one Stretch issued.
 *
 * Server-rendered, so the link unfurls with a proper preview; `noIndex`,
 * because a page with someone's name on it has no business in search results.
 */
interface Certificate {
  code: string
  learnerName: string
  programTitle: string
  programSlug: string | null
  minutes: number
  lessons: number
  instructor: string
  signedBy: string
  score: number | null
  issuedAt: string
  revokedAt: string | null
  status: string
}

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { notify } = useNotification()

const code = computed(() => String(route.params.code || '').trim().toUpperCase())

const { data, pending } = await useAsyncData(
  () => `certificate-${code.value}`,
  () =>
    $fetch<{ valid: boolean; certificate: Certificate | null }>(`/api/certificates/${encodeURIComponent(code.value)}`).catch(
      () => ({ valid: false, certificate: null }),
    ),
  { watch: [code] },
)

const cert = computed(() => data.value?.certificate ?? null)
const valid = computed(() => !!data.value?.valid)

/** DATE columns arrive as midnight UTC; read the calendar day, not a time. */
function day(value: string | null | undefined) {
  const iso = String(value || '').slice(0, 10)
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : ''
}

const hours = computed(() => (cert.value?.minutes ? Math.max(1, Math.round(cert.value.minutes / 60)) : 0))

const pageUrl = computed(() => `${String(config.public.siteUrl || 'https://stretch.vn').replace(/\/$/, '')}/verify/${encodeURIComponent(code.value)}`)

/** LinkedIn's "Add licence or certification" form, pre-filled. */
const linkedinAdd = computed(() => {
  if (!cert.value) return ''
  const issued = String(cert.value.issuedAt || '').slice(0, 10).split('-')
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: cert.value.programTitle,
    organizationName: 'Stretch Academy',
    issueYear: issued[0] || '',
    issueMonth: String(Number(issued[1]) || ''),
    certUrl: pageUrl.value,
    certId: cert.value.code,
  })
  return `https://www.linkedin.com/profile/add?${params}`
})

const linkedinShare = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl.value)}`)

function print() {
  window.print()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value)
    notify(t('learning.cert.copied'), 'success', 2500)
  } catch {
    notify(pageUrl.value, 'info', 6000)
  }
}

// Another code, typed into the lookup box.
const lookup = ref('')
function goLookup() {
  const next = lookup.value.trim().toUpperCase()
  if (next) navigateTo(localePath(`/verify/${encodeURIComponent(next)}`))
}

useSeo({
  title: cert.value
    ? `${cert.value.learnerName} — ${cert.value.programTitle} · ${t('learning.cert.page_title')}`
    : t('learning.cert.verify_title'),
  description: cert.value
    ? `${t('learning.cert.awarded')} ${cert.value.learnerName} ${t('learning.cert.for')} ${cert.value.programTitle}. ${t('learning.cert.code')}: ${cert.value.code}`
    : t('learning.cert.verify_sub'),
  image: '/education-class.png',
  type: 'website',
  noIndex: true,
})
</script>

<template>
  <div class="page">
    <div class="no-print">
      <LearningHeader />
    </div>

    <main class="wrap">
      <div v-if="pending" class="state">{{ t('learning.cert.loading') }}</div>

      <template v-else-if="cert">
        <!-- Verdict first: this is what the person following a link came for. -->
        <div class="verdict no-print" :class="valid ? 'verdict--ok' : 'verdict--bad'">
          <span class="verdict__icon" aria-hidden="true">
            <svg v-if="valid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12.5 9.5 17 19 7" /></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </span>
          <div>
            <p class="verdict__title">{{ valid ? t('learning.cert.valid') : t('learning.cert.revoked') }}</p>
            <p v-if="!valid && cert.revokedAt" class="verdict__sub">{{ t('learning.cert.revoked_on', { date: day(cert.revokedAt) }) }}</p>
          </div>
        </div>

        <!-- The certificate itself — also the printed page. -->
        <article class="cert" :class="{ 'cert--void': !valid }">
          <div class="cert__frame">
            <header class="cert__top">
              <img src="/stretch.jpg" alt="Stretch.vn" class="cert__logo" />
              <span class="cert__org">Stretch Academy</span>
            </header>

            <p class="cert__kicker">{{ t('learning.cert.heading') }}</p>
            <p class="cert__lead">{{ t('learning.cert.awarded') }}</p>
            <h1 class="cert__name">{{ cert.learnerName }}</h1>
            <p class="cert__lead">{{ t('learning.cert.for') }}</p>
            <h2 class="cert__program">{{ cert.programTitle }}</h2>

            <p v-if="hours || cert.lessons" class="cert__meta">
              <span v-if="hours">{{ t('learning.cert.hours', { n: hours }) }}</span>
              <span v-if="hours && cert.lessons"> · </span>
              <span v-if="cert.lessons">{{ t('learning.cert.lessons', { n: cert.lessons }) }}</span>
            </p>

            <footer class="cert__foot">
              <div class="cert__cell">
                <span class="cert__label">{{ t('learning.cert.issued') }}</span>
                <span class="cert__value">{{ day(cert.issuedAt) }}</span>
              </div>
              <div class="cert__seal" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2" />
                  <circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" />
                  <polyline points="21 33 28.5 40 43 25" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="cert__cell cert__cell--end">
                <span class="cert__label">{{ cert.instructor ? t('learning.cert.instructor') : t('learning.cert.signed') }}</span>
                <span class="cert__value">{{ cert.instructor || cert.signedBy || 'Stretch Academy' }}</span>
              </div>
            </footer>

            <p class="cert__code">
              {{ t('learning.cert.code') }}: <strong>{{ cert.code }}</strong>
              <span class="cert__url">· {{ t('learning.cert.verify_at') }} {{ pageUrl.replace(/^https?:\/\//, '') }}</span>
            </p>
          </div>
        </article>

        <div v-if="valid" class="actions no-print">
          <button type="button" class="btn btn--primary" @click="print">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            {{ t('learning.cert.print') }}
          </button>
          <a :href="linkedinAdd" target="_blank" rel="noopener" class="btn btn--linkedin">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
            {{ t('learning.cert.linkedin_add') }}
          </a>
          <a :href="linkedinShare" target="_blank" rel="noopener" class="btn btn--ghost">{{ t('learning.cert.linkedin_share') }}</a>
          <button type="button" class="btn btn--ghost" @click="copyLink">{{ t('learning.cert.copy') }}</button>
          <NuxtLink v-if="cert.programSlug" :to="localePath(`/learning-hub/programs/${cert.programSlug}`)" class="btn btn--link">
            {{ t('learning.cert.view_course') }} →
          </NuxtLink>
        </div>
      </template>

      <div v-else class="missing no-print">
        <p class="missing__title">{{ t('learning.cert.not_found') }}</p>
        <p class="missing__sub">{{ t('learning.cert.not_found_sub', { code }) }}</p>
      </div>

      <form class="lookup no-print" @submit.prevent="goLookup">
        <label class="lookup__label" for="cert-lookup">{{ t('learning.cert.verify_title') }}</label>
        <div class="lookup__row">
          <input id="cert-lookup" v-model="lookup" class="lookup__input" :placeholder="t('learning.cert.lookup_ph')" autocomplete="off" />
          <button type="submit" class="btn btn--primary">{{ t('learning.cert.lookup_btn') }}</button>
        </div>
      </form>
    </main>

    <div class="no-print">
      <LearningFooter />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-off-white);
}
.wrap {
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}
.state {
  padding: 4rem 1rem;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ── Verdict ── */
.verdict {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0.95rem;
  border-radius: 12px;
  border: 1px solid;
}
.verdict--ok {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #14532d;
}
.verdict--bad {
  border-color: #fecaca;
  background: #fef2f2;
  color: #7f1d1d;
}
.verdict__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  color: white;
  background: currentColor;
}
.verdict--ok .verdict__icon { background: #16a34a; }
.verdict--bad .verdict__icon { background: #dc2626; }
.verdict__title {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 800;
}
.verdict__sub {
  font-size: 12px;
  opacity: 0.85;
}

/* ── Certificate ── */
.cert {
  position: relative;
  background: white;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 24px 60px -30px rgba(11, 42, 74, 0.35);
  /* A4 landscape proportions on screen too, so the preview is the print. */
  aspect-ratio: 297 / 210;
  container-type: inline-size;
}
.cert--void {
  filter: grayscale(0.85);
  opacity: 0.75;
}
.cert__frame {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4cqw 6cqw 3cqw;
  border: 1.5px solid rgba(11, 42, 74, 0.18);
  border-radius: 10px;
  background:
    radial-gradient(circle at 0% 0%, rgba(244, 122, 31, 0.1), transparent 34%),
    radial-gradient(circle at 100% 100%, rgba(11, 42, 74, 0.08), transparent 38%),
    white;
  overflow: hidden;
}
.cert__frame::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(244, 122, 31, 0.35);
  border-radius: 6px;
  pointer-events: none;
}
.cert__top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  /* Paired with the footer's auto margin: the text block sits centred. */
  margin-top: auto;
  margin-bottom: 2.4cqw;
}
.cert__logo {
  height: clamp(18px, 3.4cqw, 34px);
  width: auto;
}
.cert__org {
  font-family: var(--font-heading);
  font-size: clamp(8px, 1.3cqw, 13px);
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.cert__kicker {
  font-family: var(--font-heading);
  font-size: clamp(10px, 2cqw, 20px);
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.cert__lead {
  margin-top: 1.4cqw;
  font-size: clamp(9px, 1.5cqw, 15px);
  color: var(--color-text-secondary);
}
.cert__name {
  margin-top: 0.8cqw;
  font-family: var(--font-heading);
  font-size: clamp(20px, 5.2cqw, 52px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-navy);
}
.cert__program {
  margin-top: 0.8cqw;
  max-width: 80%;
  font-family: var(--font-heading);
  font-size: clamp(13px, 2.7cqw, 27px);
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-navy);
}
.cert__meta {
  margin-top: 1cqw;
  font-size: clamp(8.5px, 1.3cqw, 13px);
  color: var(--color-text-secondary);
}
.cert__foot {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 2cqw;
  width: 100%;
  margin-top: auto;
  padding-top: 2.5cqw;
}
.cert__cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3cqw;
  padding-top: 0.8cqw;
  border-top: 1px solid rgba(11, 42, 74, 0.25);
}
.cert__cell--end {
  align-items: flex-end;
}
.cert__label {
  font-size: clamp(7.5px, 1.1cqw, 11px);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.cert__value {
  font-family: var(--font-heading);
  font-size: clamp(9.5px, 1.6cqw, 16px);
  font-weight: 700;
  color: var(--color-navy);
}
.cert__seal {
  color: var(--color-accent);
  width: clamp(36px, 7cqw, 68px);
}
.cert__seal svg {
  width: 100%;
  height: auto;
}
.cert__code {
  margin-top: 1.6cqw;
  font-size: clamp(7.5px, 1.1cqw, 11px);
  color: var(--color-text-secondary);
}
.cert__code strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--color-navy);
  letter-spacing: 0.04em;
}

/* ── Actions ── */
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1.1rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}
.btn--primary {
  background: var(--color-accent);
  color: white;
}
.btn--primary:hover {
  background: var(--color-accent-dark);
}
.btn--linkedin {
  background: #0a66c2;
  color: white;
}
.btn--linkedin:hover {
  background: #004182;
}
.btn--ghost {
  border: 1.5px solid var(--color-border);
  background: white;
  color: var(--color-navy);
}
.btn--ghost:hover {
  border-color: var(--color-navy);
}
.btn--link {
  color: var(--color-navy-light);
}
.btn--link:hover {
  color: var(--color-accent);
}

/* ── Not found / lookup ── */
.missing {
  padding: 2.5rem 1.2rem;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  background: white;
}
.missing__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  color: var(--color-navy);
}
.missing__sub {
  margin: 0.4rem auto 0;
  max-width: 440px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.lookup {
  margin-top: 1.8rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}
.lookup__label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--color-navy);
}
.lookup__row {
  display: flex;
  gap: 0.5rem;
}
.lookup__input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.8rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 13px;
}
.lookup__input:not(:placeholder-shown) {
  text-transform: uppercase;
}
.lookup__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

@media (max-width: 640px) {
  .cert {
    padding: 6px;
    border-radius: 12px;
  }
}

/* ── Print: the certificate alone, one landscape A4 page ── */
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .page,
  .wrap {
    background: white;
    padding: 0;
    max-width: none;
  }
  .cert {
    width: 297mm;
    height: 210mm;
    aspect-ratio: auto;
    border-radius: 0;
    box-shadow: none;
    padding: 10mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

<style>
/* Unscoped on purpose: the chat widget (and anything else a third party
   injects) sits outside this component, and must not print on the PDF. */
@media print {
  body > *:not(#__nuxt) {
    display: none !important;
  }
}
</style>
