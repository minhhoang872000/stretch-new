<template>
  <main class="page">
    <PageHeader
      eyebrow="Bán hàng"
      title="Đơn hàng"
      subtitle="Site chưa có cổng thanh toán — nút ghi danh chỉ gửi yêu cầu. Đơn ở đây được xác nhận tay, thu tiền xong thì mở quyền học."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Tạo đơn
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <StatTile label="Đã thu" :value="vnd(stats.paid)" icon="payments" tone="ok" :hint="`${stats.paidCount} đơn`" />
      <StatTile label="Chờ thu" :value="vnd(stats.pending)" icon="hourglass_top" :tone="stats.pendingCount ? 'warn' : 'neutral'" :hint="`${stats.pendingCount} đơn`" />
      <StatTile label="Đã hoàn" :value="vnd(stats.refunded)" icon="undo" :tone="stats.refunded ? 'danger' : 'neutral'" />
      <StatTile label="Giá trị đơn bình quân" :value="vnd(stats.avg)" icon="functions" tone="accent" />
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
      :selected="selected"
      :all-selected="allOnPageSelected"
      selectable
      clickable
      search-placeholder="Tìm theo mã đơn, khách, email…"
      empty-icon="receipt_long"
      empty-title="Không có đơn nào khớp"
      @update:query="query = $event"
      @update:page="page = $event"
      @sort="toggleSort"
      @reset="reset"
      @row-click="open"
      @toggle-row="toggleRow"
      @toggle-page="togglePage"
      @clear-selection="clearSelection"
    >
      <template #filters>
        <select v-model="filters.status" class="select w-40" aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          <option v-for="o in ORDER_STATUSES" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-model="filters.method" class="select w-36" aria-label="Lọc theo hình thức">
          <option value="">Mọi hình thức</option>
          <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <select v-model="filters.programId" class="select w-52" aria-label="Lọc theo chương trình">
          <option value="">Mọi chương trình</option>
          <option v-for="p in db.list('programs')" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </template>

      <template #bulk>
        <button type="button" class="btn-secondary btn-sm" @click="bulkPaid">Đánh dấu đã thu</button>
        <button type="button" class="btn-ghost btn-sm" @click="bulk('cancelled')">Huỷ đơn</button>
      </template>

      <template #cell-code="{ row }">
        <p class="font-mono text-xs font-semibold text-ink">{{ row.code }}</p>
        <p class="meta">{{ dateTime(row.createdAt) }}</p>
      </template>

      <template #cell-customer="{ row }">
        <p class="font-semibold text-ink truncate max-w-[18ch]">{{ row.customer }}</p>
        <p class="meta truncate max-w-[22ch]">{{ row.email }}</p>
      </template>

      <template #cell-programTitle="{ row }">
        <p class="truncate max-w-[24ch]">{{ row.programTitle }}</p>
        <p v-if="row.couponCode" class="meta">
          <span class="chip chip-accent font-mono">{{ row.couponCode }}</span>
          −{{ vnd(row.discount) }}
        </p>
      </template>

      <template #cell-total="{ row }">
        <p class="num font-bold text-ink">{{ vnd(row.total) }}</p>
        <p v-if="row.discount" class="num meta line-through">{{ vnd(row.subtotal) }}</p>
      </template>

      <template #cell-method="{ row }">
        <span class="chip">{{ labelOf(PAYMENT_METHODS, row.method) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusPill :status="row.status" :label="row.status === 'pending' ? 'Chờ thanh toán' : ''" />
        <p v-if="row.status === 'paid' && !row.enrolled" class="meta text-warn mt-0.5">chưa mở quyền học</p>
      </template>

      <template #row-actions="{ row }">
        <button
          v-if="row.status === 'pending'"
          type="button"
          class="btn-secondary btn-sm"
          @click="markPaid(row)"
        >Đã thu</button>
        <button v-else type="button" class="btn-ghost btn-sm btn-icon" aria-label="Mở chi tiết đơn" @click="open(row)">
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </template>
    </DataTable>

    <!-- Detail / editor --------------------------------------------------- -->
    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Đơn hàng"
      :title="form.code || 'Đơn mới'"
      :subtitle="form.customer"
      size="lg"
    >
      <div class="space-y-4">
        <div v-if="form.id" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="panel-quiet px-2.5 py-2">
            <p class="label-xs">Trạng thái</p>
            <StatusPill :status="form.status" :label="form.status === 'pending' ? 'Chờ thanh toán' : ''" class="mt-1" />
          </div>
          <div class="panel-quiet px-2.5 py-2">
            <p class="label-xs">Số tiền</p>
            <p class="num text-sm font-bold text-ink mt-0.5">{{ vnd(form.total) }}</p>
          </div>
          <div class="panel-quiet px-2.5 py-2">
            <p class="label-xs">Tạo lúc</p>
            <p class="text-xs text-ink mt-0.5">{{ dateTime(form.createdAt) }}</p>
          </div>
          <div class="panel-quiet px-2.5 py-2">
            <p class="label-xs">Thu lúc</p>
            <p class="text-xs text-ink mt-0.5">{{ form.paidAt ? dateTime(form.paidAt) : '—' }}</p>
          </div>
        </div>

        <div class="space-y-3.5">
          <FormRow label="Học viên" required>
            <template #default="{ id }">
              <select :id="id" v-model="form.learnerId" class="select" data-autofocus @change="syncLearner">
                <option v-for="l in db.list('learners')" :key="l.id" :value="l.id">
                  {{ l.name }} — {{ l.email }}
                </option>
              </select>
            </template>
          </FormRow>

          <FormRow label="Chương trình" required>
            <template #default="{ id }">
              <select :id="id" v-model="form.programId" class="select" @change="syncProgram">
                <option v-for="p in sellable" :key="p.id" :value="p.id">
                  {{ p.title }} — {{ vnd(p.price) }}
                </option>
              </select>
            </template>
          </FormRow>

          <div class="grid grid-cols-2 gap-3">
            <FormRow label="Mã giảm giá">
              <template #default="{ id }">
                <select :id="id" v-model="form.couponCode" class="select" @change="recalc">
                  <option :value="null">Không dùng</option>
                  <option v-for="c in activeCoupons" :key="c.id" :value="c.code">
                    {{ c.code }} — {{ c.type === 'percent' ? `${c.value}%` : vnd(c.value) }}
                  </option>
                </select>
              </template>
            </FormRow>
            <FormRow label="Hình thức thu">
              <template #default="{ id }">
                <select :id="id" v-model="form.method" class="select">
                  <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
              </template>
            </FormRow>
          </div>

          <div class="panel-quiet p-3">
            <dl class="space-y-1.5 text-[0.8125rem]">
              <div class="flex justify-between">
                <dt class="text-ink-2">Giá gốc</dt>
                <dd class="num text-ink">{{ vnd(form.subtotal) }}</dd>
              </div>
              <div v-if="form.discount" class="flex justify-between">
                <dt class="text-ink-2">Giảm ({{ form.couponCode }})</dt>
                <dd class="num text-danger">−{{ vnd(form.discount) }}</dd>
              </div>
              <div class="flex justify-between pt-1.5 border-t border-line">
                <dt class="font-bold text-ink">Phải thu</dt>
                <dd class="num font-bold text-ink">{{ vnd(form.total) }}</dd>
              </div>
            </dl>
          </div>

          <FormRow label="Ghi chú">
            <template #default="{ id }">
              <textarea :id="id" v-model="form.note" rows="2" class="input" />
            </template>
          </FormRow>
        </div>

        <div v-if="form.id && form.status === 'paid'" class="panel-quiet p-3">
          <p class="text-[0.8125rem] font-bold text-ink">Quyền học</p>
          <p class="meta mt-0.5">
            {{ form.enrolled
              ? 'Đơn này đã mở quyền học cho học viên.'
              : 'Đơn đã thu nhưng chưa mở quyền học — mở ngay để học viên vào được khoá.' }}
          </p>
          <button
            v-if="!form.enrolled"
            type="button"
            class="btn-secondary btn-sm mt-2"
            @click="grantAccess"
          >Mở quyền học</button>
        </div>
      </div>

      <template #footer>
        <button
          v-if="form.id && form.status === 'paid'"
          type="button"
          class="btn-danger btn-sm mr-auto"
          @click="refund"
        >Hoàn tiền</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button v-if="form.status === 'pending'" type="button" class="btn-secondary" @click="markPaid(form)">
          Đánh dấu đã thu
        </button>
        <button type="button" class="btn-primary" @click="submit">Lưu đơn</button>
      </template>
    </SlideOver>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatTile from '@/components/ui/StatTile.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import { vnd, dateTime, labelOf } from '@/utils/format.js'
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/data/mock/commerce.js'

const route = useRoute()
const notify = useNotify()

const {
  db, all, rows, loading, total, query, filters, sort, page, pageCount, activeFilterCount,
  selected, allOnPageSelected, toggleSort, reset, toggleRow, togglePage, clearSelection,
  save, patch, bulkPatch,
} = useResource('orders', {
  searchFields: ['code', 'customer', 'email', 'phone', 'programTitle'],
  filters: { status: route.query.status || '', method: '', programId: '' },
  sort: { key: 'createdAt', dir: 'desc' },
  pageSize: 15,
})

const columns = [
  { key: 'code', label: 'Đơn', sortable: true, width: '11rem' },
  { key: 'customer', label: 'Khách', sortable: true },
  { key: 'programTitle', label: 'Chương trình', sortable: true },
  { key: 'total', label: 'Số tiền', align: 'right', sortable: true, width: '9rem' },
  { key: 'method', label: 'Hình thức', width: '8rem' },
  { key: 'status', label: 'Trạng thái', width: '9rem' },
]

const sellable = computed(() => db.list('programs').filter((p) => p.status === 'published'))
const activeCoupons = computed(() => db.list('coupons').filter((c) => c.status === 'active'))

const stats = computed(() => {
  const list = all.value
  const paid = list.filter((o) => o.status === 'paid')
  const pending = list.filter((o) => o.status === 'pending')
  return {
    paid: paid.reduce((s, o) => s + o.total, 0),
    paidCount: paid.length,
    pending: pending.reduce((s, o) => s + o.total, 0),
    pendingCount: pending.length,
    refunded: list.filter((o) => o.status === 'refunded').reduce((s, o) => s + o.total, 0),
    avg: paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0,
  }
})

// ── editor ──────────────────────────────────────────────────────────
const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  const learner = db.list('learners')[0]
  const program = sellable.value[0]
  return {
    id: null,
    code: '',
    learnerId: learner?.id || '',
    customer: learner?.name || '',
    email: learner?.email || '',
    phone: learner?.phone || '',
    programId: program?.id || '',
    programTitle: program?.title || '',
    quantity: 1,
    subtotal: program?.price || 0,
    couponCode: null,
    discount: 0,
    total: program?.price || 0,
    method: 'transfer',
    status: 'pending',
    createdAt: new Date().toISOString(),
    paidAt: null,
    enrolled: false,
    note: '',
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function open(row) {
  form.value = { ...row }
  panelOpen.value = true
}

function syncLearner() {
  const learner = db.find('learners', form.value.learnerId)
  if (!learner) return
  form.value.customer = learner.name
  form.value.email = learner.email
  form.value.phone = learner.phone
}

function syncProgram() {
  const program = db.find('programs', form.value.programId)
  if (!program) return
  form.value.programTitle = program.title
  form.value.subtotal = program.price
  recalc()
}

/** Coupon maths lives in one place so the panel total and the saved row agree. */
function recalc() {
  const coupon = db.list('coupons').find((c) => c.code === form.value.couponCode)
  const subtotal = form.value.subtotal || 0
  let discount = 0
  if (coupon) {
    discount = coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      discount = 0
      notify.warn(`Mã ${coupon.code} cần đơn tối thiểu ${vnd(coupon.minSpend)}.`)
      form.value.couponCode = null
    }
  }
  form.value.discount = discount
  form.value.total = Math.max(0, subtotal - discount)
}

function submit() {
  if (!form.value.learnerId || !form.value.programId) {
    notify.warn('Cần chọn học viên và chương trình.')
    return
  }
  const row = { ...form.value }
  if (!row.code) row.code = `SO-${26000 + all.value.length * 13}`
  save(row)
  panelOpen.value = false
  notify.success('Đã lưu đơn hàng.')
}

/**
 * Marking paid does three things at once, which is exactly why it is one
 * button: record the payment, open access, and log it.
 */
function markPaid(row) {
  const paidAt = new Date().toISOString()
  patch(row.id, { status: 'paid', paidAt })
  db.save('payments', {
    orderId: row.id,
    orderCode: row.code,
    customer: row.customer,
    amount: row.total,
    method: row.method,
    reference: row.method === 'transfer' ? 'Xác nhận tay' : '—',
    status: 'settled',
    reconciled: false,
    receivedAt: paidAt,
    note: 'Xác nhận từ bảng điều khiển.',
  })
  grantAccessFor(row)
  if (form.value.id === row.id) form.value = { ...db.find('orders', row.id) }
  notify.success(`Đã ghi nhận thu ${vnd(row.total)} và mở quyền học.`)
}

function grantAccessFor(order) {
  const program = db.find('programs', order.programId)
  const learner = db.find('learners', order.learnerId)
  if (!program || !learner) return
  const existing = db.list('enrolments').find(
    (e) => e.learnerId === learner.id && e.programId === program.id,
  )
  if (existing) {
    db.patch('enrolments', existing.id, { status: 'active' })
  } else {
    db.save('enrolments', {
      learnerId: learner.id,
      learnerName: learner.name,
      programId: program.id,
      programTitle: program.title,
      mode: program.mode,
      status: 'active',
      percent: 0,
      lessonsDone: 0,
      lessons: program.lessons,
      source: 'order',
      startedAt: new Date().toISOString().slice(0, 10),
      lastLessonAt: new Date().toISOString(),
      completedAt: null,
      quizAvg: 0,
      note: `Từ đơn ${order.code}.`,
    })
  }
  db.patch('orders', order.id, { enrolled: true })
}

function grantAccess() {
  grantAccessFor(form.value)
  form.value.enrolled = true
  notify.success('Đã mở quyền học cho học viên.')
}

function refund() {
  const paidAt = new Date().toISOString()
  patch(form.value.id, { status: 'refunded', enrolled: false, note: 'Hoàn tiền từ bảng điều khiển.' })
  db.save('payments', {
    orderId: form.value.id,
    orderCode: form.value.code,
    customer: form.value.customer,
    amount: -form.value.total,
    method: form.value.method,
    reference: 'Hoàn tiền',
    status: 'refunded',
    reconciled: false,
    receivedAt: paidAt,
    note: 'Hoàn tiền, đồng thời thu hồi quyền học.',
  })
  const enrolment = db.list('enrolments').find(
    (e) => e.learnerId === form.value.learnerId && e.programId === form.value.programId,
  )
  if (enrolment) db.patch('enrolments', enrolment.id, { status: 'revoked', note: 'Thu hồi vì hoàn tiền đơn hàng.' })
  form.value.status = 'refunded'
  notify.success('Đã hoàn tiền và thu hồi quyền học.')
}

function bulkPaid() {
  const ids = [...selected.value]
  for (const id of ids) {
    const row = db.find('orders', id)
    if (row && row.status === 'pending') markPaid(row)
  }
  clearSelection()
}

async function bulk(status) {
  const n = await bulkPatch({ status })
  notify.success(`Đã cập nhật ${n} đơn.`)
}
</script>
