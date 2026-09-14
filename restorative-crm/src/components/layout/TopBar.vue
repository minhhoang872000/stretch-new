<template>
  <header
    class="sticky top-0 z-bar h-14 shrink-0 bg-panel/90 backdrop-blur border-b border-line
           flex items-center gap-2 px-3 lg:px-5"
  >
    <button
      type="button"
      class="btn-ghost btn-icon lg:hidden"
      aria-label="Mở điều hướng"
      @click="layout.toggleSidebar"
    >
      <span class="material-symbols-outlined text-xl">menu</span>
    </button>

    <!-- Breadcrumb: says where you are and gives a way back up ---------- -->
    <nav aria-label="Đường dẫn" class="min-w-0 flex items-center gap-1.5 text-[0.8125rem]">
      <RouterLink to="/dashboard" class="text-ink-3 hover:text-accent transition-colors shrink-0">
        <span class="material-symbols-outlined text-lg align-middle">home</span>
        <span class="sr-only">Tổng quan</span>
      </RouterLink>
      <template v-for="(crumb, i) in crumbs" :key="i">
        <span class="text-ink-4 shrink-0" aria-hidden="true">/</span>
        <RouterLink
          v-if="crumb.to && i < crumbs.length - 1"
          :to="crumb.to"
          class="text-ink-3 hover:text-accent transition-colors truncate"
        >{{ crumb.label }}</RouterLink>
        <span v-else class="font-bold text-ink truncate" aria-current="page">{{ crumb.label }}</span>
      </template>
    </nav>

    <div class="ml-auto flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        class="btn-ghost btn-icon md:hidden"
        aria-label="Tìm nhanh"
        @click="layout.openPalette"
      >
        <span class="material-symbols-outlined text-xl">search</span>
      </button>

      <!-- Quick create ------------------------------------------------- -->
      <div class="relative">
        <button
          type="button"
          class="btn-primary btn-sm"
          :aria-expanded="openMenu === 'create'"
          @click="toggle('create')"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span class="hidden sm:inline">Tạo mới</span>
        </button>
        <div
          v-if="openMenu === 'create'"
          class="absolute right-0 mt-1.5 w-56 panel shadow-pop p-1 z-pop animate-fade-up"
        >
          <RouterLink
            v-for="item in quickCreate"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 h-9 px-2 rounded-md text-[0.8125rem] font-semibold
                   text-ink-2 hover:bg-panel-3 hover:text-ink transition-colors"
            @click="openMenu = null"
          >
            <span class="material-symbols-outlined text-lg text-ink-3">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <!-- Việc cần xử lý ---------------------------------------------- -->
      <div class="relative">
        <button
          type="button"
          class="btn-ghost btn-icon relative"
          :aria-label="`Việc cần xử lý (${totalTodo})`"
          :aria-expanded="openMenu === 'todo'"
          @click="toggle('todo')"
        >
          <span class="material-symbols-outlined text-xl">notifications</span>
          <span
            v-if="totalTodo"
            class="num absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full
                   bg-warn text-white text-[0.6rem] font-bold flex items-center justify-center"
          >{{ totalTodo > 99 ? '99+' : totalTodo }}</span>
        </button>

        <div
          v-if="openMenu === 'todo'"
          class="absolute right-0 mt-1.5 w-72 panel shadow-pop z-pop overflow-hidden animate-fade-up"
        >
          <p class="px-3 py-2 label-xs border-b border-line">Việc cần xử lý</p>
          <ul v-if="totalTodo" class="p-1">
            <li v-for="item in todo" :key="item.to">
              <RouterLink
                :to="item.to"
                class="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-panel-3 transition-colors"
                @click="openMenu = null"
              >
                <span class="material-symbols-outlined text-lg text-ink-3">{{ item.icon }}</span>
                <span class="text-[0.8125rem] text-ink-2 flex-1 min-w-0 truncate">{{ item.label }}</span>
                <span class="num chip chip-warn">{{ item.count }}</span>
              </RouterLink>
            </li>
          </ul>
          <p v-else class="px-3 py-6 text-center text-xs text-ink-3">
            Không còn việc nào đang chờ.
          </p>
        </div>
      </div>

      <div class="h-6 w-px bg-line mx-0.5 hidden sm:block" />

      <!-- Account ------------------------------------------------------ -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-panel-3 transition-colors"
          :aria-expanded="openMenu === 'account'"
          @click="toggle('account')"
        >
          <span
            class="w-7 h-7 rounded-full bg-accent-soft text-accent-ink text-2xs font-bold
                   flex items-center justify-center"
            aria-hidden="true"
          >{{ initials(auth.user?.name || 'Admin') }}</span>
          <span class="hidden sm:block text-xs font-bold text-ink max-w-[9rem] truncate">
            {{ auth.user?.name || 'Quản trị viên' }}
          </span>
          <span class="material-symbols-outlined text-base text-ink-3">expand_more</span>
        </button>

        <div
          v-if="openMenu === 'account'"
          class="absolute right-0 mt-1.5 w-60 panel shadow-pop z-pop overflow-hidden animate-fade-up"
        >
          <div class="px-3 py-2.5 border-b border-line">
            <p class="text-[0.8125rem] font-bold text-ink truncate">{{ auth.user?.name || 'Quản trị viên' }}</p>
            <p class="meta truncate">{{ auth.user?.email || 'admin@stretch.vn' }}</p>
          </div>
          <div class="p-1">
            <RouterLink
              to="/users"
              class="flex items-center gap-2.5 h-9 px-2 rounded-md text-[0.8125rem] font-semibold
                     text-ink-2 hover:bg-panel-3 hover:text-ink transition-colors"
              @click="openMenu = null"
            >
              <span class="material-symbols-outlined text-lg text-ink-3">manage_accounts</span>
              Người dùng &amp; quyền
            </RouterLink>
            <button
              type="button"
              class="w-full flex items-center gap-2.5 h-9 px-2 rounded-md text-[0.8125rem] font-semibold
                     text-danger hover:bg-danger-soft transition-colors"
              @click="askLogout = true"
            >
              <span class="material-symbols-outlined text-lg">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Sign-out confirm: an inline dialog instead of window.confirm ------ -->
  <Teleport to="body">
    <div v-if="askLogout" class="fixed inset-0 z-overlay flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-ink/30" @click="askLogout = false" />
      <div class="relative panel shadow-pop w-full max-w-sm p-4">
        <h2 class="text-base font-headline font-bold text-ink">Đăng xuất khỏi bảng điều khiển?</h2>
        <p class="mt-1.5 text-[0.8125rem] text-ink-2">
          Phiên làm việc sẽ kết thúc trên thiết bị này. Dữ liệu mẫu vẫn được giữ.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-ghost" @click="askLogout = false">Ở lại</button>
          <button type="button" class="btn-danger" @click="logout">Đăng xuất</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout.js'
import { useAuthStore } from '@/stores/auth.js'
import { useMockDb } from '@/stores/db.js'
import { useNotify } from '@/composables/useNotify.js'
import { navIndex, quickCreate } from '@/data/navigation.js'
import { initials } from '@/utils/format.js'

const route = useRoute()
const router = useRouter()
const layout = useLayoutStore()
const auth = useAuthStore()
const db = useMockDb()
const notify = useNotify()

const openMenu = ref(null)
const askLogout = ref(false)

const toggle = (name) => { openMenu.value = openMenu.value === name ? null : name }

/** Close on outside click and on navigation — a menu left open over a new
    screen is the classic admin-panel papercut. */
function onDocClick(event) {
  if (!event.target.closest('.relative')) openMenu.value = null
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
watch(() => route.fullPath, () => { openMenu.value = null })

/**
 * Breadcrumbs come from the nav index plus the route's own meta, so a detail
 * screen reads "Học viện / Chương trình / Giải phẫu ứng dụng".
 */
const crumbs = computed(() => {
  const out = []
  const base = [...navIndex]
    .filter((item) => route.path === item.path || route.path.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]

  if (base) {
    if (base.group && base.group !== 'Tổng quan') out.push({ label: base.group, to: null })
    out.push({ label: base.label, to: base.path })
  }
  if (route.meta?.crumb) out.push({ label: route.meta.crumb, to: null })
  else if (route.params.id || route.params.slug) {
    out.push({ label: String(route.params.id || route.params.slug), to: null })
  }
  if (!out.length) out.push({ label: route.meta?.title || 'Tổng quan', to: null })
  return out
})

const todo = computed(() =>
  [
    { label: 'Lịch hẹn chờ xác nhận', icon: 'event_available', count: db.counts.bookingsPending, to: '/bookings?status=pending' },
    { label: 'Đơn chờ thanh toán', icon: 'receipt_long', count: db.counts.ordersPending, to: '/sales/orders?status=pending' },
    { label: 'Đánh giá chờ duyệt', icon: 'reviews', count: db.counts.reviewsPending, to: '/academy/reviews?status=pending' },
    { label: 'Yêu cầu doanh nghiệp mới', icon: 'contact_mail', count: db.counts.enquiriesNew, to: '/enquiries?status=new' },
    { label: 'Bài học thiếu video', icon: 'movie', count: db.counts.videosMissing, to: '/academy/videos?status=missing' },
  ].filter((item) => item.count > 0),
)

const totalTodo = computed(() => todo.value.reduce((sum, item) => sum + item.count, 0))

function logout() {
  askLogout.value = false
  openMenu.value = null
  auth.logout()
  notify.info('Đã đăng xuất.')
  router.push({ name: 'Login' })
}
</script>
