<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import ProgressMeter from '~/components/ui/ProgressMeter.vue'
import { api, WATCHED_THRESHOLD } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { clock, date } from '~/utils/format'
import type { Certificate, Course, Enrolment, Learner, LessonProgress } from '~/types'

/**
 * One learner, everything about them on one page: what they bought, how far they
 * got, which lesson they are stuck on, and the internal note.
 *
 * The per-lesson watch list is the useful part — "60% xong" says little, "dừng ở
 * phút 7 của bài Cấu trúc & cơ chế" is something an instructor can act on.
 */
const route = useRoute()
const router = useRouter()
const { push } = useToast()

type EnrolmentRow = Enrolment & { courseTitle: string }

const learner = ref<Learner | null>(null)
const enrolments = ref<EnrolmentRow[]>([])
const certificates = ref<Certificate[]>([])
const progress = ref<LessonProgress[]>([])
const courses = ref<Course[]>([])
const loading = ref(true)
const note = ref('')
const savingNote = ref(false)
const grantCourseId = ref('')

async function load() {
  const [detail, courseList] = await Promise.all([
    api.getLearner(String(route.params.id)),
    api.listCourses(),
  ])
  courses.value = courseList
  grantCourseId.value = courseList[0]?.id ?? ''
  if (detail) {
    learner.value = detail.learner
    enrolments.value = detail.enrolments
    certificates.value = detail.certificates
    progress.value = detail.progress
    note.value = detail.learner.note
  }
  loading.value = false
}

onMounted(load)

const STATUS: Record<string, { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' }> = {
  active: { label: 'Đang học', tone: 'warn' },
  completed: { label: 'Hoàn thành', tone: 'good' },
  revoked: { label: 'Đã thu hồi', tone: 'bad' },
}

const SOURCE: Record<string, string> = {
  manual: 'Cấp tay',
  checkout: 'Qua thanh toán',
  free: 'Miễn phí',
}

/** The lessons this learner has touched, newest course first. */
const watchRows = computed(() =>
  progress.value
    .map((row) => {
      const course = courses.value.find((c) => c.id === row.courseId)
      const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === row.lessonId)
      const percent = row.durationSeconds ? Math.round((row.watchedSeconds / row.durationSeconds) * 100) : 0
      return {
        ...row,
        courseTitle: course?.title ?? '—',
        lessonTitle: lesson?.title ?? row.lessonId,
        percent,
        stuck: !row.completedAt && percent < WATCHED_THRESHOLD,
      }
    })
    .sort((a, b) => Number(b.stuck) - Number(a.stuck)),
)

const stuckRows = computed(() => watchRows.value.filter((r) => r.stuck))

async function saveNote() {
  if (!learner.value) return
  savingNote.value = true
  await api.saveLearnerNote(learner.value.id, note.value)
  savingNote.value = false
  push('Đã lưu ghi chú.', 'good')
}

async function grant() {
  if (!learner.value || !grantCourseId.value) return
  await api.grantAccess(learner.value.id, grantCourseId.value)
  await load()
  push('Đã cấp quyền học.', 'good')
}

async function revoke(enrolment: EnrolmentRow) {
  await api.revokeAccess(enrolment.id)
  await load()
  push(`Đã thu hồi quyền “${enrolment.courseTitle}”.`, 'good')
}

async function issueCertificate(enrolment: EnrolmentRow) {
  await api.issueCertificate(enrolment.learnerId, enrolment.courseId)
  await load()
  push('Đã cấp chứng nhận.', 'good')
}

const hasCertificate = (courseId: string) =>
  certificates.value.some((c) => c.courseId === courseId && !c.revokedAt)
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <div class="h-8 w-52 animate-pulse rounded bg-track" />
      <div class="h-32 animate-pulse rounded-xl bg-track" />
    </div>

    <EmptyState v-else-if="!learner" icon="warning" title="Không tìm thấy học viên">
      <template #action><AppButton @click="router.push('/learners')">Về danh sách</AppButton></template>
    </EmptyState>

    <template v-else>
      <RouterLink to="/learners" class="t-fast mb-2 inline-flex items-center gap-1 text-[12px] font-semibold text-navy-light hover:text-accent-text">
        <AppIcon name="chevronLeft" :size="13" />
        Danh sách học viên
      </RouterLink>

      <PageHeader :title="learner.name" :hint="learner.email">
        <template #actions>
          <AppBadge v-if="learner.google" tone="neutral">Đăng nhập Google</AppBadge>
          <AppBadge tone="neutral">Tham gia {{ date(learner.joinedAt) }}</AppBadge>
        </template>
      </PageHeader>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div class="flex flex-col gap-4">
          <!-- ══ Enrolments ══ -->
          <AppCard title="Khóa đã đăng ký" :padded="false">
            <ul v-if="enrolments.length" class="divide-y divide-line">
              <li v-for="item in enrolments" :key="item.id" class="p-4">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-navy">{{ item.courseTitle }}</p>
                  <AppBadge :tone="STATUS[item.status].tone">{{ STATUS[item.status].label }}</AppBadge>
                  <AppBadge tone="neutral">{{ SOURCE[item.source] }}</AppBadge>
                </div>

                <div class="mt-2 max-w-sm">
                  <ProgressMeter :value="item.percent" :label="`Tiến độ ${item.courseTitle}`" />
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="figure text-[11.5px] text-ink-muted">Đăng ký {{ date(item.enrolledAt) }}</span>
                  <AppButton
                    v-if="item.percent === 100 && !hasCertificate(item.courseId)"
                    size="sm"
                    variant="secondary"
                    icon="award"
                    @click="issueCertificate(item)"
                  >
                    Cấp chứng nhận
                  </AppButton>
                  <AppButton
                    v-if="item.status !== 'revoked'"
                    size="sm"
                    variant="ghost"
                    icon="x"
                    @click="revoke(item)"
                  >
                    Thu hồi quyền
                  </AppButton>
                </div>
              </li>
            </ul>

            <EmptyState v-else icon="book" title="Chưa đăng ký khóa nào" hint="Cấp quyền ở khung bên phải." />
          </AppCard>

          <!-- ══ Per-lesson watch record ══ -->
          <AppCard
            title="Chi tiết theo bài học"
            :hint="`${watchRows.length} bài đã mở · ${stuckRows.length} bài đang dừng giữa`"
            :padded="false"
          >
            <ul v-if="watchRows.length" class="divide-y divide-line">
              <li v-for="row in watchRows" :key="`${row.courseId}-${row.lessonId}`" class="flex flex-wrap items-center gap-3 px-4 py-3">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[12.5px] text-ink">{{ row.lessonTitle }}</p>
                  <p class="truncate text-[11px] text-ink-muted">{{ row.courseTitle }}</p>
                </div>

                <span class="figure w-24 shrink-0 text-right text-[11.5px] text-ink-soft">
                  {{ clock(row.watchedSeconds) }} / {{ clock(row.durationSeconds) }}
                </span>

                <div class="w-28 shrink-0">
                  <ProgressMeter :value="row.percent" size="sm" :mark="WATCHED_THRESHOLD" :label="`Đã xem ${row.lessonTitle}`" />
                </div>

                <AppBadge v-if="row.completedAt" tone="good">Xong</AppBadge>
                <AppBadge v-else tone="warn">Đang dừng</AppBadge>
              </li>
            </ul>

            <EmptyState
              v-else
              icon="video"
              title="Chưa xem bài nào"
              hint="Khi học viên bắt đầu xem, từng bài sẽ hiện ở đây kèm chỗ họ dừng lại."
            />
          </AppCard>
        </div>

        <div class="flex flex-col gap-4">
          <!-- ══ Grant ══ -->
          <AppCard title="Cấp quyền học" hint="Dùng khi khách đã chuyển khoản">
            <AppSelect
              v-model="grantCourseId"
              :options="courses.map((c) => ({ value: c.id, label: c.title }))"
            />
            <AppButton class="mt-2 w-full" variant="primary" icon="plus" @click="grant">Cấp quyền</AppButton>
          </AppCard>

          <!-- ══ Note ══ -->
          <AppCard title="Ghi chú nội bộ" hint="Học viên không thấy phần này">
            <textarea
              v-model="note"
              rows="4"
              placeholder="Ví dụ: chuyển khoản 18/08, xin hoá đơn công ty…"
              class="t-fast w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed hover:border-line-strong focus:border-accent-dark focus:outline-none"
            />
            <AppButton class="mt-2" size="sm" :loading="savingNote" @click="saveNote">Lưu ghi chú</AppButton>
          </AppCard>

          <!-- ══ Certificates ══ -->
          <AppCard title="Chứng nhận" :padded="false">
            <ul v-if="certificates.length" class="divide-y divide-line">
              <li v-for="cert in certificates" :key="cert.id" class="px-4 py-3">
                <p class="figure text-[12.5px] font-semibold text-navy">{{ cert.code }}</p>
                <p class="truncate text-[11.5px] text-ink-muted">{{ cert.courseTitle }}</p>
                <p class="mt-0.5 flex items-center gap-2">
                  <span class="figure text-[11px] text-ink-muted">{{ date(cert.issuedAt) }}</span>
                  <AppBadge v-if="cert.revokedAt" tone="bad">Đã thu hồi</AppBadge>
                  <AppBadge v-else tone="good">Còn hiệu lực</AppBadge>
                </p>
              </li>
            </ul>
            <EmptyState v-else icon="award" title="Chưa có chứng nhận" />
          </AppCard>
        </div>
      </div>
    </template>
  </div>
</template>
