<script setup lang="ts">
/**
 * Avatar dropdown for the signed-in learner: my courses + sign out.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { user, logout } = useHubSession()

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function close() {
  isOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

async function signOut() {
  close()
  await logout()
}
</script>

<template>
  <div ref="root" class="acct">
    <button
      class="acct__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :aria-label="t('learning.nav.account')"
      @click="isOpen = !isOpen"
    >
      <img
        v-if="user?.avatar"
        :src="user.avatar"
        :alt="user?.name"
        class="acct__photo"
      />
      <span v-else class="acct__photo acct__photo--initials" aria-hidden="true">{{ user?.initials }}</span>

      <span class="acct__name">{{ user?.name }}</span>

      <svg
        class="acct__chev"
        :class="{ 'acct__chev--open': isOpen }"
        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="acct-pop">
      <div v-if="isOpen" class="acct__menu" role="menu">
        <NuxtLink :to="localePath('/learning-hub/my-courses')" class="acct__item" role="menuitem" @click="close">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z" />
            <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13z" />
          </svg>
          {{ t('learning.nav.my_courses') }}
        </NuxtLink>

        <div class="acct__sep" />

        <button type="button" class="acct__item acct__item--danger" role="menuitem" @click="signOut">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 17l5-5-5-5" />
            <line x1="20" y1="12" x2="9" y2="12" />
            <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
          </svg>
          {{ t('nav.logout') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.acct {
  position: relative;
}

.acct__trigger {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.45rem 0.25rem 0.25rem;
  border-radius: 999px;
  transition: background 0.2s ease;
}
.acct__trigger:hover {
  background: var(--color-off-white);
}

.acct__photo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}
.acct__photo--initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-navy);
  color: white;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
}

.acct__name {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-navy);
}

.acct__chev {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}
.acct__chev--open {
  transform: rotate(180deg);
}

/* ── Menu ── */
.acct__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  min-width: 196px;
  padding: 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: white;
  box-shadow: 0 14px 34px -12px rgba(11, 42, 74, 0.28);
}

.acct__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-navy);
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}
.acct__item:hover {
  background: var(--color-off-white);
  color: var(--color-accent);
}

.acct__item--danger {
  color: var(--color-text-secondary);
}
.acct__item--danger:hover {
  background: var(--color-error-container);
  color: var(--color-error);
}

.acct__sep {
  height: 1px;
  margin: 0.25rem 0.15rem;
  background: var(--color-border);
}

/* ── Transition ── */
.acct-pop-enter-active,
.acct-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.acct-pop-enter-from,
.acct-pop-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
