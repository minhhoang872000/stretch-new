<template>
  <main v-if="!program" class="page-narrow">
    <div class="panel px-6 py-12 text-center">
      <p class="text-sm font-bold text-ink">Không tìm thấy chương trình</p>
      <p class="mt-1 text-xs text-ink-3">Có thể nó đã bị xoá khỏi dữ liệu mẫu.</p>
      <RouterLink to="/academy/programs" class="btn-primary mt-4">Về danh sách</RouterLink>
    </div>
  </main>

  <main v-else class="page">
    <PageHeader
      eyebrow="Học viện · Chương trình"
      :title="draft.title || 'Chương trình chưa đặt tên'"
      back-to="/academy/programs"
      back-label="Tất cả chương trình"
      :subtitle="`${draft.lessons} bài · ${duration(draft.minutes)} · ${program.enrolled} học viên đã ghi danh`"
    >
      <template #title-badge>
        <StatusPill :status="draft.status" />
        <span v-if="dirty" class="chip chip-warn">Chưa lưu</span>
      </template>
      <template #actions>
        <button v-if="dirty" type="button" class="btn-ghost btn-sm" @click="revert">Hoàn tác</button>
        <button
          v-if="draft.status !== 'published'"
          type="button"
          class="btn-outline btn-sm"
          @click="publish"
        >
          <span class="material-symbols-outlined text-lg">rocket_launch</span>
          Mở bán
        </button>
        <button type="button" class="btn-primary btn-sm" :disabled="!dirty" @click="persist">
          <span class="material-symbols-outlined text-lg">save</span>
          Lưu thay đổi
        </button>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-line mb-4 overflow-x-auto no-scrollbar" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="tab === t.id"
        class="h-9 px-3 text-[0.8125rem] font-bold border-b-2 -mb-px transition-colors whitespace-nowrap"
        :class="tab === t.id
          ? 'border-accent text-accent-ink'
          : 'border-transparent text-ink-3 hover:text-ink'"
        @click="tab = t.id"
      >
        {{ t.label }}
        <span v-if="t.count != null" class="num text-ink-4 ml-1">{{ t.count }}</span>
      </button>
    </div>

    <!-- ── Nội dung ─────────────────────────────────────────────────── -->
    <div v-if="tab === 'basics'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <SectionCard title="Thông tin cơ bản">
          <div class="space-y-3.5">
            <FormRow label="Tên chương trình" required>
              <template #default="{ id }">
                <input :id="id" v-model="draft.title" type="text" class="input" data-autofocus />
              </template>
            </FormRow>
            <FormRow label="Đường dẫn (slug)" hint="Trang sẽ là stretch.vn/learning-hub/programs/…">
              <template #default="{ id }">
                <input :id="id" v-model="draft.slug" type="text" class="input font-mono text-xs" />
              </template>
            </FormRow>
            <FormRow label="Mô tả ngắn" hint="Câu này xuất hiện dưới tên khoá ở trang danh sách.">
              <template #default="{ id }">
                <textarea :id="id" v-model="draft.subtitle" rows="2" class="input" />
              </template>
            </FormRow>
            <div class="grid grid-cols-2 gap-3">
              <FormRow label="Loại">
                <template #default="{ id }">
                  <select :id="id" v-model="draft.kind" class="select">
                    <option v-for="o in PROGRAM_KINDS" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                </template>
              </FormRow>
              <FormRow label="Chủ đề">
                <template #default="{ id }">
                  <select :id="id" v-model="draft.topic" class="select">
                    <option v-for="o in PROGRAM_TOPICS" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                </template>
              </FormRow>
              <FormRow label="Hình thức">
                <template #default="{ id }">
                  <select :id="id" v-model="draft.mode" class="select">
                    <option v-for="o in PROGRAM_MODES" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                </template>
              </FormRow>
              <FormRow label="Trình độ">
                <template #default="{ id }">
                  <select :id="id" v-model="draft.level" class="select">
                    <option>Cơ bản</option>
                    <option>Trung cấp</option>
                    <option>Nâng cao</option>
                  </select>
                </template>
              </FormRow>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Học xong làm được gì" hint="Mỗi dòng là một kết quả cụ thể, tránh câu chung chung.">
          <ul class="space-y-2">
            <li v-for="(_, i) in draft.outcomes" :key="i" class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg text-ok shrink-0">check_circle</span>
              <input v-model="draft.outcomes[i]" type="text" class="input" />
              <button
                type="button"
                class="btn-ghost btn-sm btn-icon shrink-0"
                aria-label="Xoá kết quả"
                @click="draft.outcomes.splice(i, 1)"
              >
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </li>
          </ul>
          <button type="button" class="btn-outline btn-sm mt-2.5" @click="draft.outcomes.push('')">
            <span class="material-symbols-outlined text-lg">add</span>
            Thêm dòng
          </button>
        </SectionCard>
      </div>

      <div class="space-y-4">
        <SectionCard title="Ảnh bìa">
          <img
            :src="draft.image"
            :alt="`Ảnh bìa ${draft.title}`"
            class="w-full aspect-[16/10] object-cover rounded-lg border border-line"
          />
          <input v-model="draft.image" type="url" class="input mt-2.5 font-mono text-xs" aria-label="Đường dẫn ảnh bìa" />
          <p class="field-hint">Dùng ảnh ngang, tối thiểu 1280×800.</p>
        </SectionCard>

        <SectionCard title="Giảng viên phụ trách">
          <select v-model="draft.instructorId" class="select" aria-label="Giảng viên">
            <option v-for="ins in instructors" :key="ins.id" :value="ins.id">
              {{ ins.name }} — {{ ins.role }}
            </option>
          </select>
          <div v-if="instructor" class="panel-quiet mt-2.5 p-2.5">
            <p class="text-xs font-bold text-ink">{{ instructor.name }}</p>
            <p class="meta mt-0.5">{{ instructor.bio }}</p>
          </div>
        </SectionCard>

        <SectionCard title="Chứng nhận">
          <ToggleSwitch v-model="draft.certificate" label="Cấp chứng nhận khi hoàn thành" state-text />
          <p class="field-hint">
            Bật cái này thì học viên phải đạt {{ settings.academy.passScore }}% bài kiểm tra mới được cấp.
          </p>
        </SectionCard>
      </div>
    </div>

    <!-- ── Syllabus ─────────────────────────────────────────────────── -->
    <div v-else-if="tab === 'syllabus'" class="space-y-3">
      <div class="panel px-3.5 py-2.5 flex flex-wrap items-center gap-3">
        <p class="text-xs text-ink-2">
          <span class="num font-bold text-ink">{{ draft.modules.length }}</span> chương ·
          <span class="num font-bold text-ink">{{ draft.lessons }}</span> bài ·
          <span class="num font-bold text-ink">{{ duration(draft.minutes) }}</span> ·
          <span class="num font-bold text-ink">{{ freeCount }}</span> bài học thử
        </p>
        <button type="button" class="btn-outline btn-sm ml-auto" @click="addModule">
          <span class="material-symbols-outlined text-lg">add</span>
          Thêm chương
        </button>
      </div>

      <SectionCard
        v-for="(module, mi) in draft.modules"
        :key="mi"
        flush
      >
        <template #actions>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon"
            :disabled="mi === 0"
            aria-label="Đưa chương lên trên"
            @click="moveModule(mi, -1)"
          >
            <span class="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon"
            :disabled="mi === draft.modules.length - 1"
            aria-label="Đưa chương xuống dưới"
            @click="moveModule(mi, 1)"
          >
            <span class="material-symbols-outlined text-lg">arrow_downward</span>
          </button>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon text-danger"
            aria-label="Xoá chương"
            @click="removeModule(mi)"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </template>

        <div class="px-3.5 py-3 border-b border-line-soft grid grid-cols-1 sm:grid-cols-[1fr,1fr] gap-3">
          <label class="block">
            <span class="field-label">Chương {{ mi + 1 }}</span>
            <input v-model="module.title" type="text" class="input" />
          </label>
          <label class="block">
            <span class="field-label">Ghi chú cho học viên</span>
            <input v-model="module.summary" type="text" class="input" />
          </label>
        </div>

        <ul class="divide-y divide-line-soft">
          <li
            v-for="(item, ii) in module.items"
            :key="ii"
            class="px-3.5 py-2 flex flex-wrap items-center gap-2"
          >
            <span class="num text-2xs text-ink-4 w-6 shrink-0">{{ ii + 1 }}.</span>
            <select v-model="item.type" class="select w-28 shrink-0" aria-label="Loại bài">
              <option v-for="t in LESSON_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <input v-model="item.title" type="text" class="input flex-1 min-w-[12rem]" aria-label="Tên bài" />
            <label class="flex items-center gap-1 shrink-0">
              <span class="sr-only">Số phút</span>
              <input v-model.number="item.minutes" type="number" min="1" class="input w-16 text-center" />
              <span class="meta">phút</span>
            </label>
            <label class="flex items-center gap-1.5 shrink-0" :title="'Cho xem trước khi ghi danh'">
              <input v-model="item.free" type="checkbox" class="checkbox" />
              <span class="text-2xs font-bold text-ink-3">Học thử</span>
            </label>
            <button
              v-if="item.type === 'video'"
              type="button"
              class="chip shrink-0 transition-colors"
              :class="item.videoId ? 'chip-ok hover:bg-ok/15' : 'chip-warn hover:bg-warn/15'"
              :title="item.videoId
                ? `Ordinal ${item.ordinal ?? '—'} — bấm để đổi video khác`
                : 'Chưa có video — bấm để chọn từ thư viện'"
              @click="openGallery(mi, ii)"
            >
              <span class="material-symbols-outlined text-[0.9rem]">
                {{ item.videoId ? 'cloud_done' : 'video_library' }}
              </span>
              {{ item.videoId ? `video #${item.ordinal ?? '—'}` : 'Chọn video' }}
            </button>
            <span v-else-if="item.type === 'quiz'" class="chip chip-info shrink-0">
              {{ (item.questions || []).length }} câu hỏi
            </span>
            <button
              type="button"
              class="btn-ghost btn-sm btn-icon shrink-0"
              aria-label="Xoá bài"
              @click="module.items.splice(ii, 1); recount()"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </li>
          <li v-if="!module.items.length" class="px-3.5 py-4">
            <p class="text-xs text-ink-3">Chương này chưa có bài nào.</p>
          </li>
        </ul>

        <div class="px-3.5 py-2.5 bg-panel-2 border-t border-line flex items-center gap-2">
          <button
            v-for="t in LESSON_TYPES"
            :key="t.value"
            type="button"
            class="btn-ghost btn-sm"
            @click="addItem(mi, t.value)"
          >
            <span class="material-symbols-outlined text-base">{{ t.icon }}</span>
            Thêm {{ t.label.toLowerCase() }}
          </button>
          <span class="meta ml-auto">{{ duration(moduleMinutes(module)) }}</span>
        </div>
      </SectionCard>

      <EmptyState
        v-if="!draft.modules.length"
        icon="list_alt"
        title="Chưa có chương nào"
        hint="Một khoá tối thiểu cần một chương và vài bài học."
      >
        <button type="button" class="btn-primary btn-sm" @click="addModule">Thêm chương đầu tiên</button>
      </EmptyState>
    </div>

    <!-- ── Giá & bán ────────────────────────────────────────────────── -->
    <div v-else-if="tab === 'pricing'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SectionCard title="Giá bán">
        <div class="space-y-3.5">
          <FormRow label="Giá (VNĐ)" hint="Để 0 nếu đây là khoá miễn phí làm phễu.">
            <template #default="{ id }">
              <input :id="id" v-model.number="draft.price" type="number" min="0" step="10000" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Giá gạch ngang" hint="Chỉ điền khi đang có khuyến mãi thật.">
            <template #default="{ id }">
              <input :id="id" v-model.number="draft.compareAtPrice" type="number" min="0" step="10000" class="input num" />
            </template>
          </FormRow>
          <FormRow label="Nhãn hiển thị" hint="Ví dụ: Bán chạy, Còn ít chỗ. Để trống nếu không cần.">
            <template #default="{ id }">
              <input :id="id" v-model="draft.badge" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Trạng thái">
            <template #default="{ id }">
              <select :id="id" v-model="draft.status" class="select">
                <option v-for="o in PROGRAM_STATUSES" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </template>
          </FormRow>
        </div>
      </SectionCard>

      <div class="space-y-4">
        <SectionCard title="Hiển thị trên site">
          <div class="panel-quiet p-3">
            <div class="flex items-start gap-3">
              <img :src="draft.image" alt="" class="w-20 h-16 rounded-md object-cover border border-line" />
              <div class="min-w-0">
                <p class="text-[0.8125rem] font-bold text-ink truncate">{{ draft.title }}</p>
                <p class="meta line-clamp-2">{{ draft.subtitle || 'Chưa có mô tả ngắn' }}</p>
                <p class="num text-sm font-bold text-accent mt-1">
                  {{ draft.price === 0 ? 'Miễn phí' : vnd(draft.price) }}
                  <span v-if="draft.compareAtPrice" class="num text-xs text-ink-4 line-through ml-1">
                    {{ vnd(draft.compareAtPrice) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <p class="field-hint">Đây là dạng thẻ mà trang danh sách chương trình đang render.</p>
        </SectionCard>

        <SectionCard title="Doanh số">
          <dl class="grid grid-cols-2 gap-2.5">
            <div class="panel-quiet px-2.5 py-2">
              <dt class="label-xs">Đơn đã thu</dt>
              <dd class="num text-sm font-bold text-ink mt-0.5">{{ programOrders.paid }}</dd>
            </div>
            <div class="panel-quiet px-2.5 py-2">
              <dt class="label-xs">Đơn chờ thu</dt>
              <dd class="num text-sm font-bold text-warn mt-0.5">{{ programOrders.pending }}</dd>
            </div>
            <div class="panel-quiet px-2.5 py-2">
              <dt class="label-xs">Đang học</dt>
              <dd class="num text-sm font-bold text-ink mt-0.5">{{ programEnrolments.active }}</dd>
            </div>
            <div class="panel-quiet px-2.5 py-2">
              <dt class="label-xs">Đã hoàn thành</dt>
              <dd class="num text-sm font-bold text-ok mt-0.5">{{ programEnrolments.completed }}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>

    <!-- ── SEO ─────────────────────────────────────────────────────── -->
    <div v-else-if="tab === 'seo'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SectionCard title="Thẻ meta">
        <div class="space-y-3.5">
          <FormRow label="Tiêu đề SEO" :hint="`${(draft.seo.title || '').length}/60 ký tự`">
            <template #default="{ id }">
              <input :id="id" v-model="draft.seo.title" type="text" class="input" />
            </template>
          </FormRow>
          <FormRow label="Mô tả SEO" :hint="`${(draft.seo.description || '').length}/160 ký tự`">
            <template #default="{ id }">
              <textarea :id="id" v-model="draft.seo.description" rows="3" class="input" />
            </template>
          </FormRow>
          <FormRow label="Ảnh OG">
            <template #default="{ id }">
              <input :id="id" v-model="draft.seo.ogImage" type="url" class="input font-mono text-xs" />
            </template>
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard title="Xem như kết quả tìm kiếm">
        <div class="panel-quiet p-3">
          <p class="text-xs text-ok truncate">stretch.vn › learning-hub › programs › {{ draft.slug }}</p>
          <p class="text-info text-base font-semibold mt-0.5 truncate">
            {{ draft.seo.title || draft.title }}
          </p>
          <p class="text-xs text-ink-2 mt-0.5 line-clamp-2">
            {{ draft.seo.description || draft.subtitle || 'Chưa có mô tả — Google sẽ tự lấy đoạn đầu trang.' }}
          </p>
        </div>
        <ul class="mt-3 space-y-1.5">
          <li v-for="check in seoChecks" :key="check.label" class="flex items-start gap-2 text-xs">
            <span
              class="material-symbols-outlined text-base shrink-0"
              :class="check.ok ? 'text-ok' : 'text-warn'"
            >{{ check.ok ? 'check_circle' : 'warning' }}</span>
            <span :class="check.ok ? 'text-ink-2' : 'text-ink'">{{ check.label }}</span>
          </li>
        </ul>
      </SectionCard>
    </div>

    <!-- ── FAQ ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-3">
      <SectionCard
        v-for="(item, i) in draft.faq"
        :key="i"
        :title="`Câu hỏi ${i + 1}`"
      >
        <template #actions>
          <button
            type="button"
            class="btn-ghost btn-sm btn-icon text-danger"
            aria-label="Xoá câu hỏi"
            @click="draft.faq.splice(i, 1)"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </template>
        <div class="space-y-2.5">
          <input v-model="item.q" type="text" class="input" aria-label="Câu hỏi" placeholder="Câu hỏi" />
          <textarea v-model="item.a" rows="2" class="input" aria-label="Trả lời" placeholder="Trả lời" />
        </div>
      </SectionCard>

      <button type="button" class="btn-outline btn-sm" @click="draft.faq.push({ q: '', a: '' })">
        <span class="material-symbols-outlined text-lg">add</span>
        Thêm câu hỏi
      </button>
    </div>

    <VideoGalleryPicker
      v-model:open="galleryOpen"
      :selected-id="galleryItem?.videoId || ''"
      @select="onGalleryPick"
    />
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMockDb } from '@/stores/db.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import FormRow from '@/components/ui/FormRow.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import VideoGalleryPicker from '@/components/videos/VideoGalleryPicker.vue'
import { patchVideo } from '@/services/videoUpload.js'
import { vnd, duration } from '@/utils/format.js'
import {
  PROGRAM_KINDS, PROGRAM_TOPICS, PROGRAM_MODES, PROGRAM_STATUSES, LESSON_TYPES,
} from '@/data/mock/learning.js'

/**
 * Programme editor.
 *
 * Edits go into a local draft and only reach the store on save, so a half-typed
 * title never leaks into the list behind it — and "Hoàn tác" is a real button
 * rather than a promise.
 */
const route = useRoute()
const db = useMockDb()
const notify = useNotify()

const tab = ref('basics')

const program = computed(() => db.find('programs', route.params.id))
const instructors = computed(() => db.list('instructors'))
const settings = computed(() => db.settings)

const draft = ref(blank())

function blank() {
  return {
    title: '', subtitle: '', slug: '', kind: 'mini', topic: 'functional', mode: 'online',
    level: 'Cơ bản', price: 0, compareAtPrice: null, badge: '', status: 'draft',
    certificate: false, instructorId: 'ins-01', image: '', outcomes: [], modules: [],
    lessons: 0, minutes: 0, seo: { title: '', description: '', ogImage: '' }, faq: [],
  }
}

function load() {
  if (!program.value) return
  draft.value = JSON.parse(JSON.stringify(program.value))
  draft.value.outcomes = draft.value.outcomes || []
  draft.value.modules = draft.value.modules || []
  draft.value.faq = draft.value.faq || []
  draft.value.seo = draft.value.seo || { title: '', description: '', ogImage: '' }
}

watch(program, load, { immediate: true })

const dirty = computed(
  () => !!program.value && JSON.stringify(draft.value) !== JSON.stringify(program.value),
)

const tabs = computed(() => [
  { id: 'basics', label: 'Nội dung' },
  { id: 'syllabus', label: 'Syllabus', count: draft.value.lessons },
  { id: 'pricing', label: 'Giá & bán' },
  { id: 'seo', label: 'SEO' },
  { id: 'faq', label: 'FAQ', count: (draft.value.faq || []).length },
])

const instructor = computed(() => db.find('instructors', draft.value.instructorId))

const moduleMinutes = (module) => (module.items || []).reduce((s, it) => s + (it.minutes || 0), 0)

const freeCount = computed(
  () => draft.value.modules.reduce((s, m) => s + (m.items || []).filter((i) => i.free).length, 0),
)

/**
 * Lesson counts, durations and video ordinals are derived, never typed. The
 * ordinal matters: the site addresses lesson videos by their position among the
 * course's video lessons, so inserting a video mid-course renumbers the rest.
 */
function recount() {
  let lessons = 0
  let minutes = 0
  let ordinal = 0
  for (const module of draft.value.modules) {
    module.items = module.items || []
    for (const item of module.items) {
      lessons += 1
      minutes += item.minutes || 0
      if (item.type === 'video') {
        item.ordinal = ordinal
        ordinal += 1
      } else {
        delete item.ordinal
      }
    }
    module.minutes = moduleMinutes(module)
  }
  draft.value.lessons = lessons
  draft.value.minutes = minutes
}

watch(() => JSON.stringify(draft.value.modules), recount)

function addModule() {
  draft.value.modules.push({ title: `Chương ${draft.value.modules.length + 1}`, summary: '', items: [], minutes: 0 })
}

function removeModule(index) {
  draft.value.modules.splice(index, 1)
  recount()
}

function moveModule(index, step) {
  const target = index + step
  if (target < 0 || target >= draft.value.modules.length) return
  const [module] = draft.value.modules.splice(index, 1)
  draft.value.modules.splice(target, 0, module)
  recount()
}

// ── video gallery ───────────────────────────────────────────────────
const galleryOpen = ref(false)
const galleryTarget = ref(null)

const galleryItem = computed(() => {
  const t = galleryTarget.value
  return t ? draft.value.modules[t.mi]?.items?.[t.ii] : null
})

function openGallery(moduleIndex, itemIndex) {
  galleryTarget.value = { mi: moduleIndex, ii: itemIndex }
  galleryOpen.value = true
}

async function onGalleryPick(video) {
  const item = galleryItem.value
  if (!item) return
  item.videoId = video.id
  item.objectKey = video.objectKey
  if (video.durationSeconds) {
    item.minutes = Math.max(1, Math.round(video.durationSeconds / 60))
  }
  recount()
  // The site resolves a lesson video by (slug, ordinal) — point the R2 file at
  // this slot too, so picking here is enough without visiting "Video bài học".
  if (draft.value.slug && item.ordinal != null) {
    await patchVideo(video.id, {
      programSlug: draft.value.slug,
      lessonOrdinal: item.ordinal,
      title: item.title || video.title,
    }).catch(() => {})
  }
  notify.success('Đã gắn video từ thư viện vào bài học.')
}

function addItem(moduleIndex, type) {
  const item = {
    type,
    title: type === 'quiz' ? 'Bài kiểm tra' : type === 'reading' ? 'Ghi chú bài học' : 'Bài video mới',
    minutes: type === 'video' ? 10 : 5,
    free: false,
  }
  if (type === 'quiz') {
    item.questions = []
    item.passScore = db.settings.academy.passScore
  }
  draft.value.modules[moduleIndex].items.push(item)
  recount()
}

const programOrders = computed(() => {
  const rows = db.list('orders').filter((o) => o.programId === program.value?.id)
  return {
    paid: rows.filter((o) => o.status === 'paid').length,
    pending: rows.filter((o) => o.status === 'pending').length,
  }
})

const programEnrolments = computed(() => {
  const rows = db.list('enrolments').filter((e) => e.programId === program.value?.id)
  return {
    active: rows.filter((e) => e.status === 'active').length,
    completed: rows.filter((e) => e.status === 'completed').length,
  }
})

const seoChecks = computed(() => {
  const seo = draft.value.seo || {}
  const t = (seo.title || '').length
  const d = (seo.description || '').length
  return [
    { label: t >= 30 && t <= 60 ? 'Tiêu đề dài vừa đủ' : 'Tiêu đề nên trong khoảng 30–60 ký tự', ok: t >= 30 && t <= 60 },
    { label: d >= 70 && d <= 160 ? 'Mô tả dài vừa đủ' : 'Mô tả nên trong khoảng 70–160 ký tự', ok: d >= 70 && d <= 160 },
    { label: seo.ogImage ? 'Đã có ảnh chia sẻ' : 'Chưa có ảnh OG — link chia sẻ sẽ trống', ok: !!seo.ogImage },
    { label: draft.value.slug ? 'Slug hợp lệ' : 'Chưa có slug', ok: !!draft.value.slug },
  ]
})

function persist() {
  recount()
  db.save('programs', { ...draft.value, updatedAt: new Date().toISOString() })
  notify.success('Đã lưu chương trình.')
}

function publish() {
  draft.value.status = 'published'
  if (!draft.value.publishedAt) draft.value.publishedAt = new Date().toISOString().slice(0, 10)
  persist()
  notify.success('Chương trình đã mở bán trên site.')
}

function revert() {
  load()
  notify.info('Đã bỏ các thay đổi chưa lưu.')
}
</script>
