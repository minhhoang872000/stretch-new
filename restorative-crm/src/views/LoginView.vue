<template>
  <div class="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
    <!-- Animated Ambient Background Gradients -->
    <div class="absolute inset-0 z-0">
      <div class="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-slow"></div>
      <div class="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse-slow-delayed"></div>
      <div class="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]"></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-md animate-fade-in-up">
      <!-- Language Switcher in Header -->
      <div class="flex justify-end mb-4">
        <button
          @click="toggleLanguage"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white"
        >
          <span class="material-symbols-outlined text-sm">language</span>
          <span class="uppercase">{{ locale }}</span>
        </button>
      </div>

      <!-- Glassmorphic Login Card -->
      <div class="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 lg:p-10">
        <!-- Logo / Title -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 mb-4 animate-scale-up">
            <span class="material-symbols-outlined text-2xl font-bold">clinical_notes</span>
          </div>
          <h1 class="text-2xl font-extrabold text-white text-center tracking-tight font-headline">
            {{ $t('login.title') }}
          </h1>
          <p class="text-sm text-slate-400 text-center mt-1.5 font-light">
            {{ $t('login.subtitle') }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold tracking-widest text-slate-400 uppercase">Email</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3.5 text-slate-500 text-lg">alternate_email</span>
              <InputText
                id="email"
                v-model="email"
                type="email"
                class="login-input w-full"
                :class="{ 'border-red-500/50 focus:border-red-500': errors.email }"
                placeholder="admin@stretch.vn"
                autocomplete="email"
              />
            </div>
            <span v-if="errors.email" class="text-xs text-red-400 mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">error</span>
              {{ errors.email }}
            </span>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold tracking-widest text-slate-400 uppercase">
              {{ $t('login.password') }}
            </label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3.5 text-slate-500 text-lg">lock</span>
              <InputText
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="login-input w-full pr-10"
                :class="{ 'border-red-500/50 focus:border-red-500': errors.password }"
                :placeholder="$t('login.passwordPlaceholder')"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors flex items-center focus:outline-none"
              >
                <span class="material-symbols-outlined text-lg">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <span v-if="errors.password" class="text-xs text-red-400 mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">error</span>
              {{ errors.password }}
            </span>
          </div>

          <!-- General error -->
          <div
            v-if="errorMessage"
            class="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-start gap-2.5 animate-shake"
          >
            <span class="material-symbols-outlined text-base text-red-400 shrink-0">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="loading"
            class="relative w-full h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm tracking-wide hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/10 mt-6"
          >
            <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span v-else>{{ $t('login.signIn') }}</span>
          </button>
        </form>

        <!-- Demo Account Badge -->
        <div class="mt-8 pt-6 border-t border-slate-800/80">
          <p class="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center mb-3">
            {{ $t('login.demoCredentials') }}
          </p>
          <button
            @click="fillDemoCredentials"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/40 transition-all text-left group"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold text-slate-300">admin@stretch.vn</span>
              <span class="text-[10px] text-slate-500 font-light">Admin@stretch1 · {{ $t('login.demoHint') }}</span>
            </div>
            <span class="material-symbols-outlined text-base text-slate-500 group-hover:text-emerald-400 transition-colors">
              input
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const errors = reactive({
  email: '',
  password: ''
})

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'vi' : 'en'
}

const fillDemoCredentials = () => {
  email.value = 'admin@stretch.vn'
  password.value = 'Admin@stretch1'
  errors.email = ''
  errors.password = ''
  errorMessage.value = ''
}

const validate = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!email.value.trim()) {
    errors.email = t('login.requiredError')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.email = locale.value === 'vi' ? 'Email không hợp lệ' : 'Invalid email address'
    isValid = false
  }

  if (!password.value) {
    errors.password = t('login.requiredError')
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login(email.value.trim(), password.value)

  if (result.success) {
    router.push({ name: 'Dashboard' })
  } else {
    errorMessage.value = result.message[locale.value] || result.message.en
  }
  loading.value = false
}
</script>

<style scoped>
/* Sleek overrides for PrimeVue inside dark theme login */
:deep(.p-inputtext.login-input) {
  font-family: 'Manrope', sans-serif !important;
  font-size: 0.875rem !important;
  border-radius: 0.75rem !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  background-color: rgba(15, 23, 42, 0.6) !important;
  color: #f8fafc !important;
  padding: 0.625rem 0.875rem 0.625rem 2.75rem !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.p-inputtext.login-input:hover) {
  border-color: rgba(16, 185, 129, 0.4) !important;
}

:deep(.p-inputtext.login-input:focus) {
  outline: none !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
  background-color: rgba(15, 23, 42, 0.9) !important;
}

/* Animations */
.animate-pulse-slow {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.animate-pulse-slow-delayed {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 4s;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-up {
  animation: scale-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-shake {
  animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
