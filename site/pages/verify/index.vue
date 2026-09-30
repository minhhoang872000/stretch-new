<script setup lang="ts">
/**
 * /verify — the lookup box on its own, for someone holding a printed
 * certificate and a code rather than a link.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const code = ref('')

function go() {
  const next = code.value.trim().toUpperCase()
  if (next) navigateTo(localePath(`/verify/${encodeURIComponent(next)}`))
}

useSeo({
  title: `${t('learning.cert.verify_title')} — Stretch Academy`,
  description: t('learning.cert.verify_sub'),
  image: '/education-class.png',
  type: 'website',
})
</script>

<template>
  <div class="page">
    <LearningHeader />
    <main class="wrap">
      <h1 class="title">{{ t('learning.cert.verify_title') }}</h1>
      <p class="sub">{{ t('learning.cert.verify_sub') }}</p>
      <form class="row" @submit.prevent="go">
        <input v-model="code" class="input" :placeholder="t('learning.cert.lookup_ph')" autocomplete="off" autofocus />
        <button type="submit" class="btn">{{ t('learning.cert.lookup_btn') }}</button>
      </form>
    </main>
    <LearningFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-off-white);
}
.wrap {
  flex: 1;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
}
.title {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 800;
  color: var(--color-navy);
  letter-spacing: -0.02em;
}
.sub {
  margin-top: 0.5rem;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.row {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.4rem;
}
.input {
  flex: 1;
  min-width: 0;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: white;
  font-size: 14px;
}
.input:not(:placeholder-shown) {
  text-transform: uppercase;
}
.input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.btn {
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  background: var(--color-accent);
  color: white;
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
}
.btn:hover {
  background: var(--color-accent-dark);
}
</style>
