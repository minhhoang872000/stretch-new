<script setup lang="ts">
/**
 * Checkout — bank transfer with a VietQR code.
 *
 * Two states, one page. Before an order exists: the course summary, a coupon
 * field and one button. After: the QR code, the bank details and the order
 * code to put in the transfer note. A reload lands on the right state because
 * the pending order is looked up on mount rather than kept in the browser.
 *
 * Money is confirmed by a person, not by this page: the order is created
 * `pending`, and access is granted from the console once the transfer shows up
 * (`/payments/:id/confirm` → `/orders/:id/enrol`). The page says exactly that,
 * so nobody sits waiting for an instant unlock.
 */
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { trackPageView } = useTracking()
const { loggedIn } = useHubSession()
const { open: openAuth } = useAuthModal()
const { notify } = useNotification()
const { active, completed } = useMyLearning()
const { formatPrice } = useLearningCatalog()

const slug = computed(() => String(route.params.slug))
const detail = await useProgramDetailFor(slug)

if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found', fatal: true })
}
const d = computed(() => detail.value!)

const programPath = computed(() => localePath(`/learning-hub/programs/${slug.value}`))
const learnPath = computed(() => localePath(`/learning-hub/learn/${slug.value}`))

interface CheckoutOrder {
  id: string
  code: string
  programTitle: string
  subtotal: number
  couponCode: string
  discount: number
  total: number
  status: string
  enrolled: boolean
}

const order = ref<CheckoutOrder | null>(null)
const creating = ref(false)
const loadingExisting = ref(true)

// ── Coupon ───────────────────────────────────────────────────────────
const couponInput = ref('')
const coupon = ref<{ code: string; discount: number } | null>(null)
const couponError = ref('')
const couponChecking = ref(false)

const subtotal = computed(() => d.value.program.price)
const discount = computed(() => coupon.value?.discount ?? 0)
const total = computed(() => Math.max(0, subtotal.value - discount.value))

async function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase()
  if (!code || couponChecking.value) return
  couponChecking.value = true
  couponError.value = ''
  try {
    const res = await $fetch<{ valid: boolean; reason: string; discount: number }>(
      '/api/checkout/coupon',
      { method: 'POST', body: { code, subtotal: subtotal.value } },
    )
    if (res.valid) {
      coupon.value = { code, discount: res.discount }
      notify(t('learning.checkout.coupon_applied', { code, amount: formatPrice(res.discount) }), 'success')
    } else {
      coupon.value = null
      couponError.value = res.reason || t('learning.checkout.coupon_invalid')
    }
  } catch {
    couponError.value = t('learning.checkout.error_generic')
  } finally {
    couponChecking.value = false
  }
}

function clearCoupon() {
  coupon.value = null
  couponInput.value = ''
  couponError.value = ''
}

// ── Order ────────────────────────────────────────────────────────────
async function createOrder() {
  if (creating.value) return
  creating.value = true
  try {
    const res = await $fetch<{ order: CheckoutOrder; created: boolean }>('/api/checkout/orders', {
      method: 'POST',
      body: { slug: slug.value, couponCode: coupon.value?.code || '' },
    })
    order.value = res.order
    notify(t('learning.checkout.order_created', { code: res.order.code }), 'success')
  } catch (err: any) {
    const message = String(err?.data?.message || '')
    if (message.includes('đã có quyền')) {
      notify(t('learning.checkout.already'), 'info', 5000)
      navigateTo(learnPath.value)
      return
    }
    notify(message || t('learning.checkout.error_generic'), 'error', 6000)
  } finally {
    creating.value = false
  }
}

// ── Transfer details ─────────────────────────────────────────────────
const bank = computed(() => ({
  code: String(config.public.bankCode || ''),
  account: String(config.public.bankAccount || ''),
  name: String(config.public.bankAccountName || ''),
}))

/** VietQR renders the whole payment — amount and note included — into one image. */
const qrUrl = computed(() => {
  if (!order.value || !bank.value.code || !bank.value.account) return ''
  const params = new URLSearchParams({
    amount: String(order.value.total),
    addInfo: order.value.code,
    accountName: bank.value.name,
  })
  return `https://img.vietqr.io/image/${bank.value.code}-${bank.value.account}-compact2.png?${params}`
})

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    notify(t('learning.checkout.copied'), 'success', 2000)
  } catch {
    notify(value, 'info', 6000)
  }
}

useSeo({
  title: `${t('learning.checkout.title')} — ${d.value.program.title}`,
  description: d.value.subtitle,
  image: d.value.program.image,
  type: 'website',
})

onMounted(async () => {
  // Signed out, or a free course: this page has nothing to sell.
  if (!loggedIn.value) {
    navigateTo(programPath.value)
    openAuth('login')
    return
  }
  if (subtotal.value <= 0) {
    navigateTo(programPath.value)
    return
  }
  // Already enrolled → the player, not a second invoice.
  const enrolled =
    active.value.some((e) => e.slug === slug.value) ||
    completed.value.some((e) => e.slug === slug.value)
  if (enrolled) {
    navigateTo(learnPath.value)
    return
  }
  trackPageView()

  try {
    const res = await $fetch<{ orders: CheckoutOrder[] }>('/api/checkout/orders', {
      query: { slug: slug.value },
    })
    const pending = (res.orders || []).find((o) => o.status === 'pending')
    if (pending) order.value = pending
  } catch {
    // No order to resume is the normal case; a failed lookup just means the
    // summary state shows, which is always safe.
  } finally {
    loadingExisting.value = false
  }
})
</script>

<template>
  <div class="bg-off-white min-h-screen flex flex-col">
    <LearningHeader />

    <main class="flex-1">
      <div class="section-container py-5 lg:py-7">
        <nav class="crumbs">
          <NuxtLink :to="localePath('/learning-hub')">{{ t('learning.catalog.breadcrumb_home') }}</NuxtLink>
          <span>›</span>
          <NuxtLink :to="programPath">{{ d.program.title }}</NuxtLink>
          <span>›</span>
          <span class="crumbs__current">{{ t('learning.checkout.breadcrumb') }}</span>
        </nav>

        <h1 class="title">{{ t('learning.checkout.title') }}</h1>
        <p class="sub">{{ order ? t('learning.checkout.pay_sub') : t('learning.checkout.subtitle') }}</p>

        <div class="cols">
          <!-- ══ Left: summary → transfer instructions ══ -->
          <section class="card">
            <!-- ── State 2: the order exists — pay it ── -->
            <template v-if="order">
              <div class="paybox">
                <div class="paybox__qr">
                  <img v-if="qrUrl" :src="qrUrl" :alt="t('learning.checkout.qr_alt')" width="220" height="220" loading="eager" />
                  <p v-else class="paybox__noqr">{{ t('learning.checkout.qr_missing') }}</p>
                </div>

                <dl class="paybox__facts">
                  <div class="fact">
                    <dt>{{ t('learning.checkout.order_code') }}</dt>
                    <dd class="fact__strong">
                      {{ order.code }}
                      <button type="button" class="fact__copy" @click="copy(order.code)">{{ t('learning.checkout.copy') }}</button>
                    </dd>
                  </div>
                  <div class="fact">
                    <dt>{{ t('learning.checkout.amount') }}</dt>
                    <dd class="fact__strong">
                      {{ formatPrice(order.total) }}
                      <button type="button" class="fact__copy" @click="copy(String(order.total))">{{ t('learning.checkout.copy') }}</button>
                    </dd>
                  </div>
                  <div v-if="bank.account" class="fact">
                    <dt>{{ t('learning.checkout.account') }}</dt>
                    <dd>
                      {{ bank.code }} · {{ bank.account }}
                      <button type="button" class="fact__copy" @click="copy(bank.account)">{{ t('learning.checkout.copy') }}</button>
                    </dd>
                  </div>
                  <div v-if="bank.name" class="fact">
                    <dt>{{ t('learning.checkout.account_name') }}</dt>
                    <dd>{{ bank.name }}</dd>
                  </div>
                  <div class="fact">
                    <dt>{{ t('learning.checkout.transfer_note') }}</dt>
                    <dd class="fact__strong">{{ order.code }}</dd>
                  </div>
                </dl>
              </div>

              <p class="notice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15.5 14" />
                </svg>
                {{ t('learning.checkout.after_note') }}
              </p>

              <div class="acts">
                <NuxtLink :to="localePath('/learning-hub/my-courses')" class="btn btn--primary">
                  {{ t('learning.checkout.my_courses') }}
                </NuxtLink>
                <NuxtLink :to="programPath" class="btn btn--ghost">
                  {{ t('learning.checkout.back_course') }}
                </NuxtLink>
              </div>
            </template>

            <!-- ── State 1: build the order ── -->
            <template v-else>
              <div class="course">
                <img :src="d.program.image" :alt="d.program.title" class="course__img" width="96" height="64" />
                <div class="min-w-0">
                  <p class="course__title">{{ d.program.title }}</p>
                  <p class="course__meta">{{ d.subtitle }}</p>
                </div>
              </div>

              <!-- Coupon -->
              <div class="coupon">
                <label class="coupon__label" for="coupon-code">{{ t('learning.checkout.coupon_label') }}</label>
                <div class="coupon__row">
                  <input
                    id="coupon-code"
                    v-model="couponInput"
                    type="text"
                    class="coupon__input"
                    :placeholder="t('learning.checkout.coupon_placeholder')"
                    :disabled="!!coupon"
                    @keydown.enter.prevent="applyCoupon"
                  />
                  <button v-if="!coupon" type="button" class="btn btn--ghost coupon__btn" :disabled="couponChecking" @click="applyCoupon">
                    {{ couponChecking ? '…' : t('learning.checkout.coupon_apply') }}
                  </button>
                  <button v-else type="button" class="btn btn--ghost coupon__btn" @click="clearCoupon">✕</button>
                </div>
                <p v-if="coupon" class="coupon__ok">
                  {{ t('learning.checkout.coupon_applied', { code: coupon.code, amount: formatPrice(coupon.discount) }) }}
                </p>
                <p v-else-if="couponError" class="coupon__err">{{ couponError }}</p>
              </div>

              <!-- Totals -->
              <dl class="totals">
                <div class="totals__row">
                  <dt>{{ t('learning.checkout.subtotal') }}</dt>
                  <dd>{{ formatPrice(subtotal) }}</dd>
                </div>
                <div v-if="discount > 0" class="totals__row totals__row--good">
                  <dt>{{ t('learning.checkout.discount') }}</dt>
                  <dd>−{{ formatPrice(discount) }}</dd>
                </div>
                <div class="totals__row totals__row--total">
                  <dt>{{ t('learning.checkout.total') }}</dt>
                  <dd>{{ formatPrice(total) }}</dd>
                </div>
              </dl>

              <!-- Method — one today, named so a second one has a place to land. -->
              <div class="method">
                <p class="method__title">{{ t('learning.checkout.method_title') }}</p>
                <div class="method__opt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {{ t('learning.checkout.method_transfer') }}
                </div>
              </div>

              <button type="button" class="btn btn--primary btn--big" :disabled="creating || loadingExisting" @click="createOrder">
                {{ creating ? t('learning.checkout.creating') : t('learning.checkout.cta_create') }}
              </button>
              <p class="note">{{ t('learning.course.note_refund') }}</p>
            </template>
          </section>

          <!-- ══ Right: what they are buying ══ -->
          <aside class="side">
            <img :src="d.program.image" :alt="d.program.title" class="side__img" width="320" height="180" />
            <p class="side__title">{{ d.program.title }}</p>
            <ul class="side__incl">
              <li v-for="line in d.includes" :key="line">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="5 12.5 9.5 17 19 7" />
                </svg>
                {{ line }}
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </main>

    <LearningFooter />
  </div>
</template>

<style scoped>
.crumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.crumbs a:hover {
  color: var(--color-accent);
}
.crumbs__current {
  color: var(--color-navy);
  font-weight: 600;
}

.title {
  margin-top: 0.9rem;
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
}
.sub {
  margin-top: 0.25rem;
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 560px;
}

.cols {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}
@media (min-width: 1024px) {
  .cols {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }
}

.card {
  padding: 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
  box-shadow: 0 18px 40px -30px rgba(11, 42, 74, 0.5);
}

/* ── Course line ── */
.course {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.course__img {
  width: 96px;
  height: 64px;
  object-fit: cover;
  border-radius: 9px;
  flex-shrink: 0;
}
.course__title {
  font-family: var(--font-heading);
  font-size: 14.5px;
  font-weight: 800;
  color: var(--color-navy);
}
.course__meta {
  margin-top: 0.15rem;
  font-size: 12px;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Coupon ── */
.coupon {
  margin-top: 1rem;
}
.coupon__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.coupon__row {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.35rem;
}
.coupon__input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font-size: 13px;
  text-transform: uppercase;
}
.coupon__input:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: -1px;
}
.coupon__btn {
  flex-shrink: 0;
}
.coupon__ok {
  margin-top: 0.35rem;
  font-size: 12px;
  font-weight: 600;
  color: #15803d;
}
.coupon__err {
  margin-top: 0.35rem;
  font-size: 12px;
  color: #b91c1c;
}

/* ── Totals ── */
.totals {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
}
.totals__row {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.totals__row--good dd {
  color: #15803d;
  font-weight: 700;
}
.totals__row--total {
  margin-top: 0.3rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 800;
  color: var(--color-navy);
}

/* ── Method ── */
.method {
  margin-top: 1rem;
}
.method__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.method__opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
  padding: 0.6rem 0.7rem;
  border: 1.5px solid var(--color-accent);
  border-radius: 10px;
  background: #fff7f0;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy);
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  border-radius: 9px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s ease;
}
.btn--primary {
  background: var(--color-accent);
  color: white;
}
.btn--primary:hover {
  background: var(--color-accent-dark);
}
.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--ghost {
  border: 1px solid var(--color-border);
  color: var(--color-navy);
}
.btn--ghost:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.btn--big {
  display: flex;
  width: 100%;
  margin-top: 1.1rem;
  padding: 0.7rem 1rem;
}

.note {
  margin-top: 0.5rem;
  font-size: 10.5px;
  text-align: center;
  color: var(--color-text-secondary);
}

/* ── Pay state ── */
.paybox {
  display: grid;
  gap: 1rem;
}
@media (min-width: 640px) {
  .paybox {
    grid-template-columns: 220px minmax(0, 1fr);
    align-items: start;
  }
}
.paybox__qr img {
  width: 220px;
  height: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}
.paybox__noqr {
  width: 220px;
  padding: 2rem 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  color: var(--color-text-secondary);
}

.paybox__facts {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.fact dt {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.fact dd {
  margin-top: 0.1rem;
  font-size: 13.5px;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.fact__strong {
  font-family: var(--font-heading);
  font-weight: 800;
}
.fact__copy {
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}
.fact__copy:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.notice {
  display: flex;
  gap: 0.45rem;
  align-items: flex-start;
  margin-top: 1rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  background: #f0f6ff;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-navy);
}
.notice svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-accent);
}

.acts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* ── Right column ── */
.side {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: white;
}
.side__img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 10px;
}
.side__title {
  margin-top: 0.7rem;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  color: var(--color-navy);
}
.side__incl {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.6rem;
}
.side__incl li {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.side__incl svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--color-success);
}
</style>
