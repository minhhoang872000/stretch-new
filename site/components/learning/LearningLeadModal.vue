<script setup lang="ts">
/**
 * "Nhận tài liệu miễn phí" — the email form in front of a free download.
 *
 * Gives the lead to the CRM (/api/materials/lead → enquiries, source
 * `free-material`) and the download link to the visitor, both in the inbox and
 * straight away. The address is remembered in this browser, so the form shows
 * once per visitor rather than once per file; signed-in learners never see it.
 */
const props = defineProps<{ material: { name: string; url: string } | null }>()
const emit = defineEmits<{ close: []; done: [url: string] }>()

const { t } = useI18n()
const { notify } = useNotification()

const name = ref('')
const email = ref('')
const job = ref('')
const website = ref('') // honeypot
const sending = ref(false)
const error = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

watch(
  () => props.material,
  (m) => {
    if (m) {
      error.value = ''
      nextTick(() => document.getElementById('lead-email')?.focus())
    }
  },
)

async function submit() {
  if (!props.material || sending.value) return
  if (!EMAIL_RE.test(email.value.trim())) {
    error.value = t('learning.lead.invalid_email')
    return
  }
  sending.value = true
  error.value = ''
  try {
    await $fetch('/api/materials/lead', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        email: email.value.trim(),
        job: job.value.trim(),
        website: website.value,
        materialTitle: props.material.name,
        url: props.material.url,
      },
    })
    rememberLead(email.value.trim())
    notify(t('learning.lead.done'), 'success')
    emit('done', props.material.url)
  } catch (err: any) {
    // A bad address is theirs to fix. Anything else is ours — never hold a
    // free file hostage to a CRM outage; hand it over and lose the lead.
    if (err?.statusCode === 400 || err?.response?.status === 400) {
      error.value = t('learning.lead.invalid_email')
    } else {
      emit('done', props.material.url)
    }
  } finally {
    sending.value = false
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.material) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="lead">
    <div v-if="material" class="lead" role="dialog" aria-modal="true" :aria-label="t('learning.lead.title')">
      <div class="lead__scrim" @click="emit('close')" />
      <form class="lead__card" @submit.prevent="submit">
        <button type="button" class="lead__x" :aria-label="t('learning.lead.close')" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
        </button>

        <span class="lead__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><polyline points="7 10 12 15 17 10" /><path d="M5 21h14" /></svg>
        </span>
        <p class="lead__title">{{ t('learning.lead.title') }}</p>
        <p class="lead__sub">{{ t('learning.lead.sub', { title: material.name }) }}</p>

        <label class="lead__field">
          <span>{{ t('learning.lead.email') }} *</span>
          <input id="lead-email" v-model="email" type="email" required autocomplete="email" inputmode="email" />
        </label>
        <label class="lead__field">
          <span>{{ t('learning.lead.name') }}</span>
          <input v-model="name" type="text" autocomplete="name" />
        </label>
        <label class="lead__field">
          <span>{{ t('learning.lead.job') }}</span>
          <input v-model="job" type="text" :placeholder="t('learning.lead.job_ph')" />
        </label>
        <!-- Real people never see or fill this. -->
        <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" class="lead__hp" aria-hidden="true" />

        <p v-if="error" class="lead__error">{{ error }}</p>

        <button type="submit" class="lead__btn" :disabled="sending">
          {{ sending ? t('learning.lead.sending') : t('learning.lead.submit') }}
        </button>
        <p class="lead__consent">{{ t('learning.lead.consent') }}</p>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.lead {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.lead__scrim {
  position: absolute;
  inset: 0;
  background: rgba(7, 26, 46, 0.5);
  backdrop-filter: blur(3px);
}
.lead__card {
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 1.5rem 1.3rem 1.2rem;
  border-radius: 18px;
  background: white;
  box-shadow: 0 30px 70px -20px rgba(7, 26, 46, 0.5);
}
.lead__x {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--color-text-secondary);
}
.lead__x:hover {
  background: var(--color-off-white);
  color: var(--color-navy);
}
.lead__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(244, 122, 31, 0.12);
  color: var(--color-accent);
}
.lead__title {
  margin-top: 0.8rem;
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  color: var(--color-navy);
}
.lead__sub {
  margin-top: 0.3rem;
  margin-bottom: 0.9rem;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.lead__field {
  display: block;
  margin-bottom: 0.6rem;
}
.lead__field span {
  display: block;
  margin-bottom: 0.25rem;
  font-family: var(--font-heading);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-navy);
}
.lead__field input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
}
.lead__field input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.lead__hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.lead__error {
  margin-bottom: 0.5rem;
  font-size: 12px;
  color: #dc2626;
}
.lead__btn {
  width: 100%;
  margin-top: 0.3rem;
  padding: 0.75rem;
  border-radius: 11px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  transition: background 0.2s ease;
}
.lead__btn:hover:not(:disabled) {
  background: var(--color-accent-dark);
}
.lead__btn:disabled {
  opacity: 0.7;
}
.lead__consent {
  margin-top: 0.7rem;
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  text-align: center;
}
.lead-enter-active,
.lead-leave-active {
  transition: opacity 0.22s ease;
}
.lead-enter-active .lead__card,
.lead-leave-active .lead__card {
  transition: transform 0.22s ease;
}
.lead-enter-from,
.lead-leave-to {
  opacity: 0;
}
.lead-enter-from .lead__card,
.lead-leave-to .lead__card {
  transform: translateY(12px) scale(0.98);
}
</style>
