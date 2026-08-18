<script setup lang="ts">
/**
 * Learning Hub auth modal — login / register / forgot password / link-sent.
 *
 * The panes share one panel so switching between them never closes the dialog.
 * Open it from anywhere with `useAuthModal().open('register')`, or deep-link
 * with `?auth=register`.
 *
 * NOTE: there is no learner auth API yet — only Google OAuth (/api/auth/google)
 * is wired to a real endpoint. `submit()` below is the single place to plug the
 * email/password calls in once that backend exists; until then it surfaces
 * `err_unavailable` and points people at the Google button.
 */
const { t } = useI18n()
const route = useRoute()
const { isOpen, view, close, go, openFromQuery } = useAuthModal()
const { signInDemo, isDemoCandidate } = useHubSession()

const form = reactive({ name: '', email: '', password: '', remember: false })
const errors = reactive<Record<string, string>>({})
const formError = ref('')
const showPassword = ref(false)
const pending = ref(false)

const benefits = ['benefit_1', 'benefit_2', 'benefit_3', 'benefit_4', 'benefit_5']

const isWide = computed(() => view.value === 'register')

function clearErrors() {
  for (const key of Object.keys(errors)) delete errors[key]
  formError.value = ''
}

function validate(): boolean {
  clearErrors()

  if (view.value === 'register' && !form.name.trim()) {
    errors.name = t('learning.auth.err_name_required')
  }

  if (!form.email.trim()) {
    errors.email = t('learning.auth.err_email_required')
  } else if (
    // DEMO: the placeholder account signs in with a username, not an email.
    !(view.value === 'login' && isDemoCandidate(form.email))
    && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
  ) {
    errors.email = t('learning.auth.err_email_invalid')
  }

  if (view.value === 'login' || view.value === 'register') {
    if (!form.password) {
      errors.password = t('learning.auth.err_password_required')
    } else if (view.value === 'register' && form.password.length < 8) {
      errors.password = t('learning.auth.err_password_short')
    }
  }

  return Object.keys(errors).length === 0
}

async function submit() {
  if (pending.value || !validate()) return
  pending.value = true
  try {
    // TODO(auth-backend): call the login / register / reset endpoints here and,
    // on a successful reset request, `go('sent')`.
    await new Promise((resolve) => setTimeout(resolve, 250))

    if (view.value === 'login') {
      // DEMO account — see useHubSession. Remove with the rest of the demo path.
      if (signInDemo(form.email, form.password)) {
        close()
        return
      }
      formError.value = isDemoCandidate(form.email)
        ? t('learning.auth.err_credentials')
        : t('learning.auth.err_unavailable')
      return
    }

    formError.value = t('learning.auth.err_unavailable')
  } finally {
    pending.value = false
  }
}

function switchTo(next: 'login' | 'register' | 'forgot') {
  clearErrors()
  showPassword.value = false
  go(next)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) close()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) {
    clearErrors()
    showPassword.value = false
    form.name = ''
    form.email = ''
    form.password = ''
  }
})

onMounted(() => {
  openFromQuery(route.query.auth)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="auth">
        <div v-if="isOpen" class="auth-overlay" @click.self="close">
          <div
            class="auth-panel"
            :class="{ 'auth-panel--wide': isWide }"
            role="dialog"
            aria-modal="true"
          >
            <button class="auth-close" :aria-label="t('learning.auth.close')" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <!-- ══ Link sent ══ -->
            <div v-if="view === 'sent'" class="auth-body auth-body--center">
              <span class="auth-tick">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <h2 class="auth-title">{{ t('learning.auth.sent_title') }}</h2>
              <p class="auth-sub">{{ t('learning.auth.sent_sub') }}</p>
              <button class="auth-textlink auth-textlink--block" @click="switchTo('login')">
                {{ t('learning.auth.back_to_login') }}
              </button>
            </div>

            <!-- ══ Login / Register / Forgot ══ -->
            <div v-else class="auth-split">
              <div class="auth-body">
                <h2 class="auth-title">
                  {{ view === 'login' ? t('learning.auth.login_title')
                    : view === 'register' ? t('learning.auth.register_title')
                    : t('learning.auth.forgot_title') }}
                </h2>
                <p class="auth-sub">
                  {{ view === 'login' ? t('learning.auth.login_sub')
                    : view === 'register' ? t('learning.auth.register_sub')
                    : t('learning.auth.forgot_sub') }}
                </p>

                <form class="auth-form" novalidate @submit.prevent="submit">
                  <!-- Full name — register only -->
                  <div v-if="view === 'register'" class="auth-field">
                    <label class="auth-label" for="auth-name">{{ t('learning.auth.name') }}</label>
                    <span class="auth-control">
                      <svg class="auth-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="auth-name"
                        v-model="form.name"
                        type="text"
                        autocomplete="name"
                        class="auth-input"
                        :class="{ 'auth-input--error': errors.name }"
                        :placeholder="t('learning.auth.name_ph')"
                      />
                    </span>
                    <p v-if="errors.name" class="auth-error">{{ errors.name }}</p>
                  </div>

                  <!-- Email -->
                  <div class="auth-field">
                    <label class="auth-label" for="auth-email">{{ t('learning.auth.email') }}</label>
                    <span class="auth-control">
                      <svg class="auth-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <polyline points="2.5 6.5 12 13 21.5 6.5" />
                      </svg>
                      <input
                        id="auth-email"
                        v-model="form.email"
                        type="email"
                        autocomplete="email"
                        class="auth-input"
                        :class="{ 'auth-input--error': errors.email }"
                        :placeholder="view === 'login' ? t('learning.auth.email_or_user_ph') : t('learning.auth.email_ph')"
                      />
                    </span>
                    <p v-if="errors.email" class="auth-error">{{ errors.email }}</p>
                  </div>

                  <!-- Password — not on the forgot pane -->
                  <div v-if="view !== 'forgot'" class="auth-field">
                    <label class="auth-label" for="auth-password">{{ t('learning.auth.password') }}</label>
                    <span class="auth-control">
                      <svg class="auth-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="10" width="16" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                      <input
                        id="auth-password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        :autocomplete="view === 'register' ? 'new-password' : 'current-password'"
                        class="auth-input auth-input--password"
                        :class="{ 'auth-input--error': errors.password }"
                        :placeholder="view === 'register' ? t('learning.auth.password_new_ph') : t('learning.auth.password_ph')"
                      />
                      <button
                        type="button"
                        class="auth-eye"
                        :aria-label="showPassword ? t('learning.auth.hide_password') : t('learning.auth.show_password')"
                        @click="showPassword = !showPassword"
                      >
                        <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 12s3.6-7 10-7c2 0 3.7.7 5.2 1.6M22 12s-3.6 7-10 7c-2 0-3.7-.7-5.2-1.6" />
                          <line x1="3" y1="3" x2="21" y2="21" />
                        </svg>
                      </button>
                    </span>
                    <p v-if="errors.password" class="auth-error">{{ errors.password }}</p>
                  </div>

                  <!-- Remember / forgot — login only -->
                  <div v-if="view === 'login'" class="auth-row">
                    <label class="auth-check">
                      <input v-model="form.remember" type="checkbox" />
                      <span>{{ t('learning.auth.remember') }}</span>
                    </label>
                    <button type="button" class="auth-textlink" @click="switchTo('forgot')">
                      {{ t('learning.auth.forgot_link') }}
                    </button>
                  </div>

                  <p v-if="formError" class="auth-alert">{{ formError }}</p>

                  <button type="submit" class="auth-submit" :disabled="pending">
                    {{ view === 'login' ? t('learning.auth.login_cta')
                      : view === 'register' ? t('learning.auth.register_cta')
                      : t('learning.auth.forgot_cta') }}
                  </button>
                </form>

                <!-- Google is the only path with a real endpoint today -->
                <template v-if="view !== 'forgot'">
                  <div class="auth-divider"><span>{{ t('learning.auth.or') }}</span></div>
                  <a href="/api/auth/google" class="auth-google">
                    <svg width="17" height="17" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 34.9 27 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.7 16.2 44 24 44z" />
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36.3 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
                    </svg>
                    {{ t('learning.auth.google') }}
                  </a>
                </template>

                <!-- Cross-links -->
                <p v-if="view === 'login'" class="auth-foot">
                  {{ t('learning.auth.no_account') }}
                  <button type="button" class="auth-textlink" @click="switchTo('register')">
                    {{ t('learning.auth.to_register') }} →
                  </button>
                </p>
                <p v-else-if="view === 'register'" class="auth-foot">
                  {{ t('learning.auth.have_account') }}
                  <button type="button" class="auth-textlink" @click="switchTo('login')">
                    {{ t('learning.auth.to_login') }} →
                  </button>
                </p>
                <p v-else class="auth-foot">
                  <button type="button" class="auth-textlink" @click="switchTo('login')">
                    {{ t('learning.auth.back_to_login') }}
                  </button>
                </p>
              </div>

              <!-- ══ Benefits rail — register only ══ -->
              <aside v-if="view === 'register'" class="auth-aside">
                <p class="auth-aside__title">{{ t('learning.auth.benefits_title') }}</p>
                <ul class="auth-aside__list">
                  <li v-for="(key, i) in benefits" :key="key">
                    <span class="auth-aside__icon">
                      <svg v-if="i === 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="14" rx="2" />
                        <path d="M10 9l4 2-4 2V9z" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                      </svg>
                      <svg v-else-if="i === 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="8" y1="3" x2="8" y2="7" />
                        <line x1="16" y1="3" x2="16" y2="7" />
                      </svg>
                      <svg v-else-if="i === 2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                        <polyline points="14 3 14 9 20 9" />
                      </svg>
                      <svg v-else-if="i === 3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="13" width="4" height="8" rx="0.6" />
                        <rect x="10" y="8" width="4" height="13" rx="0.6" />
                        <rect x="17" y="4" width="4" height="17" rx="0.6" />
                      </svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="9" r="6" />
                        <polyline points="8.5 14 7 22 12 19.5 17 22 15.5 14" />
                      </svg>
                    </span>
                    {{ t(`learning.auth.${key}`) }}
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(11, 42, 74, 0.42);
  backdrop-filter: blur(3px);
  overflow-y: auto;
}

.auth-panel {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 60px -18px rgba(11, 42, 74, 0.4);
  overflow: hidden;
}
.auth-panel--wide {
  max-width: 760px;
}

.auth-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 2;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: background 0.2s ease, color 0.2s ease;
}
.auth-close:hover {
  background: var(--color-off-white);
  color: var(--color-navy);
}

/* ── Layout ── */
.auth-split {
  display: flex;
}
.auth-body {
  flex: 1;
  min-width: 0;
  padding: 2rem 1.75rem 1.75rem;
}
.auth-body--center {
  text-align: center;
}

.auth-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
  text-align: center;
  letter-spacing: -0.01em;
}
.auth-panel--wide .auth-title {
  text-align: left;
}

.auth-sub {
  margin-top: 0.4rem;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  text-align: center;
}
.auth-panel--wide .auth-sub {
  text-align: left;
}

/* ── Fields ── */
.auth-form {
  margin-top: 1.3rem;
}

.auth-field + .auth-field {
  margin-top: 0.85rem;
}

.auth-label {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-navy);
}

.auth-control {
  position: relative;
  display: block;
}

.auth-icon {
  position: absolute;
  top: 50%;
  left: 0.8rem;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  opacity: 0.65;
  pointer-events: none;
}

.auth-input {
  width: 100%;
  height: 44px;
  padding: 0 0.9rem 0 2.35rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-size: 13px;
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.auth-input::placeholder {
  color: #9aa8b6;
}
.auth-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(244, 122, 31, 0.14);
}
.auth-input--password {
  padding-right: 2.6rem;
}
.auth-input--error {
  border-color: var(--color-error);
}
.auth-input--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.auth-eye {
  position: absolute;
  top: 50%;
  right: 0.7rem;
  transform: translateY(-50%);
  display: flex;
  color: var(--color-text-secondary);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.auth-eye:hover {
  opacity: 1;
}

.auth-error {
  margin-top: 0.3rem;
  font-size: 11px;
  color: var(--color-error);
}

.auth-alert {
  margin-top: 0.9rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: var(--color-error-container);
  color: #991b1b;
  font-size: 11.5px;
  line-height: 1.5;
}

/* ── Remember / forgot row ── */
.auth-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.auth-check {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.auth-check input {
  width: 14px;
  height: 14px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.auth-textlink {
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.auth-textlink:hover {
  color: var(--color-accent);
}
.auth-textlink--block {
  display: inline-block;
  margin-top: 1.15rem;
  font-size: 12.5px;
}

/* ── Buttons ── */
.auth-submit {
  width: 100%;
  height: 46px;
  margin-top: 1.15rem;
  border-radius: 10px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  transition: background 0.2s ease;
}
.auth-submit:hover:not(:disabled) {
  background: var(--color-accent-dark);
}
.auth-submit:active:not(:disabled) {
  transform: scale(0.99);
}
.auth-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-divider {
  position: relative;
  margin: 1.15rem 0;
  text-align: center;
}
.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
}
.auth-divider span {
  position: relative;
  padding: 0 0.7rem;
  background: white;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.auth-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy);
  transition: border-color 0.2s ease, background 0.2s ease;
}
.auth-google:hover {
  border-color: var(--color-navy-light);
  background: var(--color-off-white);
}

.auth-foot {
  margin-top: 1.25rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  text-align: center;
}
.auth-panel--wide .auth-foot {
  text-align: left;
}

/* ── Sent pane ── */
.auth-tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 1rem;
  border-radius: 50%;
  background: var(--color-success);
  color: white;
}

/* ── Benefits rail ── */
.auth-aside {
  flex-shrink: 0;
  width: 300px;
  padding: 2.5rem 1.6rem 1.75rem;
  background: var(--color-off-white);
  border-left: 1px solid var(--color-border);
}

.auth-aside__title {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.45;
}

.auth-aside__list {
  margin-top: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.auth-aside__list li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.auth-aside__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-navy);
}

/* ── Mobile: the rail drops below the form ── */
@media (max-width: 719px) {
  .auth-split {
    flex-direction: column;
  }
  .auth-body {
    padding: 1.75rem 1.35rem 1.5rem;
  }
  .auth-panel--wide .auth-title,
  .auth-panel--wide .auth-sub,
  .auth-panel--wide .auth-foot {
    text-align: center;
  }
  .auth-aside {
    width: 100%;
    padding: 1.35rem;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
}

/* ── Transition ── */
.auth-enter-active,
.auth-leave-active {
  transition: opacity 0.2s ease;
}
.auth-enter-from,
.auth-leave-to {
  opacity: 0;
}
.auth-enter-active .auth-panel {
  animation: auth-pop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes auth-pop {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
}
</style>
