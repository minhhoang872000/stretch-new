<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import DataTable from '~/components/ui/DataTable.vue'
import FormField from '~/components/ui/FormField.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import StatTile from '~/components/ui/StatTile.vue'
import type { Column } from '~/components/ui/tableTypes'
import { api } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { date, fold } from '~/utils/format'
import type { Certificate, Course, Learner } from '~/types'

/**
 * Certificates: issue, look up by code, revoke.
 *
 * The code is the whole point — it is what the public `/certificates/<code>` page
 * verifies, so it is shown in the tabular face and is the first thing searchable.
 * Revoking is kept as a distinct action from deleting: a revoked certificate must
 * stay on the record, because someone out there is holding a copy of it.
 */
const { push } = useToast()

const certificates = ref<Certificate[]>([])
const courses = ref<Course[]>([])
const learners = ref<Learner[]>([])
const loading = ref(true)
const query = ref('')

const issuing = ref(false)
const issueLearnerId = ref('')
const issueCourseId = ref('')
const revoking = ref<Certificate | null>(null)

onMounted(async () => {
  const [list, courseList, learnerList] = await Promise.all([
    api.listCertificates(),
    api.listCourses(),
    api.listLearners(),
  ])
  certificates.value = list
  courses.value = courseList
  learners.value = learnerList
  issueLearnerId.value = learnerList[0]?.id ?? ''
  issueCourseId.value = courseList[0]?.id ?? ''
  loading.value = false
})

const rows = computed(() => {
  const term = fold(query.value.trim())
  if (!term) return certificates.value
  return certificates.value.filter(
    (c) => fold(c.code).includes(term) || fold(c.learnerName).includes(term) || fold(c.courseTitle).includes(term),
  )
})

const validCount = computed(() => certificates.value.filter((c) => !c.revokedAt).length)
const revokedCount = computed(() => certificates.value.filter((c) => c.revokedAt).length)

const columns: Column[] = [
  { key: 'code', label: 'Mã tra cứu', sortable: true, width: 'w-44' },
  { key: 'learnerName', label: 'Học viên', sortable: true },
  { key: 'courseTitle', label: 'Chương trình', hideOnMobile: true },
  { key: 'issuedAt', label: 'Ngày cấp', sortable: true, width: 'w-28' },
  { key: 'state', label: 'Trạng thái', width: 'w-32' },
  { key: 'actions', label: '', width: 'w-28' },
]

async function issue() {
  const created = await api.issueCertificate(issueLearnerId.value, issueCourseId.value)
  certificates.value = await api.listCertificates()
  issuing.value = false
  push(created ? `Đã cấp chứng nhận ${created.code}.` : 'Không cấp được chứng nhận.', created ? 'good' : 'bad')
}

async function confirmRevoke() {
  if (!revoking.value) return
  await api.revokeCertificate(revoking.value.id)
  certificates.value = await api.listCertificates()
  push(`Đã thu hồi ${revoking.value.code}.`, 'good')
  revoking.value = null
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    push('Đã sao chép mã.', 'good')
  } catch {
    push(code, 'info', 6000)
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Chứng nhận"
      hint="Mã tra cứu là thứ học viên đưa cho bên thứ ba. Thu hồi vẫn giữ lại bản ghi — bản in ngoài kia không tự mất đi."
    >
      <template #actions>
        <AppButton variant="primary" icon="plus" @click="issuing = true">Cấp chứng nhận</AppButton>
      </template>
    </PageHeader>

    <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatTile label="Đã cấp" :value="certificates.length" icon="award" />
      <StatTile label="Còn hiệu lực" :value="validCount" icon="check" />
      <StatTile label="Đã thu hồi" :value="revokedCount" icon="x" />
    </div>

    <div class="mb-3">
      <label class="relative block max-w-xs">
        <AppIcon name="search" :size="15" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-muted" />
        <AppInput v-model="query" placeholder="Tìm theo mã, học viên, khóa…" class="pl-8" />
      </label>
    </div>

    <AppCard :padded="false">
      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :page-size="12"
        empty-title="Không có chứng nhận nào khớp"
        empty-hint="Thử từ khoá khác, hoặc cấp chứng nhận mới."
      >
        <template #cell-code="{ row }">
          <button
            type="button"
            class="t-fast figure inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy hover:text-accent-text"
            @click="copyCode(String(row.code))"
          >
            {{ row.code }}
            <AppIcon name="link" :size="12" label="Sao chép mã" />
          </button>
        </template>

        <template #cell-issuedAt="{ row }">
          <span class="figure text-[12px] text-ink-soft">{{ date(row.issuedAt as string) }}</span>
        </template>

        <template #cell-state="{ row }">
          <AppBadge :tone="row.revokedAt ? 'bad' : 'good'">
            {{ row.revokedAt ? 'Đã thu hồi' : 'Còn hiệu lực' }}
          </AppBadge>
        </template>

        <template #cell-actions="{ row }">
          <AppButton
            v-if="!row.revokedAt"
            size="sm"
            variant="ghost"
            icon="x"
            @click="revoking = row as unknown as Certificate"
          >
            Thu hồi
          </AppButton>
        </template>
      </DataTable>
    </AppCard>

    <!-- ══ Issue ══ -->
    <AppModal :open="issuing" title="Cấp chứng nhận" @close="issuing = false">
      <div class="grid gap-3.5">
        <FormField label="Học viên" for="cert-learner">
          <AppSelect
            id="cert-learner"
            v-model="issueLearnerId"
            :options="learners.map((l) => ({ value: l.id, label: `${l.name} — ${l.email}` }))"
          />
        </FormField>

        <FormField label="Chương trình" for="cert-course">
          <AppSelect
            id="cert-course"
            v-model="issueCourseId"
            :options="courses.map((c) => ({ value: c.id, label: c.title }))"
          />
        </FormField>

        <p class="flex items-start gap-1.5 rounded-lg bg-info-bg px-2.5 py-2 text-[11.5px] leading-relaxed text-navy-light">
          <AppIcon name="info" :size="13" class="mt-px" />
          Bình thường chứng nhận được cấp tự động khi học viên đạt 100%. Cấp tay dùng cho workshop trực tiếp,
          hoặc khi cần cấp lại.
        </p>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="issuing = false">Huỷ</AppButton>
        <AppButton variant="primary" @click="issue">Cấp chứng nhận</AppButton>
      </template>
    </AppModal>

    <!-- ══ Revoke — destructive, so it asks ══ -->
    <AppModal :open="!!revoking" title="Thu hồi chứng nhận?" @close="revoking = null">
      <div v-if="revoking">
        <p class="text-[13px] leading-relaxed text-ink-soft">
          Mã <span class="figure font-semibold text-navy">{{ revoking.code }}</span> của
          <span class="font-semibold text-navy">{{ revoking.learnerName }}</span>
          sẽ báo “đã thu hồi” khi ai đó tra cứu. Bản ghi vẫn được giữ lại.
        </p>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="revoking = null">Không thu hồi</AppButton>
        <AppButton variant="danger" icon="x" @click="confirmRevoke">Thu hồi</AppButton>
      </template>
    </AppModal>
  </div>
</template>
