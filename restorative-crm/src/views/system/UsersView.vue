<script setup>
import { computed, ref } from 'vue'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import ActionModal from '@/components/ui/ActionModal.vue'
import FormRow from '@/components/ui/FormRow.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { dateTime, ago, initials, labelOf } from '@/utils/format.js'
import { ROLES } from '@/data/mock/system.js'

/**
 * Console accounts and what each one is allowed to touch.
 *
 * These are STAFF accounts, deliberately separate from the learner accounts in
 * the academy module — a learner signing in on the public site must never land in
 * the same table as a manager who can refund an order.
 *
 * Roles are coarse on purpose: six named roles that map to how the studio
 * actually works, rather than a per-screen permission matrix nobody maintains.
 */
const notify = useNotify()

const {
  all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  toggleSort, reset, save, patch,
} = useResource('users', {
  searchFields: ['name', 'email', 'studio'],
  filters: { role: '', status: '' },
  sort: { key: 'name', dir: 'asc' },
  pageSize: 15,
})

const columns = [
  { key: 'name', label: 'Người dùng', sortable: true },
  { key: 'role', label: 'Quyền', width: '10rem' },
  { key: 'studio', label: 'Cơ sở', width: '8rem' },
  { key: 'twoFactor', label: '2FA', width: '6rem', align: 'center' },
  { key: 'lastLoginAt', label: 'Đăng nhập gần nhất', sortable: true, width: '12rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

const studios = computed(() => [...new Set(all.value.map((u) => u.studio).filter(Boolean))])

const stats = computed(() => {
  const list = all.value
  return {
    total: list.length,
    active: list.filter((u) => u.status === 'active').length,
    invited: list.filter((u) => u.status === 'invited').length,
    noTwoFactor: list.filter((u) => u.status === 'active' && !u.twoFactor).length,
  }
})

/** Roles that can move money or delete data — worth seeing at a glance. */
const privileged = computed(() => all.value.filter((u) => ['owner', 'manager'].includes(u.role)))

const modalOpen = ref(false)
const form = ref(blank())
const errors = ref({})

function blank() {
  return {
    id: null,
    name: '',
    email: '',
    role: 'therapist',
    studio: studios.value[0] || 'Quận 1',
    status: 'invited',
    twoFactor: false,
    lastLoginAt: null,
    createdAt: new Date().toISOString().slice(0, 10),
  }
}

function openInvite() {
  form.value = blank()
  errors.value = {}
  modalOpen.value = true
}

function openEdit(row) {
  form.value = { ...row }
  errors.value = {}
  modalOpen.value = true
}

const roleOf = (value) => ROLES.find((r) => r.value === value) || null

function submit() {
  const next = {}
  if (!form.value.name.trim()) next.name = 'Nhập tên người dùng.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.value.email.trim())) next.email = 'Email không hợp lệ.'
  const clash = all.value.find(
    (u) => u.email.toLowerCase() === form.value.email.trim().toLowerCase() && u.id !== form.value.id,
  )
  if (clash) next.email = 'Email này đã có tài khoản.'
  errors.value = next
  if (Object.keys(next).length) return

  const isNew = !form.value.id
  save({ ...form.value, email: form.value.email.trim().toLowerCase() })
  modalOpen.value = false
  notify.success(isNew ? `Đã gửi lời mời tới ${form.value.email}.` : 'Đã cập nhật tài khoản.')
}

function toggleSuspend(row) {
  const next = row.status === 'suspended' ? 'active' : 'suspended'
  patch(row.id, { status: next })
  notify.success(next === 'suspended' ? `Đã tạm ngưng ${row.name}.` : `Đã mở lại ${row.name}.`)
}

function resendInvite(row) {
  // No mail backend yet — say what would happen rather than pretending it did.
  notify.info(`Sẽ gửi lại lời mời tới ${row.email} khi dịch vụ email được nối.`)
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Hệ thống"
      title="Người dùng & quyền"
      subtitle="Tài khoản của nhân sự vận hành console. Khác hoàn toàn với tài khoản học viên bên học viện."
    />

    <div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Tài khoản" :value="stats.total" icon="group" :loading="loading" />
      <StatTile label="Đang hoạt động" :value="stats.active" icon="how_to_reg" tone="ok" :loading="loading" />
      <StatTile label="Chờ nhận lời mời" :value="stats.invited" icon="mail" tone="info" :loading="loading" />
      <StatTile
        label="Chưa bật 2FA"
        :value="stats.noTwoFactor"
        icon="shield_lock"
        :tone="stats.noTwoFactor ? 'warn' : 'ok'"
        :hint="stats.noTwoFactor ? 'Nên bắt buộc với quyền quản lý' : 'Tất cả đã bật'"
        :loading="loading"
      />
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :query="query"
      :sort="sort"
      :page="page"
      :page-count="pageCount"
      :active-filter-count="activeFilterCount"
      search-placeholder="Tìm theo tên, email, cơ sở…"
      empty-icon="person_off"
      empty-title="Không có tài khoản nào khớp"
      empty-hint="Thử bỏ một bộ lọc, hoặc mời người dùng mới."
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openInvite">
          <span class="material-symbols-outlined text-[18px]">person_add</span>
          Mời người dùng
        </button>
      </template>

      <template #filters>
        <select v-model="filters.role" class="input">
          <option value="">Mọi quyền</option>
          <option v-for="role in ROLES" :key="role.value" :value="role.value">{{ role.label }}</option>
        </select>

        <select v-model="filters.status" class="input">
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="invited">Đã mời</option>
          <option value="suspended">Tạm ngưng</option>
        </select>
      </template>

      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <Avatar :initials="initials(row.name)" />
          <div class="min-w-0">
            <p class="truncate font-semibold text-ink">{{ row.name }}</p>
            <p class="truncate text-xs text-ink-3">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <template #cell-role="{ row }">
        <span class="font-medium text-ink-2">{{ labelOf(ROLES, row.role) }}</span>
      </template>

      <template #cell-twoFactor="{ row }">
        <span
          class="material-symbols-outlined text-[18px]"
          :class="row.twoFactor ? 'text-ok' : 'text-ink-4'"
          :title="row.twoFactor ? 'Đã bật xác thực hai lớp' : 'Chưa bật xác thực hai lớp'"
        >
          {{ row.twoFactor ? 'verified_user' : 'remove' }}
        </span>
      </template>

      <template #cell-lastLoginAt="{ row }">
        <template v-if="row.lastLoginAt">
          <span class="num">{{ dateTime(row.lastLoginAt) }}</span>
          <span class="block text-xs text-ink-3">{{ ago(row.lastLoginAt) }}</span>
        </template>
        <span v-else class="text-ink-4">Chưa đăng nhập</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" />
      </template>

      <template #row-actions="{ row }">
        <button type="button" class="btn-ghost btn-sm" @click.stop="openEdit(row)">Sửa</button>
        <button
          v-if="row.status === 'invited'"
          type="button"
          class="btn-ghost btn-sm"
          @click.stop="resendInvite(row)"
        >
          Gửi lại lời mời
        </button>
        <button
          v-if="row.role !== 'owner'"
          type="button"
          class="btn-ghost btn-sm"
          :class="row.status === 'suspended' ? 'text-ok' : 'text-danger'"
          @click.stop="toggleSuspend(row)"
        >
          {{ row.status === 'suspended' ? 'Mở lại' : 'Tạm ngưng' }}
        </button>
      </template>
    </DataTable>

    <!-- ── Role reference: what each role can actually reach ── -->
    <SectionCard
      class="mt-5"
      title="Sáu quyền đang dùng"
      hint="Quyền theo vai trò thật trong studio, không phải bảng tick từng màn hình — bảng đó không ai bảo trì được."
    >
      <ul class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <li v-for="role in ROLES" :key="role.value" class="rounded-lg border border-line bg-panel-2 p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold text-ink">{{ role.label }}</p>
            <span class="num text-xs text-ink-3">
              {{ all.filter((u) => u.role === role.value).length }} người
            </span>
          </div>
          <p class="mt-1 text-xs leading-relaxed text-ink-2">{{ role.description }}</p>
          <p class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="scope in role.scopes"
              :key="scope"
              class="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3"
            >
              {{ scope }}
            </span>
          </p>
        </li>
      </ul>

      <p v-if="privileged.length" class="mt-3 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn">
        <span class="material-symbols-outlined text-[16px]">key</span>
        <span>
          {{ privileged.length }} tài khoản có quyền chạm vào tiền và xoá dữ liệu
          ({{ privileged.map((u) => u.name).join(', ') }}). Nên bật 2FA cho tất cả.
        </span>
      </p>
    </SectionCard>

    <!-- ── Invite / edit ── -->
    <ActionModal
      v-model:is-open="modalOpen"
      :title="form.id ? 'Sửa tài khoản' : 'Mời người dùng'"
      :submit-label="form.id ? 'Lưu' : 'Gửi lời mời'"
      @submit="submit"
    >
      <div class="grid gap-4">
        <FormRow label="Tên" required :error="errors.name">
          <input v-model="form.name" type="text" class="input" placeholder="Nguyễn Văn A" />
        </FormRow>

        <FormRow label="Email" required :error="errors.email" hint="Lời mời sẽ được gửi tới địa chỉ này.">
          <input v-model="form.email" type="email" class="input" placeholder="ten@stretch.vn" />
        </FormRow>

        <FormRow label="Quyền" :hint="roleOf(form.role)?.description">
          <select v-model="form.role" class="input">
            <option v-for="role in ROLES" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
        </FormRow>

        <FormRow label="Cơ sở" hint="Giới hạn dữ liệu người này thấy được.">
          <select v-model="form.studio" class="input">
            <option>Tất cả</option>
            <option v-for="studio in studios" :key="studio" :value="studio">{{ studio }}</option>
          </select>
        </FormRow>

        <FormRow label="Xác thực hai lớp" hint="Bắt buộc với quyền Chủ sở hữu và Quản lý.">
          <ToggleSwitch v-model="form.twoFactor" state-text />
        </FormRow>
      </div>
    </ActionModal>
  </div>
</template>
