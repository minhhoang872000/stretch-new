<script setup lang="ts">
/**
 * Share sheet for a course — the desktop fallback when the native Web Share
 * API is unavailable (the page tries `navigator.share` first; on phones the
 * OS sheet already lists Zalo, Messenger and everything else installed).
 *
 * Every target here is a plain URL sharer opened in a popup, so no social
 * SDK script rides along on every page view.
 */
const props = defineProps<{
  open: boolean
  url: string
  title: string
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const { t } = useI18n()
const { notify } = useNotification()

function close() {
  emit('update:open', false)
}

function popup(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560')
  close()
}

const shareFacebook = () =>
  popup(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(props.url)}`)

/** Zalo's URL-only sharer takes a base64 JSON payload — no SDK needed. */
const shareZalo = () => {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ url: props.url }))))
  popup(`https://button-share.zalo.me/share_external?d=${payload}`)
}

const shareX = () =>
  popup(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`,
  )

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    notify(t('learning.course.share_copied'), 'success')
  } catch {
    notify(props.url, 'info', 8000)
  }
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div v-if="open" class="sheet__backdrop" @click.self="close">
        <div class="sheet" role="dialog" aria-modal="true" :aria-label="t('learning.course.share_title')">
          <div class="sheet__head">
            <div class="min-w-0">
              <p class="sheet__title">{{ t('learning.course.share_title') }}</p>
              <p class="sheet__hint">{{ t('learning.course.share_hint') }}</p>
            </div>
            <button type="button" class="sheet__close" aria-label="Đóng" @click="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <div class="sheet__grid">
            <button type="button" class="target" @click="shareFacebook">
              <span class="target__icon target__icon--fb" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.3 1.2-3.3 3.4V11H8.5v3h2.7v7h2.3z" />
                </svg>
              </span>
              Facebook
            </button>

            <button type="button" class="target" @click="shareZalo">
              <span class="target__icon target__icon--zalo" aria-hidden="true">Z</span>
              Zalo
            </button>

            <button type="button" class="target" @click="shareX">
              <span class="target__icon target__icon--x" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7 3.7H5.2L17.8 20z" />
                </svg>
              </span>
              X
            </button>

            <button type="button" class="target" @click="copyLink">
              <span class="target__icon target__icon--copy" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="12" height="12" rx="2.5" />
                  <path d="M5 15H4.5A2.5 2.5 0 0 1 2 12.5v-8A2.5 2.5 0 0 1 4.5 2h8A2.5 2.5 0 0 1 15 4.5V5" />
                </svg>
              </span>
              {{ t('learning.course.share_copy') }}
            </button>
          </div>

          <p class="sheet__url" :title="url">{{ url }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  background: rgba(7, 26, 46, 0.45);
  backdrop-filter: blur(3px);
}
@media (min-width: 640px) {
  .sheet__backdrop {
    align-items: center;
  }
}

.sheet {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  border-radius: 16px;
  background: white;
  box-shadow: 0 24px 60px -24px rgba(11, 42, 74, 0.55);
}

.sheet__head {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.sheet__title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-navy);
}

.sheet__hint {
  margin-top: 0.15rem;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.sheet__close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  flex-shrink: 0;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: background 0.15s ease, color 0.15s ease;
}
.sheet__close:hover {
  background: var(--color-off-white);
  color: var(--color-navy);
}

.sheet__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.target {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-navy);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.target:hover {
  border-color: var(--color-accent);
  background: #fff9f4;
}

.target__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 8px;
  color: white;
}
.target__icon--fb {
  background: #1877f2;
}
.target__icon--zalo {
  background: #0068ff;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
}
.target__icon--x {
  background: #0f1419;
}
.target__icon--copy {
  background: var(--color-off-white);
  color: var(--color-navy);
  border: 1px solid var(--color-border);
}

.sheet__url {
  margin-top: 0.7rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: var(--color-off-white);
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.18s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>
