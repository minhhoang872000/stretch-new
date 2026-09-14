<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '~/components/ui/AppButton.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import FormField from '~/components/ui/FormField.vue'
import { session } from '~/services/session'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const pending = ref(false)

async function submit() {
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Nhập đủ email và mật khẩu.'
    return
  }
  pending.value = true
  const failure = await session.signIn(email.value, password.value)
  pending.value = false
  if (failure) {
    error.value = failure
    toast.push(failure, 'bad')
    return
  }
  toast.push(`Đăng nhập thành công. Chào ${session.user.value?.name || 'bạn'}!`)
  router.push((route.query.next as string) || '/dashboard')
}
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-shell px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-4 text-center">
        <p class="text-lg font-bold tracking-tight text-navy">Stretch Academy</p>
        <p class="mt-0.5 text-[12.5px] text-ink-muted">Bảng quản lý giảng dạy</p>
      </div>

      <form class="rounded-xl border border-line bg-surface p-5" novalidate @submit.prevent="submit">
        <FormField label="Email" :error="error" required for="login-email">
          <AppInput id="login-email" v-model="email" type="email" placeholder="instructor@stretch.vn" :invalid="!!error" />
        </FormField>

        <div class="mt-3.5">
          <FormField label="Mật khẩu" required for="login-password">
            <div class="relative">
              <AppInput
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••"
                :invalid="!!error"
              />
              <button
                type="button"
                class="t-fast absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-md text-ink-muted hover:text-navy"
                @click="showPassword = !showPassword"
              >
                <AppIcon
                  :name="showPassword ? 'eyeOff' : 'eye'"
                  :size="16"
                  :label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                />
              </button>
            </div>
          </FormField>
        </div>

        <AppButton type="submit" variant="primary" class="mt-4 w-full" :loading="pending">Đăng nhập</AppButton>
      </form>
    </div>
  </div>
</template>
