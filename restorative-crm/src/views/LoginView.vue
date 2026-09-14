<template>
  <!-- Two-panel sign-in: the form on the left, what this console covers on the
       right. Same token palette as the rest of the app — no separate dark
       gradient world for one screen. -->
  <div class="min-h-screen grid lg:grid-cols-[minmax(0,1fr),minmax(0,1.1fr)] bg-canvas">
    <div class="flex items-center justify-center px-5 py-10 lg:px-12">
      <div class="w-full max-w-sm">
        <div class="flex items-center gap-2.5 mb-8">
          <span
            class="w-9 h-9 rounded-md bg-accent text-white flex items-center justify-center"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined ms-fill text-xl">accessibility_new</span>
          </span>
          <div>
            <p class="font-headline font-extrabold text-[0.9375rem] text-ink leading-tight">Stretch.vn</p>
            <p class="text-2xs text-ink-3 font-semibold">Bảng điều khiển</p>
          </div>
        </div>

        <h1 class="text-2xl font-headline font-extrabold text-ink tracking-tight">Đăng nhập</h1>
        <p class="mt-1.5 text-[0.8125rem] text-ink-2">
          Dành cho nhân sự Stretch. Học viên đăng nhập ở
          <a :href="`${siteUrl}/learning-hub`" class="link">trang học viện</a>.
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <FormRow label="Email" required :error="errors.email">
            <template #default="{ id }">
              <input
                :id="id"
                v-model="email"
                type="email"
                class="input"
                autocomplete="email"
                placeholder="ten@stretch.vn"
                :aria-invalid="!!errors.email"
              />
            </template>
          </FormRow>

          <FormRow label="Mật khẩu" required :error="errors.password">
            <template #default="{ id }">
              <div class="relative">
                <input
                  :id="id"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input pr-10"
                  autocomplete="current-password"
                  :aria-invalid="!!errors.password"
                />
                <button
                  type="button"
                  class="absolute right-1 top-1/2 -translate-y-1/2 btn-ghost btn-sm btn-icon"
                  :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                  @click="showPassword = !showPassword"
                >
                  <span class="material-symbols-outlined text-lg">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </template>
          </FormRow>

          <p
            v-if="errorMessage"
            class="panel-quiet !bg-danger-soft !border-danger-line px-3 py-2.5 text-xs text-danger flex items-start gap-2"
            role="alert"
          >
            <span class="material-symbols-outlined text-base shrink-0">error</span>
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn-primary btn-lg w-full" :disabled="loading">
            <span v-if="loading" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            {{ loading ? 'Đang kiểm tra…' : 'Đăng nhập' }}
          </button>
        </form>
      </div>
    </div>

    <!-- What the console manages: sets expectations before the first login. -->
    <aside class="hidden lg:flex flex-col justify-center px-12 py-10 bg-panel border-l border-line">
      <p class="label-xs">Bảng điều khiển quản lý</p>
      <ul class="mt-4 space-y-3 max-w-md">
        <li v-for="area in areas" :key="area.title" class="flex items-start gap-3">
          <span
            class="w-8 h-8 rounded-md bg-accent-soft text-accent-ink flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined text-lg">{{ area.icon }}</span>
          </span>
          <span class="min-w-0">
            <span class="block text-[0.8125rem] font-bold text-ink">{{ area.title }}</span>
            <span class="block text-xs text-ink-2">{{ area.detail }}</span>
          </span>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useNotify } from '@/composables/useNotify.js'
import FormRow from '@/components/ui/FormRow.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notify = useNotify()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = reactive({ email: '', password: '' })

const areas = [
  { icon: 'school', title: 'Học viện', detail: 'Chương trình, syllabus, lịch khai giảng, học viên, chứng nhận.' },
  { icon: 'receipt_long', title: 'Bán hàng', detail: 'Đơn hàng, thanh toán, mã giảm giá.' },
  { icon: 'event_available', title: 'Trị liệu', detail: 'Lịch hẹn, dịch vụ, chuyên viên, khung giờ.' },
  { icon: 'article', title: 'Nội dung', detail: 'Bài viết, trang tĩnh, FAQ, ngôn ngữ, SEO.' },
  { icon: 'person_search', title: 'Khách hàng', detail: 'Lead, yêu cầu doanh nghiệp, phễu chuyển đổi.' },
]

/** Where learners sign in — the public site this console manages. */
const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://stretch.vn').replace(/\/$/, '')

function validate() {
  errors.email = ''
  errors.password = ''
  if (!email.value.trim()) errors.email = 'Cần nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.email = 'Email chưa đúng dạng.'
  if (!password.value) errors.password = 'Cần nhập mật khẩu.'
  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  errorMessage.value = ''
  const result = await authStore.login(email.value.trim(), password.value)
  loading.value = false
  if (result.success) {
    notify.success(`Đăng nhập thành công. Chào ${authStore.user?.name || 'bạn'}!`)
    const next = typeof route.query.next === 'string' ? route.query.next : null
    router.push(next || { name: 'Dashboard' })
  } else {
    errorMessage.value = result.message
    notify.error(result.message)
  }
}
</script>
