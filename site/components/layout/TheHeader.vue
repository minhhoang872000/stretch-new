<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const localePath = useLocalePath();

const navLinks = computed(() => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.individual'), href: '/individual' },
  {
    label: t('nav.business'),
    href: '/business',
    dropdown: [
      { label: t('nav.business_intro'), href: '/business' },
      { label: t('nav.business_recovery'), href: '/business/recovery-event' },
      {
        label: t('nav.business_training'),
        href: '/business/education-training',
      },
      {
        label: t('nav.business_wellness'),
        href: '/business/corporate-wellness',
      },
    ],
  },
  { label: t('sharing_hub.nav'), href: '/sharing-hub' },
]);

const isBusinessDropdownOpen = ref(false);
const isMobileBusinessOpen = ref(false);
let dropdownTimeout: ReturnType<typeof setTimeout> | null = null;

function showBusinessDropdown() {
  if (dropdownTimeout) clearTimeout(dropdownTimeout);
  isBusinessDropdownOpen.value = true;
}

function hideBusinessDropdown() {
  dropdownTimeout = setTimeout(() => {
    isBusinessDropdownOpen.value = false;
  }, 300);
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (dropdownTimeout) clearTimeout(dropdownTimeout);
});

function handleScroll() {
  isScrolled.value = window.scrollY > 40;
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
}

function switchLanguage(code: string) {
  setLocale(code);
}
</script>

<template>
  <div>
    <nav
      class="sticky top-0 w-full bg-white transition-all duration-300 overflow-visible"
      :class="[
        isScrolled
          ? 'shadow-sm border-b border-border-default'
          : 'border-b border-border-default',
        isMobileMenuOpen ? 'z-[980]' : 'z-50',
      ]"
    >
      <!-- ✅ FIX: section-container bây giờ bao gồm CẢ desktop nav VÀ mobile controls -->
      <div class="section-container flex justify-between items-center py-3.5">
        <!-- Logo -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-2 flex-shrink-0"
          @click="closeMobileMenu"
        >
          <div class="flex items-center">
            <img
              src="/stretch.jpg"
              alt="Stretch.vn"
              class="h-12 w-auto object-contain opacity-80"
            />
          </div>
          <div
            class="hidden sm:flex items-center gap-3 border-l border-border-default pl-3 ml-3"
          >
            <span
              class="text-[10px] text-text-secondary font-bold uppercase tracking-tight"
            >
              {{ $t('footer.poweredBy') }} Monaco Healthcare
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Nav -->
        <div
          class="hidden lg:flex items-center gap-8 font-heading text-sm font-medium"
        >
          <template v-for="link in navLinks" :key="link.href">
            <!-- Regular nav link -->
            <NuxtLink
              v-if="!link.dropdown"
              :to="localePath(link.href)"
              class="nav-link text-text-secondary hover:text-navy transition-colors relative py-1"
            >
              {{ link.label }}
            </NuxtLink>

            <!-- Dropdown nav link -->
            <div
              v-else
              class="relative"
              @mouseenter="showBusinessDropdown"
              @mouseleave="hideBusinessDropdown"
            >
              <NuxtLink
                :to="localePath(link.href)"
                class="nav-link text-text-secondary hover:text-navy transition-colors relative py-1 inline-flex items-center gap-1"
              >
                {{ link.label }}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-transform duration-200"
                  :class="isBusinessDropdownOpen ? 'rotate-180' : ''"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </NuxtLink>

              <Transition name="dropdown">
                <div
                  v-if="isBusinessDropdownOpen"
                  class="nav-dropdown"
                  @mouseenter="showBusinessDropdown"
                  @mouseleave="hideBusinessDropdown"
                >
                  <div class="nav-dropdown-panel">
                    <NuxtLink
                      v-for="sub in link.dropdown"
                      :key="sub.href"
                      :to="localePath(sub.href)"
                      class="nav-dropdown-item"
                      @click="isBusinessDropdownOpen = false"
                    >
                      {{ sub.label }}
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden lg:flex items-center gap-4">
          <!-- Language Switcher -->
          <div
            class="flex items-center gap-1.5 border border-border-default rounded-xl p-1 bg-off-white/50"
          >
            <button
              v-for="loc in locales"
              :key="loc.code"
              @click="switchLanguage(loc.code)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] font-heading font-bold uppercase"
              :class="
                locale === loc.code
                  ? 'bg-white text-navy shadow-sm border border-border-default'
                  : 'text-text-secondary hover:text-navy'
              "
            >
              <template v-if="loc.code === 'vi'">
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 30 20"
                  class="rounded-[1px]"
                >
                  <rect width="30" height="20" fill="#da251d" />
                  <polygon
                    points="15,4 16.17,7.6 20,7.6 16.9,9.8 18.07,13.4 15,11.2 11.93,13.4 13.1,9.8 10,7.6 13.83,7.6"
                    fill="#ffff00"
                  />
                </svg>
              </template>
              <template v-else>
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 60 30"
                  class="rounded-[1px]"
                >
                  <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                  <path
                    d="M0,0 L60,30 M60,0 L0,30"
                    stroke="#fff"
                    stroke-width="6"
                  />
                  <path
                    d="M0,0 L60,30 M60,0 L0,30"
                    stroke="#C8102E"
                    stroke-width="4"
                  />
                  <path
                    d="M30,0 v30 M0,15 h60"
                    stroke="#fff"
                    stroke-width="10"
                  />
                  <path
                    d="M30,0 v30 M0,15 h60"
                    stroke="#C8102E"
                    stroke-width="6"
                  />
                </svg>
              </template>
              {{ loc.code }}
            </button>
          </div>

          <NuxtLink :to="localePath('/booking')" class="btn-navy">
            {{ $t('nav.bookSession') }}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 12l4-4-4-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </NuxtLink>
        </div>

        <!-- ✅ FIX: Mobile controls nằm TRONG section-container (cùng cấp với Logo và Desktop Nav) -->
        <div class="lg:hidden flex items-center gap-3">
          <!-- Small Mobile Lang Switch -->
          <button
            @click="switchLanguage(locale === 'en' ? 'vi' : 'en')"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-full bg-white text-[11px] font-heading font-bold uppercase text-navy"
          >
            <template v-if="locale === 'en'">
              <svg
                width="14"
                height="10"
                viewBox="0 0 30 20"
                class="rounded-[1px]"
              >
                <rect width="30" height="20" fill="#da251d" />
                <polygon
                  points="15,4 16.17,7.6 20,7.6 16.9,9.8 18.07,13.4 15,11.2 11.93,13.4 13.1,9.8 10,7.6 13.83,7.6"
                  fill="#ffff00"
                />
              </svg>
              VI
            </template>
            <template v-else>
              <svg
                width="14"
                height="10"
                viewBox="0 0 60 30"
                class="rounded-[1px]"
              >
                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                <path
                  d="M0,0 L60,30 M60,0 L0,30"
                  stroke="#fff"
                  stroke-width="6"
                />
                <path
                  d="M0,0 L60,30 M60,0 L0,30"
                  stroke="#C8102E"
                  stroke-width="4"
                />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
                <path
                  d="M30,0 v30 M0,15 h60"
                  stroke="#C8102E"
                  stroke-width="6"
                />
              </svg>
              EN
            </template>
          </button>

          <!-- Hamburger button -->
          <button
            class="w-10 h-10 flex items-center justify-center"
            @click="toggleMobileMenu"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
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
      </div>
    </nav>

    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile Drawer -->
    <Transition name="slide-right">
      <div
        v-if="isMobileMenuOpen"
        class="fixed top-0 right-0 bottom-0 w-[300px] bg-white shadow-elevated z-[999] lg:hidden flex flex-col pt-24 px-6"
      >
        <template v-for="link in navLinks" :key="link.href">
          <!-- Regular mobile nav link -->
          <NuxtLink
            v-if="!link.dropdown"
            :to="localePath(link.href)"
            class="mobile-nav-link py-4 text-base font-heading font-medium text-navy border-b border-border-default hover:text-accent transition-colors"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Mobile dropdown -->
          <div v-else class="border-b border-border-default">
            <button
              class="mobile-nav-link w-full py-4 text-base font-heading font-medium text-navy hover:text-accent transition-colors flex items-center justify-between"
              @click="isMobileBusinessOpen = !isMobileBusinessOpen"
            >
              {{ link.label }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-transform duration-200"
                :class="isMobileBusinessOpen ? 'rotate-180' : ''"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div
              v-if="isMobileBusinessOpen"
              class="pb-3 pl-4 flex flex-col gap-1"
            >
              <NuxtLink
                v-for="sub in link.dropdown"
                :key="sub.href"
                :to="localePath(sub.href)"
                class="mobile-sub-link py-2 text-sm font-heading text-text-secondary hover:text-accent transition-colors"
                @click="closeMobileMenu"
              >
                {{ sub.label }}
              </NuxtLink>
            </div>
          </div>
        </template>

        <NuxtLink
          :to="localePath('/booking')"
          class="btn-navy justify-center mt-6"
          @click="closeMobileMenu"
        >
          {{ $t('nav.bookSession') }}
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}

/* ── Active Header Underline ── */
.nav-link.router-link-exact-active {
  color: #0b2a4a !important;
  font-weight: 700;
}
.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #0b2a4a;
  border-radius: 2px;
}

/* ── Active Mobile Link ── */
.mobile-nav-link.router-link-exact-active {
  color: #f47a1f !important;
  font-weight: 700;
}

/* ── Dropdown ── */
/* The container touches the trigger (top: 100%) and uses a transparent
   padding-top as the hover bridge, so there is never an uncovered gap. */
.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  padding-top: 10px;
  z-index: 60;
}

.nav-dropdown-panel {
  background: white;
  border: 1px solid #e6ecf2;
  border-radius: 12px;
  padding: 6px;
  box-shadow:
    0 8px 32px rgba(11, 42, 74, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-dropdown-item {
  display: block;
  padding: 10px 14px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.15s ease;
  text-decoration: none;
  white-space: nowrap;
}
.nav-dropdown-item:hover {
  background: #f3f4f6;
  color: #0b2a4a;
}
.nav-dropdown-item.router-link-active {
  color: #f47a1f;
  font-weight: 600;
}

/* ── Dropdown Transitions ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
