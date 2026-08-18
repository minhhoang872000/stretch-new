<script setup lang="ts">
/**
 * Learning Hub's own top bar — deliberately NOT TheHeader.
 * Brand lockup (logo + LEARNING HUB), 5 nav links, and the two account CTAs,
 * matching the hub design.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { loggedIn, user, logout: endSession } = useHubSession()

const { open: openAuthModal } = useAuthModal()

const isMobileMenuOpen = ref(false)

/** Drawer has to close first, otherwise it sits on top of the modal. */
function openAuth(view: 'login' | 'register') {
  closeMobileMenu()
  openAuthModal(view)
}

const navLinks = computed(() => [
  { label: t('learning.nav.home'), to: localePath('/learning-hub'), exact: true },
  { label: t('learning.nav.programs'), to: localePath('/learning-hub/programs') },
  { label: t('learning.nav.schedule'), hash: '#schedule' },
  { label: t('learning.nav.hub'), to: localePath('/sharing-hub') },
  { label: t('learning.nav.support'), hash: '#support' },
])

onUnmounted(() => {
  document.body.style.overflow = ''
})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

async function logout() {
  await endSession()
  closeMobileMenu()
}
</script>

<template>
  <div>
    <header
      class="sticky top-0 w-full bg-white border-b border-border"
      :class="isMobileMenuOpen ? 'z-[980]' : 'z-50'"
    >
      <div class="section-container flex items-center justify-between h-[58px]">
        <!-- Brand lockup: wordmark with the hub sub-label underneath -->
        <NuxtLink
          :to="localePath('/learning-hub')"
          class="flex flex-col justify-center flex-shrink-0 leading-none"
          @click="closeMobileMenu"
        >
          <img src="/stretch.jpg" alt="Stretch.vn" class="h-7 w-auto object-contain" />
          <span class="brand-sub">{{ t('learning.brand') }}</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden lg:flex items-center gap-7 font-heading text-[13px] font-medium">
          <template v-for="link in navLinks" :key="link.label">
            <NuxtLink
              v-if="link.to"
              :to="link.to"
              class="hub-link"
              :class="link.exact ? 'hub-link--home' : ''"
            >
              {{ link.label }}
            </NuxtLink>
            <a v-else :href="link.hash" class="hub-link">{{ link.label }}</a>
          </template>
        </nav>

        <!-- Desktop actions -->
        <div class="hidden lg:flex items-center gap-2.5">
          <LearningAccountMenu v-if="loggedIn" />
          <template v-else>
            <button class="hub-btn hub-btn--ghost" @click="openAuth('login')">{{ t('learning.login') }}</button>
            <button class="hub-btn hub-btn--accent" @click="openAuth('register')">{{ t('learning.signup') }}</button>
          </template>
        </div>

        <!-- Mobile toggle -->
        <button
          class="lg:hidden w-11 h-11 flex items-center justify-center rounded-full bg-white border border-border shadow-[0_2px_10px_-2px_rgba(11,42,74,0.16)] active:scale-95 transition-transform"
          :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
          @click="toggleMobileMenu"
        >
          <div class="flex flex-col gap-1.5 w-5">
            <span
              class="block h-[2px] bg-navy transition-all duration-300 origin-center"
              :class="isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''"
            />
            <span
              class="block h-[2px] bg-navy transition-all duration-300"
              :class="isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''"
            />
            <span
              class="block h-[2px] bg-navy transition-all duration-300 origin-center"
              :class="isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''"
            />
          </div>
        </button>
      </div>
    </header>

    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="isMobileMenuOpen"
        class="fixed top-0 right-0 bottom-0 w-[290px] bg-white shadow-elevated z-[999] lg:hidden flex flex-col pt-20 px-6 overflow-y-auto"
      >
        <template v-for="link in navLinks" :key="link.label">
          <NuxtLink
            v-if="link.to"
            :to="link.to"
            class="py-3.5 text-[15px] font-heading font-medium text-navy border-b border-border hover:text-accent transition-colors"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </NuxtLink>
          <a
            v-else
            :href="link.hash"
            class="py-3.5 text-[15px] font-heading font-medium text-navy border-b border-border hover:text-accent transition-colors"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </a>
        </template>

        <!-- The drawer stands in for the desktop avatar dropdown on mobile. -->
        <NuxtLink
          v-if="loggedIn"
          :to="localePath('/learning-hub/my-courses')"
          class="py-3.5 text-[15px] font-heading font-medium text-navy border-b border-border hover:text-accent transition-colors"
          @click="closeMobileMenu"
        >
          {{ t('learning.nav.my_courses') }}
        </NuxtLink>

        <div v-if="loggedIn" class="flex items-center gap-3 mt-6">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user?.name"
            class="w-9 h-9 rounded-full object-cover border border-border"
          />
          <span v-else class="avatar-fallback avatar-fallback--lg" aria-hidden="true">{{ user?.initials }}</span>
          <span class="text-sm font-heading font-semibold text-navy truncate">{{ user?.name }}</span>
          <button
            class="ml-auto text-xs font-heading font-semibold text-text-secondary hover:text-accent transition-colors"
            @click="logout"
          >
            {{ t('nav.logout') }}
          </button>
        </div>
        <div v-else class="flex flex-col gap-2.5 mt-6">
          <button class="hub-btn hub-btn--ghost justify-center" @click="openAuth('login')">{{ t('learning.login') }}</button>
          <button class="hub-btn hub-btn--accent justify-center" @click="openAuth('register')">{{ t('learning.signup') }}</button>
        </div>

        <NuxtLink
          :to="localePath('/')"
          class="mt-7 text-xs font-heading font-semibold text-text-secondary hover:text-accent transition-colors"
          @click="closeMobileMenu"
        >
          ← {{ t('learning.back_to_site') }}
        </NuxtLink>
      </div>
    </Transition>

    <AuthModal />
  </div>
</template>

<style scoped>
.brand-sub {
  font-family: var(--font-heading);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-top: 3px;
  padding-left: 2px;
}

/* Shown when the account has no photo — Google supplies one, the demo login
   and email signups do not. */
.avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-navy);
  color: white;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.avatar-fallback--lg {
  width: 36px;
  height: 36px;
  font-size: 13px;
}

.hub-link {
  position: relative;
  padding: 2px 0;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
  white-space: nowrap;
}
.hub-link:hover {
  color: var(--color-navy);
}
.hub-link--home.router-link-exact-active {
  color: var(--color-navy);
  font-weight: 700;
}
.hub-link--home.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2.5px;
  background-color: var(--color-accent);
  border-radius: 2px;
}

.hub-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.hub-btn--ghost {
  color: var(--color-navy);
  border: 1.5px solid var(--color-border);
  background: white;
}
.hub-btn--ghost:hover {
  border-color: var(--color-navy);
}
.hub-btn--accent {
  color: white;
  background: var(--color-accent);
  border: 1.5px solid var(--color-accent);
}
.hub-btn--accent:hover {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
