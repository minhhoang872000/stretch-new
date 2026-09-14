<script setup lang="ts">
/**
 * Learning Hub auth modal — sign in / create account, both with Google.
 *
 * There is no email + password path: Google is the only identity provider, and
 * with Google, sign-up and sign-in are the same event (the first successful
 * sign-in creates the learner row — see server/api/auth/google.get.ts). The
 * two panes therefore only differ in copy and in the benefits rail shown to
 * someone who came here to "create an account".
 *
 * Open it from anywhere with `useAuthModal().open('register')`, or deep-link
 * with `?auth=register`.
 */
const { t } = useI18n()
const route = useRoute()
const { isOpen, view, close, go, openFromQuery } = useAuthModal()

const benefits = ['benefit_1', 'benefit_2', 'benefit_3', 'benefit_4', 'benefit_5']

const isWide = computed(() => view.value === 'register')

/**
 * /api/auth/login notes the current page (via Referer) before handing over to
 * Google, so the person lands back here — same course, same locale — instead
 * of on the home page. Passing `next` explicitly covers browsers that strip
 * the Referer.
 */
const loginHref = computed(() => `/api/auth/login?next=${encodeURIComponent(route.fullPath)}`)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) close()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
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

            <div class="auth-split">
              <div class="auth-body">
                <h2 class="auth-title">
                  {{ view === 'login' ? t('learning.auth.login_title') : t('learning.auth.register_title') }}
                </h2>
                <p class="auth-sub">
                  {{ view === 'login' ? t('learning.auth.login_sub') : t('learning.auth.register_sub') }}
                </p>

                <a :href="loginHref" class="auth-google">
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 34.9 27 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.7 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36.3 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
                  </svg>
                  {{ t('learning.auth.google') }}
                </a>

                <p class="auth-hint">{{ t('learning.auth.google_hint') }}</p>

                <!-- Cross-links -->
                <p v-if="view === 'login'" class="auth-foot">
                  {{ t('learning.auth.no_account') }}
                  <button type="button" class="auth-textlink" @click="go('register')">
                    {{ t('learning.auth.to_register') }} →
                  </button>
                </p>
                <p v-else class="auth-foot">
                  {{ t('learning.auth.have_account') }}
                  <button type="button" class="auth-textlink" @click="go('login')">
                    {{ t('learning.auth.to_login') }} →
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
  max-width: 720px;
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
  padding: 2.25rem 1.75rem 1.75rem;
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

/* ── Google button ── */
.auth-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  height: 48px;
  margin-top: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.1s ease;
}
.auth-google:hover {
  border-color: var(--color-navy-light);
  background: var(--color-off-white);
}
.auth-google:active {
  transform: scale(0.99);
}

.auth-hint {
  margin-top: 0.75rem;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  text-align: center;
}
.auth-panel--wide .auth-hint {
  text-align: left;
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
  .auth-panel--wide .auth-hint,
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
