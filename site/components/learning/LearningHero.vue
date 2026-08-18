<script setup lang="ts">
const { t } = useI18n()
const { open } = useAuthModal()

const features = [
  { key: 'f1', icon: 'cap' },
  { key: 'f2', icon: 'play' },
  { key: 'f3', icon: 'chart' },
]
</script>

<template>
  <section class="hub-hero">
    <!-- Photo bleeds off the right edge of the viewport on desktop -->
    <div class="hub-hero__photo">
      <NuxtImg
        src="/education-class.png"
        :alt="t('learning.hero.image_alt')"
        class="w-full h-full object-cover"
        format="webp"
        sizes="55vw"
      />
    </div>

    <div class="section-container hub-hero__inner">
      <!-- Copy -->
      <div class="hub-hero__copy">
        <h1 class="hub-hero__title">
          {{ t('learning.hero.title1') }}<br />
          <span class="text-accent">{{ t('learning.hero.title2') }}</span>
        </h1>
        <p class="hub-hero__sub">{{ t('learning.hero.subtitle') }}</p>

        <div class="hub-hero__actions">
          <a href="#programs" class="hub-hero__cta">
            {{ t('learning.hero.cta_primary') }}
            <svg class="hub-hero__cta-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <span class="hub-hero__account">
            {{ t('learning.hero.have_account') }}
            <button type="button" class="hub-hero__login" @click="open('login')">
              {{ t('learning.login') }} →
            </button>
          </span>
        </div>
      </div>

      <!-- Feature panel floating over the photo -->
      <div class="hub-hero__panel">
        <div v-for="f in features" :key="f.key" class="hub-feature">
          <span class="hub-feature__icon">
            <svg v-if="f.icon === 'cap'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
            <svg v-else-if="f.icon === 'play'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M10 9l4 2-4 2V9z" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 3h4v4" />
              <path d="M10 14L22 2" />
              <rect x="3" y="13" width="3" height="7" rx="0.5" />
              <rect x="9" y="9" width="3" height="11" rx="0.5" />
              <rect x="15" y="5" width="3" height="15" rx="0.5" />
            </svg>
          </span>
          <div class="min-w-0">
            <p class="hub-feature__title">{{ t(`learning.hero.${f.key}_title`) }}</p>
            <p class="hub-feature__desc">{{ t(`learning.hero.${f.key}_desc`) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hub-hero {
  position: relative;
  background: #fbfcfd;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.hub-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-top: 2.25rem;
  padding-bottom: 2rem;
}

.hub-hero__title {
  font-family: var(--font-heading);
  font-size: 31px;
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}

.hub-hero__sub {
  margin-top: 0.9rem;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 340px;
}

.hub-hero__actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.9rem;
}

.hub-hero__account {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.hub-hero__login {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.hub-hero__login:hover {
  color: var(--color-accent);
}

.hub-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.95rem 1.2rem;
  border-radius: 12px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  transition: background 0.2s ease;
}

/* The mobile CTA is a full-width block button — the arrow would read as
   decoration next to centred text, so it only shows once the button shrinks
   back to its inline size on desktop. */
.hub-hero__cta-arrow {
  display: none;
}
.hub-hero__cta:hover {
  background: var(--color-accent-dark);
}
.hub-hero__cta:active {
  transform: scale(0.97);
}

/* ── Photo ──
   Mobile leads with the headline and a full-width CTA, so the photo and the
   feature panel are desktop-only. */
.hub-hero__photo {
  display: none;
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  order: -1;
}

/* ── Feature panel ── */
.hub-hero__panel {
  display: none;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 10px 30px -12px rgba(11, 42, 74, 0.18);
  overflow: hidden;
}

.hub-feature {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.7rem 0.8rem;
}
.hub-feature + .hub-feature {
  border-top: 1px solid var(--color-border);
}

.hub-feature__icon {
  flex-shrink: 0;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  color: var(--color-navy);
}

.hub-feature__title {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-navy);
  line-height: 1.3;
}

.hub-feature__desc {
  font-size: 10.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* ── Desktop: photo on the right half, copy + panel on top of it ── */
@media (min-width: 1024px) {
  .hub-hero__actions {
    margin-top: 1.25rem;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.25rem;
  }

  .hub-hero__cta {
    padding: 0.6rem 1.2rem;
    border-radius: 9px;
    font-size: 13px;
  }
  .hub-hero__cta-arrow {
    display: block;
  }

  .hub-hero__account {
    font-size: 12.5px;
    text-align: left;
  }
  .hub-hero__login {
    color: var(--color-navy);
  }

  .hub-hero__photo {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: 53%;
    height: auto;
    aspect-ratio: auto;
    order: 0;
  }

  .hub-hero__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: 2rem;
    min-height: 296px;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  /* Keep the copy clear of the photo's left edge on very wide viewports —
     the photo is anchored to the viewport edge, the container is centred. */
  .hub-hero__copy {
    max-width: 430px;
    padding-right: 1rem;
  }

  .hub-hero__title {
    font-size: 30px;
  }

  .hub-hero__panel {
    display: block;
    justify-self: end;
    width: 340px;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(6px);
  }
}
</style>
