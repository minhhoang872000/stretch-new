<script setup lang="ts">
/**
 * The one place toast notifications render. `useNotification` has always held
 * the queue; until this component existed, nothing displayed it — every
 * `notify()` on the site was silent. Mounted once in app.vue so a toast shows
 * on any page, including the homepage right after the Google OAuth redirect.
 */
const { notifications, dismiss } = useNotification()

const ICONS: Record<string, string> = {
  success: 'M5 12.5 9.5 17 19 7',
  error: 'M6 6l12 12M18 6L6 18',
  info: 'M12 8h.01M12 11v5',
}
</script>

<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="toast"
          :class="`toast--${n.type}`"
          role="status"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="toast__icon">
            <circle v-if="n.type === 'info'" cx="12" cy="12" r="9" stroke-width="1.8" />
            <path :d="ICONS[n.type] || ICONS.info" />
          </svg>
          <p class="toast__text">{{ n.message }}</p>
          <button type="button" class="toast__close" aria-label="Đóng" @click="dismiss(n.id)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(360px, calc(100vw - 28px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--color-border, #e3e8ef);
  background: white;
  box-shadow: 0 14px 34px -18px rgba(11, 42, 74, 0.45);
  pointer-events: auto;
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 2px;
}
.toast--success .toast__icon { color: #15803d; }
.toast--error .toast__icon { color: #b91c1c; }
.toast--info .toast__icon { color: var(--color-accent, #f47a1f); }

.toast__text {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-navy, #0b2a4a);
}

.toast__close {
  flex-shrink: 0;
  margin-top: 2px;
  color: #93a1b3;
  transition: color 0.15s ease;
}
.toast__close:hover { color: var(--color-navy, #0b2a4a); }

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
