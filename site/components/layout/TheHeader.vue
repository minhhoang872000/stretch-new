<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const localePath = useLocalePath()

const navLinks = computed(() => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.individual'), href: '/individual' },
  { label: t('nav.business'), href: '/business' },

])

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

function switchLanguage(code: string) {
  setLocale(code)
}
</script>

<template>
  <nav
    class="sticky top-0 z-50 w-full bg-white transition-all duration-300"
    :class="isScrolled ? 'shadow-sm border-b border-border-default' : 'border-b border-border-default'"
  >
    <div class="section-container flex justify-between items-center py-3.5">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2 flex-shrink-0" @click="closeMobileMenu">
        <div class="flex items-center">
          <!-- Stretch.vn logo text -->
          <img src="~/assets/image/stretch.jpg" alt="Stretch.vn" class="h-12 w-auto object-contain opacity-80" />
        </div>
        <div class="hidden sm:flex items-center gap-3 border-l border-border-default pl-3 ml-3">
          <img src="~/assets/image/monaco.jpeg" alt="Monaco Healthcare" class="h-6 w-auto object-contain opacity-80" />
          <span class="text-[10px] text-text-secondary font-bold uppercase tracking-tight">Monaco Healthcare</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden lg:flex items-center gap-8 font-heading text-sm font-medium">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="localePath(link.href)"
          class="text-text-secondary hover:text-navy transition-colors relative py-1"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- Desktop CTA -->
      <div class="hidden lg:flex items-center gap-4">
        <!-- Language Switcher -->
        <div class="flex items-center gap-1.5 border border-border-default rounded-xl p-1 bg-off-white/50">
          <button
            v-for="loc in locales"
            :key="loc.code"
            @click="switchLanguage(loc.code)"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] font-heading font-bold uppercase"
            :class="locale === loc.code ? 'bg-white text-navy shadow-sm border border-border-default' : 'text-text-secondary hover:text-navy'"
          >
            <template v-if="loc.code === 'vi'">
              <svg width="14" height="10" viewBox="0 0 30 20" class="rounded-[1px]">
                <rect width="30" height="20" fill="#da251d"/>
                <polygon points="15,4 16.17,7.6 20,7.6 16.9,9.8 18.07,13.4 15,11.2 11.93,13.4 13.1,9.8 10,7.6 13.83,7.6" fill="#ffff00"/>
              </svg>
            </template>
            <template v-else>
              <svg width="14" height="10" viewBox="0 0 60 30" class="rounded-[1px]">
                <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
              </svg>
            </template>
            {{ loc.code }}
          </button>
        </div>

        <NuxtLink :to="localePath('/booking')" class="btn-navy">
          {{ $t('nav.bookSession') }}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden flex items-center gap-3">
        <!-- Small Mobile Lang Switch -->
        <button
          @click="switchLanguage(locale === 'en' ? 'vi' : 'en')"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-full bg-white text-[11px] font-heading font-bold uppercase text-navy"
        >
          <template v-if="locale === 'en'">
            <svg width="14" height="10" viewBox="0 0 30 20" class="rounded-[1px]">
              <rect width="30" height="20" fill="#da251d"/>
              <polygon points="15,4 16.17,7.6 20,7.6 16.9,9.8 18.07,13.4 15,11.2 11.93,13.4 13.1,9.8 10,7.6 13.83,7.6" fill="#ffff00"/>
            </svg>
            VI
          </template>
          <template v-else>
            <svg width="14" height="10" viewBox="0 0 60 30" class="rounded-[1px]">
              <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/>
              <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
              <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
            </svg>
            EN
          </template>
        </button>

        <button
          class="relative w-10 h-10 flex items-center justify-center"
          @click="toggleMobileMenu"
          :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
        >
          <div class="flex flex-col gap-1.5 w-5">
            <span
              class="block h-[2px] bg-navy transition-all duration-300 origin-center"
              :class="isMobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''"
            />
            <span
              class="block h-[2px] bg-navy transition-all duration-300"
              :class="isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''"
            />
            <span
              class="block h-[2px] bg-navy transition-all duration-300 origin-center"
              :class="isMobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile Drawer -->
    <Transition name="slide-right">
      <div
        v-if="isMobileMenuOpen"
        class="fixed top-0 right-0 bottom-0 w-[300px] bg-white shadow-elevated z-50 lg:hidden
               flex flex-col pt-20 px-6"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="localePath(link.href)"
          class="py-4 text-base font-heading font-medium text-navy border-b border-border-default
                 hover:text-accent transition-colors"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/booking')"
          class="btn-navy justify-center mt-6"
          @click="closeMobileMenu"
        >
          {{ $t('nav.bookSession') }}
        </NuxtLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
